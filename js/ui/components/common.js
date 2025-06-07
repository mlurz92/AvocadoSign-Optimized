const commonComponents = (() => {

    function createCard(id, title, content, options = {}) {
        const {
            headerClass = '',
            bodyClass = 'p-3',
            cardClass = 'h-100',
            footerContent = '',
            headerButtons = []
        } = options;

        const headerButtonHtml = headerButtons.map(btn => {
            const btnId = btn.id || `${id}-btn-${btn.action}`;
            const btnTooltip = btn.tooltip || '';
            const btnIcon = btn.icon || 'fa-question-circle';
            return `
                <button 
                    class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 ms-1" 
                    id="${btnId}" 
                    data-tippy-content="${btnTooltip}"
                    ${btn.extraAttributes || ''}
                >
                    <i class="fas ${btnIcon}"></i>
                </button>`;
        }).join('');

        const headerHtml = `
            <div class="card-header d-flex justify-content-between align-items-center ${headerClass}">
                <span class="fw-bold">${title}</span>
                <div class="card-header-buttons">
                    ${headerButtonHtml}
                </div>
            </div>`;

        const bodyHtml = `
            <div class="card-body ${bodyClass}" id="${id}-body">
                ${content}
            </div>`;

        const footerHtml = footerContent 
            ? `<div class="card-footer">${footerContent}</div>` 
            : '';

        return `
            <div class="card ${cardClass}" id="${id}">
                ${headerHtml}
                ${bodyHtml}
                ${footerHtml}
            </div>`;
    }

    function createModal(id, title, bodyContent, footerContent, options = {}) {
        const {
            size = 'modal-lg',
            centered = true,
            scrollable = true
        } = options;

        const modalClasses = `modal fade`;
        const dialogClasses = `modal-dialog ${size} ${centered ? 'modal-dialog-centered' : ''} ${scrollable ? 'modal-dialog-scrollable' : ''}`;

        return `
            <div class="${modalClasses}" id="${id}" tabindex="-1" aria-labelledby="${id}-label" aria-hidden="true">
                <div class="${dialogClasses}">
                    <div class="modal-content modal-glass">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${id}-label">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
                        </div>
                        <div class="modal-body" id="${id}-body">
                            ${bodyContent}
                        </div>
                        <div class="modal-footer" id="${id}-footer">
                            ${footerContent}
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function createT2CriteriaIcon(key, value) {
        const s = 20;
        const sw = 1.5;
        const c = s / 2;
        const r = (s - sw) / 2;
        const iconColor = 'currentColor';
        let svgContent = '';

        switch (key) {
            case CONSTANTS.T2_CRITERIA_KEYS.FORM:
                svgContent = value === 'rund'
                    ? `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${iconColor}" stroke-width="${sw}"/>`
                    : `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.65}" fill="none" stroke="${iconColor}" stroke-width="${sw}"/>`;
                break;
            case CONSTANTS.T2_CRITERIA_KEYS.KONTUR:
                svgContent = value === 'scharf'
                    ? `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${iconColor}" stroke-width="${sw}"/>`
                    : `<path d="M${c + r*0.9},${c} A${r} ${r} 0 1 1 ${c - r*0.9},${c+r*0.3}" fill="none" stroke="${iconColor}" stroke-width="${sw}" stroke-linecap="round" style="stroke-dasharray: 3, 2;"/>`;
                break;
            case CONSTANTS.T2_CRITERIA_KEYS.HOMOGENITAET:
                if (value === 'homogen') {
                    svgContent = `<rect x="${sw}" y="${sw}" width="${s - 2*sw}" height="${s - 2*sw}" fill="${iconColor}" rx="1"/>`;
                } else {
                    const halfS = s / 2;
                    svgContent = `<path d="M${sw},${sw} H${s-sw} V${s-sw} H${sw} Z M${sw},${halfS} H${s-sw} M${halfS},${sw} V${s-sw}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}"/>`;
                }
                break;
            case CONSTANTS.T2_CRITERIA_KEYS.SIGNAL:
                let opacity = 0.5;
                if(value === 'signalarm') opacity = 0.9;
                if(value === 'signalreich') opacity = 0.2;
                svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${iconColor}" style="opacity: ${opacity};"/>`;
                break;
            default:
                return '';
        }
        
        return `<svg class="icon-t2" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${key}: ${value}">${svgContent}</svg>`;
    }


    return Object.freeze({
        createCard,
        createModal,
        createT2CriteriaIcon
    });

})();
