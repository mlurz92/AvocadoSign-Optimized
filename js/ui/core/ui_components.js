const uiComponents = (() => {

    function _createHeaderButtonHTML(buttonConfig, cardId) {
        if (!buttonConfig || typeof buttonConfig !== 'object' || (typeof APP_CONFIG === 'undefined' && !buttonConfig.icon && !buttonConfig.tooltip)) {
             console.warn("_createHeaderButtonHTML: buttonConfig oder APP_CONFIG unvollständig.");
             return '';
        }
        const appConfig = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { EXPORT_SETTINGS: { ENABLE_TABLE_PNG_EXPORT: false }};

        const iconClass = buttonConfig.icon || 'fa-question-circle';
        const title = buttonConfig.tooltip || buttonConfig.label || 'Aktion';
        const btnClass = buttonConfig.class || 'btn-outline-secondary';
        const id = buttonConfig.id || `${cardId}-btn-${(typeof generateUUID === 'function' ? generateUUID().substring(0,8) : Math.random().toString(36).substring(2,10))}`;
        let attributes = '';
        if (buttonConfig.action) attributes += ` data-action="${buttonConfig.action}"`;
        if (buttonConfig.targetId) attributes += ` data-target-id="${buttonConfig.targetId}"`;
        if (buttonConfig.format) attributes += ` data-format="${buttonConfig.format}"`;
        if (buttonConfig.chartId) attributes += ` data-chart-id="${buttonConfig.chartId}"`;
        if (buttonConfig.tableId) attributes += ` data-table-id="${buttonConfig.tableId}"`;
        if (buttonConfig.chartName) attributes += ` data-chart-name="${buttonConfig.chartName}"`;

        return `<button type="button" class="btn btn-sm ${btnClass} ms-1 praes-dl-btn" id="${id}" data-tippy-content="${title}" ${attributes}><i class="fas ${iconClass}"></i></button>`;
    }

    function createT2CriteriaControls(initialCriteria, initialLogic) {
        const localAppConfig = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { DEFAULT_SETTINGS: { DEFAULT_T2_CRITERIA: {}, DEFAULT_T2_LOGIC: 'UND' }, T2_CRITERIA_SETTINGS: { SIZE_RANGE: { min: 0, max: 10, step: 0.5, default: 5 } } };
        const localUiTexts = typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : { t2CriteriaShort: {}, t2CriteriaCard: {}, t2LogicDisplayNames: {}, t2CriteriaValues: {} };
        const localTooltipContent = typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : { t2CriteriaCard: {} };
        const localUiHelpers = typeof ui_helpers !== 'undefined' ? ui_helpers : { getT2IconSVG: () => '<svg></svg>' };

        const defaultConfig = localAppConfig.DEFAULT_SETTINGS.DEFAULT_T2_CRITERIA || {};
        const criteriaSettings = localAppConfig.T2_CRITERIA_SETTINGS || { SIZE_RANGE: { min: 0, max: 10, step: 0.5, default: 5 }};
        const criteriaToUse = {};

        const defaultKeys = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        defaultKeys.forEach(key => {
            const defaultCriterion = defaultConfig[key] || { active: false, value: null, threshold: criteriaSettings.SIZE_RANGE?.default || 5.0};
            criteriaToUse[key] = {
                active: initialCriteria?.[key]?.active ?? defaultCriterion.active,
                value: initialCriteria?.[key]?.value ?? defaultCriterion.value,
                threshold: initialCriteria?.[key]?.threshold ?? defaultCriterion.threshold
            };
        });

        const logicToUse = initialLogic || defaultConfig.logic || localAppConfig.DEFAULT_SETTINGS.DEFAULT_T2_LOGIC || 'UND';
        const t2Tooltips = localTooltipContent.t2CriteriaCard || {};
        const t2Texts = localUiTexts.t2CriteriaCard || {};

        let html = `
            <div class="card card-primary shadow-sm" id="t2-criteria-card">
                <div class="card-header">
                    <h6 class="card-title mb-0">${t2Texts.title || 'T2-gewichtete MRT Kriterien Definition'}</h6>
                    <div class="card-header-actions">
                        <button class="btn btn-sm btn-outline-secondary" id="btn-save-t2-criteria" data-tippy-content="${t2Tooltips.saveButton?.description || 'Kriterien speichern'}"><i class="fas fa-save me-1"></i> ${t2Texts.saveButtonLabel || 'Speichern'}</button>
                        <button class="btn btn-sm btn-outline-danger ms-2" id="btn-reset-t2-criteria" data-tippy-content="${t2Tooltips.resetButton?.description || 'Kriterien zurücksetzen'}"><i class="fas fa-undo me-1"></i> ${t2Texts.resetButtonLabel || 'Reset'}</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 criteria-set">`;

        ['size', 'form', 'kontur'].forEach(key => {
            const criterion = criteriaToUse[key];
            const setting = criteriaSettings[key.toUpperCase() + '_VALUES'] || (key === 'size' ? criteriaSettings.SIZE_RANGE : []);
            const label = (localUiTexts.t2CriteriaShort && localUiTexts.t2CriteriaShort[key]) || key.charAt(0).toUpperCase() + key.slice(1);
            const tooltip = (t2Tooltips[key] && t2Tooltips[key].description) || `Einstellung für ${label}`;
            const iconSVG = localUiHelpers.getT2IconSVG(key === 'size' ? 'ruler-horizontal' : key, key === 'size' ? null : criterion.value);
            
            html += `<div class="mb-3 criteria-group" data-criterion="${key}">
                        <div class="d-flex align-items-center mb-1">
                            <div class="form-check form-switch me-2">
                                <input class="form-check-input t2-criterion-active-check" type="checkbox" role="switch" id="check-${key}" data-criterion="${key}" ${criterion.active ? 'checked' : ''}>
                                <label class="form-check-label visually-hidden" for="check-${key}">Aktiv</label>
                            </div>
                            <span class="fw-bold me-2" data-tippy-content="${tooltip}">${iconSVG} ${label}</span>
                            ${key === 'size' ? `<span class="ms-auto badge bg-secondary criteria-value-display" id="value-${key}">${formatNumber(criterion.threshold, 1)} mm</span>` : ''}
                        </div>
                        <div class="criteria-options-container ${criterion.active ? '' : 'disabled-criterion-control-group'}">`;
            if (key === 'size' && setting && typeof setting.min === 'number') {
                html += `<div class="d-flex align-items-center">
                            <input type="range" class="form-range flex-grow-1 me-2 criteria-range" id="range-${key}" min="${setting.min}" max="${setting.max}" step="${setting.step}" value="${criterion.threshold || setting.default}" ${criterion.active ? '' : 'disabled'}>
                            <input type="number" class="form-control form-control-sm text-center criteria-input-manual" id="input-${key}" min="${setting.min}" max="${setting.max}" step="${setting.step}" value="${criterion.threshold || setting.default}" style="width: 70px;" ${criterion.active ? '' : 'disabled'}>
                         </div>`;
            } else if (Array.isArray(setting)) {
                html += `<div class="btn-group btn-group-sm w-100" role="group" aria-label="${label} Optionen">`;
                setting.forEach(val => {
                    const valLabel = (localUiTexts.t2CriteriaValues && localUiTexts.t2CriteriaValues[key] && localUiTexts.t2CriteriaValues[key][val]) || val;
                    const valIcon = localUiHelpers.getT2IconSVG(key, val);
                    html += `<button type="button" class="btn btn-outline-secondary t2-criteria-button ${criterion.value === val && criterion.active ? 'active' : ''} ${criterion.active ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${val}" data-tippy-content="${valLabel}" ${criterion.active ? '' : 'disabled'}>${valIcon}</button>`;
                });
                html += `</div>`;
            }
            html += `</div></div>`;
        });
        html += `</div><div class="col-md-6 criteria-set">`;

        ['homogenitaet', 'signal'].forEach(key => {
            const criterion = criteriaToUse[key];
            const setting = criteriaSettings[key.toUpperCase() + '_VALUES'] || [];
            const label = (localUiTexts.t2CriteriaShort && localUiTexts.t2CriteriaShort[key]) || key.charAt(0).toUpperCase() + key.slice(1);
            const tooltip = (t2Tooltips[key] && t2Tooltips[key].description) || `Einstellung für ${label}`;
            const iconSVG = localUiHelpers.getT2IconSVG(key, criterion.value);

            html += `<div class="mb-3 criteria-group" data-criterion="${key}">
                        <div class="d-flex align-items-center mb-1">
                             <div class="form-check form-switch me-2">
                                <input class="form-check-input t2-criterion-active-check" type="checkbox" role="switch" id="check-${key}" data-criterion="${key}" ${criterion.active ? 'checked' : ''}>
                                <label class="form-check-label visually-hidden" for="check-${key}">Aktiv</label>
                            </div>
                            <span class="fw-bold me-2" data-tippy-content="${tooltip}">${iconSVG} ${label}</span>
                        </div>
                        <div class="criteria-options-container ${criterion.active ? '' : 'disabled-criterion-control-group'}">
                            <div class="btn-group btn-group-sm w-100" role="group" aria-label="${label} Optionen">`;
            if (Array.isArray(setting)) {
                setting.forEach(val => {
                     const valLabel = (localUiTexts.t2CriteriaValues && localUiTexts.t2CriteriaValues[key] && localUiTexts.t2CriteriaValues[key][val]) || val;
                     const valIcon = localUiHelpers.getT2IconSVG(key, val);
                     html += `<button type="button" class="btn btn-outline-secondary t2-criteria-button ${criterion.value === val && criterion.active ? 'active' : ''} ${criterion.active ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${val}" data-tippy-content="${valLabel}" ${criterion.active ? '' : 'disabled'}>${valIcon}</button>`;
                });
            }
            html += `</div></div></div>`;
        });
        html += `<div class="mt-3">
                    <div class="form-check form-switch d-flex align-items-center justify-content-center">
                        <input class="form-check-input me-2" type="checkbox" role="switch" id="t2-logic-switch" ${logicToUse === 'ODER' ? 'checked' : ''}>
                        <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label" data-tippy-content="${t2Tooltips.logicSwitch?.description || 'Logische Verknüpfung der Kriterien'}">${(localUiTexts.t2LogicDisplayNames && localUiTexts.t2LogicDisplayNames[logicToUse]) || logicToUse}</label>
                    </div>
                 </div>`;
        html += `</div></div></div></div>`;
        return html;
    }

    function createBruteForceCard(currentKollektiv, workerAvailable) {
        const localAppConfig = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { DEFAULT_SETTINGS: { BRUTE_FORCE_METRIC: 'Balanced Accuracy' } };
        const localUiTexts = typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : { bruteForceCard: {}, statMetrics: {} };
        const localTooltipContent = typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : { bruteForceCard: {} };

        const bfTooltips = localTooltipContent.bruteForceCard || {};
        const bfTexts = localUiTexts.bruteForceCard || {};
        const defaultMetric = localAppConfig.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy';
        const kollektivDisplayName = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName(currentKollektiv) : currentKollektiv;

        let metricOptionsHTML = '';
        if (localUiTexts.statMetrics) {
            metricOptionsHTML = Object.entries(localUiTexts.statMetrics)
                .filter(([key, val]) => val && val.optimizable)
                .map(([key, val]) => `<option value="${val.name}" ${val.name === defaultMetric ? 'selected' : ''}>${val.name}</option>`)
                .join('');
        }


        return `
            <div class="card card-accent-info shadow-sm" id="brute-force-card">
                <div class="card-header">
                    <h6 class="card-title mb-0">${bfTexts.title || 'Brute-Force T2-Kriterien Optimierung'}</h6>
                </div>
                <div class="card-body">
                    <div class="mb-2" id="brute-force-info" data-tippy-content="${(bfTooltips.info?.description || 'Optimiere T2-Kriterien für Kollektiv [KOLLEKTIV_NAME]. Aktueller Status: [STATUS_TEXT].').replace('[KOLLEKTIV_NAME]', kollektivDisplayName).replace('[STATUS_TEXT]', workerAvailable ? 'Bereit' : 'Worker nicht verfügbar')}">
                        <small class="text-muted">Kollektiv: <strong id="bf-kollektiv-info">${kollektivDisplayName}</strong>. <span id="bf-status-text">${workerAvailable ? 'Bereit.' : 'Worker nicht verfügbar.'}</span></small>
                    </div>
                    <div class="input-group input-group-sm mb-3">
                        <label class="input-group-text" for="brute-force-metric">${bfTexts.metricSelectLabel || 'Zielmetrik:'}</label>
                        <select class="form-select" id="brute-force-metric" data-tippy-content="${bfTooltips.metricSelect?.description || 'Metrik für die Optimierung auswählen'}">
                            ${metricOptionsHTML}
                        </select>
                    </div>
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button class="btn btn-sm btn-primary" id="btn-start-brute-force" ${workerAvailable ? '' : 'disabled'} data-tippy-content="${bfTooltips.startButton?.description || 'Startet die Brute-Force Optimierung'}">
                            <i class="fas fa-cogs me-1"></i> ${workerAvailable ? (bfTexts.startButtonLabel || 'Optimierung starten') : 'Starten (Worker fehlt)'}
                        </button>
                        <button class="btn btn-sm btn-danger d-none" id="btn-cancel-brute-force" data-tippy-content="${bfTooltips.cancelButton?.description || 'Bricht die laufende Optimierung ab'}">
                            <i class="fas fa-times-circle me-1"></i> ${bfTexts.cancelButtonLabel || 'Abbrechen'}
                        </button>
                    </div>
                    <div id="brute-force-progress-container" class="mt-3 d-none">
                        <div class="progress" style="height: 20px;" data-tippy-content="${bfTooltips.progressBar?.description || 'Fortschritt der Optimierung. Getestete Kombinationen von [TOTAL]'}">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"><span id="bf-progress-percent">0%</span></div>
                        </div>
                        <div class="text-muted small mt-1 d-flex justify-content-between">
                            <span>Getestet: <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span>Akt. Best (<span id="bf-metric-label">${defaultMetric}</span>): <strong id="bf-best-metric">--</strong></span>
                        </div>
                         <div class="text-muted small mt-1" id="bf-best-criteria" style="font-size: 0.75rem; line-height: 1.2;">Beste Kriterien: --</div>
                    </div>
                    <div id="brute-force-result-container" class="mt-3 p-2 border rounded bg-light d-none" data-tippy-content="${(bfTooltips.resultContainer?.description || 'Bestes Ergebnis der Optimierung für N=[N_GESAMT] Patienten ([N_PLUS] N+, [N_MINUS] N-).').replace('[N_GESAMT]', '?').replace('[N_PLUS]','?').replace('[N_MINUS]','?')}">
                        <h6 class="small mb-1">Bestes Ergebnis für <span id="bf-result-metric">${defaultMetric}</span> (<span id="bf-result-kollektiv">${kollektivDisplayName}</span>):</h6>
                        <p class="mb-1"><strong>Wert: <span id="bf-result-value">--</span></strong></p>
                        <p class="mb-1 small">Kriterien: <code id="bf-result-criteria" class="small">--</code> (<span id="bf-result-logic"></span>)</p>
                        <p class="mb-0 small text-muted">
                            Dauer: <span id="bf-result-duration">--</span>s | Getestet: <span id="bf-result-total-tested">--</span> Komb. <br/>
                            Basis: N=<span id="bf-result-kollektiv-n">--</span> (<span id="bf-result-kollektiv-nplus">--</span> N+, <span id="bf-result-kollektiv-nminus">--</span> N-)
                        </p>
                        <div class="d-flex justify-content-end mt-2">
                            <button class="btn btn-sm btn-success me-2" id="btn-apply-best-bf-criteria" data-tippy-content="${bfTooltips.applyButton?.description || 'Übernimmt die besten gefundenen Kriterien in den T2-Kriterien-Definitionsbereich.'}"><i class="fas fa-check-circle me-1"></i> ${bfTexts.applyButtonLabel || 'Anwenden'}</button>
                            <button class="btn btn-sm btn-outline-secondary" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#bruteForceModal" data-tippy-content="${bfTooltips.detailsButton?.description || 'Zeigt die Top-Ergebnisse der Optimierung an.'}"><i class="fas fa-list-ul me-1"></i> ${bfTexts.detailsButtonLabel || 'Details'}</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createDashboardCard(title, valueHTML, chartOrContentId, bgClass = 'bg-light', cardId = null, headerActions = null, downloadButtons = []) {
        const id = cardId || `dash-card-${(typeof generateUUID === 'function' ? generateUUID().substring(0,8) : Math.random().toString(36).substring(2,10))}`;
        let headerActionsHTML = '';
        if (Array.isArray(downloadButtons) && downloadButtons.length > 0) {
             headerActionsHTML += downloadButtons.map(btnConfig => _createHeaderButtonHTML(btnConfig, id)).join('');
        }
        if (headerActions) { 
            if (Array.isArray(headerActions)) { headerActionsHTML += headerActions.map(btnHTML => btnHTML).join('');}
            else { headerActionsHTML += String(headerActions); }
        }

        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${chartOrContentId && chartOrContentId.startsWith('chart-') ? 'chart-card' : 'metric-card'}">
                <div class="card h-100 shadow-sm dashboard-card ${bgClass}" id="${id}">
                    <div class="card-header pt-2 pb-1 ps-3 pe-2 d-flex justify-content-between align-items-center">
                        <h6 class="card-title mb-0 small fw-bold text-uppercase text-muted">${title}</h6>
                        ${headerActionsHTML ? `<div class="card-header-actions">${headerActionsHTML}</div>` : ''}
                    </div>
                    <div class="card-body text-center d-flex flex-column justify-content-center align-items-center p-2">
                        ${chartOrContentId ? `<div id="${chartOrContentId}" class="w-100 h-100 dashboard-chart-container">` : ''}
                        ${valueHTML || ''}
                        ${chartOrContentId ? `</div>` : ''}
                    </div>
                </div>
            </div>`;
    }

    function createStatistikCard(cardId, title, contentHTML, isCollapsible = false, tooltipKey = null, downloadButtons = [], exportTableId = null) {
        const localTooltipContent = typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : { statistikKarten: {} };
        const localAppConfig = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { EXPORT_SETTINGS: { ENABLE_TABLE_PNG_EXPORT: false } };

        const cardTooltip = (tooltipKey && localTooltipContent.statistikKarten && localTooltipContent.statistikKarten[tooltipKey]) ? (localTooltipContent.statistikKarten[tooltipKey].description || title) : title;
        const collapseId = isCollapsible ? `${cardId}-collapse` : '';
        let headerActionsHTML = '';

        if (Array.isArray(downloadButtons) && downloadButtons.length > 0) {
             headerActionsHTML += downloadButtons.map(btnConfig => _createHeaderButtonHTML(btnConfig, cardId)).join('');
        }
        if(exportTableId && localAppConfig.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT){
            const pngButtonTooltip = (localTooltipContent.statistikKarten?.exportTableAsPngButtonTooltip || 'Tabelle als PNG exportieren');
            headerActionsHTML += _createHeaderButtonHTML({ id: `dl-png-${exportTableId}`, format: 'png', icon: 'fa-image', tooltip: pngButtonTooltip, tableId: exportTableId}, cardId);
        }

        return `
            <div class="card card-accent-primary shadow-sm mb-3 statistik-card" id="${cardId}" data-tippy-content="${cardTooltip}">
                <div class="card-header ${isCollapsible ? 'collapsible-card-header' : ''}" ${isCollapsible ? `data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="true" aria-controls="${collapseId}" style="cursor: pointer;"` : ''}>
                    <h6 class="card-title mb-0">${title}</h6>
                    <div class="card-header-actions">
                        ${headerActionsHTML}
                        ${isCollapsible ? '<i class="fas fa-chevron-down collapse-icon ms-2"></i>' : ''}
                    </div>
                </div>
                <div id="${collapseId}" class="collapse ${isCollapsible ? 'show' : ''}">
                    <div class="card-body small p-2">
                        ${contentHTML}
                    </div>
                </div>
            </div>`;
    }

    function createConfusionMatrixHTML(matrix, methodName, kollektivName, tableId = null, tooltipKey = null) {
        const localUiTexts = typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : { konfusionsmatrix: {} };
        const localTooltipContent = typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : { konfusionsmatrix: {} };

        if (!matrix || typeof matrix !== 'object') return '<p class="text-muted small">Konfusionsmatrix nicht verfügbar.</p>';
        
        const kollektivDisplayName = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName(kollektivName) : kollektivName;
        const id = tableId || `conf-matrix-${String(methodName).replace(/\s+/g, '_')}-${String(kollektivDisplayName).replace(/\s+/g, '_')}`;
        const tt = (tooltipKey && localTooltipContent.konfusionsmatrix && localTooltipContent.konfusionsmatrix[tooltipKey]) ? localTooltipContent.konfusionsmatrix[tooltipKey] : {};
        const cmTexts = localUiTexts.konfusionsmatrix || {};

        return `
            <table class="table table-sm table-bordered text-center small confusion-matrix-table" id="${id}">
                <caption class="visually-hidden">Konfusionsmatrix für ${methodName} in Kollektiv ${kollektivDisplayName}</caption>
                <thead>
                    <tr>
                        <th class="bg-light" scope="col" rowspan="2" colspan="2" data-tippy-content="${tt.achseBeschreibung || 'Vorhersage vs. Wahrheit'}"></th>
                        <th class="bg-light" scope="col" colspan="2" data-tippy-content="${tt.wahrheitLabel || 'Wahrer N-Status'}">${cmTexts.wahrheitLabel || 'Wahrheit (N-Status)'}</th>
                    </tr>
                    <tr>
                        <th class="bg-light" scope="col" data-tippy-content="${tt.wahrheitPositivLabel || 'Positiv (N+)'}">${cmTexts.wahrheitPositivLabel || 'N+'}</th>
                        <th class="bg-light" scope="col" data-tippy-content="${tt.wahrheitNegativLabel || 'Negativ (N-)'}">${cmTexts.wahrheitNegativLabel || 'N-'}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th class="bg-light" scope="row" rowspan="2" data-tippy-content="${tt.vorhersageLabel || 'Vorhersage durch Methode'}"><span class="cm-axis-label">${cmTexts.vorhersageLabel || 'Vorhersage'}</span></th>
                        <th class="bg-light" scope="row" data-tippy-content="${tt.vorhersagePositivLabel || 'Positiv'}">${cmTexts.vorhersagePositivLabel || '+'}</th>
                        <td data-tippy-content="${tt.tp || 'Richtig Positiv (TP)'}">${matrix.tp ?? 0}</td>
                        <td data-tippy-content="${tt.fp || 'Falsch Positiv (FP)'}">${matrix.fp ?? 0}</td>
                    </tr>
                    <tr>
                        <th class="bg-light" scope="row" data-tippy-content="${tt.vorhersageNegativLabel || 'Negativ'}">${cmTexts.vorhersageNegativLabel || '-'}</th>
                        <td data-tippy-content="${tt.fn || 'Falsch Negativ (FN)'}">${matrix.fn ?? 0}</td>
                        <td data-tippy-content="${tt.tn || 'Richtig Negativ (TN)'}">${matrix.tn ?? 0}</td>
                    </tr>
                </tbody>
            </table>`;
    }
    
    function createT2MetricsOverview(statsT2, currentKollektiv) {
        const localUiTexts = typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : { statMetrics: {} };
        const localAppConfig = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { SPECIAL_IDS: {} };
        const localTooltipContent = typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : { t2MetricsOverview: {} };
        
        if (!localUiTexts.statMetrics) return '<p class="text-danger">Fehler: Konfiguration für T2 Metrik Übersicht nicht verfügbar.</p>';

        const na = '--';
        const fCI = (metric, key, defaultDigits = 1) => {
            const isRate = !(key === 'auc' || key === 'f1');
            const digits = (key === 'auc' || key === 'f1') ? 3 : defaultDigits;
            return formatCI(metric?.value, metric?.ci?.lower, metric?.ci?.upper, digits, isRate, na);
        };
        const appliedCriteriaDisplayName = localAppConfig.SPECIAL_IDS?.APPLIED_CRITERIA_DISPLAY_NAME || "Angewandt";
        const getInterpretationTT = (mk, st) => { return (typeof ui_helpers !== 'undefined' && ui_helpers.getMetricInterpretationHTML) ? ui_helpers.getMetricInterpretationHTML(mk, st, `T2 (${appliedCriteriaDisplayName})`, currentKollektiv) : '';};
        const ttOverview = localTooltipContent.t2MetricsOverview || {};

        let content = `<div class="row g-2 align-items-center t2-metrics-overview-bar">`;
        const metricsToShow = ['sens', 'spez', 'acc', 'auc'];
        metricsToShow.forEach(key => {
            const metricConfig = localUiTexts.statMetrics[key] || {name: key.toUpperCase(), short: key.toUpperCase()};
            const valueStr = statsT2 && statsT2[key] ? fCI(statsT2[key], key, metricConfig.digits) : na;
            const interpretation = statsT2 && statsT2[key] ? getInterpretationTT(key, statsT2[key]) : (ttOverview[key]?.interpretationNoData || 'Keine Daten');
            content += `
                <div class="col text-center" data-tippy-content="${interpretation}">
                    <span class="metric-label small text-muted">${metricConfig.short || metricConfig.name}</span>
                    <span class="metric-value fw-bold d-block">${valueStr}</span>
                </div>`;
        });
        content += `</div>`;
        return content;
    }

    function createPresentationControls(currentView, studyCriteriaSets, currentStudyId) {
         const localUiTexts = typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : { praesentationTab: {} };
         const localTooltipContent = typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : { praesentation: {} };
         const localAppConfig = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { SPECIAL_IDS: {}, DEFAULT_SETTINGS: {} };

         const praesTexts = localUiTexts.praesentationTab || {};
         const praesTooltips = localTooltipContent.praesentation || {};
         const appliedCriteriaStudyId = localAppConfig.SPECIAL_IDS?.APPLIED_CRITERIA_STUDY_ID || "__applied_criteria__";
         const appliedCriteriaDisplayName = localAppConfig.SPECIAL_IDS?.APPLIED_CRITERIA_DISPLAY_NAME || "Aktuell angewandt";
         const defaultStudyId = currentStudyId || localAppConfig.DEFAULT_SETTINGS?.DEFAULT_PRAESENTATION_STUDY_ID || appliedCriteriaStudyId;


         let optionsHTML = `<option value="${appliedCriteriaStudyId}" ${defaultStudyId === appliedCriteriaStudyId ? 'selected' : ''}>${appliedCriteriaDisplayName}</option>`;
         if (Array.isArray(studyCriteriaSets)) {
             studyCriteriaSets.forEach(set => {
                if(set.id !== appliedCriteriaStudyId){ // Avoid duplicating applied criteria if it's already first
                    optionsHTML += `<option value="${set.id}" ${defaultStudyId === set.id ? 'selected' : ''}>${set.name || set.id}</option>`;
                }
             });
         }

        return `
            <div class="row align-items-center">
                <div class="col-md-auto">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Präsentationsansicht Auswahl">
                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-as-pur-radio" value="as-pur" ${currentView === 'as-pur' ? 'checked' : ''} autocomplete="off">
                        <label class="btn btn-outline-primary ${currentView === 'as-pur' ? 'active' : ''}" for="praes-as-pur-radio" data-tippy-content="${praesTooltips.asPurView?.description || 'AS Pur Performance'}"><i class="fas fa-star me-1"></i> ${praesTexts.asPurViewLabel || 'AS Pur'}</label>

                        <input type="radio" class="btn-check" name="praesentationAnsicht" id="praes-as-vs-t2-radio" value="as-vs-t2" ${currentView === 'as-vs-t2' ? 'checked' : ''} autocomplete="off">
                        <label class="btn btn-outline-primary ${currentView === 'as-vs-t2' ? 'active' : ''}" for="praes-as-vs-t2-radio" data-tippy-content="${praesTooltips.asVsT2View?.description || 'AS vs. T2 Vergleich'}"><i class="fas fa-balance-scale me-1"></i> ${praesTexts.asVsT2ViewLabel || 'AS vs. T2'}</label>
                    </div>
                </div>
                <div class="col-md" id="praes-study-select-container" style="${currentView === 'as-vs-t2' ? '' : 'display: none;'}">
                    <div class="input-group input-group-sm">
                         <label class="input-group-text" for="praes-study-select">${praesTexts.t2SetSelectLabel || 'T2-Basis:'}</label>
                         <select class="form-select" id="praes-study-select" data-tippy-content="${praesTooltips.t2SetSelect?.description || 'Wähle das T2 Kriterienset für den Vergleich'}">
                            ${optionsHTML}
                         </select>
                    </div>
                </div>
            </div>`;
    }
    
    function createExportOptions(currentKollektiv) {
        const localAppConfig = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { EXPORT_SETTINGS: { FILENAME_TYPES: {} } };
        const localUiTexts = typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : { exportTab: {} };
        const localTooltipContent = typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : { exportTab: {} };

        const exportTexts = localUiTexts.exportTab || {};
        const exportTooltips = localTooltipContent.exportTab || {};
        const filenameTypes = localAppConfig.EXPORT_SETTINGS.FILENAME_TYPES || {};
        const kollektivDisplayName = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName(currentKollektiv) : currentKollektiv;


        const createButton = (id, icon, textKey, tooltipKey, typeKey, additionalClasses = '') => {
            const text = exportTexts[textKey] || textKey;
            const tooltipText = exportTooltips[tooltipKey]?.description || text;
            const type = filenameTypes[typeKey] || typeKey;
            return `<button class="btn btn-primary mb-2 me-2 ${additionalClasses}" id="${id}" data-export-type="${type}" data-tippy-content="${tooltipText}"><i class="fas ${icon} me-1"></i> ${text}</button>`;
        };
        
        let html = `<p class="text-muted">Datenexport für Kollektiv: <strong>${kollektivDisplayName}</strong></p><hr/>`;
        html += '<h5>Tabellen & Berichte</h5>';
        html += createButton('export-statistik-csv', 'fa-table', 'exportGesamtStatistikCSV', 'statsCSV', 'STATS_CSV');
        html += createButton('export-bruteforce-txt', 'fa-file-alt', 'exportBruteForceBericht', 'bruteForceTXT', 'BRUTEFORCE_TXT');
        html += createButton('export-deskriptiv-md', 'fa-file-word', 'exportDeskriptiveStatistikMD', 'deskriptivMD', 'DESKRIPTIV_MD');
        html += createButton('export-daten-md', 'fa-users', 'exportDatenlisteMD', 'datenMD', 'DATEN_MD');
        html += createButton('export-auswertung-md', 'fa-tasks', 'exportAuswertungstabelleMD', 'auswertungMD', 'AUSWERTUNG_MD');
        html += createButton('export-filtered-data-csv', 'fa-filter', 'exportAktuelleDatenCSV', 'filteredDataCSV', 'FILTERED_DATA_CSV');
        html += createButton('export-publication-gesamt-md', 'fa-book-open', 'exportPublikationsentwurfMD', 'publicationGesamtMD', 'PUBLIKATION_GESAMT_MD');
        html += createButton('export-comprehensive-report-html', 'fa-file-invoice', 'exportGesamtberichtHTML', 'comprehensiveReportHTML', 'COMPREHENSIVE_REPORT_HTML');
        
        html += '<hr/><h5>Diagramme</h5>';
        html += createButton('export-charts-png', 'fa-chart-bar', 'exportAlleDiagrammePNG', 'chartsPNG', 'PNG_ZIP', 'btn-info');
        html += createButton('export-charts-svg', 'fa-vector-square', 'exportAlleDiagrammeSVG', 'chartsSVG', 'SVG_ZIP', 'btn-info');

        html += '<hr/><h5>ZIP-Pakete</h5>';
        html += createButton('export-all-zip', 'fa-file-archive', 'exportAlleDateienZIP', 'allZIP', 'ALL_ZIP', 'btn-success');
        html += createButton('export-csv-zip', 'fa-file-csv', 'exportAlleCsvZIP', 'csvZIP', 'CSV_ZIP', 'btn-outline-success');
        html += createButton('export-md-zip', 'fab fa-markdown', 'exportAlleMarkdownZIP', 'mdZIP', 'MD_ZIP', 'btn-outline-success');
        
        return html;
    }

    function createBruteForceModalContent(resultsData) {
        const localAppConfig = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { PERFORMANCE_SETTINGS: { BRUTE_FORCE_MAX_TOP_RESULTS: 10 }};
        const localTooltipContent = typeof TOOLTIP_CONTENT !== 'undefined' ? TOOLTIP_CONTENT : { bruteForceModal: {} };

        if (!resultsData || !resultsData.results || resultsData.results.length === 0) {
            return '<p class="text-muted">Keine Ergebnisse zum Anzeigen.</p>';
        }
        const formatCritFunc = (typeof studyT2CriteriaManager !== 'undefined' && studyT2CriteriaManager.formatCriteriaForDisplay) ? studyT2CriteriaManager.formatCriteriaForDisplay : (c,l) => 'N/A';
        const topN = localAppConfig.PERFORMANCE_SETTINGS?.BRUTE_FORCE_MAX_TOP_RESULTS || 10;
        const resultsToDisplay = resultsData.results.slice(0, topN);
        const ttModal = localTooltipContent.bruteForceModal || {};
        const kollektivDisplayName = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName(resultsData.kollektiv) : resultsData.kollektiv;


        let tableHTML = `
            <p class="small text-muted">Zeige Top ${resultsToDisplay.length} von ${resultsData.totalTested || resultsData.results.length} getesteten/gefundenen Ergebnissen. Optimiert für <strong>${(typeof ui_helpers !== 'undefined' && ui_helpers.escapeMarkdown) ? ui_helpers.escapeMarkdown(String(resultsData.metric)) : String(resultsData.metric)}</strong> auf Kollektiv <strong>${kollektivDisplayName}</strong> (N=${resultsData.nGesamt || '?'}).</p>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover small" id="brute-force-results-table">
                    <thead>
                        <tr>
                            <th data-tippy-content="${ttModal.rang || 'Rang'}">#</th>
                            <th data-tippy-content="${ttModal.metrikWert || 'Wert der Zielmetrik'}">${(typeof ui_helpers !== 'undefined' && ui_helpers.escapeMarkdown) ? ui_helpers.escapeMarkdown(String(resultsData.metric)) : String(resultsData.metric)}</th>
                            <th data-tippy-content="${ttModal.logik || 'Logische Verknüpfung'}">Logik</th>
                            <th data-tippy-content="${ttModal.kriterien || 'Kriterienkombination'}">Kriterien</th>
                            <th data-tippy-content="${ttModal.sens || 'Sensitivität'}">Sens.</th>
                            <th data-tippy-content="${ttModal.spez || 'Spezifität'}">Spez.</th>
                             <th data-tippy-content="${ttModal.acc || 'Accuracy'}">Acc.</th>
                            <th data-tippy-content="${ttModal.auc || 'AUC'}">AUC</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        resultsToDisplay.forEach((res, index) => {
            tableHTML += `
                <tr>
                    <td>${index + 1}.</td>
                    <td><strong>${formatNumber(res.metricValue, 4)}</strong></td>
                    <td>${res.logic || 'N/A'}</td>
                    <td style="font-size: 0.8em; line-height:1.2;">${formatCritFunc(res.criteria, res.logic, false)}</td>
                    <td>${formatPercent(res.sens, 1)}</td>
                    <td>${formatPercent(res.spez, 1)}</td>
                    <td>${formatPercent(res.acc, 1)}</td>
                    <td>${formatNumber(res.auc || res.balAcc, 3, '--', false)}</td>
                </tr>`;
        });

        tableHTML += `</tbody></table></div>`;
        if (resultsData.results.length > topN) {
            tableHTML += `<p class="small text-muted mt-2">Hinweis: Die vollständige Liste aller Ergebnisse kann über den Export-Button auf der Brute-Force Karte (Auswertungstab) als Textdatei heruntergeladen werden.</p>`;
        }
        return tableHTML;
    }

    return Object.freeze({
        createT2CriteriaControls,
        createBruteForceCard,
        createDashboardCard,
        createStatistikCard,
        createConfusionMatrixHTML,
        createT2MetricsOverview,
        createPresentationControls,
        createExportOptions,
        createBruteForceModalContent
    });
})();
