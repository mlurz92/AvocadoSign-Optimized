const uiComponents = (() => {

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = [], lang = 'de') {
        let headerButtonHtml = '';
         if(downloadButtons && downloadButtons.length > 0 && chartId) {
             headerButtonHtml = downloadButtons.map(btn => {
                const tooltipText = btn.tooltip || (lang === 'en' ? `Download as ${btn.format.toUpperCase()}` : `Als ${btn.format.toUpperCase()} herunterladen`);
                return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${chartId}" data-format="${btn.format}" data-tippy-content="${tooltipText}"> <i class="fas ${btn.icon || 'fa-download'}"></i></button>`
             }).join('');
        }
        const tooltipContent = TOOLTIP_CONTENT?.[lang]?.deskriptiveStatistik?.[chartId]?.description || TOOLTIP_CONTENT?.de?.deskriptiveStatistik?.[chartId]?.description || title || '';
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

    function createT2CriteriaControls(initialCriteria, initialLogic, lang = 'de') {
        if (!initialCriteria || !initialLogic) return `<p class="text-danger">${lang === 'de' ? 'Fehler: Initialkriterien konnten nicht geladen werden.' : 'Error: Initial criteria could not be loaded.'}</p>`;
        const logicChecked = initialLogic === 'ODER';
        const defaultCriteriaForSize = getDefaultT2Criteria();
        const sizeThreshold = initialCriteria.size?.threshold ?? defaultCriteriaForSize?.size?.threshold ?? 5.0;
        const sizeMin = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min;
        const sizeMax = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max;
        const sizeStep = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step;
        const formattedThreshold = formatNumber(sizeThreshold, 1, '5.0', true, lang);
        const uiStrings = UI_TEXTS.t2CriteriaControls?.[lang] || UI_TEXTS.t2CriteriaControls?.de;

        const createButtonOptions = (key, isChecked, criterionLabel) => {
            const valuesKey = key.toUpperCase() + '_VALUES';
            const values = APP_CONFIG.T2_CRITERIA_SETTINGS[valuesKey] || [];
            const currentValue = initialCriteria[key]?.value;
            return values.map(value => {
                const isActiveValue = isChecked && currentValue === value;
                const icon = ui_helpers.getT2IconSVG(key, value);
                const tooltipInactiveText = isChecked ? '' : (lang === 'de' ? ' (Kriterium ist derzeit inaktiv)' : ' (Criterion is currently inactive)');
                const buttonTooltip = `${lang === 'de' ? 'Kriterium' : 'Criterion'} '${criterionLabel}' ${lang === 'de' ? 'auf' : 'to'} '${value}' ${lang === 'de' ? 'setzen' : 'set'}.${tooltipInactiveText}`;
                return `<button class="btn t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isChecked ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${isChecked ? '' : 'disabled'}>${icon}</button>`;
            }).join('');
        };

        const createCriteriaGroup = (key, labelText, tooltipKey, contentGenerator) => {
            const isChecked = initialCriteria[key]?.active === true;
            const tooltip = TOOLTIP_CONTENT?.[lang]?.[tooltipKey]?.description || TOOLTIP_CONTENT?.de?.[tooltipKey]?.description || labelText;
            return `
                <div class="col-md-6 criteria-group">
                    <div class="form-check mb-2">
                        <input class="form-check-input criteria-checkbox" type="checkbox" value="${key}" id="check-${key}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label fw-bold" for="check-${key}">${labelText}</label>
                         <span data-tippy-content="${tooltip}"> <i class="fas fa-info-circle text-muted ms-1"></i></span>
                    </div>
                    <div class="criteria-options-container ps-3">
                        ${contentGenerator(key, isChecked, labelText)}
                    </div>
                </div>`;
        };
        
        const t2SignalNote = TOOLTIP_CONTENT?.[lang]?.t2Signal?.note || TOOLTIP_CONTENT?.de?.t2Signal?.note || "Hinweis: Lymphknoten mit Signal 'null' (d.h. nicht beurteilbar/nicht vorhanden) erfüllen das Signal-Kriterium nie.";

        return `
            <div class="card criteria-card" id="t2-criteria-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${uiStrings?.cardTitle || 'T2 Malignitäts-Kriterien Definieren'}</span>
                    <div class="form-check form-switch" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.t2Logic?.description || TOOLTIP_CONTENT?.de?.t2Logic?.description}">
                         <label class="form-check-label small me-2" for="t2-logic-switch" id="t2-logic-label-prefix">${uiStrings?.logicPrefix || 'Logik:'}</label>
                         <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${logicChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${UI_TEXTS.t2LogicDisplayNames[lang]?.[initialLogic] || initialLogic}</label>
                     </div>
                </div>
                <div class="card-body">
                     <div class="row g-4">
                        ${createCriteriaGroup('size', uiStrings?.sizeLabel || 'Größe', 't2Size', (key, isChecked) => `
                            <div class="d-flex align-items-center flex-wrap">
                                 <span class="me-1 small text-muted">≥</span>
                                 <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.t2Size?.sliderTooltip || TOOLTIP_CONTENT?.de?.t2Size?.sliderTooltip || 'Schwellenwert für Kurzachsendurchmesser (≥) einstellen.'}">
                                 <span class="criteria-value-display text-end me-1 fw-bold" id="value-size">${formatNumber(sizeThreshold, 1, '--', false, lang)}</span><span class="me-2 small text-muted">mm</span>
                                 <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-size" min="${sizeMin}" max="${sizeMax}" step="${sizeStep}" value="${formattedThreshold}" ${isChecked ? '' : 'disabled'} style="width: 70px;" aria-label="${uiStrings?.sizeAriaLabel || 'Größe manuell eingeben'}" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.t2Size?.inputTooltip || TOOLTIP_CONTENT?.de?.t2Size?.inputTooltip || 'Schwellenwert manuell eingeben oder anpassen.'}">
                            </div>
                        `)}
                        ${createCriteriaGroup('form', uiStrings?.formLabel || 'Form', 't2Form', createButtonOptions)}
                        ${createCriteriaGroup('kontur', uiStrings?.konturLabel || 'Kontur', 't2Kontur', createButtonOptions)}
                        ${createCriteriaGroup('homogenitaet', uiStrings?.homogenitaetLabel || 'Homogenität', 't2Homogenitaet', createButtonOptions)}
                        ${createCriteriaGroup('signal', uiStrings?.signalLabel || 'Signal', 't2Signal', (key, isChecked, label) => `
                            <div>${createButtonOptions(key, isChecked, label)}</div>
                            <small class="text-muted d-block mt-1">${t2SignalNote}</small>
                        `)}
                        <div class="col-12 d-flex justify-content-end align-items-center border-top pt-3 mt-3">
                            <button class="btn btn-sm btn-outline-secondary me-2" id="btn-reset-criteria" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.t2Actions?.reset || TOOLTIP_CONTENT?.de?.t2Actions?.reset}">
                                <i class="fas fa-undo me-1"></i> ${uiStrings?.resetButton || 'Zurücksetzen (Standard)'}
                            </button>
                            <button class="btn btn-sm btn-primary" id="btn-apply-criteria" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.t2Actions?.apply || TOOLTIP_CONTENT?.de?.t2Actions?.apply}">
                                <i class="fas fa-check me-1"></i> ${uiStrings?.applyButton || 'Anwenden & Speichern'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createBruteForceCard(currentKollektivName, workerAvailable, lang = 'de') {
        const uiStrings = UI_TEXTS.bruteForceCard?.[lang] || UI_TEXTS.bruteForceCard?.de;
        const disabledAttribute = !workerAvailable ? 'disabled' : '';
        const startButtonText = workerAvailable ? `<i class="fas fa-cogs me-1"></i> ${uiStrings?.startButton || 'Optimierung starten'}` : `<i class="fas fa-times-circle me-1"></i> ${uiStrings?.workerNotAvailableButton || 'Worker nicht verfügbar'}`;
        const statusText = workerAvailable ? (uiStrings?.statusReady || 'Bereit.') : (uiStrings?.statusWorkerNotInit || 'Worker konnte nicht initialisiert werden.');
        const defaultMetric = APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy';
        const metricOptions = [
            {value: "Accuracy", labelKey: "accuracy"},
            {value: "Balanced Accuracy", labelKey: "balancedAccuracy"},
            {value: "F1-Score", labelKey: "f1Score"},
            {value: "PPV", labelKey: "ppv"},
            {value: "NPV", labelKey: "npv"}
        ];

        return `
        <div class="col-12">
            <div class="card">
                <div class="card-header">${uiStrings?.cardTitle || 'Kriterien-Optimierung (Brute-Force)'}</div>
                <div class="card-body">
                    <p class="card-text small">${uiStrings?.description || 'Findet automatisch die Kombination von T2-Kriterien (Größe, Form, Kontur, Homogenität, Signal) und Logik (UND/ODER), die eine gewählte diagnostische Metrik im Vergleich zum N-Status maximiert.'}</p>
                    <div class="row g-3 align-items-end mb-3">
                        <div class="col-md-4">
                            <label for="brute-force-metric" class="form-label form-label-sm">${uiStrings?.targetMetricLabel || 'Zielmetrik:'}</label>
                            <select class="form-select form-select-sm" id="brute-force-metric" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.bruteForceMetric?.description || TOOLTIP_CONTENT?.de?.bruteForceMetric?.description}">
                                ${metricOptions.map(opt => `<option value="${opt.value}" ${defaultMetric === opt.value ? 'selected' : ''}>${UI_TEXTS.statMetrics[lang]?.[opt.labelKey]?.name || UI_TEXTS.statMetrics.de[opt.labelKey]?.name || opt.value}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-4">
                             <button class="btn btn-primary btn-sm w-100" id="btn-start-brute-force" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.bruteForceStart?.description || TOOLTIP_CONTENT?.de?.bruteForceStart?.description}" ${disabledAttribute}>
                                 ${startButtonText}
                             </button>
                        </div>
                         <div class="col-md-4">
                             <div id="brute-force-info" class="text-muted small text-md-end" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.bruteForceInfo?.description || TOOLTIP_CONTENT?.de?.bruteForceInfo?.description}">
                                 ${uiStrings?.statusPrefix || 'Status:'} <span id="bf-status-text" class="fw-bold">${statusText}</span><br>${uiStrings?.cohortPrefix || 'Kollektiv:'} <strong id="bf-kollektiv-info">${currentKollektivName}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.bruteForceProgress?.description || TOOLTIP_CONTENT?.de?.bruteForceProgress?.description}">
                         <div class="d-flex justify-content-between mb-1 small">
                            <span>${uiStrings?.progressLabel || 'Fortschritt:'} <span id="bf-tested-count">0</span> / <span id="bf-total-count">0</span></span>
                            <span id="bf-progress-percent">0%</span>
                         </div>
                         <div class="progress" style="height: 8px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" id="bf-progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                         </div>
                         <div class="mt-2 small">
                            ${uiStrings?.bestMetricLabel || 'Beste'} <span id="bf-metric-label" class="fw-bold">${UI_TEXTS.statMetrics[lang]?.[defaultMetric.toLowerCase().replace(' ','')]?.name || defaultMetric}</span> ${uiStrings?.bestMetricSuffix || 'bisher:'} <span id="bf-best-metric" class="fw-bold">--</span>
                            <div id="bf-best-criteria" class="mt-1 text-muted" style="word-break: break-word;">${uiStrings?.bestCriteriaLabel || 'Beste Kriterien:'} --</div>
                         </div>
                          <button class="btn btn-danger btn-sm mt-2 d-none" id="btn-cancel-brute-force" data-tippy-content="${lang === 'de' ? 'Bricht die laufende Brute-Force-Optimierung ab.' : 'Cancels the ongoing brute-force optimization.'}">
                            <i class="fas fa-times me-1"></i> ${uiStrings?.cancelButton || 'Abbrechen'}
                         </button>
                     </div>
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.bruteForceResult?.description || TOOLTIP_CONTENT?.de?.bruteForceResult?.description}">
                         <h6 class="alert-heading small">${uiStrings?.resultTitle || 'Optimierung Abgeschlossen'}</h6>
                         <p class="mb-1 small">${uiStrings?.resultBestCombinationFor || 'Beste Kombi für'} <strong id="bf-result-metric"></strong> (${uiStrings?.resultCohort || 'Koll.'}: <strong id="bf-result-kollektiv"></strong>):</p>
                         <ul class="list-unstyled mb-1 small">
                            <li><strong>${uiStrings?.resultValue || 'Wert:'}</strong> <span id="bf-result-value" class="fw-bold"></span></li>
                            <li><strong>${uiStrings?.resultLogic || 'Logik:'}</strong> <span id="bf-result-logic" class="fw-bold"></span></li>
                            <li style="word-break: break-word;"><strong>${uiStrings?.resultCriteria || 'Kriterien:'}</strong> <span id="bf-result-criteria" class="fw-bold"></span></li>
                         </ul>
                         <p class="mb-1 small text-muted">${uiStrings?.resultDuration || 'Dauer:'} <span id="bf-result-duration"></span>s | ${uiStrings?.resultTested || 'Getestet:'} <span id="bf-result-total-tested"></span></small></p>
                         <hr class="my-1">
                         <button class="btn btn-success btn-sm me-2" id="btn-apply-best-bf-criteria" data-tippy-content="${lang === 'de' ? 'Wendet die beste gefundene Kriterienkombination an und speichert sie.' : 'Applies the best found criteria combination and saves it.'}">
                             <i class="fas fa-check me-1"></i> ${uiStrings?.applyButtonResult || 'Anwenden'}
                         </button>
                         <button class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-tippy-content="${TOOLTIP_CONTENT?.[lang]?.bruteForceDetailsButton?.description || TOOLTIP_CONTENT?.de?.bruteForceDetailsButton?.description}">
                             <i class="fas fa-list-ol me-1"></i> ${uiStrings?.top10Button || 'Top 10'}
                         </button>
                     </div>
                </div>
            </div>
        </div>
        `;
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null, lang = 'de') {
        const cardTooltipHtml = tooltipKey && (TOOLTIP_CONTENT?.[lang]?.[tooltipKey]?.cardTitle || TOOLTIP_CONTENT?.de?.[tooltipKey]?.cardTitle)
            ? `data-tippy-content="${(TOOLTIP_CONTENT[lang]?.[tooltipKey]?.cardTitle || TOOLTIP_CONTENT.de[tooltipKey].cardTitle).replace(/\[KOLLEKTIV\]/g, '{KOLLEKTIV_PLACEHOLDER}')}"`
            : '';

        let headerButtonHtml = downloadButtons.map(btn => {
            const btnTooltipText = btn.tooltip || (lang === 'de' ? (btn.tableId ? `Tabelle als PNG` : `Als ${btn.format.toUpperCase()}`) : (btn.tableId ? `Table as PNG` : `As ${btn.format.toUpperCase()}`));
            if (btn.tableId) {
                return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${btn.id}" data-table-id="${btn.tableId}" data-table-name="${btn.tableName || title.replace(/[^a-z0-9]/gi, '_').substring(0,30)}" data-tippy-content="${btnTooltipText}"><i class="fas ${btn.icon || 'fa-image'}"></i></button>`;
            } else {
                 return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${btn.chartId || id+'-content'}" data-format="${btn.format}" data-tippy-content="${btnTooltipText}"><i class="fas ${btn.icon || 'fa-download'}"></i></button>`;
            }
        }).join('');


        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId && !downloadButtons.some(b => b.tableId === tableId)) {
             const pngExportButtonTooltip = lang === 'de' ? `Tabelle '${title}' als PNG herunterladen.` : `Download table '${title}' as PNG.`;
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

    function createExportOptions(currentKollektiv, lang = 'de') {
        const dateStr = getCurrentDateString(APP_CONFIG.EXPORT_SETTINGS.DATE_FORMAT);
        const safeKollektiv = getKollektivDisplayName(currentKollektiv, lang).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        const fileNameTemplate = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TEMPLATE;
        const uiStrings = UI_TEXTS.exportTab?.[lang] || UI_TEXTS.exportTab?.de;


        const generateButtonHTML = (idSuffix, iconClass, textKey, tooltipKey, disabled = false, experimental = false) => {
            const config = TOOLTIP_CONTENT?.[lang]?.exportTab?.[tooltipKey] || TOOLTIP_CONTENT?.de?.exportTab?.[tooltipKey];
            if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext;
            const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext);
            const tooltipHtml = `data-tippy-content="${config.description}<br><small>${lang==='de'?'Datei':'File'}: ${filename}</small>"`;
            const disabledAttr = disabled ? 'disabled' : '';
            const experimentalBadgeText = lang==='de'?'Experimentell':'Experimental';
            const experimentalBadge = experimental ? `<span class="badge bg-warning text-dark ms-1 small">${experimentalBadgeText}</span>` : '';
            const buttonClass = disabled ? 'btn-outline-secondary' : 'btn-outline-primary';
            const buttonText = uiStrings?.buttons?.[textKey] || textKey;
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${buttonText} (.${ext})</span> ${experimentalBadge}</button>`;
        };

         const generateZipButtonHTML = (idSuffix, iconClass, textKey, tooltipKey, disabled = false) => {
            const config = TOOLTIP_CONTENT?.[lang]?.exportTab?.[tooltipKey] || TOOLTIP_CONTENT?.de?.exportTab?.[tooltipKey];
            if (!config || !APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]) return ``;
            const type = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES[config.type]; const ext = config.ext;
            const filename = fileNameTemplate.replace('{TYPE}', type).replace('{KOLLEKTIV}', safeKollektiv).replace('{DATE}', dateStr).replace('{EXT}', ext);
            const tooltipHtml = `data-tippy-content="${config.description}<br><small>${lang==='de'?'Datei':'File'}: ${filename}</small>"`;
            const disabledAttr = disabled ? 'disabled' : '';
            const buttonClass = idSuffix === 'all-zip' ? 'btn-primary' : 'btn-outline-secondary';
            const buttonText = uiStrings?.buttons?.[textKey] || textKey;
            return `<button class="btn ${buttonClass} w-100 mb-2 d-flex justify-content-start align-items-center" id="export-${idSuffix}" ${tooltipHtml} ${disabledAttr}><i class="${iconClass} fa-fw me-2"></i> <span class="flex-grow-1 text-start">${buttonText} (.${ext})</span></button>`;
         };

        const exportDesc = (TOOLTIP_CONTENT?.[lang]?.exportTab?.description || TOOLTIP_CONTENT?.de?.exportTab?.description).replace('[KOLLEKTIV]', `<strong>${safeKollektiv}</strong>`);
        const notesTitle = uiStrings?.notesTitle || "Hinweise zum Export";
        const notesItems = uiStrings?.notesItems || [
            "Alle Exporte basieren auf dem aktuell gewählten Kollektiv und den zuletzt **angewendeten** T2-Kriterien.",
            "**CSV:** Für Statistiksoftware; Trennzeichen: Semikolon (;).",
            "**MD:** Für Dokumentation.",
            "**TXT:** Brute-Force-Bericht.",
            "**HTML Bericht:** Umfassend, druckbar.",
            "**PNG:** Pixelbasiert (Diagramme/Tabellen).",
            "**SVG:** Vektorbasiert (Diagramme), skalierbar.",
            "ZIP-Exporte für Diagramme/Tabellen erfassen nur aktuell im Statistik- oder Auswertungstab sichtbare/gerenderte Elemente. Einzel-Downloads sind direkt am Element möglich (z.B. auch im Präsentationstab)."
        ];

        return `
            <div class="row export-options-container">
                <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${uiStrings?.singleExports || 'Einzelexporte'}</div>
                        <div class="card-body">
                            <p class="small text-muted mb-3">${exportDesc}</p>
                            <h6 class="text-muted small text-uppercase mb-2">${uiStrings?.reportsStatsHeader || 'Berichte & Statistiken'}</h6>
                            ${generateButtonHTML('statistik-csv', 'fas fa-file-csv', 'statsCSV', 'statsCSV')}
                            ${generateButtonHTML('bruteforce-txt', 'fas fa-file-alt', 'bruteForceTXT', 'bruteForceTXT', true)}
                            ${generateButtonHTML('deskriptiv-md', 'fab fa-markdown', 'deskriptivMD', 'deskriptivMD')}
                            ${generateButtonHTML('comprehensive-report-html', 'fas fa-file-invoice', 'comprehensiveReportHTML', 'comprehensiveReportHTML')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${uiStrings?.tablesRawDataHeader || 'Tabellen & Rohdaten'}</h6>
                             ${generateButtonHTML('daten-md', 'fab fa-markdown', 'datenMD', 'datenMD')}
                             ${generateButtonHTML('auswertung-md', 'fab fa-markdown', 'auswertungMD', 'auswertungMD')}
                             ${generateButtonHTML('filtered-data-csv', 'fas fa-database', 'filteredDataCSV', 'filteredDataCSV')}
                             <h6 class="mt-3 text-muted small text-uppercase mb-2">${uiStrings?.chartsTablesImageHeader || 'Diagramme & Tabellen (als Bilder)'}</h6>
                             ${generateButtonHTML('charts-png', 'fas fa-images', 'pngZIPExport', 'pngZIP')}
                             ${generateButtonHTML('charts-svg', 'fas fa-file-code', 'svgZIPExport', 'svgZIP')}
                        </div>
                    </div>
                </div>
                 <div class="col-lg-6 col-xl-4 mb-3">
                    <div class="card h-100">
                        <div class="card-header">${uiStrings?.exportPackages || 'Export-Pakete (.zip)'}</div>
                        <div class="card-body">
                             <p class="small text-muted mb-3">${(uiStrings?.exportPackagesDescription || 'Bündelt mehrere thematisch zusammengehörige Exportdateien in einem ZIP-Archiv für das Kollektiv <strong>[KOLLEKTIV]</strong>.').replace('[KOLLEKTIV]', safeKollektiv)}</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', 'allZIP', 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', 'csvZIP', 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'mdZIP', 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', 'pngZIP', 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', 'svgZIP', 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">${notesTitle}</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> ${notesItems.map(item => `<li class="mb-2">${item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</li>`).join('')} </ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName, lang = 'de') {
        const cardTitleKey = TOOLTIP_CONTENT?.[lang]?.t2MetricsOverview?.cardTitle || TOOLTIP_CONTENT?.de?.t2MetricsOverview?.cardTitle || (lang === 'de' ? "Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)" : "Brief Overview Diagnostic Performance (T2 vs. N - applied criteria)");
        const cardTooltip = cardTitleKey.replace('[KOLLEKTIV]', `<strong>${kollektivName}</strong>`);
        const noDataMsg = lang === 'de' ? "Metriken für T2 nicht verfügbar." : "Metrics for T2 not available.";

        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
             return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">${cardTitleKey.split(' für das Kollektiv:')[0]}</div><div class="card-body p-2"><p class="m-0 text-muted small">${noDataMsg}</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC' };
        const na = '--';

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            const metricDescription = (TOOLTIP_CONTENT?.[lang]?.t2MetricsOverview?.[key] || TOOLTIP_CONTENT?.[lang]?.statMetrics?.[key]?.description || TOOLTIP_CONTENT?.de?.statMetrics?.[key]?.description || key).replace(/\[METHODE\]/g, 'T2');
            const interpretationTemplate = TOOLTIP_CONTENT?.[lang]?.statMetrics?.[key]?.interpretation || TOOLTIP_CONTENT?.de?.statMetrics?.[key]?.interpretation || (lang==='de'?'Keine Interpretation verfügbar.':'No interpretation available.');
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na, lang);
            const valueStr = formatNumber(metricData?.value, digits, na, false, lang);
            const lowerStr = formatNumber(metricData?.ci?.lower, digits, na, false, lang);
            const upperStr = formatNumber(metricData?.ci?.upper, digits, na, false, lang);
            const ciMethodStr = metricData?.method || na;
            const bewertungStr = (key === 'auc') ? getAUCBewertung(metricData?.value, lang) : '';

            let filledInterpretation = interpretationTemplate
                .replace(/\[METHODE\]/g, 'T2')
                .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent && valueStr !== na ? '%' : ''}</strong>`)
                .replace(/\[LOWER\]/g, lowerStr)
                .replace(/\[UPPER\]/g, upperStr)
                .replace(/\[METHOD_CI\]/g, ciMethodStr)
                .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
                .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

            if (lowerStr === na || upperStr === na || ciMethodStr === na) {
                 filledInterpretation = filledInterpretation.replace(/\(95% CI nach .*?: .*? - .*?\)/g, (lang === 'de' ? '(Keine CI-Daten verfügbar)' : '(No CI data available)'));
                 filledInterpretation = filledInterpretation.replace(/nach \[METHOD_CI\]:/g, '');
                 filledInterpretation = filledInterpretation.replace(/by \[METHOD_CI\]:/g, '');
            }
            filledInterpretation = filledInterpretation.replace(/<hr.*?>.*$/, '');

            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-tippy-content="${metricDescription}">${metricDisplayNames[key]}:</strong>
                    <span data-tippy-content="${filledInterpretation}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">${cardTitleKey.split(lang==='de'?' für das Kollektiv:':' for cohort:')[0]}</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createBruteForceModalContent(results, metric, kollektiv, duration, totalTested, lang = 'de') {
        if (!results || results.length === 0) return `<p class="text-muted">${lang === 'de' ? 'Keine Ergebnisse gefunden.' : 'No results found.'}</p>`;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s, lg) => 'Formatierungsfehler';
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k, lg) => k;
        const bestResult = results[0];
        const kollektivName = getKollektivNameFunc(kollektiv, lang);
        const metricDisplayName = UI_TEXTS.statMetrics[lang]?.[metric.toLowerCase().replace('-score','').replace(' ','')]?.name || UI_TEXTS.statMetrics.de[metric.toLowerCase().replace('-score','').replace(' ','')]?.name || metric;
        const uiStrings = UI_TEXTS.bruteForceModal?.[lang] || UI_TEXTS.bruteForceModal?.de;

        let tableHTML = `
            <div class="alert alert-light small p-2 mb-3">
                <p class="mb-1"><strong>${(uiStrings?.bestCombinationFor || 'Beste Kombi für').replace('[METRIC]', metricDisplayName).replace('[KOLLEKTIV]', kollektivName)}:</strong></p>
                <ul class="list-unstyled mb-1">
                    <li><strong>${uiStrings?.valueLabel || 'Wert:'}</strong> ${formatNumber(bestResult.metricValue, 4, '--', false, lang)}</li>
                    <li><strong>${uiStrings?.logicLabel || 'Logik:'}</strong> ${UI_TEXTS.t2LogicDisplayNames[lang]?.[bestResult.logic.toUpperCase()] || bestResult.logic.toUpperCase()}</li>
                    <li><strong>${uiStrings?.criteriaLabel || 'Kriterien:'}</strong> ${formatCriteriaFunc(bestResult.criteria, bestResult.logic, false, lang)}</li>
                </ul>
                <p class="mb-0 text-muted"><small>${uiStrings?.durationLabel || 'Dauer:'} ${formatNumber(duration / 1000, 1, '--', false, lang)}s | ${uiStrings?.testedLabel || 'Getestet:'} ${formatNumber(totalTested, 0, '--', false, lang)}</small></p>
            </div>
            <h6 class="mb-2">${uiStrings?.top10Title || 'Top 10 Ergebnisse (inkl. identischer Werte):'}</h6>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover small" id="bruteforce-results-table">
                    <thead class="small">
                        <tr>
                            <th data-tippy-content="${uiStrings?.rankTooltip || 'Rang'}">${uiStrings?.rankHeader || 'Rang'}</th>
                            <th data-tippy-content="${(uiStrings?.metricValueTooltip || 'Wert der Zielmetrik ({METRIC_NAME})').replace('{METRIC_NAME}', metricDisplayName)}">${metricDisplayName}</th>
                            <th data-tippy-content="${uiStrings?.logicTooltip || 'Logik'}">${uiStrings?.logicHeader || 'Logik'}</th>
                            <th data-tippy-content="${uiStrings?.criteriaTooltip || 'Kriterienkombination'}">${uiStrings?.criteriaHeader || 'Kriterien'}</th>
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
                    <td>${formatNumber(result.metricValue, 4, '--', false, lang)}</td>
                    <td>${UI_TEXTS.t2LogicDisplayNames[lang]?.[result.logic.toUpperCase()] || result.logic.toUpperCase()}</td>
                    <td>${formatCriteriaFunc(result.criteria, result.logic, false, lang)}</td>
                </tr>`;

            if (isNewRank || i === 0) {
                lastMetricValue = result.metricValue;
            }
            displayedCount++;
        }
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function createPublikationTabHeader(lang = 'de') {
        const currentBfMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const uiStringsPub = UI_TEXTS.publikationTab?.[lang] || UI_TEXTS.publikationTab?.de;

        const sectionNavItems = PUBLICATION_CONFIG.sections.map(mainSection => {
            const label = UI_TEXTS.publikationTab.sectionLabels[lang]?.[mainSection.labelKey] || UI_TEXTS.publikationTab.sectionLabels.de[mainSection.labelKey] || mainSection.labelKey;
            return `
                <li class="nav-item">
                    <a class="nav-link py-2 publikation-section-link" href="#" data-section-id="${mainSection.id}">
                        ${label}
                    </a>
                </li>`;
        }).join('');

        const bfMetricOptions = PUBLICATION_CONFIG.bruteForceMetricsForPublication.map(opt => {
            const label = UI_TEXTS.publikationTab.bfMetrics[lang]?.[opt.labelKey] || UI_TEXTS.publikationTab.bfMetrics.de[opt.labelKey] || opt.value;
            return `<option value="${opt.value}" ${opt.value === currentBfMetric ? 'selected' : ''}>${label}</option>`;
        }).join('');
        
        const tooltipBfSelect = TOOLTIP_CONTENT?.[lang]?.publikationTabTooltips?.bruteForceMetricSelect?.description || TOOLTIP_CONTENT?.de?.publikationTabTooltips?.bruteForceMetricSelect?.description || '';
        const tooltipLangSwitch = TOOLTIP_CONTENT?.[lang]?.publikationTabTooltips?.spracheSwitch?.description || TOOLTIP_CONTENT?.de?.publikationTabTooltips?.spracheSwitch?.description || '';
        const noSectionSelectedText = lang === 'de' ? "Bitte wählen Sie einen Abschnitt aus der Navigation." : "Please select a section from the navigation.";


        return `
            <div class="row mb-3 sticky-top bg-light py-2 shadow-sm" style="top: calc(var(--header-height) + var(--nav-height)); z-index: 1010;">
                <div class="col-md-3">
                    <h5 class="mb-2">${uiStringsPub.sectionLabels.sectionsTitle || (lang === 'de' ? 'Abschnitte' : 'Sections')}</h5>
                    <nav id="publikation-sections-nav" class="nav flex-column nav-pills">
                        ${sectionNavItems}
                    </nav>
                </div>
                <div class="col-md-9">
                    <div class="d-flex justify-content-end align-items-center mb-2">
                        <div class="me-3">
                           <label for="publikation-bf-metric-select" class="form-label form-label-sm mb-0 me-1">${uiStringsPub.bruteForceMetricSelectLabel}</label>
                           <select class="form-select form-select-sm d-inline-block" id="publikation-bf-metric-select" style="width: auto;" data-tippy-content="${tooltipBfSelect}">
                               ${bfMetricOptions}
                           </select>
                        </div>
                        <div class="form-check form-switch" data-tippy-content="${tooltipLangSwitch}">
                            <input class="form-check-input" type="checkbox" role="switch" id="publikation-sprache-switch" ${lang === 'en' ? 'checked' : ''}>
                            <label class="form-check-label fw-bold" for="publikation-sprache-switch" id="publikation-sprache-label">${uiStringsPub.spracheSwitchLabel[lang]}</label>
                        </div>
                    </div>
                    <div id="publikation-content-area" class="bg-white p-3 border rounded" style="min-height: 400px; max-height: calc(100vh - var(--header-height) - var(--nav-height) - 70px); overflow-y: auto;">
                        <p class="text-muted">${noSectionSelectedText}</p>
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
