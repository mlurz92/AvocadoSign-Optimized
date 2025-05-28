const ui_helpers = (() => {
    let tippyInstances = [];
    let toastElement = null;
    let toastInstance = null;

    function showToast(message, type = 'info', duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS) {
        if (!window.bootstrap || !window.bootstrap.Toast) return;
        if (!toastElement) {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toastId = `toast-${generateUUID()}`;
            const toastHTML = `
                <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true" id="${toastId}" data-bs-delay="${duration}">
                    <div class="d-flex">
                        <div class="toast-body">${escapeHTML(message)}</div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', toastHTML);
            toastElement = document.getElementById(toastId);
            if (!toastElement) return;
            toastInstance = new bootstrap.Toast(toastElement, { delay: duration });
            toastElement.addEventListener('hidden.bs.toast', () => {
                if (toastElement) toastElement.remove();
                toastElement = null;
                toastInstance = null;
            });
        } else {
             const toastBody = toastElement.querySelector('.toast-body');
             if (toastBody) toastBody.textContent = escapeHTML(message);
             toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
             if(toastInstance) toastInstance.dispose();
             toastInstance = new bootstrap.Toast(toastElement, { delay: duration });
        }
        if (toastInstance) toastInstance.show();
    }

    function hideToast() {
        if (toastInstance) {
            toastInstance.hide();
        }
    }

    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, (match) => {
            switch (match) {
                case '&': return '&amp;';
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '"': return '&quot;';
                case "'": return '&#39;';
                default: return match;
            }
        });
    }

    function escapeMarkdown(str) {
        if (typeof str !== 'string') return '';
        const markdownChars = /[\\`*_{}[\]()#+\-.!|]/g;
        return str.replace(markdownChars, '\\$&');
    }

    function getTooltipContent(tooltipKey, replacements = {}) {
        if (!TOOLTIP_CONTENT || typeof tooltipKey !== 'string') return 'Tooltip nicht gefunden.';
        const path = tooltipKey.split('.');
        let contentObj = TOOLTIP_CONTENT;
        for (const key of path) {
            if (contentObj && typeof contentObj === 'object' && contentObj.hasOwnProperty(key)) {
                contentObj = contentObj[key];
            } else {
                return `Tooltip-Key '${tooltipKey}' nicht in TOOLTIP_CONTENT gefunden.`;
            }
        }

        let content = (typeof contentObj === 'string' ? contentObj : contentObj?.description) || `Inhalt für '${tooltipKey}' nicht definiert.`;

        for (const placeholder in replacements) {
            if (Object.prototype.hasOwnProperty.call(replacements, placeholder)) {
                const regex = new RegExp(`\\[${placeholder.toUpperCase()}\\]`, 'g');
                content = content.replace(regex, String(replacements[placeholder]));
            }
        }
        const sizeRange = APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE;
        content = content.replace(/\{SIZE_MIN\}/g, String(sizeRange.min));
        content = content.replace(/\{SIZE_MAX\}/g, String(sizeRange.max));
        content = content.replace(/\{SIZE_STEP\}/g, String(sizeRange.step));
        content = content.replace(/\{SIGNIFICANCE_LEVEL\}/g, String(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL));
        content = content.replace(/\{SIGNIFICANCE_LEVEL_FORMATTED\}/g, formatNumber(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,3,undefined,true));

        return content;
    }


    function initTooltips(container = document.body) {
        if (!window.tippy) {
            console.warn("Tippy.js nicht geladen. Tooltips werden nicht initialisiert.");
            return;
        }
        destroyTooltips(container);
        const elementsWithTooltip = container.querySelectorAll('[data-tippy-content-key], [data-tippy-content]');
        const newInstances = Array.from(elementsWithTooltip).map(el => {
            const contentKey = el.dataset.tippyContentKey;
            const staticContent = el.dataset.tippyContent;
            let dynamicReplacements = {};
            try {
                if(el.dataset.tippyReplacements) {
                    dynamicReplacements = JSON.parse(el.dataset.tippyReplacements);
                }
            } catch(e) {
                console.warn("Fehler beim Parsen von tippy-replacements für Element:", el, e);
            }

            const finalContent = contentKey ? getTooltipContent(contentKey, dynamicReplacements) : staticContent;

            return tippy(el, {
                content: finalContent || "Kein Inhalt für Tooltip.",
                allowHTML: true,
                theme: el.dataset.tippyTheme || 'glass',
                placement: el.dataset.tippyPlacement || 'top',
                delay: el.dataset.tippyDelay ? JSON.parse(el.dataset.tippyDelay) : APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
                interactive: el.dataset.tippyInteractive === 'true',
                maxWidth: parseInt(el.dataset.tippyMaxwidth) || 350,
                appendTo: () => document.body,
                onShow(instance) {
                    if (contentKey && el.dataset.tippyReplacementsKey) {
                         const replacementsFromState = state[el.dataset.tippyReplacementsKey]?.() || {};
                         instance.setContent(getTooltipContent(contentKey, replacementsFromState));
                    } else if (contentKey && el.dataset.tippyReplacements) {
                        try {
                            const currentReplacements = JSON.parse(el.dataset.tippyReplacements);
                            instance.setContent(getTooltipContent(contentKey, currentReplacements));
                        } catch(e){}
                    }
                },
            });
        });
        tippyInstances = tippyInstances.concat(newInstances.flat().filter(Boolean));
    }

    function destroyTooltips(container = document.body) {
        const elementsWithTippy = Array.from(container.querySelectorAll('[data-tippy-content-key], [data-tippy-content]'));
        elementsWithTippy.forEach(el => {
            if (el._tippy) {
                try { el._tippy.destroy(); } catch (e) { /* ignore */ }
            }
        });
        if (container === document.body) {
             tippyInstances.forEach(instance => { try { instance.destroy(); } catch(e) {/* ignore */ } });
             tippyInstances = [];
        } else {
            tippyInstances = tippyInstances.filter(instance => !container.contains(instance.reference));
        }
    }

    function updateTooltipContent(element, newContent) {
        if (element && element._tippy) {
            element._tippy.setContent(newContent);
            element._tippy.show();
        }
    }

    function createIcon(iconName, options = {}) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        const size = options.size || APP_CONFIG.UI_SETTINGS.ICON_SIZE;
        const color = options.color || APP_CONFIG.UI_SETTINGS.ICON_COLOR;
        const strokeWidth = options.strokeWidth || APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH;
        const classList = options.class ? options.class.split(' ') : [];

        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", color);
        svg.setAttribute("stroke-width", strokeWidth);
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");
        if (options.id) svg.id = options.id;
        svg.classList.add("icon", `icon-${iconName}`, ...classList);

        const use = document.createElementNS(svgNS, "use");
        use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#icon-${iconName}`);
        svg.appendChild(use);
        return svg;
    }

     function createElementWithAttributes(tag, attributes = {}, textContent = null) {
        const element = document.createElement(tag);
        for (const attr in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, attr)) {
                if (attr === 'class' && Array.isArray(attributes[attr])) {
                    element.classList.add(...attributes[attr].filter(Boolean));
                } else {
                    element.setAttribute(attr, attributes[attr]);
                }
            }
        }
        if (textContent !== null && textContent !== undefined) {
            element.textContent = String(textContent);
        }
        return element;
    }

    function highlightElement(element, duration = 1500) {
        if (!element) return;
        element.classList.add('element-flash-highlight');
        setTimeout(() => {
            if (element) element.classList.remove('element-flash-highlight');
        }, duration);
    }

    function getIcon(iconName, options = {}) {
        const iconElement = createIcon(iconName, options);
        return iconElement.outerHTML;
    }

    function showLoadingSpinner(containerId, message = "Lade...") {
        const container = document.getElementById(containerId);
        if (!container) return;
        hideLoadingSpinner(containerId);
        const spinnerId = `spinner-${containerId}`;
        const spinnerHTML = `
            <div id="${spinnerId}" class="d-flex flex-column justify-content-center align-items-center p-4 text-muted" style="min-height: 150px;">
                <div class="spinner-border text-primary mb-2" role="status">
                    <span class="visually-hidden">Lade...</span>
                </div>
                <span>${escapeHTML(message)}</span>
            </div>`;
        container.innerHTML = spinnerHTML;
    }

    function hideLoadingSpinner(containerId) {
        const spinner = document.getElementById(`spinner-${containerId}`);
        if (spinner) {
            spinner.remove();
        }
    }

    function getKollektivBadgeClass(kollektivId) {
        switch (kollektivId) {
            case 'Gesamt': return 'bg-primary text-white';
            case 'direkt OP': return 'bg-success text-white';
            case 'nRCT': return 'bg-warning text-dark';
            default: return 'bg-secondary text-white';
        }
    }

    return Object.freeze({
        showToast,
        hideToast,
        escapeHTML,
        escapeMarkdown,
        initTooltips,
        destroyTooltips,
        updateTooltipContent,
        getTooltipContent,
        createIcon,
        createElementWithAttributes,
        highlightElement,
        getIcon,
        showLoadingSpinner,
        hideLoadingSpinner,
        getKollektivBadgeClass
    });
})();
