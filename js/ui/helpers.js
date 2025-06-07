const uiHelpers = (() => {

    let globalTippyInstances = [];
    let kurzanleitungModalInstance = null;
    let isKurzanleitungVisible = false;

    function escapeMarkdown(text) {
        if (typeof text !== 'string' || text === null) return text === null ? '' : String(text);
        const map = { '\\': '\\\\', '`': '\\`', '*': '\\*', '_': '\\_', '{': '\\{', '}': '\\}', '[': '\\[', ']': '\\]', '(': '\\(', ')': '\\)', '#': '\\#', '+': '\\+', '-': '\\-', '.': '\\.', '!': '\\!', '|': '\\|' };
        return text.replace(/[\\`*_{}[\]()#+\-.!|]/g, match => map[match]);
    }

    function showToast(message, type = 'info', duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.error("showToast: Toast-Container Element 'toast-container' nicht gefunden.");
            return;
        }
        const toastId = `toast-${utils.generateUUID()}`;
        const toastTypeConfig = {
            success: { bg: 'bg-success', icon: 'fa-check-circle', text: 'text-white' },
            warning: { bg: 'bg-warning', icon: 'fa-exclamation-triangle', text: 'text-dark' },
            danger: { bg: 'bg-danger', icon: 'fa-exclamation-circle', text: 'text-white' },
            info: { bg: 'bg-info', icon: 'fa-info-circle', text: 'text-dark' }
        };
        const config = toastTypeConfig[type] || toastTypeConfig.info;

        const toastElement = document.createElement('div');
        toastElement.id = toastId;
        toastElement.className = `toast align-items-center ${config.text} ${config.bg} border-0 fade`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.setAttribute('data-bs-delay', String(duration));
        toastElement.setAttribute('data-bs-autohide', 'true');

        toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${config.icon} fa-fw me-2"></i> ${message}</div><button type="button" class="btn-close me-2 m-auto ${config.text === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Schließen"></button></div>`;
        toastContainer.appendChild(toastElement);

        const toastInstance = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove(), { once: true });
        toastInstance.show();
    }

    function initializeTooltips(scope = document.body) {
        if (!window.tippy || typeof scope?.querySelectorAll !== 'function') return;

        const newElements = Array.from(scope.matches('[data-tippy-content]') ? [scope] : scope.querySelectorAll('[data-tippy-content]'));
        
        const newInstances = tippy(newElements, {
            allowHTML: true,
            theme: 'glass',
            placement: 'top',
            animation: 'fade',
            interactive: false,
            appendTo: () => document.body,
            delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
            maxWidth: 450,
            duration: [200, 200],
            zIndex: 1060,
            onCreate(instance) {
                if (!instance.props.content || String(instance.props.content).trim() === '') {
                    instance.disable();
                }
            }
        });

        if (Array.isArray(newInstances)) {
            globalTippyInstances = globalTippyInstances.concat(newInstances);
        } else if (newInstances) {
            globalTippyInstances.push(newInstances);
        }
    }

    function destroyTooltips() {
        globalTippyInstances.forEach(instance => {
            if (instance && instance.destroy) {
                try {
                    instance.destroy();
                } catch (e) {
                    console.warn("Fehler beim Zerstören der Tippy-Instanz:", e);
                }
            }
        });
        globalTippyInstances = [];
    }
    
    function updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html ?? '';
        }
    }

    function toggleElementClass(elementId, className, force) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle(className, force);
        }
    }

    function updateKollektivButtonsUI(currentKollektiv) {
        document.querySelectorAll('.kollektiv-selector .btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.kollektiv === currentKollektiv);
        });
    }

    function attachRowCollapseListeners(tableBodyElement) {
        if (!tableBodyElement || tableBodyElement.dataset.collapseListenersAttached) return;

        const handleCollapseEvent = (event) => {
            const row = event.target.closest('tr.sub-row')?.previousElementSibling;
            if (!row) return;
            const icon = row.querySelector('.row-toggle-icon');
            if (!icon) return;
            const isShowing = event.type === 'show.bs.collapse';
            icon.style.transform = isShowing ? 'rotate(180deg)' : 'rotate(0deg)';
        };

        tableBodyElement.addEventListener('show.bs.collapse', handleCollapseEvent);
        tableBodyElement.addEventListener('hide.bs.collapse', handleCollapseEvent);
        tableBodyElement.dataset.collapseListenersAttached = 'true';
    }

    function getMetricDescriptionHTML(key, methode = '') {
        const desc = TOOLTIP_CONTENT.statMetrics[key]?.description || key;
        return desc.replace(/\[METHODE\]/g, `<strong>${methode}</strong>`);
    }

    function getMetricInterpretationHTML(key, metricData, methode = '', kollektivName = '') {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        if (!metricData || typeof metricData.value !== 'number' || !isFinite(metricData.value)) {
            return `Keine validen Daten für die Metrik '${key}' vorhanden.`;
        }

        const na = '--';
        const isPercent = key !== 'auc' && key !== 'f1';
        const digits = isPercent ? 1 : 3;

        const valueFormatted = utils.formatCI(metricData.value, metricData.ci?.lower, metricData.ci?.upper, digits, isPercent, na);
        
        let ciWarning = '';
        const ciWarningThreshold = APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD;
        if (metricData.ci && metricData.matrix_components) {
            const { rp, fp, fn, rn } = metricData.matrix_components;
            let denominator;
            switch(key) {
                case 'sens': denominator = rp + fn; break;
                case 'spez': denominator = fp + rn; break;
                case 'ppv': denominator = rp + fp; break;
                case 'npv': denominator = rn + fn; break;
                case 'acc': denominator = rp + fp + fn + rn; break;
                default: denominator = -1;
            }
            if (denominator !== -1 && denominator < ciWarningThreshold) {
                ciWarning = `<hr><p class="small text-warning mb-0"><strong>Hinweis:</strong> Das Konfidenzintervall ist aufgrund der geringen Fallzahl (Nenner = ${denominator}) potenziell unzuverlässig.</p>`;
            }
        }

        let bewertungStr = '';
        if (key === 'auc') bewertungStr = utils.getAUCBewertung(metricData.value);
        if (key === 'phi') bewertungStr = utils.getPhiBewertung(metricData.value);
        
        let interpretation = interpretationTemplate
            .replace(/\[WERT_MIT_CI\]/g, `<strong>${valueFormatted}</strong>`)
            .replace(/\[METHODE\]/g, `<strong>${methode}</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${utils.getKollektivDisplayName(kollektivName)}</strong>`)
            .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

        return interpretation + ciWarning;
    }

    function getTestInterpretationHTML(key, testData, kollektivName = '', methode1 = 'AS', methode2 = 'T2') {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        if (!testData || typeof testData.pValue !== 'number' || !isFinite(testData.pValue)) {
            return `Keine validen Test-Daten für '${key}' vorhanden.`;
        }

        const pValueText = utils.getPValueText(testData.pValue);
        const signifikanzText = utils.getStatisticalSignificanceText(testData.pValue);
        
        return interpretationTemplate
            .replace(/\[P_WERT\]/g, `${pValueText}`)
            .replace(/\[SIGNIFIKANZ\]/g, `${utils.getStatisticalSignificanceSymbol(testData.pValue)}`)
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${signifikanzText}</strong>`)
            .replace(/\[METHODE1\]/g, `<strong>${methode1}</strong>`)
            .replace(/\[METHODE2\]/g, `<strong>${methode2}</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${utils.getKollektivDisplayName(kollektivName)}</strong>`);
    }
    
    function getAssociationInterpretationHTML(key, assocData, merkmalName, kollektivName) {
         const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation;
         if (!interpretationTemplate || !assocData) return 'Keine Interpretation verfügbar.';

         const pValueText = typeof assocData.pValue === 'number' ? utils.getPValueText(assocData.pValue) : 'N/A';
         const signifikanzText = typeof assocData.pValue === 'number' ? utils.getStatisticalSignificanceText(assocData.pValue) : 'nicht bestimmbar';
         const orVal = assocData.or?.value;
         const rdVal = assocData.rd?.value;
         
         let mainStatFormatted = '';
         if (key === 'or' && orVal !== undefined) {
             mainStatFormatted = interpretationTemplate
                .replace(/\[WERT\]/g, utils.formatCI(orVal, assocData.or.ci?.lower, assocData.or.ci?.upper, 2, false, '--'))
                .replace(/\[FAKTOR_TEXT\]/g, `<strong>${orVal >= 1 ? 'erhöht' : 'reduziert'}</strong>`);
         } else if (key === 'rd' && rdVal !== undefined) {
             mainStatFormatted = interpretationTemplate
                .replace(/\[WERT\]/g, utils.formatCI(Math.abs(rdVal), assocData.rd.ci?.lower, assocData.rd.ci?.upper, 1, true, '--'))
                .replace(/\[HOEHER_NIEDRIGER\]/g, `<strong>${rdVal >= 0 ? 'höher' : 'niedriger'}</strong>`);
         } else if (key === 'phi' && assocData.phi?.value !== undefined) {
              mainStatFormatted = interpretationTemplate
                .replace(/\[WERT\]/g, utils.formatNumber(assocData.phi.value, 2, '--'))
                .replace(/\[BEWERTUNG\]/g, `<strong>${utils.getPhiBewertung(assocData.phi.value)}</strong>`);
         } else if (key === 'fisher' || key === 'mannwhitney') {
             mainStatFormatted = interpretationTemplate;
         }

         return mainStatFormatted
            .replace(/\[P_WERT\]/g, pValueText)
            .replace(/\[SIGNIFIKANZ\]/g, utils.getStatisticalSignificanceSymbol(assocData.pValue))
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${signifikanzText}</strong>`)
            .replace(/\[MERKMAL\]/g, `<strong>'${merkmalName}'</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${utils.getKollektivDisplayName(kollektivName)}</strong>`)
            .replace(/\[VARIABLE\]/g, `<strong>'${merkmalName}'</strong>`);
    }

    function showKurzanleitung() {
        if (isKurzanleitungVisible) return;

        const modalElement = document.getElementById('kurzanleitung-modal');
        if (!modalElement) {
            console.error("Modal-Element 'kurzanleitung-modal' nicht gefunden.");
            return;
        }

        if (!kurzanleitungModalInstance) {
            kurzanleitungModalInstance = new bootstrap.Modal(modalElement);
            modalElement.addEventListener('shown.bs.modal', () => { isKurzanleitungVisible = true; });
            modalElement.addEventListener('hidden.bs.modal', () => { isKurzanleitungVisible = false; });
        }
        
        kurzanleitungModalInstance.show();
    }

    return Object.freeze({
        escapeMarkdown,
        showToast,
        initializeTooltips,
        destroyTooltips,
        updateElementHTML,
        updateKollektivButtonsUI,
        attachRowCollapseListeners,
        showKurzanleitung,
        getMetricDescriptionHTML,
        getMetricInterpretationHTML,
        getTestInterpretationHTML,
        getAssociationInterpretationHTML,
        toggleElementClass
    });

})();
