const uiComponents = (() => {

    function createHeaderButtonHTML(buttons, targetId, defaultTitle = 'Element') {
        if (!Array.isArray(buttons) || buttons.length === 0 || !targetId) {
            return '';
        }
        return buttons.map(btn => {
            const btnId = btn.id || `dl-${targetId.replace(/[^a-zA-Z0-9_-]/g, '')}-${btn.format || 'action'}`;
            const iconClass = btn.icon || 'fa-download';
            const safeChartName = String(btn.chartName || defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
            const safeTableName = String(btn.tableName || defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
            
            let tooltip = btn.tooltip || `Aktion für ${defaultTitle}`;
            
            const dataAttributes = Object.entries(btn).map(([key, value]) => {
                if (key.startsWith('data-')) {
                    return `${key}="${String(value)}"`;
                }
                return '';
            }).filter(Boolean).join(' ');

            const mainDataAttr = btn.chartId ? `data-chart-id="${btn.chartId}" data-chart-name="${safeChartName.replace(/\s/g, '_')}"` : 
                                 btn.tableId ? `data-table-id="${btn.tableId}" data-table-name="${safeTableName.replace(/\s/g, '_')}"` : '';

            return `<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 ${btn.chartId ? 'chart-download-btn' : (btn.tableId ? 'table-download-btn' : '')}" id="${btnId}" ${mainDataAttr} data-format="${btn.format || 'none'}" ${dataAttributes} data-tippy-content="${tooltip}"><i class="fas ${iconClass}"></i></button>`;
        }).join('');
    }

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = []) {
        const kollektivName = utils.getKollektivDisplayName(stateManager.getCurrentKollektiv());
        let cardTooltipContent = title;

        if (tooltipKey && TOOLTIP_CONTENT.statistikTabTooltips?.[tooltipKey]) {
            cardTooltipContent = (TOOLTIP_CONTENT.statistikTabTooltips[tooltipKey].description || tooltipKey)
                                .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`);
        } else if (tooltipKey && TOOLTIP_CONTENT.praesentation?.[tooltipKey]?.description) {
            cardTooltipContent = (TOOLTIP_CONTENT.praesentation[tooltipKey].description || tooltipKey)
                                .replace(/\[CURRENT_KOLLEKTIV_PRAES\]/g, `<strong>${kollektivName}</strong>`);
        }

        const cardTooltipHtml = cardTooltipContent ? `data-tippy-content="${cardTooltipContent}"` : '';
        const headerButtonHtml = createHeaderButtonHTML(downloadButtons, id, title);

        return `
            <div class="col-12 stat-card" id="${id}-card-container">
                <div class="card h-100">
                    <div class="card-header" ${cardTooltipHtml}>
                        ${title}
                        <span class="float-end card-header-buttons">${headerButtonHtml}</span>
                    </div>
                    <div class="card-body ${addPadding ? 'p-2' : 'p-0'}" style="overflow-y: auto; overflow-x: hidden;" id="${id}-content-wrapper">
                        <div id="${id}-content">${content}</div>
                    </div>
                </div>
            </div>`;
    }

    function createCriteriaToggle(key, isChecked) {
        const labels = { size: 'Größe', form: 'Form', kontur: 'Kontur', homogenitaet: 'Homogenität', signal: 'Signal' };
        const tooltipKey = `t2${key.charAt(0).toUpperCase() + key.slice(1)}`;
        const tooltip = TOOLTIP_CONTENT[tooltipKey]?.description || `Kriterium ${labels[key]}`;
        return `
            <div class="form-check form-switch mb-2">
                <input class="form-check-input criteria-checkbox" type="checkbox" role="switch" value="${key}" id="check-${key}" ${isChecked ? 'checked' : ''}>
                <label class="form-check-label fw-bold" for="check-${key}">${labels[key]}</label>
                <span data-tippy-content="${tooltip}"><i class="fas fa-info-circle text-muted ms-1 fa-xs"></i></span>
            </div>`;
    }

    function createRangeSlider(key, value, isEnabled) {
        const rangeConfig = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE;
        const formattedValue = utils.formatNumber(value, 1, rangeConfig.min.toFixed(1), true);
        const tooltip = (TOOLTIP_CONTENT.t2Size?.description || "")
                        .replace('${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min}', rangeConfig.min)
                        .replace('${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max}', rangeConfig.max)
                        .replace('${APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step}', rangeConfig.step);

        return `
            <div class="criteria-options-container ${isEnabled ? '' : 'disabled-criterion-control'}">
                <div class="d-flex align-items-center flex-wrap">
                    <span class="me-1 small text-muted">≥</span>
                    <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-${key}" min="${rangeConfig.min}" max="${rangeConfig.max}" step="${rangeConfig.step}" value="${formattedValue}" ${isEnabled ? '' : 'disabled'} data-tippy-content="${tooltip}">
                    <span class="criteria-value-display text-end me-1 fw-bold" id="value-${key}">${utils.formatNumber(value, 1)}</span><span class="me-2 small text-muted">mm</span>
                    <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-${key}" min="${rangeConfig.min}" max="${rangeConfig.max}" step="${rangeConfig.step}" value="${formattedValue}" ${isEnabled ? '' : 'disabled'} aria-label="Größe manuell eingeben" data-tippy-content="Schwellenwert manuell eingeben.">
                </div>
            </div>`;
    }

    function createRadioOptions(key, currentValue, isEnabled) {
        const values = APP_CONFIG.T2_CRITERIA_SETTINGS[`${key.toUpperCase()}_VALUES`];
        const buttonsHTML = values.map(value => {
            const isActiveValue = isEnabled && currentValue === value;
            const icon = getIconForT2Feature(key, value);
            const buttonTooltip = `Kriterium '${key}' auf '${value}' setzen. ${isEnabled ? '' : '(Kriterium ist derzeit inaktiv)'}`;
            return `<button type="button" class="btn btn-sm t2-criteria-button ${isActiveValue ? 'active' : ''}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${isEnabled ? '' : 'disabled'}>${icon}</button>`;
        }).join('');
        return `<div class="btn-group criteria-options-container" role="group" aria-label="${key} options">${buttonsHTML}</div>`;
    }

    function createLogicSwitch(currentLogic) {
        return `
            <div class="form-check form-switch" data-tippy-content="${TOOLTIP_CONTENT.t2Logic.description}">
                <label class="form-check-label small me-2" for="t2-logic-switch">Logik:</label>
                <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${currentLogic === 'ODER' ? 'checked' : ''}>
                <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${currentLogic}</label>
            </div>`;
    }

    function getIconForT2Feature(type, value, isMet = undefined) {
        const cfg = APP_CONFIG.UI_SETTINGS;
        const s = cfg.ICON_SIZE;
        const sw = cfg.ICON_STROKE_WIDTH;
        const c = s / 2;
        const r = (s - sw) / 2;

        let svgContent = '';
        let fillColor = (isMet === true) ? 'var(--danger-color-light)' : 'none';
        let strokeColor = cfg.ICON_COLOR;
        
        const signalFills = { 'signalarm': '#555555', 'intermediär': '#aaaaaa', 'signalreich': '#f0f0f0' };
        const unknownIcon = `<g stroke="${strokeColor}" stroke-width="${sw / 2}"><rect x="${s*0.2}" y="${s*0.2}" width="${s*0.6}" height="${s*0.6}" fill="none" stroke-dasharray="2 2" /><line x1="${s*0.2}" y1="${s*0.2}" x2="${s*0.8}" y2="${s*0.8}" /><line x1="${s*0.8}" y1="${s*0.2}" x2="${s*0.2}" y2="${s*0.8}" /></g>`;

        switch (type) {
            case 'size':
                svgContent = `<g stroke="${(isMet === true) ? 'var(--danger-color)' : strokeColor}" stroke-width="${sw/2}" stroke-linecap="round"><path d="M${sw} ${c} H${s-sw} M${c} ${sw} V${s-sw}" /><line x1="${s*0.2}" y1="${c-s*0.15}" x2="${s*0.2}" y2="${c+s*0.15}" /><line x1="${s*0.8}" y1="${c-s*0.15}" x2="${s*0.8}" y2="${c+s*0.15}" /></g>`;
                break;
            case 'form':
                if (value === 'rund') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
                else if (value === 'oval') svgContent = `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r*0.65}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
                else svgContent = unknownIcon;
                break;
            case 'kontur':
                if (value === 'scharf') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw*1.2}"/>`;
                else if (value === 'irregulär') svgContent = `<path d="M ${c+r},${c} C ${c+r},${c+r*0.7} ${c+r*0.7},${c+r} ${c},${c+r} S ${c-r*1.2},${c+r*0.5} ${c-r*0.8},${c-r*0.2} S ${c-0.1},${c-r} ${c+r},${c} Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw*1.2}"/>`;
                else svgContent = unknownIcon;
                break;
            case 'homogenitaet':
                const homoStroke = (isMet === true && value === 'heterogen') ? 'var(--danger-color)' : strokeColor;
                if (value === 'homogen') svgContent = `<rect x="${sw}" y="${sw}" width="${s-2*sw}" height="${s-2*sw}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw/2}" rx="1"/>`;
                else if (value === 'heterogen') {
                    const pSize = (s - 2 * sw) / 4;
                    let pattern = `<rect x="${sw}" y="${sw}" width="${s-2*sw}" height="${s-2*sw}" fill="none" stroke="${homoStroke}" stroke-width="${sw/2}" rx="1"/>`;
                    for (let i = 0; i < 4; i++) {
                        for (let j = 0; j < 4; j++) {
                            if ((i + j) % 2 === 0) {
                                pattern += `<rect x="${sw+i*pSize}" y="${sw+j*pSize}" width="${pSize}" height="${pSize}" fill="${homoStroke}" style="opacity:0.6;"/>`;
                            }
                        }
                    }
                    svgContent = pattern;
                } else svgContent = unknownIcon;
                break;
            case 'signal':
                const signalFillColor = (isMet === true && signalFills[value]) ? 'var(--danger-color-light)' : signalFills[value] || 'none';
                if (signalFills[value]) {
                    svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${signalFillColor}" stroke="${value === 'signalreich' ? '#333' : 'rgba(0,0,0,0.1)'}" stroke-width="${sw*0.75}"/>`;
                } else svgContent = unknownIcon;
                break;
            default:
                svgContent = unknownIcon;
        }

        const valueClass = value ? `icon-value-${String(value).replace(/\s+/g, '-').toLowerCase()}` : 'icon-value-unknown';
        const metClass = (isMet === true) ? 'icon-met' : ((isMet === false) ? 'icon-not-met' : '');
        return `<svg class="icon-t2 icon-${type} ${valueClass} ${metClass}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: ${value || 'unbekannt'}">${svgContent}</svg>`;
    }

    return Object.freeze({
        createStatistikCard,
        createCriteriaToggle,
        createRangeSlider,
        createRadioOptions,
        createLogicSwitch,
        getIconForT2Feature
    });
})();
