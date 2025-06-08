const uiComponents = (() => {

    function _createHeaderButtonHTML(buttons, targetId, defaultTitle = 'Element') {
        if (!Array.isArray(buttons) || buttons.length === 0 || !targetId) {
            return '';
        }
        return buttons.map(btn => {
            const iconClass = btn.icon || 'fa-download';
            const safeChartName = String(btn.chartName || defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '');
            const safeTableName = String(btn.tableName || defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '');
            let tooltip = btn.tooltip || `Aktion für ${defaultTitle}`;

            const dataAttributes = [
                btn.chartId ? `data-chart-id="${btn.chartId}"` : '',
                btn.tableId ? `data-table-id="${btn.tableId}"` : '',
                btn.format ? `data-format="${btn.format}"` : '',
                `data-chart-name="${safeChartName.replace(/\s/g, '_')}"`,
                `data-table-name="${safeTableName.replace(/\s/g, '_')}"`
            ].filter(Boolean).join(' ');

            return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 ${btn.tableId ? 'table-download-png-btn' : 'chart-download-btn'}" ${dataAttributes} data-tippy-content="${tooltip}"><i class="fas ${iconClass}"></i></button>`;
        }).join('');
    }

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        const headerButtonHtml = _createHeaderButtonHTML(downloadButtons, chartId || title.replace(/\s/g, '_'), title);
        const tooltipKey = (chartId || title).replace(/^chart-dash-/, '').replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        const tooltipContent = (TOOLTIP_CONTENT.deskriptiveStatistik[tooltipKey]?.description || title).replace('[KOLLEKTIV]', 'dem aktuellen Kollektiv');

        return `
            <div class="col-xl-2 col-lg-4 col-md-4 col-sm-6 dashboard-card-col ${cardClasses}">
                <div class="card h-100 dashboard-card">
                    <div class="card-header ${headerClasses}" data-tippy-content="${tooltipContent}">
                        <span class="text-truncate">${title}</span>
                        <span class="card-header-buttons flex-shrink-0 ps-1">${headerButtonHtml}</span>
                    </div>
                    <div class="card-body d-flex flex-column justify-content-between ${bodyClasses}">
                        <div class="dashboard-card-content">${content}</div>
                        ${chartId ? `<div id="${chartId}" class="mt-1 w-100 dashboard-chart-container"></div>` : ''}
                    </div>
                </div>
            </div>`;
    }

    function createT2CriteriaControls(initialCriteria, initialLogic) {
        if (!initialCriteria || !initialLogic) return '<p class="text-danger">Fehler: Kriterien für Steuerung nicht verfügbar.</p>';
        const logicChecked = initialLogic === 'ODER';
        const { min, max, step } = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE;
        const sizeThreshold = initialCriteria.size?.threshold ?? getDefaultT2Criteria().size.threshold;
        const formattedThreshold = utils.formatNumber(sizeThreshold, 1, '', true);

        const createButtonOptions = (key, isChecked) => {
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[key.toUpperCase() + '_VALUES'] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => `
                <button class="btn t2-criteria-button criteria-icon-button ${isChecked && currentValue === value ? 'active' : ''}" 
                        data-criterion="${key}" data-value="${value}" 
                        data-tippy-content="${TOOLTIP_CONTENT[`t2${key.charAt(0).toUpperCase() + key.slice(1)}`]?.description || ''}"
                        ${isChecked ? '' : 'disabled'}>
                    ${ui_helpers.getT2IconSVG(key, value)} ${value}
                </button>
            `).join('');
        };

        const createCriteriaGroup = (key, label, tooltipKey, contentGenerator) => `
            <div class="col-md-6 criteria-group">
                <div class="form-check mb-2">
                    <input class="form-check-input criteria-checkbox" type="checkbox" value="${key}" id="check-${key}" ${initialCriteria[key]?.active ? 'checked' : ''}>
                    <label class="form-check-label fw-bold" for="check-${key}">${label}</label>
                    <span data-tippy-content="${TOOLTIP_CONTENT[tooltipKey]?.description || ''}"><i class="fas fa-info-circle text-muted ms-1"></i></span>
                </div>
                <div class="criteria-options-container ps-3">${contentGenerator(key, initialCriteria[key]?.active)}</div>
            </div>`;

        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header">
                    <span>T2 Malignitäts-Kriterien Definieren</span>
                    <div class="form-check form-switch" data-tippy-content="${TOOLTIP_CONTENT.t2Logic.description}">
                         <label class="form-check-label small me-2" for="t2-logic-switch">Logik:</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', 'Größe', 't2Size', isChecked => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range flex-grow-1 me-2" id="range-size" min="${min}" max="${max}" step="${step}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'}>
                                 <span class="criteria-value-display fw-bold me-1" id="value-size">${utils.formatNumber(sizeThreshold, 1)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm" id="input-size" min="${min}" max="${max}" step="${step}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', 'Form', 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', 'Kontur', 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', 'Homogenität', 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', 'Signal', 't2Signal', createButtonOptions)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${TOOLTIP_CONTENT.t2Actions.reset}"><i class="fas fa-undo me-1"></i> Zurücksetzen</button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${TOOLTIP_CONTENT.t2Actions.apply}"><i class="fas fa-check me-1"></i> Anwenden & Speichern</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createBruteForceCard(currentKollektivName, workerAvailable) {
        const disabledAttribute = !workerAvailable ? 'disabled' : '';
        const startButtonText = workerAvailable ? '<i class="fas fa-cogs me-1"></i> Optimierung starten' : '<i class="fas fa-times-circle me-1"></i> Worker nicht verfügbar';
        const metricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt => `<option value="${opt.value}" ${opt.value === APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC ? 'selected' : ''}>${opt.label}</option>`).join('');

        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header">Kriterien-Optimierung (Brute-Force)</div>
                <div class="card-body">
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">Zielmetrik:</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${TOOLTIP_CONTENT.bruteForceMetric.description}">${metricOptions}</select>
                        </div>
                        <div class="col-md-4">
                             <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" ${disabledAttribute}>${startButtonText}</button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end"></div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none"></div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2"></div>
                </div>
            </div>
        </div>`;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        const cardTooltipHtml = tooltipKey && TOOLTIP_CONTENT[tooltipKey]?.cardTitle ? `data-tippy-content="${TOOLTIP_CONTENT[tooltipKey].cardTitle.replace('[KOLLEKTIV]', '<strong>[KOLLEKTIV_PLACEHOLDER]</strong>')}"` : `data-tippy-content="${title}"`;
        const headerButtonHtml = _createHeaderButtonHTML(downloadButtons, id + '-content', title);

        return `
            <div class="col-12 stat-card" id="${id}-card-container">
                <div class="card h-100">
                    <div class="card-header" ${cardTooltipHtml}>
                         ${title}
                         <span class="float-end card-header-buttons">${headerButtonHtml}</span>
                     </div>
                    <div class="card-body ${addPadding ? '' : 'p-0'}">
                        <div id="${id}-content">${content}</div>
                    </div>
                </div>
            </div>`;
    }

    function createPublikationTabHeader() {
        const lang = state.getCurrentPublikationLang();
        const currentBfMetric = state.getCurrentPublikationBruteForceMetric();
        const sectionNavItems = PUBLICATION_CONFIG.sections.map(mainSection => `
            <li class="nav-item">
                <a class="nav-link py-2 publikation-section-link" href="#" data-section-id="${mainSection.id}" data-tippy-content="${TOOLTIP_CONTENT.publikationTabTooltips[mainSection.id]?.description || ''}">
                    ${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey]}
                </a>
            </li>`).join('');
        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt =>
            `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: var(--sticky-header-offset);">
                <div class="col-md-3">
                    <h5 class="mb-2">Abschnitte</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills">${sectionNavItems}</nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${UI_TEXTS.publikationTab.bruteForceMetricSelectLabel}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;">${bfMetricOptions}</select>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                            <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${UI_TEXTS.publikationTab.spracheSwitchLabel[lang]}</label>
                        </div>
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded">
                        <p class="text-muted">Bitte wählen Sie einen Abschnitt.</p>
                    </div>
                </div>
            </div>`;
    }
    
    return Object.freeze({
        createDashboardCard,
        createT2CriteriaControls,
        createBruteForceCard,
        createStatistikCard,
        createPublikationTabHeader
    });
})();
