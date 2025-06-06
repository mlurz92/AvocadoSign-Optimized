const uiHelpers = (() => {

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
        if (!toastContainer) {
            console.error("showToast: Toast-Container Element 'toast-container' nicht gefunden.");
            return;
        }
        if (typeof message !== 'string' || message.trim() === '') {
            console.warn("showToast: Ungültige oder leere Nachricht.");
            return;
        }
        if (typeof bootstrap === 'undefined' || !bootstrap.Toast) {
            console.error("showToast: Bootstrap Toast ist nicht verfügbar.");
            return;
        }

        const toastId = `toast-${generateUUID()}`;
        let bgClass = 'bg-secondary',
            iconClass = 'fa-info-circle',
            textClass = 'text-white';
        switch (type) {
            case 'success':
                bgClass = 'bg-success';
                iconClass = 'fa-check-circle';
                textClass = 'text-white';
                break;
            case 'warning':
                bgClass = 'bg-warning';
                iconClass = 'fa-exclamation-triangle';
                textClass = 'text-dark';
                break;
            case 'danger':
                bgClass = 'bg-danger';
                iconClass = 'fa-exclamation-circle';
                textClass = 'text-white';
                break;
            case 'info':
            default:
                bgClass = 'bg-info';
                iconClass = 'fa-info-circle';
                textClass = 'text-dark';
                break;
        }

        const toastElement = document.createElement('div');
        toastElement.id = toastId;
        toastElement.className = `toast align-items-center ${textClass} ${bgClass} border-0 fade`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        toastElement.setAttribute('data-bs-delay', String(duration));
        toastElement.setAttribute('data-bs-autohide', 'true');

        toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${iconClass} fa-fw me-2"></i> ${escapeMarkdown(message)}</div><button type="button" class="btn-close me-2 m-auto ${textClass === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Schließen"></button></div>`;
        toastContainer.appendChild(toastElement);

        try {
            const toastInstance = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
            toastElement.addEventListener('hidden.bs.toast', () => {
                if (toastContainer.contains(toastElement)) {
                    toastElement.remove();
                }
            }, { once: true });
            toastInstance.show();
        } catch (e) {
            console.error("Fehler beim Erstellen/Anzeigen des Toasts:", e);
            if (toastContainer.contains(toastElement)) {
                toastElement.remove();
            }
        }
    }

    function initializeTooltips(scope = document.body) {
        if (!window.tippy || typeof scope?.querySelectorAll !== 'function') {
            console.warn("Tippy.js nicht verfügbar oder ungültiger Scope für Tooltips.");
            return;
        }

        const elementsInScope = Array.from(scope.matches('[data-tippy-content]') ? [scope] : scope.querySelectorAll('[data-tippy-content]'));
        const elementSet = new Set(elementsInScope);

        globalTippyInstances = globalTippyInstances.filter(instance => {
            if (!instance || !instance.reference || !document.body.contains(instance.reference)) {
                try {
                    instance?.destroy();
                } catch (e) {}
                return false;
            }
            if (elementSet.has(instance.reference) && instance.state.isEnabled) {
                try {
                    instance.destroy();
                } catch (e) {}
                return false;
            }
            return true;
        });

        if (elementsInScope.length > 0) {
            const newInstances = tippy(elementsInScope, {
                allowHTML: true,
                theme: 'glass',
                placement: 'top',
                animation: 'fade',
                interactive: false,
                appendTo: () => document.body,
                delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY || [150, 50],
                maxWidth: 400,
                duration: [150, 150],
                zIndex: 3050,
                onCreate(instance) {
                    if (!instance.props.content || String(instance.props.content).trim() === '') {
                        instance.disable();
                    }
                },
                onShow(instance) {
                    const content = instance.reference.getAttribute('data-tippy-content');
                    if (content && String(content).trim() !== '') {
                        instance.setContent(content);
                        return true;
                    } else {
                        return false;
                    }
                }
            });
            if (Array.isArray(newInstances)) {
                globalTippyInstances = globalTippyInstances.concat(newInstances.filter(inst => inst !== null && inst !== undefined));
            } else if (newInstances) {
                globalTippyInstances.push(newInstances);
            }
        }
    }

    function updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = (text === null || text === undefined) ? '' : String(text);
        }
    }

    function updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = (html === null || html === undefined) ? '' : String(html);
        }
    }

    function toggleElementClass(elementId, className, add) {
        const element = document.getElementById(elementId);
        if (element && className) {
            element.classList.toggle(className, add);
        }
    }

    function setElementDisabled(elementId, isDisabled) {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = !!isDisabled;
        }
    }

    function highlightElement(elementId, highlightClass = 'element-flash-highlight', duration = 1500) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(highlightClass);
            void element.offsetWidth;
            element.classList.add(highlightClass);
            setTimeout(() => {
                if (element) element.classList.remove(highlightClass);
            }, duration);
        }
    }

    function handleCollapseEvent(event) {
        const collapseElement = event.target;
        if (!collapseElement || !collapseElement.matches('.collapse')) return;

        const triggerRow = collapseElement.closest('tr.sub-row')?.previousElementSibling;
        if (!triggerRow || !triggerRow.matches('tr[data-bs-target]')) return;

        const icon = triggerRow.querySelector('.row-toggle-icon');
        const isShowing = event.type === 'show.bs.collapse' || event.type === 'shown.bs.collapse';
        const isHiding = event.type === 'hide.bs.collapse' || event.type === 'hidden.bs.collapse';

        if (icon) {
            icon.classList.toggle('fa-chevron-up', isShowing);
            icon.classList.toggle('fa-chevron-down', !isShowing && isHiding);
        }
        triggerRow.setAttribute('aria-expanded', String(isShowing));
    }

    function attachRowCollapseListeners(tableBodyElement) {
        if (!tableBodyElement || typeof tableBodyElement.id !== 'string' || collapseEventListenersAttached.has(tableBodyElement.id)) return;
        tableBodyElement.addEventListener('show.bs.collapse', handleCollapseEvent);
        tableBodyElement.addEventListener('hide.bs.collapse', handleCollapseEvent);
        collapseEventListenersAttached.add(tableBodyElement.id);
    }

    function getMetricDescriptionHTML(key, methode = '') {
        const desc = TOOLTIP_CONTENT.statMetrics[key]?.description || key;
        return desc.replace(/\[METHODE\]/g, `<strong>${methode}</strong>`);
    }

    function getMetricInterpretationHTML(key, metricData, methode = '', kollektivName = '') {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        const data = (typeof metricData === 'object' && metricData !== null) ? metricData : { value: metricData, ci: null, method: null };
        const na = '--';
        const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
        const isPercent = !(key === 'f1' || key === 'auc');
        const valueStr = formatNumber(data?.value, digits, na, true);
        const lowerStr = formatNumber(data?.ci?.lower, digits, na, true);
        const upperStr = formatNumber(data?.ci?.upper, digits, na, true);
        const ciMethodStr = data?.method || 'N/A';
        const bewertungStr = (key === 'auc') ? getAUCBewertung(data?.value) : ((key === 'phi') ? getPhiBewertung(data?.value) : '');
        const kollektivNameToUse = getKollektivDisplayName(kollektivName) || kollektivName || 'Unbekannt';

        let ciWarning = '';
        const ciWarningThreshold = APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD || 10;
        if (data?.n_trials !== undefined && data?.n_trials < ciWarningThreshold && (key === 'sens' || key === 'spez' || key === 'ppv' || key === 'npv' || key === 'acc')) {
            ciWarning = `<hr><i>Hinweis: Konfidenzintervall ggf. unsicher aufgrund kleiner Fallzahl (Nenner=${data.n_trials}).</i>`;
        } else if (data?.matrix_components && (key === 'balAcc' || key === 'f1' || key === 'auc')) {
            const mc = data.matrix_components;
            if (mc.total < ciWarningThreshold * 2 || mc.rp < ciWarningThreshold / 2 || mc.fp < ciWarningThreshold / 2 || mc.fn < ciWarningThreshold / 2 || mc.rn < ciWarningThreshold / 2) {
                ciWarning = `<hr><i>Hinweis: Konfidenzintervall ggf. unsicher aufgrund kleiner Fallzahlen in der Konfusionsmatrix (Gesamt=${mc.total}).</i>`;
            }
        }

        let interpretation = interpretationTemplate
            .replace(/\[METHODE\]/g, `<strong>${methode}</strong>`)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent && valueStr !== na ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, `<strong>${lowerStr}${isPercent && lowerStr !== na ? '%' : ''}</strong>`)
            .replace(/\[UPPER\]/g, `<strong>${upperStr}${isPercent && upperStr !== na ? '%' : ''}</strong>`)
            .replace(/\[METHOD_CI\]/g, `<em>${ciMethodStr}</em>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivNameToUse}</strong>`)
            .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

        if (lowerStr === na || upperStr === na || ciMethodStr === na || !data?.ci) {
            interpretation = interpretation.replace(/\(95%-KI nach .*?: .*? – .*?\)/g, '(Keine CI-Daten verfügbar)');
            interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
        }
        interpretation = interpretation.replace(/, p=\[P_WERT\], \[SIGNIFIKANZ\]/g, '');
        interpretation = interpretation.replace(/<hr.*?>.*$/, '');
        interpretation += ciWarning;
        return interpretation;
    }

    function getTestDescriptionHTML(key, t2ShortName = 'T2') {
        const desc = TOOLTIP_CONTENT.statMetrics[key]?.description || key;
        return desc.replace(/\[T2_SHORT_NAME\]/g, `<strong>${t2ShortName}</strong>`);
    }

    function getTestInterpretationHTML(key, testData, kollektivName = '', t2ShortName = 'T2') {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        if (!testData) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        const pValue = testData?.pValue;
        const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : formatNumber(pValue, 3, na)) : na;
        const sigSymbol = getStatisticalSignificanceSymbol(pValue);
        const sigText = getStatisticalSignificanceText(pValue);
        const kollektivNameToUse = getKollektivDisplayName(kollektivName) || kollektivName || 'Unbekannt';
        return interpretationTemplate
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivNameToUse}</strong>`)
            .replace(/\[T2_SHORT_NAME\]/g, `<strong>${t2ShortName}</strong>`)
            .replace(/<hr.*?>.*$/, '');
    }

    function getAssociationInterpretationHTML(key, assocObj, merkmalName, kollektivName) {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        if (!assocObj) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        let valueStr = na,
            lowerStr = na,
            upperStr = na,
            ciMethodStr = na,
            bewertungStr = '',
            pStr = na,
            sigSymbol = '',
            sigText = '',
            pVal = NaN,
            ciWarning = '';
        const assozPValue = assocObj?.pValue;
        const kollektivNameToUse = getKollektivDisplayName(kollektivName) || kollektivName || 'Unbekannt';
        const ciWarningThreshold = APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD || 10;

        if (assocObj.matrix && (key === 'or' || key === 'rd' || key === 'phi')) {
            const m = assocObj.matrix;
            const totalInMatrix = m.rp + m.fp + m.fn + m.rn;
            if (totalInMatrix < ciWarningThreshold * 2 || m.rp < ciWarningThreshold / 2 || m.fp < ciWarningThreshold / 2 || m.fn < ciWarningThreshold / 2 || m.rn < ciWarningThreshold / 2) {
                ciWarning = `<hr><i>Hinweis: Konfidenzintervall oder Maß ggf. unsicher aufgrund kleiner Fallzahlen in der zugrundeliegenden 2x2 Tabelle (Gesamt=${totalInMatrix}).</i>`;
            }
        }


        if (key === 'or') {
            valueStr = formatNumber(assocObj.or?.value, 2, na, true);
            lowerStr = formatNumber(assocObj.or?.ci?.lower, 2, na, true);
            upperStr = formatNumber(assocObj.or?.ci?.upper, 2, na, true);
            ciMethodStr = assocObj.or?.method || na;
            pStr = (assozPValue !== null && !isNaN(assozPValue)) ? (assozPValue < 0.001 ? '&lt;0.001' : formatNumber(assozPValue, 3, na, true)) : na;
            sigSymbol = getStatisticalSignificanceSymbol(assozPValue);
            sigText = getStatisticalSignificanceText(assozPValue);
        } else if (key === 'rd') {
            valueStr = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, true);
            lowerStr = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, true);
            upperStr = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, true);
            ciMethodStr = assocObj.rd?.method || na;
        } else if (key === 'phi') {
            valueStr = formatNumber(assocObj.phi?.value, 2, na, true);
            bewertungStr = getPhiBewertung(assocObj.phi?.value);
        } else if (key === 'fisher' || key === 'mannwhitney' || key === 'pvalue' || key === 'size_mwu' || key === 'defaultP') {
            pVal = assocObj?.pValue;
            pStr = (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, true)) : na;
            sigSymbol = getStatisticalSignificanceSymbol(pVal);
            sigText = getStatisticalSignificanceText(pVal);
            const templateToUse = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || TOOLTIP_CONTENT.statMetrics.defaultP.interpretation;
            return templateToUse
                .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
                .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
                .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                .replace(/\[MERKMAL\]/g, `<strong>'${merkmalName}'</strong>`)
                .replace(/\[VARIABLE\]/g, `<strong>'${merkmalName}'</strong>`)
                .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivNameToUse}</strong>`)
                .replace(/<hr.*?>.*$/, '');
        }

        let interpretation = interpretationTemplate
            .replace(/\[MERKMAL\]/g, `<strong>'${merkmalName}'</strong>`)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${key === 'rd' && valueStr !== na ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, `<strong>${lowerStr}${key === 'rd' && lowerStr !== na ? '%' : ''}</strong>`)
            .replace(/\[UPPER\]/g, `<strong>${upperStr}${key === 'rd' && upperStr !== na ? '%' : ''}</strong>`)
            .replace(/\[METHOD_CI\]/g, `<em>${ciMethodStr}</em>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivNameToUse}</strong>`)
            .replace(/\[FAKTOR_TEXT\]/g, assocObj?.or?.value > 1 ? UI_TEXTS.statMetrics.orFaktorTexte.ERHOEHT : (assocObj?.or?.value < 1 ? UI_TEXTS.statMetrics.orFaktorTexte.VERRINGERT : UI_TEXTS.statMetrics.orFaktorTexte.UNVERAENDERT))
            .replace(/\[HOEHER_NIEDRIGER\]/g, assocObj?.rd?.value > 0 ? UI_TEXTS.statMetrics.rdRichtungTexte.HOEHER : (assocObj?.rd?.value < 0 ? UI_TEXTS.statMetrics.rdRichtungTexte.NIEDRIGER : UI_TEXTS.statMetrics.rdRichtungTexte.GLEICH))
            .replace(/\[STAERKE\]/g, `<strong>${bewertungStr}</strong>`)
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/<hr.*?>.*$/, '');

        if (key === 'or' || key === 'rd') {
            if (lowerStr === na || upperStr === na || ciMethodStr === na || !assocObj?.[key]?.ci) {
                interpretation = interpretation.replace(/\(95%-KI nach .*?: .*? – .*?\)/g, '(Keine CI-Daten verfügbar)');
                interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
            }
        }
        if (key === 'or' && pStr === na) {
            interpretation = interpretation.replace(/, p=.*?, \[SIGNIFIKANZ\]/g, '');
        }
        interpretation += ciWarning;
        return interpretation;
    }

    function showKurzanleitung() {
        return new Promise((resolve) => {
            let modalElement = document.getElementById('kurzanleitung-modal');
            const modalBody = modalElement ? modalElement.querySelector('.modal-body') : null;
            const modalTitle = modalElement ? modalElement.querySelector('.modal-title') : null;

            if (!modalElement) {
                const modalHTML = `
                    <div class="modal fade" id="kurzanleitung-modal" tabindex="-1" aria-labelledby="kurzanleitungModalLabel" aria-hidden="true">
                      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content modal-glass">
                          <div class="modal-header">
                            <h5 class="modal-title" id="kurzanleitungModalLabel">${UI_TEXTS.kurzanleitung.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
                          </div>
                          <div class="modal-body">
                            ${UI_TEXTS.kurzanleitung.content}
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Schließen</button>
                          </div>
                        </div>
                      </div>
                    </div>`;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                modalElement = document.getElementById('kurzanleitung-modal');
                kurzanleitungModalInstance = new bootstrap.Modal(modalElement);
            } else {
                if (modalTitle && UI_TEXTS.kurzanleitung.title) {
                    modalTitle.innerHTML = UI_TEXTS.kurzanleitung.title;
                }
                if (modalBody && UI_TEXTS.kurzanleitung.content) {
                    modalBody.innerHTML = UI_TEXTS.kurzanleitung.content;
                }
                if (!kurzanleitungModalInstance) {
                    kurzanleitungModalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                }
            }

            if (kurzanleitungModalInstance && modalElement) {
                if (!kurzanleitungFirstShowDone) {
                    modalElement.addEventListener('hidden.bs.modal', () => resolve(), { once: true });
                    kurzanleitungFirstShowDone = true;
                } else {
                    modalElement.addEventListener('hidden.bs.modal', () => resolve(), { once: true });
                }
                 if(!modalElement.classList.contains('show')) {
                    kurzanleitungModalInstance.show();
                 } else {
                    resolve();
                 }
            } else {
                resolve();
            }
        });
    }


    return Object.freeze({
        escapeMarkdown,
        showToast,
        initializeTooltips,
        updateElementText,
        updateElementHTML,
        toggleElementClass,
        setElementDisabled,
        highlightElement,
        attachRowCollapseListeners,
        showKurzanleitung,
        getMetricDescriptionHTML,
        getMetricInterpretationHTML,
        getTestDescriptionHTML,
        getTestInterpretationHTML,
        getAssociationInterpretationHTML
    });

})();
