const uiComponents = (() => {

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        let headerButtonHtml = '';
        const langKey = state.getCurrentPublikationLang() || 'de';

        if (downloadButtons && downloadButtons.length > 0 && chartId) {
            headerButtonHtml = downloadButtons.map(btn => {
                const tooltipText = (typeof btn.tooltip === 'object' ? btn.tooltip[langKey] : btn.tooltip) || (langKey === 'de' ? `Als ${btn.format.toUpperCase()} herunterladen` : `Download as ${btn.format.toUpperCase()}`);
                return `<button type="button" class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${chartId}" data-format="${btn.format}" data-tippy-content="${tooltipText}"> <i class="fas ${btn.icon || 'fa-download'}"></i></button>`;
            }).join('');
        }

        let tooltipContent = title || '';
        if (chartId && TOOLTIP_CONTENT.deskriptiveStatistik && TOOLTIP_CONTENT.deskriptiveStatistik[chartId] && TOOLTIP_CONTENT.deskriptiveStatistik[chartId].description) {
            const descEntry = TOOLTIP_CONTENT.deskriptiveStatistik[chartId].description;
            tooltipContent = (typeof descEntry === 'object' ? descEntry[langKey] : descEntry) || title;
        }


        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses} d-flex justify-content-between align-items-center" data-tippy-content="${tooltipContent}">
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
        const langKey = state.getCurrentPublikationLang() || 'de';
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
                const displayValue = UI_TEXTS.t2CriteriaValues[value]?.[langKey] || UI_TEXTS.t2CriteriaValues[value]?.['de'] || value;
                const buttonTooltipDe = `Kriterium '${criterionLabel}' auf '${displayValue}' setzen. ${isChecked ? '' : '(Kriterium ist derzeit inaktiv)'}`;
                const buttonTooltipEn = `Set criterion '${criterionLabel}' to '${displayValue}'. ${isChecked ? '' : '(Criterion is currently inactive)'}`;
                const buttonTooltip = langKey === 'de' ? buttonTooltipDe : buttonTooltipEn;
                return `<button type="button" class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
            }).join('');
        };

        const createCriteriaGroup = (key, labelDe, labelEn, tooltipKey, contentGenerator) => {
            const isChecked = initialCriteria[key]?.active === true;
            const label = langKey === 'de' ? labelDe : labelEn;
            const tooltipBase = TOOLTIP_CONTENT[tooltipKey]?.description;
            const tooltip = (typeof tooltipBase === 'object' ? tooltipBase[langKey] : tooltipBase?.[langKey]) || tooltipBase?.['de'] || label;
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
        const logicLabelDe = 'Logik:'; const logicLabelEn = 'Logic:';
        const logicTooltipBase = TOOLTIP_CONTENT.t2Logic.description;
        const logicTooltip = (typeof logicTooltipBase === 'object' ? logicTooltipBase[langKey] : logicTooltipBase) || logicTooltipBase['de'];
        const resetText = langKey === 'de' ? 'Zurücksetzen (Standard)' : 'Reset (Default)';
        const applyText = langKey === 'de' ? 'Anwenden & Speichern' : 'Apply & Save';
        const resetTooltipBase = TOOLTIP_CONTENT.t2Actions.reset;
        const resetTooltip = (typeof resetTooltipBase === 'object' ? resetTooltipBase[langKey] : resetTooltipBase) || resetTooltipBase['de'];
        const applyTooltipBase = TOOLTIP_CONTENT.t2Actions.apply;
        const applyTooltip = (typeof applyTooltipBase === 'object' ? applyTooltipBase[langKey] : applyTooltipBase) || applyTooltipBase['de'];

        const sizeRangeTooltipDe = `Schwellenwert für Kurzachsendurchmesser (≥) einstellen. Bereich: ${sizeMin} - ${sizeMax} mm.`;
        const sizeRangeTooltipEn = `Set threshold for short axis diameter (≥). Range: ${sizeMin} - ${sizeMax} mm.`;
        const sizeRangeTooltip = langKey === 'de' ? sizeRangeTooltipDe : sizeRangeTooltipEn;
        const sizeManualInputTooltipDe = "Schwellenwert manuell eingeben oder anpassen.";
        const sizeManualInputTooltipEn = "Enter or adjust threshold manually.";
        const sizeManualInputTooltip = langKey === 'de' ? sizeManualInputTooltipDe : sizeManualInputTooltipEn;

        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${langKey === 'de' ? 'T2 Malignitäts-Kriterien Definieren' : 'Define T2 Malignancy Criteria'}</span>
                    <div class="form-check form-switch" data-tippy-content="${logicTooltip}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">${langKey === 'de' ? logicLabelDe : logicLabelEn}</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${UI_TEXTS.t2LogicDisplayNames[initialLogic]?.[langKey] || UI_TEXTS.t2LogicDisplayNames[initialLogic]?.['de'] || initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', 'Größe', 'Size', 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} data-tippy-content="${sizeRangeTooltip}">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1, 'N/A', false, langKey)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="${langKey === 'de' ? 'Größe manuell eingeben' : 'Enter size manually'}" data-tippy-content="${sizeManualInputTooltip}">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', 'Form', 'Shape', 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', 'Kontur', 'Border', 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', 'Homogenität', 'Homogeneity', 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', 'Signal', 'Signal Intensity', 't2Signal', (key, isChecked, label) => `
                            <div>${createButtonOptions(key, isChecked, label)}</div>
                            <small class="text-muted d-block mt-1">${langKey === 'de' ? "Hinweis: Lymphknoten mit Signal 'null' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie." : "Note: Lymph nodes with signal 'null' (i.e., not assessable/not present) never meet the signal criterion."}</small>
                        `)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button type="button" class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${resetTooltip}">
                                <i class="fas fa-undo me-1"></i> ${resetText}
                            </button>
                            <button type="button" class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${applyTooltip}">
                                <i class="fas fa-check me-1"></i> ${applyText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createBruteForceCard(currentKollektivName, workerAvailable) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        const disabledAttribute = !workerAvailable ? 'disabled' : '';
        const startButtonTextDe = workerAvailable ? '<i class="fas fa-cogs me-1"></i> Optimierung starten' : '<i class="fas fa-times-circle me-1"></i> Worker nicht verfügbar';
        const startButtonTextEn = workerAvailable ? '<i class="fas fa-cogs me-1"></i> Start Optimization' : '<i class="fas fa-times-circle me-1"></i> Worker not available';
        const startButtonText = langKey === 'de' ? startButtonTextDe : startButtonTextEn;

        const statusTextDe = workerAvailable ? 'Bereit.' : 'Worker konnte nicht initialisiert werden.';
        const statusTextEn = workerAvailable ? 'Ready.' : 'Worker could not be initialized.';
        const statusText = langKey === 'de' ? statusTextDe : statusTextEn;

        const defaultMetric = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy';
        const metricTooltipBase = TOOLTIP_CONTENT.bruteForceMetric.description;
        const metricTooltip = (typeof metricTooltipBase === 'object' ? metricTooltipBase[langKey] : metricTooltipBase) || metricTooltipBase['de'];
        const startTooltipBase = TOOLTIP_CONTENT.bruteForceStart.description;
        const startTooltip = (typeof startTooltipBase === 'object' ? startTooltipBase[langKey] : startTooltipBase) || startTooltipBase['de'];
        const infoTooltipBase = TOOLTIP_CONTENT.bruteForceInfo.description;
        const infoTooltip = (typeof infoTooltipBase === 'object' ? infoTooltipBase[langKey] : infoTooltipBase) || infoTooltipBase['de'];
        const progressTooltipBase = TOOLTIP_CONTENT.bruteForceProgress.description;
        const progressTooltip = (typeof progressTooltipBase === 'object' ? progressTooltipBase[langKey] : progressTooltipBase) || progressTooltipBase['de'];
        const resultTooltipBase = TOOLTIP_CONTENT.bruteForceResult.description;
        const resultTooltip = (typeof resultTooltipBase === 'object' ? resultTooltipBase[langKey] : resultTooltipBase) || resultTooltipBase['de'];
        const detailsButtonTooltipBase = TOOLTIP_CONTENT.bruteForceDetailsButton.description;
        const detailsButtonTooltip = (typeof detailsButtonTooltipBase === 'object' ? detailsButtonTooltipBase[langKey] : detailsButtonTooltipBase) || detailsButtonTooltipBase['de'];

        const cancelText = langKey === 'de' ? 'Abbrechen' : 'Cancel';
        const applyText = langKey === 'de' ? 'Anwenden' : 'Apply';
        const top10Text = langKey === 'de' ? 'Top 10' : 'Top 10';

        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header">${langKey === 'de' ? 'Kriterien-Optimierung (Brute-Force)' : 'Criteria Optimization (Brute-Force)'}</div>
                <div class="card-body">
                    <p class="card-text small">${langKey === 'de' ? 'Findet automatisch die Kombination von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) und Logik (UND/ODER), die eine gewählte diagnostische Metrik im Vergleich zum N-Status maximiert.' : 'Automatically finds the combination of T2 criteria (size, shape, border, homogeneity, signal) and logic (AND/OR) that maximizes a selected diagnostic metric compared to N-status.'}</p>
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">${langKey === 'de' ? 'Zielmetrik:' : 'Target Metric:'}</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${metricTooltip}">
                                <option value="Accuracy" ${defaultMetric === 'Accuracy' ? 'selected' : ''}>Accuracy</option>
                                <option value="Balanced Accuracy" ${defaultMetric === 'Balanced Accuracy' ? 'selected' : ''}>Balanced Accuracy</option>
                                <option value="F1-Score" ${defaultMetric === 'F1-Score' ? 'selected' : ''}>F1-Score</option>
                                <option value="PPV" ${defaultMetric === 'PPV' ? 'selected' : ''}>${langKey === 'de' ? 'Positiver Prädiktiver Wert (PPV)' : 'Positive Predictive Value (PPV)'}</option>
                                <option value="NPV" ${defaultMetric === 'NPV' ? 'selected' : ''}>${langKey === 'de' ? 'Negativer Prädiktiver Wert (NPV)' : 'Negative Predictive Value (NPV)'}</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                             <button type="button" class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" data-tippy-content="${startTooltip}" ${disabledAttribute}>
                                 ${startButtonText}
                             </button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end" data-tippy-content="${infoTooltip}">
                                 ${langKey === 'de' ? 'Status:' : 'Status:'} <span id="bf-status-text" class="fw-bold">${statusText}</span><br>${langKey === 'de' ? 'Kollektiv:' : 'Cohort:'} <strong id="bf-kollektiv-info">${getKollektivDisplayName(currentKollektivName, langKey)}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-tippy-content="${progressTooltip}">
                         <div class="d-flex justify-content-between mb-1 small">
                            <span>${langKey === 'de' ? 'Fortschritt:' : 'Progress:'} <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span id="bf-progress-percent">0%</span>
                         </div>
                         <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                         </div>
                         <div class="mt-2 small">
                            ${langKey === 'de' ? 'Beste' : 'Best'} <span id="bf-metric-label" class="fw-bold">${defaultMetric}</span> ${langKey === 'de' ? 'bisher:' : 'so far:'} <span id="bf-best-metric" class="fw-bold">--</span>
                            <div id="bf-best-criteria" class="mt-1 text-muted" style="word-break: break-word;">${langKey === 'de' ? 'Beste Kriterien:' : 'Best Criteria:'} --</div>
                         </div>
                          <button type="button" class="btn btn-danger btn-sm mt-2 d-none" id="btn-cancel-brute-force" data-tippy-content="${langKey === 'de' ? 'Bricht die laufende Brute-Force-Optimierung ab.' : 'Cancels the ongoing brute-force optimization.'}">
                            <i class="fas fa-times me-1"></i> ${cancelText}
                         </button>
                     </div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-tippy-content="${resultTooltip}">
                         <h6 class="alert-heading small">${langKey === 'de' ? 'Optimierung Abgeschlossen' : 'Optimization Completed'}</h6>
                         <p class="mb-1 small">${langKey === 'de' ? 'Beste Kombi für' : 'Best Combo for'} <strong id="bf-result-metric"></strong> (${langKey === 'de' ? 'Koll.:' : 'Cohort:'} <strong id="bf-result-kollektiv"></strong>):</p>
                         <ul class="list-unstyled mb-1 small">
                            <li><strong>${langKey === 'de' ? 'Wert:' : 'Value:'}</strong> <span id="bf-result-value" class="fw-bold"></span></li>
                            <li><strong>${langKey === 'de' ? 'Logik:' : 'Logic:'}</strong> <span id="bf-result-logic" class="fw-bold"></span></li>
                            <li style="word-break: break-word;"><strong>${langKey === 'de' ? 'Kriterien:' : 'Criteria:'}</strong> <span id="bf-result-criteria" class="fw-bold"></span></li>
                         </ul>
                         <p class="mb-1 small text-muted">${langKey === 'de' ? 'Dauer:' : 'Duration:'} <span id="bf-result-duration"></span>s | ${langKey === 'de' ? 'Getestet:' : 'Tested:'} <span id="bf-result-total-tested"></span></p>
                         <hr class="my-1">
                         <button type="button" class="btn btn-success btn-sm me-2" id="btn-apply-best-bf-criteria" data-tippy-content="${langKey === 'de' ? 'Wendet die beste gefundene Kriterienkombination an und speichert sie.' : 'Applies the best found criteria combination and saves it.'}">
                             <i class="fas fa-check me-1"></i> ${applyText}
                         </button>
                         <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-tippy-content="${detailsButtonTooltip}">
                             <i class="fas fa-list-ol me-1"></i> ${top10Text}
                         </button>
                     </div>
                </div>
            </div>
        </div>
        `;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        const cardTooltipBase = tooltipKey && TOOLTIP_CONTENT[tooltipKey]?.cardTitle;
        let cardTooltipText = (typeof cardTooltipBase === 'object' ? cardTooltipBase?.[langKey] : cardTooltipBase) || title || '';
        if (typeof cardTooltipText !== 'string') cardTooltipText = title || ''; // Fallback if langKey resolution fails
        const cardTooltipHtml = cardTooltipText ? `data-tippy-content="${cardTooltipText.replace(/\[KOLLEKTIV\]/g, '{KOLLEKTIV_PLACEHOLDER}')}"` : '';

        let headerButtonHtml = downloadButtons.map(btn => {
            const btnTooltipBase = btn.tooltip || '';
            const btnTooltipText = (typeof btnTooltipBase === 'object' ? btnTooltipBase[langKey] : btnTooltipBase) || (langKey === 'de' ? 'Herunterladen' : 'Download');

            if (btn.tableId) {
                return `<button type="button" class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${btn.id}" data-table-id="${btn.tableId}" data-table-name="${btn.tableName || title.replace(/[^a-z0-9]/gi, '_').substring(0, 30)}" data-tippy-content="${btnTooltipText}"><i class="fas ${btn.icon || 'fa-image'}"></i></button>`;
            } else if (btn.chartId) {
                return `<button type="button" class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${btn.chartId}" data-format="${btn.format}" data-tippy-content="${btnTooltipText}"><i class="fas ${btn.icon || 'fa-download'}"></i></button>`;
            }
            return '';
        }).join('');


        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId && !downloadButtons.some(b => b.tableId === tableId)) {
            const tooltipDefaultDe = `Tabelle '${title}' als PNG herunterladen.`;
            const tooltipDefaultEn = `Download table '${title}' as PNG.`;
            const pngExportButton = { id: `dl-card-${id.replace(/[^a-z0-9_-]/gi, '')}-${tableId}-png`, icon: 'fa-image', tooltip: langKey === 'de' ? tooltipDefaultDe : tooltipDefaultEn, format: 'png', tableId: tableId, tableName: title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 30) };
            headerButtonHtml += `
                 <button type="button" class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${pngExportButton.id}" data-table-id="${pngExportButton.tableId}" data-table-name="${pngExportButton.tableName}" data-tippy-content="${pngExportButton.tooltip}">
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
        const langKey = state.getCurrentPublikationLang() || 'de';
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(currentKollektiv, langKey).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        const fileNameTemplate = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;

        const generateButtonHTML = (idSuffix, iconClass, textDe, textEn, tooltipKey, disabled = false, experimental = false) => {
            const config = TOOLTIP_CONTENT.exportTab[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext).replace('_{SectionName}', '').replace('{SectionName}', '');
            const tooltipBase = config.description;
            const tooltipText = ((typeof tooltipBase === 'object' ? tooltipBase[langKey] : tooltipBase) || (langKey === 'de' ? 'Info nicht verfügbar' : 'Info not available')) + `<br><small>File: ${filename}</small>`;
            const tooltipHtml = `data-tippy-content="${tooltipText}"`;
            const disabledAttr = disabled ? 'disabled' : ''; const experimentalBadge = experimental ? `<span class="badge bg-warning text-dark ms-1 small">${langKey === 'de' ? 'Experimentell' : 'Experimental'}</span>` : ''; const buttonClass = disabled ? 'btn-outline-secondary' : 'btn-outline-primary'; const text = langKey === 'de' ? textDe : textEn;
            return `<button type="button" class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span> ${experimentalBadge}</button>`;
        };

        const generateZipButtonHTML = (idSuffix, iconClass, textDe, textEn, tooltipKey, disabled = false) => {
            const config = TOOLTIP_CONTENT.exportTab[tooltipKey]; if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext; const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext).replace('_{SectionName}', '').replace('{SectionName}', '');
            const tooltipBase = config.description;
            const tooltipText = ((typeof tooltipBase === 'object' ? tooltipBase[langKey] : tooltipBase) || (langKey === 'de' ? 'Info nicht verfügbar' : 'Info not available')) + `<br><small>File: ${filename}</small>`;
            const tooltipHtml = `data-tippy-content="${tooltipText}"`;
            const disabledAttr = disabled ? 'disabled' : ''; const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary'; const text = langKey === 'de' ? textDe : textEn;
            return `<button type="button" class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span></button>`;
        };

        const exportDescBase = TOOLTIP_CONTENT.exportTab.description;
        const exportDesc = ((typeof exportDescBase === 'object' ? exportDescBase[langKey] : exportDescBase) || exportDescBase['de']).replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(currentKollektiv, langKey)}</strong>`);
        const singleExportsTitle = TOOLTIP_CONTENT.exportTab.singleExports?.[langKey] || (langKey === 'de' ? 'Einzelexporte' : 'Single Exports');
        const exportPackagesTitle = TOOLTIP_CONTENT.exportTab.exportPackages?.[langKey] || (langKey === 'de' ? 'Export-Pakete (.zip)' : 'Export Packages (.zip)');

        return `
            <div class="row export-options-container">
                <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${singleExportsTitle}</div>
                        <div class="card-body">
                            <p class="small text-muted mb-3">${exportDesc}</p>
                            <h6 class="text-muted small text-uppercase mb-2">${langKey === 'de' ? 'Berichte & Statistiken' : 'Reports & Statistics'}</h6>
                            ${generateButtonHTML('statistik-csv', 'fas fa-file-csv', 'Statistik Ergebnisse', 'Statistics Results', 'statsCSV')}
                            ${generateButtonHTML('bruteforce-txt', 'fas fa-file-alt', 'Brute-Force Bericht', 'Brute-Force Report', 'bruteForceTXT', true)}
                            ${generateButtonHTML('deskriptiv-md', 'fab fa-markdown', 'Deskriptive Statistik', 'Descriptive Statistics', 'deskriptivMD')}
                            ${generateButtonHTML('comprehensive-report-html', 'fas fa-file-invoice', 'Umfassender Bericht', 'Comprehensive Report', 'comprehensiveReportHTML')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${langKey === 'de' ? 'Tabellen & Rohdaten' : 'Tables & Raw Data'}</h6>
                             ${generateButtonHTML('daten-md', 'fab fa-markdown', 'Datenliste', 'Data List', 'datenMD')}
                             ${generateButtonHTML('auswertung-md', 'fab fa-markdown', 'Auswertungstabelle', 'Evaluation Table', 'auswertungMD')}
                             ${generateButtonHTML('filtered-data-csv', 'fas fa-database', 'Gefilterte Rohdaten', 'Filtered Raw Data', 'filteredDataCSV')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${langKey === 'de' ? 'Diagramme & Tabellen (als Bilder)' : 'Charts & Tables (as Images)'}</h6>
                             ${generateButtonHTML('charts-png', 'fas fa-images', 'Diagramme & Tabellen (PNG)', 'Charts & Tables (PNG)', 'pngZIP')}
                             ${generateButtonHTML('charts-svg', 'fas fa-file-code', 'Diagramme (SVG)', 'Charts (SVG)', 'svgZIP')}
                        </div>
                    </div>
                </div>
                 <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${exportPackagesTitle}</div>
                        <div class="card-body">
                             <p class="small text-muted mb-3">${langKey === 'de' ? 'Bündelt mehrere thematisch zusammengehörige Exportdateien in einem ZIP-Archiv für das Kollektiv' : 'Bundles multiple thematically related export files into a ZIP archive for cohort'} <strong>${getKollektivDisplayName(currentKollektiv, langKey)}</strong>.</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', 'Gesamtpaket (Alle Dateien)', 'Complete Package (All Files)', 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', 'Nur CSVs', 'CSVs Only', 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'Nur Markdown (inkl. Publikations-Texte)', 'Markdown Only (incl. Publication Texts)', 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', 'Nur Diagramm/Tabellen-PNGs', 'Chart/Table PNGs Only', 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', 'Nur Diagramm-SVGs', 'Chart SVGs Only', 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">${langKey === 'de' ? 'Hinweise zum Export' : 'Export Notes'}</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> <li class="mb-2"><i class="fas fa-info-circle fa-fw me-1 text-primary"></i>${langKey === 'de' ? 'Alle Exporte basieren auf dem aktuell gewählten Kollektiv und den zuletzt **angewendeten** T2-Kriterien.' : 'All exports are based on the currently selected cohort and the last **applied** T2 criteria.'}</li> <li class="mb-2"><i class="fas fa-table fa-fw me-1 text-primary"></i>**CSV:** ${langKey === 'de' ? 'Für Statistiksoftware; Trennzeichen: Semikolon (;).' : 'For statistics software; Delimiter: Semicolon (;).'}</li> <li class="mb-2"><i class="fab fa-markdown fa-fw me-1 text-primary"></i>**MD:** ${langKey === 'de' ? 'Für Dokumentation. Publikations-MDs enthalten die Textblöcke aus dem Publikation-Tab.' : 'For documentation. Publication MDs include text blocks from the Publication tab.'}</li> <li class="mb-2"><i class="fas fa-file-alt fa-fw me-1 text-primary"></i>**TXT:** ${langKey === 'de' ? 'Brute-Force-Bericht.' : 'Brute-force report.'}</li> <li class="mb-2"><i class="fas fa-file-invoice fa-fw me-1 text-primary"></i>**HTML Bericht:** ${langKey === 'de' ? 'Umfassend, druckbar.' : 'Comprehensive, printable.'}</li> <li class="mb-2"><i class="fas fa-images fa-fw me-1 text-primary"></i>**PNG:** ${langKey === 'de' ? 'Pixelbasiert (Diagramme/Tabellen).' : 'Pixel-based (charts/tables).'}</li> <li class="mb-2"><i class="fas fa-file-code fa-fw me-1 text-primary"></i>**SVG:** ${langKey === 'de' ? 'Vektorbasiert (Diagramme), skalierbar.' : 'Vector-based (charts), scalable.'}</li> <li class="mb-0"><i class="fas fa-exclamation-triangle fa-fw me-1 text-warning"></i>${langKey === 'de' ? 'ZIP-Exporte für Diagramme/Tabellen (PNG/SVG) erfassen nur aktuell im Statistik-, Auswertung- oder Präsentationstab sichtbare/gerenderte Elemente. Einzel-Downloads sind direkt am Element möglich.' : 'ZIP exports for charts/tables (PNG/SVG) only capture elements currently visible/rendered in the Statistics, Evaluation, or Presentation tab. Single downloads are available directly on the element.'}</li> </ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        const cardTooltipBase = TOOLTIP_CONTENT.t2MetricsOverview.cardTitle;
        const cardTooltip = ((typeof cardTooltipBase === 'object' ? cardTooltipBase[langKey] : cardTooltipBase) || cardTooltipBase['de']).replace('[KOLLEKTIV]', `<strong>${getKollektivDisplayName(kollektivName, langKey)}</strong>`);

        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
            const noMetricsText = langKey === 'de' ? 'Metriken für T2 nicht verfügbar.' : 'Metrics for T2 not available.';
            return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">${langKey === 'de' ? 'Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)' : 'Brief Dx. Performance (T2 vs. N - applied criteria)'}</div><div class="card-body p-2"><p class="m-0 text-muted small">${noMetricsText}</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC' };
        const na = '--';

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            const metricDescriptionBase = (TOOLTIP_CONTENT.t2MetricsOverview?.[key]?.[langKey] || TOOLTIP_CONTENT.statMetrics[key]?.description?.[langKey] || TOOLTIP_CONTENT.statMetrics[key]?.description?.['de'] || key);
            const metricDescription = metricDescriptionBase.replace(/\[METHODE\]/g, 'T2');

            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na, langKey);
            const interpretationTooltip = ui_helpers.getMetricInterpretationHTML(key, metricData, 'T2', getKollektivDisplayName(kollektivName, langKey), langKey);


            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-tippy-content="${metricDescription}">${metricDisplayNames[key]}:</strong>
                    <span data-tippy-content="${interpretationTooltip}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">${langKey === 'de' ? 'Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)' : 'Brief Dx. Performance (T2 vs. N - applied criteria)'}</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createBruteForceModalContent(results, metric, kollektiv, duration, totalTested) {
        const langKey = state.getCurrentPublikationLang() || 'de';
        if (!results || results.length === 0) return `<p class="text-muted">${langKey === 'de' ? 'Keine Ergebnisse gefunden.' : 'No results found.'}</p>`;

        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? (c, l) => studyT2CriteriaManager.formatCriteriaForDisplay(c, l, false, langKey) : (c, l) => 'Formatierungsfehler';
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k, l) => k;
        const bestResult = results[0];
        const kollektivName = getKollektivNameFunc(kollektiv, langKey);
        const metricKeyForDisplay = metric.toLowerCase().replace(/\s+/g, '').replace('-', '');
        const metricDisplayName = UI_TEXTS.statMetrics[metricKeyForDisplay]?.name?.[langKey] || UI_TEXTS.statMetrics[metricKeyForDisplay]?.name?.['de'] || metric;

        let tableHTML = `
            <div class="alert alert-light small p-2 mb-3">
                <p class="mb-1"><strong>${langKey === 'de' ? 'Beste Kombi für' : 'Best Combo for'} '${metricDisplayName}' (${langKey === 'de' ? 'Koll.:' : 'Cohort:'} '${kollektivName}'):</strong></p>
                <ul class="list-unstyled mb-1">
                    <li><strong>${langKey === 'de' ? 'Wert:' : 'Value:'}</strong> ${formatNumber(bestResult.metricValue, 4, 'N/A', false, langKey)}</li>
                    <li><strong>${langKey === 'de' ? 'Logik:' : 'Logic:'}</strong> ${UI_TEXTS.t2LogicDisplayNames[bestResult.logic.toUpperCase()]?.[langKey] || UI_TEXTS.t2LogicDisplayNames[bestResult.logic.toUpperCase()]?.['de'] || bestResult.logic.toUpperCase()}</li>
                    <li><strong>${langKey === 'de' ? 'Kriterien:' : 'Criteria:'}</strong> ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}</li>
                </ul>
                <p class="mb-0 text-muted"><small>${langKey === 'de' ? 'Dauer:' : 'Duration:'} ${formatNumber((duration || 0) / 1000, 1, 'N/A', false, langKey)}s | ${langKey === 'de' ? 'Getestet:' : 'Tested:'} ${formatNumber(totalTested, 0, 'N/A', false, langKey)}</small></p>
            </div>
            <h6 class="mb-2">${langKey === 'de' ? 'Top Ergebnisse (inkl. identischer Werte bis Rang 10+):' : 'Top Results (incl. identical values up to rank 10+):'}</h6>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover small" id="bruteforce-results-table">
                    <thead class="small">
                        <tr>
                            <th data-tippy-content="${langKey === 'de' ? 'Rang' : 'Rank'}">${langKey === 'de' ? 'Rang' : 'Rank'}</th>
                            <th data-tippy-content="${langKey === 'de' ? 'Wert der Zielmetrik' : 'Value of target metric'} (${metricDisplayName})">${metricDisplayName}</th>
                            <th data-tippy-content="${langKey === 'de' ? 'Logik' : 'Logic'}">${langKey === 'de' ? 'Logik' : 'Logic'}</th>
                            <th data-tippy-content="${langKey === 'de' ? 'Kriterienkombination' : 'Criteria Combination'}">${langKey === 'de' ? 'Kriterien' : 'Criteria'}</th>
                        </tr>
                    </thead>
                    <tbody>`;

        let rank = 1, displayedCount = 0, lastMetricValue = -Infinity;
        const precision = 1e-8;

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue;

            const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision));
            const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision));
            let currentRankDisplay = rank;

            const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > precision;

            if (i > 0 && isNewRank) {
                rank = displayedCount + 1;
                currentRankDisplay = rank;
            } else if (i > 0) {
                currentRankDisplay = rank;
            }

            tableHTML += `
                <tr>
                    <td>${currentRankDisplay}.</td>
                    <td>${formatNumber(result.metricValue, 4, 'N/A', false, langKey)}</td>
                    <td>${UI_TEXTS.t2LogicDisplayNames[result.logic.toUpperCase()]?.[langKey] || UI_TEXTS.t2LogicDisplayNames[result.logic.toUpperCase()]?.['de'] || result.logic.toUpperCase()}</td>
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
        const langKey = lang === 'en' ? 'en' : 'de';
        const currentBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const currentActiveSectionId = state.getCurrentPublikationSection() || PUBLICATION_CONFIG.defaultSection;

        let navTitle = '';
        const activeMainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === currentActiveSectionId);
        if (activeMainSectionConfig && UI_TEXTS.publikationTab.sectionLabels[activeMainSectionConfig.labelKey]) {
            navTitle = UI_TEXTS.publikationTab.sectionLabels[activeMainSectionConfig.labelKey]?.[langKey] || UI_TEXTS.publikationTab.sectionLabels[activeMainSectionConfig.labelKey]?.['de'] || (langKey === 'de' ? 'Abschnitte' : 'Sections');
        } else {
            navTitle = langKey === 'de' ? 'Abschnitte' : 'Sections';
        }


        const sectionNavItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            const label = UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey]?.[langKey] || UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey]?.['de'] || mainSection.labelKey;
            const isActive = mainSection.id === currentActiveSectionId;
            const mainLinkClass = `nav-link py-2 publikation-section-link fw-bold ${isActive ? 'active' : ''}`;

            return `
                <li class="nav-item">
                    <a class="${mainLinkClass}" href="#" data-section-id="${mainSection.id}">
                        ${label}
                    </a>
                </li>`;
        }).join('');

        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        const bfMetricLabelText = UI_TEXTS.publikationTab.bruteForceMetricSelectLabel?.[langKey] || UI_TEXTS.publikationTab.bruteForceMetricSelectLabel?.['de'];
        const bfMetricTooltipBase = TOOLTIP_CONTENT.publikationTabTooltips.bruteForceMetricSelect.description;
        const bfMetricTooltipText = (typeof bfMetricTooltipBase === 'object' ? bfMetricTooltipBase[langKey] : bfMetricTooltipBase) || bfMetricTooltipBase['de'];

        const initialContentText = langKey === 'de' ? 'Bitte wählen Sie einen Abschnitt aus der Navigation.' : 'Please select a section from the navigation.';

        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" id="publikation-controls-header" style="top: calc(var(--header-height) + var(--nav-height) + 1px); z-index: 1010;">
                <div class="col-md-3">
                    <h5 class="mb-2">${navTitle}</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills">
                        ${sectionNavItems}
                    </nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2" id="publikation-top-controls">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${bfMetricLabelText}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${bfMetricTooltipText}">
                               ${bfMetricOptions}
                           </select>
                        </div>
                         {LANG_SWITCH_PLACEHOLDER}
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded" style="min-height: 400px; max-height: calc(100vh - var(--header-height) - var(--nav-height) - 70px - 2rem); overflow-y: auto;">
                        <p class="text-muted">${initialContentText}</p>
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
