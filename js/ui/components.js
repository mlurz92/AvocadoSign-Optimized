const uiComponents = (() => {

    function createHeaderButtonHTML(buttons, targetId, defaultTitle = 'Element') {
        if (!buttons || buttons.length === 0 || !targetId) {
            return '';
        }
        return buttons.map(btn => {
            const btnId = btn.id || `dl-${targetId.replace(/[^a-zA-Z0-9_-]/g, '')}-${btn.format || 'action'}`;
            const iconClass = btn.icon || 'fa-download';
            let tooltip = btn.tooltip || `Als ${String(btn.format || 'Aktion').toUpperCase()} herunterladen`;

            const safeDefaultTitle = String(defaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
            const safeChartName = String(btn.chartName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
            const safeTableName = String(btn.tableName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);

            if (btn.format === 'png' && btn.chartId && TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description) {
                tooltip = TOOLTIP_CONTENT.exportTab.chartSinglePNG.description.replace('{ChartName}', `<strong>${safeChartName}</strong>`);
            } else if (btn.format === 'svg' && btn.chartId && TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description) {
                tooltip = TOOLTIP_CONTENT.exportTab.chartSingleSVG.description.replace('{ChartName}', `<strong>${safeChartName}</strong>`);
            } else if (btn.format === 'png' && btn.tableId && TOOLTIP_CONTENT.exportTab.tableSinglePNG?.description) {
                tooltip = TOOLTIP_CONTENT.exportTab.tableSinglePNG.description.replace('{TableName}', `<strong>${safeTableName}</strong>`);
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

    function createStatistikCard(id, title, content = '', addPadding = true, tooltipKey = null, downloadButtons = [], tableId = null) {
        const cardTooltipHtml = tooltipKey && TOOLTIP_CONTENT[tooltipKey]?.cardTitle ?
            `data-tippy-content="${(TOOLTIP_CONTENT[tooltipKey].cardTitle || title).replace('[KOLLEKTIV]', '<strong>[KOLLEKTIV_PLACEHOLDER]</strong>')}"` :
            `data-tippy-content="${title}"`;

        let headerButtonHtml = createHeaderButtonHTML(downloadButtons, id + '-content', title);

        if (APP_CONFIG.EXPORT_SETTINGS.ENABLE_TABLE_PNG_EXPORT && tableId && !downloadButtons.some(b => b.tableId === tableId)) {
            const pngExportButton = {
                id: `dl-card-${id}-${tableId}-png`,
                icon: 'fa-image',
                tooltip: `Tabelle '${title}' als PNG herunterladen.`,
                format: 'png',
                tableId: tableId,
                tableName: title
            };
            headerButtonHtml += createHeaderButtonHTML([pngExportButton], tableId, title);
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

    function createCriteriaToggle(key, isChecked, tooltip) {
        const labels = {
            size: 'Größe',
            form: 'Form',
            kontur: 'Kontur',
            homogenitaet: 'Homogenität',
            signal: 'Signal'
        };
        return `
            <div class="form-check form-switch mb-2">
                <input class="form-check-input criteria-checkbox" type="checkbox" role="switch" value="${key}" id="check-${key}" ${isChecked ? 'checked' : ''}>
                <label class="form-check-label fw-bold" for="check-${key}">${labels[key]}</label>
                <span data-tippy-content="${tooltip}"><i class="fas fa-info-circle text-muted ms-1 fa-xs"></i></span>
            </div>`;
    }

    function createRangeSlider(key, value, rangeConfig, isEnabled, tooltip) {
        const formattedValue = formatNumber(value, 1, '5.0', true);
        return `
            <div class="d-flex align-items-center flex-wrap criteria-options-container">
                <span class="me-1 small text-muted">≥</span>
                <input type="range" class="form-range criteria-range flex-grow-1 me-2" id="range-${key}" min="${rangeConfig.min}" max="${rangeConfig.max}" step="${rangeConfig.step}" value="${formattedValue}" ${isEnabled ? '' : 'disabled'} data-tippy-content="Schwellenwert für Kurzachsendurchmesser (≥) einstellen.">
                <span class="criteria-value-display text-end me-1 fw-bold" id="value-${key}">${formatNumber(value, 1)}</span><span class="me-2 small text-muted">mm</span>
                <input type="number" class="form-control form-control-sm criteria-input-manual" id="input-${key}" min="${rangeConfig.min}" max="${rangeConfig.max}" step="${rangeConfig.step}" value="${formattedValue}" ${isEnabled ? '' : 'disabled'} style="width: 70px;" aria-label="Größe manuell eingeben" data-tippy-content="Schwellenwert manuell eingeben oder anpassen.">
            </div>`;
    }

    function createRadioOptions(key, values, currentValue, isEnabled, tooltip) {
        const buttonsHTML = values.map(value => {
            const isActiveValue = isEnabled && currentValue === value;
            const icon = getIconForT2Feature(key, value);
            const buttonTooltip = `Kriterium '${key}' auf '${value}' setzen. ${isEnabled ? '' : '(Kriterium ist derzeit inaktiv)'}`;
            return `<button type="button" class="btn btn-sm t2-criteria-button criteria-icon-button ${isActiveValue ? 'active' : ''} ${isEnabled ? '' : 'inactive-option'}" data-criterion="${key}" data-value="${value}" data-tippy-content="${buttonTooltip}" ${isEnabled ? '' : 'disabled'}>${icon}</button>`;
        }).join('');
        return `<div class="btn-group criteria-options-container" role="group" aria-label="${key} options">${buttonsHTML}</div>`;
    }

    function createLogicSwitch(currentLogic, tooltip) {
        return `
            <div class="form-check form-switch" data-tippy-content="${tooltip}">
                <label class="form-check-label small me-2" for="t2-logic-switch">Logik:</label>
                <input class="form-check-input" type="checkbox" role="switch" id="t2-logic-switch" ${currentLogic === 'ODER' ? 'checked' : ''}>
                <label class="form-check-label fw-bold" for="t2-logic-switch" id="t2-logic-label">${currentLogic}</label>
            </div>`;
    }

    function getIconForT2Feature(type, value, isMet = undefined) {
        const s = APP_CONFIG.UI_SETTINGS.ICON_SIZE || 16;
        const sw = APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH || 1.2;
        const iconColor = APP_CONFIG.UI_SETTINGS.ICON_COLOR || '#212529';
        const c = s / 2;
        const r = Math.max(1, (s - sw) / 2);
        const sq = Math.max(1, s - sw * 1.5);
        const sqPos = (s - sq) / 2;
        let svgContent = '';
        let extraClass = '';
        let fillColor = isMet ? 'var(--danger-color-light)' : 'none';
        let strokeColor = iconColor;

        const unknownIconSVG = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" stroke-dasharray="2 2" /><line x1="${sqPos}" y1="${sqPos}" x2="${sqPos+sq}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/><line x1="${sqPos+sq}" y1="${sqPos}" x2="${sqPos}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;

        switch (type) {
            case 'size':
                svgContent = `<path d="M${sw/2} ${c} H${s-sw/2} M${c} ${sw/2} V${s-sw/2} M${s*0.2} ${c-s*0.15} L${s*0.2} ${c+s*0.15} M${s*0.4} ${c-s*0.1} L${s*0.4} ${c+s*0.1} M${s*0.6} ${c-s*0.1} L${s*0.6} ${c+s*0.1} M${s*0.8} ${c-s*0.15} L${s*0.8} ${c+s*0.15}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;
                break;
            case 'form':
                if (value === 'rund') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
                else if (value === 'oval') svgContent = `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.65}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw}"/>`;
                else svgContent = unknownIconSVG;
                break;
            case 'kontur':
                const ksw = sw * 1.2;
                const kr = Math.max(1, (s - ksw) / 2);
                if (value === 'scharf') svgContent = `<circle cx="${c}" cy="${c}" r="${kr}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${ksw}"/>`;
                else if (value === 'irregulär') svgContent = `<path d="M ${c + kr} ${c} A ${kr} ${kr} 0 0 1 ${c} ${c + kr} A ${kr*0.8} ${kr*1.2} 0 0 1 ${c-kr*0.9} ${c-kr*0.3} A ${kr*1.1} ${kr*0.7} 0 0 1 ${c+kr} ${c} Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${ksw}"/>`;
                else svgContent = unknownIconSVG;
                break;
            case 'homogenitaet':
                const homoFill = isMet ? 'var(--danger-color)' : iconColor;
                if (value === 'homogen') {
                    svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="${homoFill}" stroke="none" rx="1" ry="1"/>`;
                } else if (value === 'heterogen') {
                    const pSize = Math.max(1, sq / 4);
                    svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" rx="1" ry="1"/>`;
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            if ((i + j) % 2 === 0) {
                                svgContent += `<rect x="${sqPos+i*pSize + pSize/2}" y="${sqPos+j*pSize + pSize/2}" width="${pSize}" height="${pSize}" fill="${homoFill}" stroke="none" style="opacity: 0.6;"/>`;
                            }
                        }
                    }
                } else {
                    svgContent = unknownIconSVG;
                }
                break;
            case 'signal':
                if (value === 'signalarm') fillColor = '#555555';
                else if (value === 'intermediär') fillColor = '#aaaaaa';
                else if (value === 'signalreich') fillColor = '#f0f0f0';
                else {
                    svgContent = unknownIconSVG;
                    break;
                }
                strokeColor = (value === 'signalreich') ? '#333333' : 'rgba(0,0,0,0.1)';
                svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw * 0.75}"/>`;
                if (value === 'signalreich') svgContent += `<circle cx="${c}" cy="${c}" r="${r * 0.3}" fill="${strokeColor}" stroke="none"/>`;
                else if (value === 'intermediär') svgContent += `<line x1="${c-r*0.5}" y1="${c}" x2="${c+r*0.5}" y2="${c}" stroke="${iconColor}" stroke-width="${sw/1.5}" stroke-linecap="round"/>`;
                break;
            default:
                svgContent = unknownIconSVG;
        }

        const valueClass = (value !== null && typeof value === 'string') ? `icon-value-${value.replace(/\s+/g, '-').toLowerCase()}` : 'icon-value-unknown';
        return `<svg class="icon-t2 icon-${type} ${valueClass} ${extraClass}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: ${value || 'unbekannt'}">${svgContent}</svg>`;
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
