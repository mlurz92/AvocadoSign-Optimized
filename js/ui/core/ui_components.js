const uiComponents = (() => {

    function createDashboardCard(title, content, chartId = null, cardClasses = '', headerClasses = '', bodyClasses = '', downloadButtons = []) {
        let headerButtonHtml = '';
         if(downloadButtons && downloadButtons.length > 0 && chartId) {
             headerButtonHtml = downloadButtons.map(btn =>
                 `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${chartId}" data-format="${btn.format}" data-tippy-content="${btn.tooltip || `Als ${btn.format.toUpperCase()} herunterladen`}"> <i class="fas ${btn.icon || 'fa-download'}"></i></button>`
             ).join('');
        }
        const tooltipContent = TOOLTIP_CONTENT.deskriptiveStatistik[chartId]?.description || title || '';
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
                             <div id="brute-force-info" class="text-muted small text-md-end" data-tippy-content="${TOOLTIP_CONTENT.bruteForceInfo.description}">
                                 Status: <span id="bf-status-text" class="fw-bold">${statusText}</span><br>Kollektiv: <strong id="bf-kollektiv-info">${currentKollektivName}</strong>
                             </div>
                         </div>
                    </div>
                     <div id="brute-force-progress-container" class="mt-3 d-none" data-tippy-content="${TOOLTIP_CONTENT.bruteForceProgress.description}">
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
                     <div id="brute-force-result-container" class="mt-3 d-none alert alert-success p-2" role="alert" data-tippy-content="${TOOLTIP_CONTENT.bruteForceResult.description}">
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
                         <button class="btn btn-outline-secondary btn-sm" id="btn-show-brute-force-details" data-bs-toggle="modal" data-bs-target="#brute-force-modal" data-tippy-content="${TOOLTIP_CONTENT.bruteForceDetailsButton.description}">
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
            ? `data-tippy-content="${TOOLTIP_CONTENT[tooltipKey].cardTitle.replace(/\[KOLLEKTIV\]/g, '{KOLLEKTIV_PLACEHOLDER}')}"`
            : '';

        let headerButtonHtml = downloadButtons.map(btn => `
            <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${btn.id}" data-chart-id="${id}-content" data-format="${btn.format}" data-tippy-content="${btn.tooltip}">
                <i class="fas ${btn.icon}"></i>
            </button>`).join('');

        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId) {
             const pngExportButton = { id: `dl-${id}-table-png`, icon: 'fa-image', tooltip: `Tabelle '${title}' als PNG herunterladen.`, format: 'png', tableId: tableId, tableName: title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0,30) };
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

        const exportDesc = TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${safeKollektiv}</strong>`);

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
                             ${generateButtonHTML('patienten-md', 'fab fa-markdown', 'Patientenliste', 'patientenMD')}
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
                             <p class="small text-muted mb-3">Bündelt mehrere thematisch zusammengehörige Exportdateien in einem ZIP-Archiv für das Kollektiv <strong>${safeKollektiv}</strong>.</p>
                            ${generateZipButtonHTML('all-zip', 'fas fa-file-archive', 'Gesamtpaket (Alle Dateien)', 'allZIP')}
                            ${generateZipButtonHTML('csv-zip', 'fas fa-file-csv', 'Nur CSVs', 'csvZIP')}
                            ${generateZipButtonHTML('md-zip', 'fab fa-markdown', 'Nur Markdown', 'mdZIP')}
                            ${generateZipButtonHTML('png-zip', 'fas fa-images', 'Nur Diagramm/Tabellen-PNGs', 'pngZIP')}
                            ${generateZipButtonHTML('svg-zip', 'fas fa-file-code', 'Nur Diagramm-SVGs', 'svgZIP')}
                        </div>
                    </div>
                </div>
                <div class="col-lg-12 col-xl-4 mb-3">
                   <div class="card h-100"> <div class="card-header">Hinweise zum Export</div> <div class="card-body small"> <ul class="list-unstyled mb-0"> <li class="mb-2"><i class="fas fa-info-circle fa-fw me-1 text-primary"></i>Alle Exporte basieren auf dem aktuell gewählten Kollektiv und den zuletzt **angewendeten** T2-Kriterien.</li> <li class="mb-2"><i class="fas fa-table fa-fw me-1 text-primary"></i>**CSV:** Für Statistiksoftware; Trennzeichen: Semikolon (;).</li> <li class="mb-2"><i class="fab fa-markdown fa-fw me-1 text-primary"></i>**MD:** Für Dokumentation.</li> <li class="mb-2"><i class="fas fa-file-alt fa-fw me-1 text-primary"></i>**TXT:** Brute-Force-Bericht.</li> <li class="mb-2"><i class="fas fa-file-invoice fa-fw me-1 text-primary"></i>**HTML Bericht:** Umfassend, druckbar.</li> <li class="mb-2"><i class="fas fa-images fa-fw me-1 text-primary"></i>**PNG:** Pixelbasiert (Diagramme/Tabellen).</li> <li class="mb-2"><i class="fas fa-file-code fa-fw me-1 text-primary"></i>**SVG:** Vektorbasiert (Diagramme), skalierbar.</li> <li class="mb-0"><i class="fas fa-exclamation-triangle fa-fw me-1 text-warning"></i>ZIP-Exporte erfassen nur aktuell sichtbare Elemente. Einzel-Downloads sind direkt am Element möglich.</li> </ul> </div> </div>
                </div>
            </div>
        `;
    }

    function createT2MetricsOverview(stats, kollektivName) {
        const cardTooltip = (TOOLTIP_CONTENT.t2MetricsOverview.cardTitle || '').replace('[KOLLEKTIV]', `<strong>${kollektivName}</strong>`);
        if (!stats || !stats.matrix || stats.matrix.rp === undefined) {
             return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)</div><div class="card-body p-2"><p class="m-0 text-muted small">Metriken für T2 nicht verfügbar.</p></div></div>`;
        }
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { sens: 'Sens', spez: 'Spez', ppv: 'PPV', npv: 'NPV', acc: 'Acc', balAcc: 'BalAcc', f1: 'F1', auc: 'AUC' };
        const na = '--';

        let contentHTML = '<div class="d-flex flex-wrap justify-content-around small text-center">';

        metrics.forEach((key, index) => {
            const metricData = stats[key];
            const metricDescription = (TOOLTIP_CONTENT.t2MetricsOverview?.[key] || TOOLTIP_CONTENT.statMetrics[key]?.description || key).replace(/\[METHODE\]/g, 'T2');
            const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
            const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
            const isPercent = !(key === 'f1' || key === 'auc');
            const formattedValue = formatCI(metricData?.value, metricData?.ci?.lower, metricData?.ci?.upper, digits, isPercent, na);
            const valueStr = formatNumber(metricData?.value, digits, na);
            const lowerStr = formatNumber(metricData?.ci?.lower, digits, na);
            const upperStr = formatNumber(metricData?.ci?.upper, digits, na);
            const ciMethodStr = metricData?.method || na;
            const bewertungStr = (key === 'auc') ? getAUCBewertung(metricData?.value) : '';

            const filledInterpretation = interpretationTemplate
                .replace(/\[METHODE\]/g, 'T2')
                .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent ? '%' : ''}</strong>`)
                .replace(/\[LOWER\]/g, lowerStr)
                .replace(/\[UPPER\]/g, upperStr)
                .replace(/\[METHOD_CI\]/g, ciMethodStr)
                .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
                .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`)
                .replace(/<hr.*?>.*$/, ''); // Remove second part if exists

            contentHTML += `
                <div class="p-1 flex-fill bd-highlight ${index > 0 ? 'border-start' : ''}">
                    <strong data-tippy-content="${metricDescription}">${metricDisplayNames[key]}:</strong>
                    <span data-tippy-content="${filledInterpretation}"> ${formattedValue}</span>
                </div>`;
        });

        contentHTML += '</div>';

        return `<div class="card bg-light border-secondary" data-tippy-content="${cardTooltip}"><div class="card-header card-header-sm bg-secondary text-white">Kurzübersicht Diagnostische Güte (T2 vs. N - angew. Kriterien)</div><div class="card-body p-2">${contentHTML}</div></div>`;
    }

    function createMethodenBeschreibungContent(lang = 'de') {
        const placeholders = { ANZAHL_GESAMT: '[ANZAHL_GESAMT]', ANZAHL_DIREKT_OP: '[ANZAHL_DIREKT_OP]', ANZAHL_NRCT: '[ANZAHL_NRCT]', T2_SIZE_MIN: '[T2_SIZE_MIN]', T2_SIZE_MAX: '[T2_SIZE_MAX]', BOOTSTRAP_REPLICATIONS: '[BOOTSTRAP_REPLICATIONS]', SIGNIFICANCE_LEVEL: '[SIGNIFICANCE_LEVEL]' };
        const texts = {
             de: `
                <h3 id="methoden-studienanlage">1. Studienanlage und Software</h3>
                <p>Diese Analyse basiert auf einer **retrospektiven Auswertung prospektiv erhobener Daten** einer monozentrischen Kohorte von Patientinnen und Patienten mit histologisch gesichertem Rektumkarzinom, die ursprünglich für die Evaluation des „Avocado Signs" rekrutiert wurde (Lurz & Schäfer, Eur Radiol 2025). Die vorliegende Untersuchung nutzt eine **speziell entwickelte, interaktive Webanwendung** (v${APP_CONFIG.APP_VERSION}, implementiert in HTML5, CSS3, JavaScript ES6+) als primäres Werkzeug für die Datenanalyse, statistische Auswertung und Visualisierung. Alle hier berichteten Ergebnisse wurden mit dieser Anwendung generiert.</p>

                <h3 id="methoden-patientenkohorte">2. Patientenkollektiv und Datenbasis</h3>
                <p>Das analysierte Kollektiv umfasst ${placeholders.ANZAHL_GESAMT} konsekutive Patienten, die zwischen Januar 2020 und November 2023 eingeschlossen wurden. Davon erhielten ${placeholders.ANZAHL_NRCT} Patienten eine neoadjuvante Radiochemotherapie (nRCT-Gruppe), während ${placeholders.ANZAHL_DIREKT_OP} Patienten primär operiert wurden (Direkt-OP-Gruppe). Die Analysen können für das Gesamtkollektiv oder separat für die Subgruppen durchgeführt werden.</p>
                <p>Die Datenbasis ist ein fest integrierter, präprozessierter Datensatz, der dem der Avocado-Sign Publikation entspricht. Er enthält für jeden Patienten demographische Daten, Therapieinformationen, den pathologischen N-Status (N+/N-, Anzahl N+ LK, Gesamtzahl untersuchter LK) als Referenzstandard, den mittels kontrastverstärkter T1w-MRT ermittelten Avocado-Sign-Status (AS+/AS-, Anzahl AS+ LK, Gesamtzahl sichtbarer LK) sowie detaillierte morphologische Informationen zu allen im hochauflösenden T2w-MRT sichtbaren mesorektalen Lymphknoten (Kurzachsendurchmesser [mm], Form ['rund'/'oval'], Kontur ['scharf'/'irregulär'], Homogenität ['homogen'/'heterogen'], Signalintensität ['signalarm'/'intermediär'/'signalreich']).</p>

                <h3 id="methoden-bildgebung-und-bewertung">3. Bildgebung und Bewertung</h3>
                <p>Die MRT-Untersuchungen erfolgten auf einem 3.0-T System (Siemens Healthineers) unter Verwendung eines standardisierten Protokolls, das hochauflösende T2w-Sequenzen in drei Ebenen sowie axiale T1w-Sequenzen nach Gabe eines Gadolinium-basierten Kontrastmittels (Gadoteridol) umfasste. Die Bewertung des **Avocado Signs** erfolgte wie in der Originalpublikation beschrieben (hypointenser Kern in sonst homogen hyperintensem LK auf T1w KM).</p>
                <p>Die Bewertung der **T2-gewichteten morphologischen Kriterien** erfolgte interaktiv innerhalb der Webanwendung. Der Nutzer kann folgende Kriterien aktivieren und deren spezifische Ausprägung als "suspekt" definieren:</p>
                <ul>
                    <li><strong>Größe:</strong> Kurzachsendurchmesser ≥ Schwellenwert (einstellbar von ${placeholders.T2_SIZE_MIN} bis ${placeholders.T2_SIZE_MAX} mm, Schrittweite 0.1 mm).</li>
                    <li><strong>Form:</strong> 'rund' oder 'oval'.</li>
                    <li><strong>Kontur:</strong> 'scharf' oder 'irregulär'.</li>
                    <li><strong>Homogenität:</strong> 'homogen' oder 'heterogen'.</li>
                    <li><strong>Signal:</strong> 'signalarm', 'intermediär' oder 'signalreich'.</li>
                </ul>
                <p>Die aktivierten Kriterien werden mittels einer global wählbaren **logischen Verknüpfung** ('UND' oder 'ODER') kombiniert. Ein Lymphknoten gilt als T2-positiv, wenn er die definierte Regel erfüllt (bei 'UND' müssen alle aktiven Kriterien erfüllt sein, bei 'ODER' mindestens eines). Ein Patient erhält den Status T2='+', wenn mindestens einer seiner T2-Lymphknoten positiv bewertet wird.</p>
                <p>Zusätzlich implementiert die Anwendung **fest definierte T2-Kriteriensets aus der Literatur** für Vergleichszwecke: Barbaro et al. (2024), Koh et al. (2008), sowie die von Rutegård et al. (2025) evaluierten ESGAR 2016 Kriterien. Diese Sets werden spezifisch auf die entsprechenden Subgruppen angewendet.</p>

                <h3 id="methoden-optimierung">4. Optimierung von T2-Kriterien</h3>
                <p>Eine integrierte **Brute-Force-Optimierungsfunktion** (implementiert als Web Worker) testet systematisch alle sinnvollen Kombinationen der definierbaren T2-Kriterien (aktive Merkmale, spezifische Werte/Schwellenwert, UND/ODER-Logik). Ziel ist die Identifikation der Kriterienkombination, die eine vom Benutzer gewählte **diagnostische Zielmetrik** (Accuracy, Balanced Accuracy, F1-Score, PPV oder NPV) im Vergleich zum pathologischen N-Status für das ausgewählte Kollektiv maximiert.</p>

                <h3 id="methoden-statistik">5. Statistische Analyse</h3>
                <p>Alle statistischen Analysen wurden mittels spezifisch implementierter JavaScript-Module innerhalb der Webanwendung durchgeführt. Als Referenzstandard für den Lymphknotenstatus diente stets die Histopathologie.</p>
                <ul>
                    <li><strong>Deskriptive Statistik:</strong> Häufigkeiten, Median, Mittelwert ± Standardabweichung (SD), Minimum und Maximum wurden für demographische Daten und Lymphknotenanzahlen berechnet.</li>
                    <li><strong>Diagnostische Güte:</strong> Für das Avocado Sign (AS) und die jeweils angewendeten T2-Kriterien wurden Sensitivität, Spezifität, Positiver Prädiktiver Wert (PPV), Negativer Prädiktiver Wert (NPV), Accuracy und Balanced Accuracy (BalAcc, entspricht AUC für binäre Tests) berechnet. 95% Konfidenzintervalle (CI) für Proportionen wurden mittels Wilson Score Interval Methode ermittelt. Für BalAcc und F1-Score wurden 95% CIs mittels Bootstrap Percentile Methode (mit ${placeholders.BOOTSTRAP_REPLICATIONS} Replikationen) geschätzt.</li>
                    <li><strong>Vergleich von AS vs. T2 (gepaart):</strong> Die Accuracies von AS und den angewendeten T2-Kriterien wurden mittels McNemar-Test verglichen. Die AUCs (BalAcc) wurden mittels DeLong-Test verglichen.</li>
                    <li><strong>Assoziationsanalysen:</strong> Der Zusammenhang zwischen AS-Status bzw. einzelnen T2-Merkmalen und dem N-Status wurde mittels Odds Ratio (OR) mit 95% CI (Woolf Logit Methode mit +0.5 Korrektur), Risk Difference (RD) mit 95% CI (Wald Methode) und Phi-Koeffizient (φ) quantifiziert. Der p-Wert für den Zusammenhang wurde mittels Fisher's Exact Test berechnet. Für den Kurzachsendurchmesser wurde der Mann-Whitney-U-Test zum Vergleich der Mediane zwischen N+ und N- Patienten verwendet.</li>
                    <li><strong>Vergleich zwischen Kollektiven (ungepaart):</strong> Im Vergleichsmodus wurden Accuracies mittels Fisher's Exact Test und AUCs mittels eines Z-Tests verglichen.</li>
                </ul>
                <p>Ein p-Wert unter ${placeholders.SIGNIFICANCE_LEVEL} wurde als statistisch signifikant interpretiert.</p>

                 <h3 id="methoden-software">6. Software und Bibliotheken</h3>
                 <p>Die Webanwendung basiert auf HTML5, CSS3 und JavaScript (ES6+). Folgende externe Bibliotheken wurden genutzt: Bootstrap (v5.3) für das UI-Framework, D3.js (v7) für Datenvisualisierungen, Tippy.js (v6) für Tooltips, PapaParse (v5) für CSV-Exporte und JSZip (v3) für die Erstellung von ZIP-Archiven.</p>
             `,
             en: `
                <h3 id="methoden-studienanlage">1. Study Design and Software</h3>
                <p>This analysis is based on a **retrospective evaluation of prospectively collected data** from a single-center cohort of patients with histologically confirmed rectal cancer, originally recruited for the evaluation of the "Avocado Sign" (Lurz & Schäfer, Eur Radiol 2025). The present investigation utilizes a **custom-developed, interactive web application** (v${APP_CONFIG.APP_VERSION}, implemented in HTML5, CSS3, JavaScript ES6+) as the primary tool for data analysis, statistical evaluation, and visualization. All results reported herein were generated using this application.</p>

                <h3 id="methoden-patientenkohorte">2. Patient Cohort and Data Basis</h3>
                <p>The analyzed cohort comprises ${placeholders.ANZAHL_GESAMT} consecutive patients enrolled between January 2020 and November 2023. Of these, ${placeholders.ANZAHL_NRCT} patients received neoadjuvant chemoradiotherapy (nRCT group), while ${placeholders.ANZAHL_DIREKT_OP} patients underwent primary surgery (upfront surgery group). Analyses can be performed on the entire cohort or separately for the subgroups.</p>
                <p>The data basis is a fixed, preprocessed dataset identical to that of the Avocado Sign publication. It includes demographic data, therapy information, pathological N-status (N+/N-, number of N+ LNs, total number of examined LNs) as the reference standard, the Avocado Sign status determined by contrast-enhanced T1w-MRI (AS+/AS-, number of AS+ LNs, total number of visible LNs), and detailed morphological information for all mesorectal lymph nodes visible on high-resolution T2w-MRI (short-axis diameter [mm], shape ['round'/'oval'], border ['sharp'/'irregular'], homogeneity ['homogeneous'/'heterogeneous'], signal intensity ['signal-poor'/'intermediate'/'signal-rich']).</p>

                <h3 id="methoden-bildgebung-und-bewertung">3. Imaging and Assessment</h3>
                <p>MRI examinations were performed on a 3.0-T system (Siemens Healthineers) using a standardized protocol including high-resolution T2w sequences in three planes and axial T1w sequences after administration of a gadolinium-based contrast agent (Gadoteridol). The **Avocado Sign** was assessed as described in the original publication (hypointense core within an otherwise homogeneously hyperintense node on T1w CE-MRI).</p>
                <p>The assessment of **T2-weighted morphological criteria** was performed interactively within the web application. Users can activate criteria and define their specific "suspicious" characteristic:</p>
                <ul>
                    <li><strong>Size:</strong> Short-axis diameter ≥ threshold (adjustable from ${placeholders.T2_SIZE_MIN} to ${placeholders.T2_SIZE_MAX} mm, step 0.1 mm).</li>
                    <li><strong>Shape:</strong> 'round' or 'oval'.</li>
                    <li><strong>Border:</strong> 'sharp' or 'irregular'.</li>
                    <li><strong>Homogeneity:</strong> 'homogeneous' or 'heterogeneous'.</li>
                    <li><strong>Signal:</strong> 'signal-poor', 'intermediate', or 'signal-rich'.</li>
                </ul>
                <p>Activated criteria are combined using a globally selectable **logical operator** ('AND' or 'OR'). A lymph node is considered T2-positive if it meets the defined rule (for 'AND', all active criteria must be met; for 'OR', at least one must be met). A patient receives the status T2='+' if at least one of their T2 lymph nodes is rated positive.</p>
                <p>Additionally, the application implements **predefined T2 criteria sets from the literature** for comparison: Barbaro et al. (2024), Koh et al. (2008), and the ESGAR 2016 criteria as evaluated by Rutegård et al. (2025). These sets are applied specifically to the corresponding subgroups.</p>

                <h3 id="methoden-optimierung">4. Optimization of T2 Criteria</h3>
                <p>An integrated **brute-force optimization function** (implemented as a Web Worker) systematically tests all meaningful combinations of the definable T2 criteria (active features, specific values/threshold, AND/OR logic). The objective is to identify the criteria combination that maximizes a user-selected **diagnostic target metric** (Accuracy, Balanced Accuracy, F1-Score, PPV, or NPV) compared to the pathological N-status for the selected cohort.</p>

                <h3 id="methoden-statistik">5. Statistical Analysis</h3>
                <p>All statistical analyses were performed using custom JavaScript modules implemented within the web application. Histopathology served as the reference standard for lymph node status.</p>
                <ul>
                    <li><strong>Descriptive Statistics:</strong> Frequencies, median, mean ± standard deviation (SD), minimum, and maximum were calculated for demographic data and lymph node counts.</li>
                    <li><strong>Diagnostic Performance:</strong> For the Avocado Sign (AS) and the applied T2 criteria, sensitivity, specificity, Positive Predictive Value (PPV), Negative Predictive Value (NPV), Accuracy, and Balanced Accuracy (BalAcc, equivalent to AUC for binary tests) were calculated. 95% confidence intervals (CI) for proportions were determined using the Wilson Score Interval method. For BalAcc and F1-Score, 95% CIs were estimated using the Bootstrap Percentile method (with ${placeholders.BOOTSTRAP_REPLICATIONS} replications).</li>
                    <li><strong>Comparison of AS vs. T2 (paired):</strong> Accuracies of AS and the applied T2 criteria were compared using McNemar's test. AUCs (BalAcc) were compared using DeLong's test.</li>
                    <li><strong>Association Analyses:</strong> The association between AS status or individual T2 features and N-status was quantified using Odds Ratio (OR) with 95% CI (Woolf Logit method with +0.5 correction), Risk Difference (RD) with 95% CI (Wald method), and Phi coefficient (φ). The p-value for association was calculated using Fisher's Exact Test. For short-axis diameter, the Mann-Whitney U test was used to compare medians between N+ and N- patients.</li>
                    <li><strong>Comparison between Cohorts (unpaired):</strong> In comparison mode, Accuracies were compared using Fisher's Exact Test, and AUCs were compared using a Z-test.</li>
                </ul>
                <p>A p-value below ${placeholders.SIGNIFICANCE_LEVEL} was considered statistically significant.</p>

                 <h3 id="methoden-software">6. Software and Libraries</h3>
                 <p>The web application is based on HTML5, CSS3, and JavaScript (ES6+). The following external libraries were utilized: Bootstrap (v5.3) for the UI framework, D3.js (v7) for data visualizations, Tippy.js (v6) for tooltips, PapaParse (v5) for CSV exports, and JSZip (v3) for creating ZIP archives.</p>
             `
        };
        return texts[lang] || `<p>Methodology description for language '${lang}' not available.</p>`;
    }

    function createBruteForceModalContent(results, metric, kollektiv, duration, totalTested) {
        if (!results || results.length === 0) return '<p class="text-muted">Keine Ergebnisse gefunden.</p>';
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler'; const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
        const bestResult = results[0]; const kollektivName = getKollektivNameFunc(kollektiv); const metricDisplayName = metric === 'PPV' ? 'PPV' : metric === 'NPV' ? 'NPV' : metric;
        let tableHTML = `<div class="alert alert-light small p-2 mb-3"><p class="mb-1"><strong>Beste Kombi für '${metricDisplayName}' (Koll.: '${kollektivName}'):</strong></p><ul class="list-unstyled mb-1"><li><strong>Wert:</strong> ${formatNumber(bestResult.metricValue, 4)}</li><li><strong>Logik:</strong> ${bestResult.logic.toUpperCase()}</li><li><strong>Kriterien:</strong> ${formatCriteriaFunc(bestResult.criteria, bestResult.logic)}</li></ul><p class="mb-0 text-muted"><small>Dauer: ${formatNumber(duration / 1000, 1)}s | Getestet: ${formatNumber(totalTested, 0)}</small></p></div><h6 class="mb-2">Top 10 Ergebnisse (inkl. identischer Werte):</h6><div class="table-responsive"><table class="table table-sm table-striped table-hover small" id="bruteforce-results-table"><thead class="small"><tr><th data-tippy-content="Rang">Rang</th><th data-tippy-content="Wert der Zielmetrik (${metricDisplayName})">${metricDisplayName}</th><th data-tippy-content="Logik">Logik</th><th data-tippy-content="Kriterienkombination">Kriterien</th></tr></thead><tbody>`;
        let rank = 1, displayedCount = 0, lastMetricValue = -Infinity; const precision = 8;
        for (let i = 0; i < results.length; i++) { const result = results[i]; if (!result || typeof result.metricValue !== 'number' || !isFinite(result.metricValue)) continue; const currentMetricValueRounded = parseFloat(result.metricValue.toFixed(precision)); const lastMetricValueRounded = parseFloat(lastMetricValue.toFixed(precision)); let currentRank = rank; const isNewRank = Math.abs(currentMetricValueRounded - lastMetricValueRounded) > 1e-8; if (i > 0 && isNewRank) { rank = displayedCount + 1; currentRank = rank; } else if (i > 0) { currentRank = rank; } if (rank > 10 && isNewRank) break; tableHTML += `<tr><td>${currentRank}.</td><td>${formatNumber(result.metricValue, 4)}</td><td>${result.logic.toUpperCase()}</td><td>${formatCriteriaFunc(result.criteria, result.logic)}</td></tr>`; if (isNewRank || i === 0) { lastMetricValue = result.metricValue; } displayedCount++; }
        tableHTML += `</tbody></table></div>`; return tableHTML;
    }

    return Object.freeze({
        createDashboardCard,
        createT2CriteriaControls,
        createBruteForceCard,
        createStatistikCard,
        createExportOptions,
        createT2MetricsOverview,
        createMethodenBeschreibungContent,
        createBruteForceModalContent
    });

})();
