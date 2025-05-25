const uiComponents = (() => {

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        const generalTexts = localizedTexts.general || {};

        let headerButtonHtml = '';
         if(downloadButtons && downloadButtons.length > 0 && chartId) {
             headerButtonHtml = downloadButtons.map(btn => {
                 const btnTooltipText = btn.tooltip || (lang === 'de' ? `Als ${btn.format.toUpperCase()} herunterladen` : `Download as ${btn.format.toUpperCase()}`);
                 return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${chartId}" data-format="${btn.format}" data-tippy-content="${btnTooltipText}"> <i class="fas ${btn.icon || 'fa-download'}"></i></button>`
             }).join('');
        }
        
        let tooltipContent = title || '';
        if (TOOLTIP_CONTENT.deskriptiveStatistik && TOOLTIP_CONTENT.deskriptiveStatistik[chartId] && TOOLTIP_CONTENT.deskriptiveStatistik[chartId].description) {
            const descField = TOOLTIP_CONTENT.deskriptiveStatistik[chartId].description;
            tooltipContent = typeof descField === 'string' ? descField : (descField[lang] || descField['de'] || title);
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
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);

        if (!initialCriteria || !initialLogic) {
            const errorMsg = lang === 'de' ? 'Fehler: Initialkriterien konnten nicht geladen werden.' : 'Error: Initial criteria could not be loaded.';
            return `<p class="text-danger">${errorMsg}</p>`;
        }
        const logicChecked = initialLogic === 'ODER';
        const defaultCriteriaForSize = getDefaultT2Criteria();
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteriaForSize?.size?.threshold ?? 5.0;
        const sizeMin = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min;
        const sizeMax = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max;
        const sizeStep = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step;
        const formattedThreshold = formatNumber(sizeThreshold, 1, '5.0', true); // standard format for input value

        const getTooltipDesc = (tooltipKey) => {
            const tooltipData = TOOLTIP_CONTENT[tooltipKey];
            if (tooltipData && tooltipData.description) {
                return typeof tooltipData.description === 'string' ? tooltipData.description : (tooltipData.description[lang] || tooltipData.description['de'] || '');
            }
            return '';
        };
        
        const t2CardTitle = lang === 'de' ? 'T2 Malignitäts-Kriterien Definieren' : 'Define T2 Malignancy Criteria';
        const logicLabelPrefixText = lang === 'de' ? 'Logik:' : 'Logic:';
        const logicSwitchTooltip = getTooltipDesc('t2Logic');
        const sizeLabel = lang === 'de' ? 'Größe' : 'Size';
        const formLabel = lang === 'de' ? 'Form' : 'Shape';
        const konturLabel = lang === 'de' ? 'Kontur' : 'Border';
        const homogenitaetLabel = lang === 'de' ? 'Homogenität' : 'Homogeneity';
        const signalLabel = lang === 'de' ? 'Signal' : 'Signal';
        
        const sizeRangeTooltip = (getTooltipDesc('t2Size') || '').replace('${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min}', sizeMin).replace('${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max}', sizeMax);
        const manualInputTooltip = lang==='de' ? "Schwellenwert manuell eingeben oder anpassen." : "Enter or adjust threshold manually.";
        const signalNote = lang==='de' ? "Hinweis: Lymphknoten mit Signal 'null' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie." : "Note: Lymph nodes with signal 'null' (i.e., not assessable/not present) never meet the signal criterion.";
        const resetBtnText = lang === 'de' ? 'Zurücksetzen (Standard)' : 'Reset (Default)';
        const resetBtnTooltip = getTooltipDesc('t2Actions_reset') || getTooltipDesc('t2Actions')?.reset || (lang === 'de' ? 'Setzt auf Standardwerte zurück.' : 'Resets to default values.');
        const applyBtnText = lang === 'de' ? 'Anwenden & Speichern' : 'Apply & Save';
        const applyBtnTooltip = getTooltipDesc('t2Actions_apply') || getTooltipDesc('t2Actions')?.apply || (lang === 'de' ? 'Wendet Kriterien an und speichert sie.' : 'Applies and saves criteria.');


        const createButtonOptions = (key, isChecked, criterionLabelText) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = ui_helpers.getT2IconSVG(key, value);
                const buttonTooltipText = (lang === 'de' ? `Kriterium '${criterionLabelText}' auf '${value}' setzen. ${isChecked ? '' : '(Kriterium ist derzeit inaktiv)'}` : `Set criterion '${criterionLabelText}' to '${value}'. ${isChecked ? '' : '(Criterion is currently inactive)'}`);
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltipText}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
            }).join('');
        };

        const createCriteriaGroup = (key, labelText, tooltipKey, contentGenerator) => {
            const isChecked = initialCriteria[key]?.active === true;
            const tooltipText = getTooltipDesc(tooltipKey) || labelText;
            return `
                <div class="col-md-6 criteria-group">
                    <div class="form-check mb-2">
                        <input class="form-check-input criteria-checkbox" type="checkbox" value="${key}" id="check-${key}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label fw-bold" for="check-${key}">${labelText}</label>
                         <span data-tippy-content="${tooltipText}"> <i class="fas fa-info-circle text-muted ms-1"></i></span>
                    </div>
                    <div class="criteria-options-container ps-3">
                        ${contentGenerator(key, isChecked, labelText)}
                    </div>
                </div>`;
        };

        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${t2CardTitle}</span>
                    <div class="form-check form-switch" data-tippy-content="${logicSwitchTooltip}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">${logicLabelPrefixText}</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${(localizedTexts.t2LogicDisplayNames || {})[initialLogic] || initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', sizeLabel, 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} data-tippy-content="${sizeRangeTooltip}">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1, '--', lang === 'en')}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="${manualInputTooltip}" data-tippy-content="${manualInputTooltip}">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', formLabel, 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', konturLabel, 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', homogenitaetLabel, 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', signalLabel, 't2Signal', (key, isChecked, labelText) => `
                            <div>${createButtonOptions(key, isChecked, labelText)}</div>
                            <small class="text-muted d-block mt-1">${signalNote}</small>
                        `)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${resetBtnTooltip}">
                                <i class="fas fa-undo me-1"></i> ${resetBtnText}
                            </button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${applyBtnTooltip}">
                                <i class="fas fa-check me-1"></i> ${applyBtnText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createBruteForceCard(currentKollektivName, workerAvailable) {
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        const generalTexts = localizedTexts.general || {};

        const getTooltipDesc = (tooltipKey) => {
            const tooltipData = TOOLTIP_CONTENT[tooltipKey];
            if (tooltipData && tooltipData.description) {
                return typeof tooltipData.description === 'string' ? tooltipData.description : (tooltipData.description[lang] || tooltipData.description['de'] || '');
            }
            return '';
        };

        const cardTitle = lang === 'de' ? 'Kriterien-Optimierung (Brute-Force)' : 'Criteria Optimization (Brute-Force)';
        const cardText = lang === 'de' ? 'Findet automatisch die Kombination von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) und Logik (UND/ODER), die eine gewählte diagnostische Metrik im Vergleich zum N-Status maximiert.' : 'Automatically finds the combination of T2 criteria (size, shape, border, homogeneity, signal) and logic (AND/OR) that maximizes a selected diagnostic metric compared to the N-status.';
        const metricSelectLabel = lang === 'de' ? 'Zielmetrik:' : 'Target Metric:';
        const metricSelectTooltip = getTooltipDesc('bruteForceMetric');
        const defaultMetric = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy';
        const metricOptions = [
            {value: "Accuracy", de: "Accuracy", en: "Accuracy"},
            {value: "Balanced Accuracy", de: "Balanced Accuracy", en: "Balanced Accuracy"},
            {value: "F1-Score", de: "F1-Score", en: "F1-Score"},
            {value: "PPV", de: "Positiver Prädiktiver Wert (PPV)", en: "Positive Predictive Value (PPV)"},
            {value: "NPV", de: "Negativer Prädiktiver Wert (NPV)", en: "Negative Predictive Value (NPV)"}
        ];
        const metricOptionsHTML = metricOptions.map(opt => `<option value="${opt.value}" ${defaultMetric === opt.value ? 'selected' : ''}>${opt[lang]}</option>`).join('');

        const disabledAttribute = !workerAvailable ? 'disabled' : '';
        let startButtonTextContent = workerAvailable ? (lang === 'de' ? 'Optimierung starten' : 'Start Optimization') : (lang === 'de' ? 'Worker nicht verfügbar' : 'Worker not available');
        const startButtonText = `<i class="fas fa-cogs me-1"></i> ${startButtonTextContent}`;
        const startButtonTooltip = getTooltipDesc('bruteForceStart');
        
        const statusLabelText = lang === 'de' ? 'Status:' : 'Status:';
        const initialStatusText = workerAvailable ? (lang === 'de' ? 'Bereit.' : 'Ready.') : (lang === 'de' ? 'Worker konnte nicht initialisiert werden.' : 'Worker could not be initialized.');
        const kollektivLabelText = lang === 'de' ? 'Kollektiv:' : 'Cohort:';
        const infoTooltip = getTooltipDesc('bruteForceInfo');

        const progressLabelText = lang === 'de' ? 'Fortschritt:' : 'Progress:';
        const progressPercentLabel = '0%';
        const progressTooltip = getTooltipDesc('bruteForceProgress');
        const bestMetricLabelText = lang === 'de' ? 'Beste' : 'Best';
        const bestMetricUnitLabel = lang === 'de' ? 'Metrik' : 'Metric';
        const bestCriteriaLabelText = lang === 'de' ? 'Beste Kriterien:' : 'Best Criteria:';
        const cancelBtnText = lang === 'de' ? 'Abbrechen' : 'Cancel';
        const cancelBtnTooltip = lang === 'de' ? 'Bricht die laufende Brute-Force-Optimierung ab.' : 'Cancels the current brute-force optimization.';
        
        const resultHeadingText = lang === 'de' ? 'Optimierung Abgeschlossen' : 'Optimization Complete';
        const resultDescText1 = lang === 'de' ? 'Beste Kombi für' : 'Best combo for';
        const resultDescText2 = lang === 'de' ? 'Koll.:' : 'Cohort:';
        const resultValueLabel = lang === 'de' ? 'Wert:' : 'Value:';
        const resultLogicLabel = lang === 'de' ? 'Logik:' : 'Logic:';
        const resultCriteriaLabel = lang === 'de' ? 'Kriterien:' : 'Criteria:';
        const resultDurationLabel = lang === 'de' ? 'Dauer:' : 'Duration:';
        const resultTotalTestedLabel = lang === 'de' ? 'Getestet:' : 'Tested:';
        const resultTooltip = getTooltipDesc('bruteForceResult');
        const applyBtnText = lang === 'de' ? 'Anwenden' : 'Apply';
        const applyBtnTooltip = lang === 'de' ? 'Wendet die beste gefundene Kriterienkombination an und speichert sie.' : 'Applies and saves the best found criteria combination.';
        const detailsBtnText = lang === 'de' ? 'Top 10' : 'Top 10';
        const detailsBtnTooltip = getTooltipDesc('bruteForceDetailsButton');


        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header">${cardTitle}</div>
                <div class="card-body">
                    <p class="card-text small">${cardText}</p>
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">${metricSelectLabel}</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${metricSelectTooltip}">
                                ${metricOptionsHTML}
                            </select>
                        </div>
                        <div class="col-md-4">
                             <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" data-tippy-content="${startButtonTooltip}" ${disabledAttribute}>
                                 ${startButtonText}
                             </button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end" data-tippy-content="${infoTooltip}">
                                 ${statusLabelText} <span id="bf-status-text" class="fw-bold">${initialStatusText}</span><br>${kollektivLabelText} <strong id="bf-kollektiv-info">${getKollektivDisplayName(currentKollektivName, lang, localizedTexts)}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-tippy-content="${progressTooltip}">
                         <div class="d-flex justify-content-between mb-1 small">
                            <span>${progressLabelText} <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span id="bf-progress-percent">${progressPercentLabel}</span>
                         </div>
                         <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                         </div>
                         <div class="mt-2 small">
                            ${bestMetricLabelText} <span id="bf-metric-label" class="fw-bold">${bestMetricUnitLabel}</span> ${lang === 'de' ? 'bisher' : 'so far'}: <span id="bf-best-metric" class="fw-bold">--</span>
                            <div id="bf-best-criteria" class="mt-1 text-muted" style="word-break: break-word;">${bestCriteriaLabelText} --</div>
                         </div>
                          <button class="btn btn-danger btn-sm mt-2 d-none" id="btn-cancel-brute-force" data-tippy-content="${cancelBtnTooltip}">
                            <i class="fas fa-times me-1"></i> ${cancelBtnText}
                         </button>
                     </div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-tippy-content="${resultTooltip}">
                         <h6 class="alert-heading small">${resultHeadingText}</h6>
                         <p class="mb-1 small">${resultDescText1} <strong id="bf-result-metric"></strong> (${resultDescText2} <strong id="bf-result-kollektiv"></strong>):</p>
                         <ul class="list-unstyled mb-1 small">
                            <li><strong>${resultValueLabel}</strong> <span id="bf-result-value" class="fw-bold"></span></li>
                            <li><strong>${resultLogicLabel}</strong> <span id="bf-result-logic" class="fw-bold"></span></li>
                            <li style="word-break: break-word;"><strong>${resultCriteriaLabel}</strong> <span id="bf-result-criteria" class="fw-bold"></span></li>
                         </ul>
                         <p class="mb-1 small text-muted"><small>${resultDurationLabel} <span id="bf-result-duration"></span>s | ${resultTotalTestedLabel} <span id="bf-result-total-tested"></span></small></p>
                         <hr class="my-1">
                         <button class="btn btn-success btn-sm me-2" id="btn-apply-best-bf-criteria" data-tippy-content="${applyBtnTooltip}">
                             <i class="fas fa-check me-1"></i> ${applyBtnText}
                         </button>
                         <button class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-tippy-content="${detailsBtnTooltip}">
                             <i class="fas fa-list-ol me-1"></i> ${detailsBtnText}
                         </button>
                     </div>
                </div>
            </div>
        </div>
        `;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        const lang = state.getCurrentPublikationLang() || 'de';
        let cardTooltipHtml = '';
        if (tooltipKey && TOOLTIP_CONTENT[tooltipKey] && TOOLTIP_CONTENT[tooltipKey].cardTitle) {
            const titleTemplate = typeof TOOLTIP_CONTENT[tooltipKey].cardTitle === 'string' ? TOOLTIP_CONTENT[tooltipKey].cardTitle : (TOOLTIP_CONTENT[tooltipKey].cardTitle[lang] || TOOLTIP_CONTENT[tooltipKey].cardTitle['de']);
            cardTooltipHtml = `data-tippy-content="${(titleTemplate || '').replace(/\[KOLLEKTIV\]/g, '{KOLLEKTIV_PLACEHOLDER}')}"`;
        }


        let headerButtonHtml = downloadButtons.map(btn => {
            const btnTooltipText = btn.tooltip || (lang === 'de' ? `Als ${btn.format.toUpperCase()} herunterladen` : `Download as ${btn.format.toUpperCase()}`);
            if (btn.tableId) {
                return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${btn.id}" data-table-id="${btn.tableId}" data-table-name="${btn.tableName || title.replace(/[^a-z0-9]/gi, '_').substring(0,30)}" data-tippy-content="${btnTooltipText}"><i class="fas ${btn.icon || 'fa-image'}"></i></button>`;
            } else {
                 return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${btn.chartId || id+'-content'}" data-format="${btn.format}" data-tippy-content="${btnTooltipText}"><i class="fas ${btn.icon || 'fa-download'}"></i></button>`;
            }
        }).join('');


        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId && !downloadButtons.some(b => b.tableId === tableId)) {
             const pngExportButtonTitle = lang === 'de' ? `Tabelle '${title}' als PNG herunterladen.` : `Download table '${title}' as PNG.`;
             const pngExportButton = { id: `dl-card-${id}-${tableId}-png`, icon: 'fa-image', tooltip: pngExportButtonTitle, format: 'png', tableId: tableId, tableName: title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0,30) };
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
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        const exportTabTexts = TOOLTIP_CONTENT.exportTab || {};

        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(currentKollektiv, lang, localizedTexts).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        const fileNameTemplate = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;

        const generateButtonHTML = (idSuffix, iconClass, textKey, tooltipKey, disabled = false, experimental = false) => {
            const config = exportTabTexts[tooltipKey];
            if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            
            const text = (localizedTexts.exportTabButtonLabels || {})[textKey] || textKey; // Fallback to key if not found
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type];
            const ext = config.ext;
            const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext);
            const tooltipDesc = typeof config.description === 'string' ? config.description : (config.description[lang] || config.description['de'] || '');
            const tooltipHtml = `data-tippy-content="${tooltipDesc}<br><small>${lang === 'de' ? 'Datei' : 'File'}: ${filename}</small>"`;
            const disabledAttr = disabled ? 'disabled' : '';
            const experimentalBadgeText = lang === 'de' ? 'Experimentell' : 'Experimental';
            const experimentalBadge = experimental ? `<span class="badge bg-warning text-dark ms-1 small">${experimentalBadgeText}</span>` : '';
            const buttonClass = disabled ? 'btn-outline-secondary' : 'btn-outline-primary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span> ${experimentalBadge}</button>`;
        };

         const generateZipButtonHTML = (idSuffix, iconClass, textKey, tooltipKey, disabled = false) => {
            const config = exportTabTexts[tooltipKey];
            if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;

            const text = (localizedTexts.exportTabButtonLabels || {})[textKey] || textKey;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type];
            const ext = config.ext;
            const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext);
            const tooltipDesc = typeof config.description === 'string' ? config.description : (config.description[lang] || config.description['de'] || '');
            const tooltipHtml = `data-tippy-content="${tooltipDesc}<br><small>${lang === 'de' ? 'Datei' : 'File'}: ${filename}</small>"`;
            const disabledAttr = disabled ? 'disabled' : '';
            const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary';
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${text} (.${ext})</span></button>`;
         };

        const exportDescText = (typeof exportTabTexts.description === 'string' ? exportTabTexts.description : (exportTabTexts.description[lang] || exportTabTexts.description['de'] || '')).replace('[KOLLEKTIV]', `<strong>${safeKollektiv}</strong>`);
        const singleExportsTitle = exportTabTexts.singleExports ? (exportTabTexts.singleExports[lang] || exportTabTexts.singleExports) : (lang === 'de' ? 'Einzelexporte' : 'Single Exports');
        const packagesTitle = exportTabTexts.exportPackages ? (exportTabTexts.exportPackages[lang] || exportTabTexts.exportPackages) : (lang === 'de' ? 'Export-Pakete (.zip)' : 'Export Packages (.zip)');
        const hintsTitle = lang === 'de' ? 'Hinweise zum Export' : 'Export Notes';
        
        const hintItems = [
            lang === 'de' ? "Alle Exporte basieren auf dem aktuell gewählten Kollektiv und den zuletzt **angewendeten** T2-Kriterien." : "All exports are based on the currently selected cohort and the last **applied** T2 criteria.",
            lang === 'de' ? "**CSV:** Für Statistiksoftware; Trennzeichen: Semikolon (;)." : "**CSV:** For statistical software; Delimiter: Semicolon (;).",
            lang === 'de' ? "**MD:** Für Dokumentation." : "**MD:** For documentation.",
            lang === 'de' ? "**TXT:** Brute-Force-Bericht." : "**TXT:** Brute-force report.",
            lang === 'de' ? "**HTML Bericht:** Umfassend, druckbar." : "**HTML Report:** Comprehensive, printable.",
            lang === 'de' ? "**PNG:** Pixelbasiert (Diagramme/Tabellen)." : "**PNG:** Pixel-based (charts/tables).",
            lang === 'de' ? "**SVG:** Vektorbasiert (Diagramme), skalierbar." : "**SVG:** Vector-based (charts), scalable.",
            lang === 'de' ? "ZIP-Exporte für Diagramme/Tabellen erfassen nur aktuell im Statistik- oder Auswertungstab sichtbare/gerenderte Elemente. Einzel-Downloads sind direkt am Element möglich (z.B. auch im Präsentationstab)." : "ZIP exports for charts/tables only capture currently visible/rendered elements in the Statistics or Analysis tab. Individual downloads are possible directly on the element (e.g., also in the Presentation tab)."
        ];
        const hintListHTML = hintItems.map(item => `<li class="mb-2"><i class="fas ${item.startsWith('ZIP') || item.startsWith('ZIP exports') ? 'fa-exclamation-triangle text-warning' : 'fa-info-circle text-primary'} fa-fw me-1"></i>${item}</li>`).join('');


        // Assuming textKeys are defined in localizedTexts.exportTabButtonLabels
        // If not, they will fallback to the key itself.
        // Example: localizedTexts.exportTabButtonLabels.statsCSV = "Statistik Ergebnisse" for 'de'
        if (!localizedTexts.exportTabButtonLabels) localizedTexts.exportTabButtonLabels = {};


        return `
            <div class="row export-options-container">
                <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${singleExportsTitle}</div>
                        <div class="card-body">
                            <p class="small text-muted mb-3">${exportDescText}</p>
                            <h6 class="text-muted small text-uppercase mb-2">${lang === 'de' ? 'Berichte & Statistiken' : 'Reports & Statistics'}</h6>
                            ${generateButtonHTML('statistik-csv', 'fas fa-file-csv', 'statsCSV', 'statsCSV')}
                            ${generateButtonHTML('bruteforce-txt', 'fas fa-file-alt', 'bruteForceTXT', 'bruteForceTXT', true)}
                            ${generateButtonHTML('deskriptiv-md', 'fab fa-markdown', 'deskriptivMD', 'deskriptivMD')}
                            ${generateButtonHTML('comprehensive-report-html', 'fas fa-file-invoice', 'comprehensiveReportHTML', 'comprehensiveReportHTML')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${lang === 'de' ? 'Tabellen & Rohdaten' : 'Tables & Raw Data'}</h6>
                             ${generateButtonHTML('daten-md', 'fab fa-markdown', 'datenMD', 'datenMD')}
                             ${generateButtonHTML('auswertung-md', 'fab fa-markdown', 'auswertungMD', 'auswertungMD')}
                             ${generateButtonHTML('filtered-data-csv', 'fas fa-database', 'filteredDataCSV', 'filteredDataCSV')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${lang === 'de' ? 'Diagramme & Tabellen (als Bilder)' : 'Charts & Tables (as Images)'}</h6>
                             ${generateButtonHTML('charts-png', 'fas fa-images', 'chartsPNG', 'pngZIP')}
                             ${generateButtonHTML('charts-svg', 'fas fa-file-code', 'chartsSVG', 'svgZIP')}
                        </div>
                    </div>
                </div>
                 <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${packagesTitle}</div>
                        <div class="card-body">
                             <p class="small text-muted mb-3">${lang === 'de' ? 'Bündelt mehrere thematisch zusammengehörige Exportdateien in einem ZIP-Archiv für das Kollektiv' : 'Bundles multiple thematically related export files into a ZIP archive for the cohort'} <strong>${safeKollektiv}</strong>.</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', 'allZIP', 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', 'csvZIP', 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'mdZIP', 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', 'pngZIP', 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', 'svgZIP', 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">${hintsTitle}</div> <div class="card-body small"> <ul class="list-unstyled mb-0">${hintListHTML}</ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName) {
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        const generalTexts = localizedTexts.general || {};
        
        const cardTitleText = (TOOLTIP_CONTENT.t2MetricsOverview.cardTitle ? (TOOLTIP_CONTENT.t2MetricsOverview.cardTitle[lang] || TOOLTIP_CONTENT.t2MetricsOverview.cardTitle) : '').replace('[KOLLEKTIV]', `<strong>${kollektivName}</strong>`);
        const cardHeader = lang === 'de' ? 'Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)' : 'Brief Overview Diagnostic Performance (T2 vs. N - applied criteria)';

        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
             const noDataText = lang === 'de' ? 'Metriken für T2 nicht verfügbar.' : 'Metrics for T2 not available.';
             return `<div class="card bg-light border-secondary" data-tippy-content="${cardTitleText}"><div class="card-header card-header-sm bg-secondary text-white">${cardHeader}</div><div class="card-body p-2"><p class="m-0 text-muted small">${noDataText}</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { 
            sens: generalTexts.sensitivityShort || 'Sens', 
            spez: generalTexts.specificityShort || 'Spez', 
            ppv: generalTexts.ppvShort || 'PPV', 
            npv: generalTexts.npvShort || 'NPV', 
            acc: generalTexts.accuracyShort || 'Acc', 
            balAcc: (localizedTexts.statMetrics?.balAcc?.name || 'BalAcc').split(' ')[0], // Take first word like "Balanced"
            f1: (localizedTexts.statMetrics?.f1?.name || 'F1').split('-')[0], 
            auc: generalTexts.aucShort || 'AUC'
        };
        const na = generalTexts.notApplicable || '--';

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            let metricDescription = ui_helpers.getMetricDescriptionHTML(key, 'T2', lang);
            
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na, lang);
            let filledInterpretation = ui_helpers.getMetricInterpretationHTML(key, metricData, 'T2', kollektivName, lang);

            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-tippy-content="${metricDescription}">${metricDisplayNames[key]}:</strong>
                    <span data-tippy-content="${filledInterpretation}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-tippy-content="${cardTitleText}"><div class="card-header card-header-sm bg-secondary text-white">${cardHeader}</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createBruteForceModalContent(results, metric, kollektiv, duration, totalTested) {
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        const generalTexts = localizedTexts.general || {};

        if (!results || results.length === 0) return `<p class="text-muted">${lang === 'de' ? 'Keine Ergebnisse gefunden.' : 'No results found.'}</p>`;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
        const getKollektivNameFunc = (kId) => getKollektivDisplayName(kId, lang, localizedTexts);
        const bestResult = results[0];
        const kollektivName = getKollektivNameFunc(kollektiv);
        
        const metricConfig = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === metric);
        const metricDisplayName = metricConfig ? metricConfig.label : metric;


        const bestComboText = lang === 'de' ? 'Beste Kombi für' : 'Best combo for';
        const cohortLabelModal = lang === 'de' ? 'Koll.:' : 'Cohort:';
        const valueLabelModal = lang === 'de' ? 'Wert:' : 'Value:';
        const logicLabelModal = lang === 'de' ? 'Logik:' : 'Logic:';
        const criteriaLabelModal = lang === 'de' ? 'Kriterien:' : 'Criteria:';
        const durationLabelModal = lang === 'de' ? 'Dauer:' : 'Duration:';
        const testedLabelModal = lang === 'de' ? 'Getestet:' : 'Tested:';
        const top10Label = lang === 'de' ? 'Top 10 Ergebnisse (inkl. identischer Werte):' : 'Top 10 Results (incl. identical values):';
        const rankLabel = lang === 'de' ? 'Rang' : 'Rank';

        let tableHTML = `
            <div class="alert alert-light small p-2 mb-3">
                <p class="mb-1"><strong>${bestComboText} '${metricDisplayName}' (${cohortLabelModal} '${kollektivName}'):</strong></p>
                <ul class="list-unstyled mb-1">
                    <li><strong>${valueLabelModal}</strong> ${formatNumber(bestResult.metricValue, 4, '--', lang === 'en')}</li>
                    <li><strong>${logicLabelModal}</strong> ${(localizedTexts.t2LogicDisplayNames || {})[bestResult.logic.toUpperCase()] || bestResult.logic.toUpperCase()}</li>
                    <li><strong>${criteriaLabelModal}</strong> ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}</li>
                </ul>
                <p class="mb-0 text-muted"><small>${durationLabelModal} ${formatNumber(duration / 1000, 1, '--', lang === 'en')}s | ${testedLabelModal} ${formatNumber(totalTested, 0, '--', lang === 'en')}</small></p>
            </div>
            <h6 class="mb-2">${top10Label}</h6>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover small" id="bruteforce-results-table">
                    <thead class="small">
                        <tr>
                            <th data-tippy-content="${rankLabel}">${rankLabel}</th>
                            <th data-tippy-content="${valueLabelModal} ${metricDisplayName}">${metricDisplayName}</th>
                            <th data-tippy-content="${logicLabelModal}">${logicLabelModal}</th>
                            <th data-tippy-content="${criteriaLabelModal}">${criteriaLabelModal}</th>
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
                    <td>${formatNumber(result.metricValue, 4, '--', lang === 'en')}</td>
                    <td>${(localizedTexts.t2LogicDisplayNames || {})[result.logic.toUpperCase()] || result.logic.toUpperCase()}</td>
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
        const lang = state.getCurrentPublikationLang() || 'de';
        const localizedTexts = getLocalizedUITexts(lang);
        const pubTabTexts = localizedTexts.publikationTab || {};
        const sectionLabels = pubTabTexts.sectionLabels || {};
        const currentBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const sectionNavItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            return `
                <li class="nav-item">
                    <a class="nav-link py-2 publikation-section-link" href="#" data-section-id="${mainSection.id}">
                        ${sectionLabels[mainSection.labelKey] || mainSection.labelKey}
                    </a>
                </li>`;
        }).join('');

        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        
        const bfMetricSelectLabel = pubTabTexts.bruteForceMetricSelectLabel || 'Optimierungsmetrik für T2 (BF):';
        const navTitle = lang === 'de' ? 'Abschnitte' : 'Sections';
        const contentPlaceholder = lang === 'de' ? 'Bitte wählen Sie einen Abschnitt aus der Navigation.' : 'Please select a section from the navigation.';


        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: calc(var(--header-height) + var(--nav-height)); z-index: 1010;">
                <div class="col-md-3">
                    <h5 class="mb-2">${navTitle}</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills">
                        ${sectionNavItems}
                    </nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${bfMetricSelectLabel}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${(TOOLTIP_CONTENT.publikationTabTooltips?.bruteForceMetricSelect?.description || {} )[lang] || TOOLTIP_CONTENT.publikationTabTooltips?.bruteForceMetricSelect?.description || ''}">
                               ${bfMetricOptions}
                           </select>
                        </div>
                        <div class="form-check form-switch" data-tippy-content="${(TOOLTIP_CONTENT.publikationTabTooltips?.spracheSwitch?.description || {})[lang] || TOOLTIP_CONTENT.publikationTabTooltips?.spracheSwitch?.description || ''}">
                            <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                            <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${pubTabTexts.spracheSwitchLabel || (lang === 'en' ? 'English' : 'Deutsch')}</label>
                        </div>
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded" style="min-height: 400px; max-height: calc(100vh - var(--header-height) - var(--nav-height) - 70px); overflow-y: auto;">
                        <p class="text-muted">${contentPlaceholder}</p>
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
