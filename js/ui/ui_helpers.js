const ui_helpers = (() => {

    let globalTippyInstances = [];
    let collapseEventListenersAttached = new Set();
    let kurzanleitungModalInstance = null;
    let kurzanleitungFirstShowDone = false;

    function escapeMarkdown(text) {
        if (typeof text !== 'string' || text === null) return text === null ? '' : String(text);
        const map = { '\\': '\\\\', '`': '\\`', '*': '\\*', '_': '\\_', '{': '\\{', '}': '\\}', '[': '\\[', ']': '\\]', '(': '\\(', ')': '\\)', '#': '\\#', '+': '\\+', '-': '\\-', '.': '\\.', '!': '\\!', '|': '\\|' };
        return text.replace(/[\\`*_{}[\]()#+\-.!|]/g, match => map[match]);
    }

    function showToast(message, type = 'info', duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        if (typeof message !== 'string' || message.trim() === '') return;
        if (typeof bootstrap === 'undefined' || !bootstrap.Toast) return;

        const toastId = `toast-${utils.generateUUID()}`;
        let bgClass = 'bg-secondary', iconClass = 'fa-info-circle', textClass = 'text-white';
        switch (type) {
            case 'success': bgClass = 'bg-success'; iconClass = 'fa-check-circle'; break;
            case 'warning': bgClass = 'bg-warning'; iconClass = 'fa-exclamation-triangle'; textClass = 'text-dark'; break;
            case 'danger': bgClass = 'bg-danger'; iconClass = 'fa-exclamation-circle'; break;
            case 'info':
            default: bgClass = 'bg-info'; iconClass = 'fa-info-circle'; textClass = 'text-dark'; break;
        }

        const toastElement = document.createElement('div');
        toastElement.id = toastId;
        toastElement.className = `toast align-items-center ${textClass} ${bgClass} border-0 fade`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${iconClass} fa-fw me-2"></i> ${message}</div><button type="button" class="btn-close me-2 m-auto ${textClass === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Schließen"></button></div>`;
        toastContainer.appendChild(toastElement);

        const toastInstance = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove(), { once: true });
        toastInstance.show();
    }

    function initializeTooltips(scope = document.body) {
        if (!window.tippy || typeof scope?.querySelectorAll !== 'function') return;

        const elementsInScope = Array.from(scope.matches('[data-tippy-content]') ? [scope] : scope.querySelectorAll('[data-tippy-content]'));
        globalTippyInstances = globalTippyInstances.filter(instance => {
            if (!instance || !instance.reference || !document.body.contains(instance.reference)) {
                try { instance?.destroy(); } catch (e) {}
                return false;
            }
            if (elementsInScope.includes(instance.reference)) {
                try { instance.destroy(); } catch (e) {}
                return false;
            }
            return true;
        });

        const newInstances = tippy(elementsInScope, {
            allowHTML: true, theme: 'glass', placement: 'top', animation: 'fade',
            interactive: false, appendTo: () => document.body, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
            maxWidth: 400, duration: [150, 150], zIndex: 3050,
            onShow(instance) { return !!instance.props.content; }
        });
        if (Array.isArray(newInstances)) globalTippyInstances.push(...newInstances);
        else if (newInstances) globalTippyInstances.push(newInstances);
    }

    function updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) element.innerHTML = html ?? '';
    }

    function setElementDisabled(elementId, isDisabled) {
        const element = document.getElementById(elementId);
        if (element) element.disabled = !!isDisabled;
    }
    
    function highlightElement(elementId, highlightClass = 'element-flash-highlight', duration = 1500) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(highlightClass);
            void element.offsetWidth;
            element.classList.add(highlightClass);
            setTimeout(() => element.classList.remove(highlightClass), duration);
        }
    }
    
    function _updateHeaderStatsUI(stats) {
        if (!stats) stats = {};
        updateElementHTML('header-kollektiv', stats.kollektiv || '--');
        updateElementHTML('header-anzahl-patienten', stats.anzahlPatienten ?? '--');
        updateElementHTML('header-status-n', stats.statusN || '--');
        updateElementHTML('header-status-as', stats.statusAS || '--');
        updateElementHTML('header-status-t2', stats.statusT2 || '--');
    }

    function updateKollektivButtonsUI(currentKollektiv) {
        const buttonGroup = document.querySelector('header .btn-group[aria-label="Kollektiv Auswahl"]');
        if (buttonGroup) {
            buttonGroup.querySelectorAll('button[data-kollektiv]').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-kollektiv') === currentKollektiv);
            });
        }
    }

    function updateSortIcons(tableHeaderId, sortState) {
        const tableHeader = document.getElementById(tableHeaderId);
        if (!tableHeader || !sortState) return;
        tableHeader.querySelectorAll('th[data-sort-key]').forEach(th => {
            const key = th.dataset.sortKey;
            const icon = th.querySelector('i.fas');
            if (!icon) return;
            icon.className = 'fas fa-sort text-muted opacity-50 ms-1';
            
            if (key === sortState.key) {
                icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1`;
            }
        });
    }

    function toggleAllDetails(tableBodyId, buttonId) {
        const button = document.getElementById(buttonId);
        const tableBody = document.getElementById(tableBodyId);
        if (!button || !tableBody) return;

        const expand = button.dataset.action === 'expand';
        tableBody.querySelectorAll('.collapse').forEach(el => {
            const instance = bootstrap.Collapse.getOrCreateInstance(el);
            if (expand && !el.classList.contains('show')) instance.show();
            else if (!expand && el.classList.contains('show')) instance.hide();
        });

        button.dataset.action = expand ? 'collapse' : 'expand';
        button.innerHTML = `${expand ? 'Alle Details Ausblenden' : 'Alle Details Einblenden'} <i class="fas ${expand ? 'fa-chevron-up' : 'fa-chevron-down'} ms-1"></i>`;
    }

    function _handleCollapseEvent(event) {
        const collapseElement = event.target;
        if (!collapseElement?.matches('.collapse')) return;

        const triggerRow = document.querySelector(`tr[data-bs-target="#${collapseElement.id}"]`);
        if (!triggerRow) return;

        const icon = triggerRow.querySelector('.row-toggle-icon');
        const isShowing = event.type === 'show.bs.collapse';
        if (icon) icon.classList.toggle('fa-chevron-up', isShowing);
    }

    function attachRowCollapseListeners(tableBodyElement) {
        if (!tableBodyElement?.id || collapseEventListenersAttached.has(tableBodyElement.id)) return;
        tableBodyElement.addEventListener('show.bs.collapse', _handleCollapseEvent);
        tableBodyElement.addEventListener('hide.bs.collapse', _handleCollapseEvent);
        collapseEventListenersAttached.add(tableBodyElement.id);
    }
    
    function getT2IconSVG(type, value) {
        const s = APP_CONFIG.UI_SETTINGS.ICON_SIZE;
        const sw = APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH;
        const c = s / 2;
        const r = (s - sw) / 2;
        let svgContent = '';

        switch (type) {
            case 'form':
                svgContent = value === 'rund' ? `<circle cx="${c}" cy="${c}" r="${r}" />` : `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.65}" />`;
                break;
            case 'kontur':
                svgContent = value === 'scharf' ? `<circle cx="${c}" cy="${c}" r="${r}" />` : `<path d="M ${c + r} ${c} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${r*0.8} ${r*1.2} 0 0 1 ${c-r*0.9} ${c-r*0.3} A ${r*1.1} ${r*0.7} 0 0 1 ${c+r} ${c} Z" />`;
                break;
            default:
                svgContent = `<rect x="${sw}" y="${sw}" width="${s - 2*sw}" height="${s - 2*sw}" />`;
                break;
        }
        return `<svg class="icon-t2" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${svgContent}</svg>`;
    }
    
    function showKurzanleitung() {
        if (!kurzanleitungModalInstance) {
            const modalElement = document.getElementById('kurzanleitung-modal');
            if (modalElement) {
                kurzanleitungModalInstance = new bootstrap.Modal(modalElement);
            }
        }
        if (kurzanleitungModalInstance) {
            kurzanleitungModalInstance.show();
        }
    }

    return Object.freeze({
        escapeMarkdown,
        showToast,
        initializeTooltips,
        updateElementHTML,
        setElementDisabled,
        highlightElement,
        updateHeaderStats: _updateHeaderStatsUI,
        updateKollektivButtonsUI,
        updateSortIcons,
        toggleAllDetails,
        attachRowCollapseListeners,
        getT2IconSVG,
        showKurzanleitung
    });

})();
