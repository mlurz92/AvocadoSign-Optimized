const ui_helpers = (() => {

    let globalTippyInstances = [];
    let collapseEventListenersAttached = new Set();

    function escapeMarkdown(text) {
        if (typeof text !== 'string' || text === null) return text === null ? '' : String(text);
        const map = { '\\': '\\\\', '`': '\\`', '*': '\\*', '_': '\\_', '{': '\\{', '}': '\\}', '[': '\\[', ']': '\\]', '(': '\\(', ')': '\\)', '#': '\\#', '+': '\\+', '-': '\\-', '.': '\\.', '!': '\\!', '|': '\\|' };
        return text.replace(/[\\`*_{}[\]()#+\-.!|]/g, match => map[match]);
    }

    function showToast(message, type = 'info', duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS) {
          const toastContainer = document.getElementById('toast-container');
          if (!toastContainer) { console.error("showToast: Toast-Container Element 'toast-container' nicht gefunden."); return; }
          if (typeof message !== 'string' || message.trim() === '') { console.warn("showToast: Ungültige oder leere Nachricht."); return; }
          if (typeof bootstrap === 'undefined' || !bootstrap.Toast) { console.error("showToast: Bootstrap Toast ist nicht verfügbar."); return; }

          const toastId = `toast-${generateUUID()}`;
          let bgClass = 'bg-secondary', iconClass = 'fa-info-circle', textClass = 'text-white';
          switch (type) {
              case 'success': bgClass = 'bg-success'; iconClass = 'fa-check-circle'; textClass = 'text-white'; break;
              case 'warning': bgClass = 'bg-warning'; iconClass = 'fa-exclamation-triangle'; textClass = 'text-dark'; break;
              case 'danger': bgClass = 'bg-danger'; iconClass = 'fa-exclamation-circle'; textClass = 'text-white'; break;
              case 'info': default: bgClass = 'bg-info'; iconClass = 'fa-info-circle'; textClass = 'text-dark'; break;
          }

          const toastElement = document.createElement('div');
          toastElement.id = toastId; toastElement.className = `toast align-items-center ${textClass} ${bgClass} border-0 fade`;
          toastElement.setAttribute('role', 'alert'); toastElement.setAttribute('aria-live', 'assertive'); toastElement.setAttribute('aria-atomic', 'true'); toastElement.setAttribute('data-bs-delay', String(duration));
          toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${iconClass} fa-fw me-2"></i> ${escapeMarkdown(message)}</div><button type="button" class="btn-close me-2 m-auto ${textClass === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Schließen"></button></div>`;
          toastContainer.appendChild(toastElement);

          try {
              const toastInstance = new bootstrap.Toast(toastElement, { delay: duration });
              toastElement.addEventListener('hidden.bs.toast', () => { if(toastContainer.contains(toastElement)) { toastElement.remove(); } }, { once: true });
              toastInstance.show();
          } catch (e) { console.error("Fehler beim Erstellen/Anzeigen des Toasts:", e); if(toastContainer.contains(toastElement)) { toastElement.remove(); } }
    }

    function initializeTooltips(scope = document.body) {
        if (!window.tippy || typeof scope?.querySelectorAll !== 'function') { console.warn("Tippy.js nicht verfügbar oder ungültiger Scope für Tooltips."); return; }

        const elementsInScope = Array.from(scope.matches('[data-tippy-content]') ? [scope] : scope.querySelectorAll('[data-tippy-content]'));
        const elementSet = new Set(elementsInScope);

        globalTippyInstances = globalTippyInstances.filter(instance => {
            if (!instance || !instance.reference || !document.body.contains(instance.reference)) { try { instance?.destroy(); } catch(e){} return false; }
            if (elementSet.has(instance.reference)) { try { instance.destroy(); } catch (e) {} return false; }
            return true;
        });

        if (elementsInScope.length > 0) {
           const newInstances = tippy(elementsInScope, {
               allowHTML: true, theme: 'glass', placement: 'top', animation: 'fade',
               interactive: false, appendTo: () => document.body, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY || [150, 50],
               maxWidth: 350, duration: [150, 150], zIndex: 3050,
               onCreate(instance) { if (!instance.props.content || String(instance.props.content).trim() === '') { instance.disable(); } },
               onShow(instance) { const content = instance.reference.getAttribute('data-tippy-content'); if (content && String(content).trim() !== '') { instance.setContent(content); return true; } else { return false; } }
           });
           if (Array.isArray(newInstances)) { globalTippyInstances = globalTippyInstances.concat(newInstances); }
           else if (newInstances) { globalTippyInstances.push(newInstances); }
        }
    }

    function updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) { element.textContent = (text === null || text === undefined) ? '' : String(text); }
    }

    function updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) { element.innerHTML = (html === null || html === undefined) ? '' : String(html); }
    }

    function toggleElementClass(elementId, className, add) {
        const element = document.getElementById(elementId);
        if (element && className) { element.classList.toggle(className, add); }
    }

    function setElementDisabled(elementId, isDisabled) {
        const element = document.getElementById(elementId);
        if (element) { element.disabled = !!isDisabled; }
    }

    function updateHeaderStatsUI(stats) {
        const lang = 'de'; // Header is always German
        if (!stats) { stats = {}; }
        updateElementText('header-kollektiv', getKollektivDisplayName(stats.kollektiv, lang) || '--');
        updateElementText('header-anzahl-patienten', stats.anzahlPatienten ?? '--');
        updateElementText('header-status-n', stats.statusN || '--');
        updateElementText('header-status-as', stats.statusAS || '--');
        updateElementText('header-status-t2', stats.statusT2 || '--');
    }

    function updateKollektivButtonsUI(currentKollektiv) {
        const buttonGroup = document.querySelector('header .btn-group[aria-label="Kollektiv Auswahl"]');
        if (!buttonGroup) return;
        buttonGroup.querySelectorAll('button[data-kollektiv]').forEach(btn => { if (btn) { btn.classList.toggle('active', btn.getAttribute('data-kollektiv') === currentKollektiv); } });
    }

    function updateSortIcons(tableHeaderId, sortState) {
        const tableHeader = document.getElementById(tableHeaderId);
        if (!tableHeader || !sortState) return;
        tableHeader.querySelectorAll('th[data-sort-key]').forEach(th => {
            const key = th.dataset.sortKey; const icon = th.querySelector('i.fas'); if (!icon) return;
            icon.className = 'fas fa-sort text-muted opacity-50 ms-1';
            const subSpans = th.querySelectorAll('.sortable-sub-header'); let isSubKeySortActive = false;

            if (subSpans.length > 0) {
                subSpans.forEach(span => {
                    const subKey = span.dataset.subKey;
                    const isActiveSort = (key === sortState.key && subKey === sortState.subKey);
                    span.style.fontWeight = isActiveSort ? 'bold' : 'normal';
                    span.style.textDecoration = isActiveSort ? 'underline' : 'none';
                    span.style.color = isActiveSort ? 'var(--primary-color)' : 'inherit';
                    const thLabel = th.textContent.split('(')[0].trim();
                    const spanLabel = span.textContent.trim();
                    span.setAttribute('data-tippy-content', `Sortieren nach: ${thLabel} -> ${spanLabel}`);
                    if (isActiveSort) {
                        icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary`;
                        isSubKeySortActive = true;
                    }
                });
                if (!isSubKeySortActive && key === sortState.key && (sortState.subKey === null || sortState.subKey === undefined) ) {
                    icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary`;
                }
            } else {
                if (key === sortState.key && (sortState.subKey === null || sortState.subKey === undefined)) {
                    icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary`;
                }
            }
        });
        initializeTooltips(tableHeader);
    }

    function toggleAllDetails(tableBodyId, buttonId, lang = 'de') {
        const button = document.getElementById(buttonId);
        const tableBody = document.getElementById(tableBodyId);
        if (!button || !tableBody) return;

        const action = button.dataset.action || 'expand';
        const expand = action === 'expand';
        const collapseElements = tableBody.querySelectorAll('.collapse');
        let changedCount = 0;

        if (typeof bootstrap === 'undefined' || !bootstrap.Collapse) {
            console.error("Bootstrap Collapse nicht verfügbar.");
            return;
        }

        collapseElements.forEach(el => {
            const instance = bootstrap.Collapse.getOrCreateInstance(el);
            if (instance) {
                if (expand && !el.classList.contains('show')) { instance.show(); changedCount++; }
                else if (!expand && el.classList.contains('show')) { instance.hide(); changedCount++; }
            }
        });

        const newAction = expand ? 'collapse' : 'expand';
        button.dataset.action = newAction;
        const iconClass = expand ? 'fa-chevron-up' : 'fa-chevron-down';
        
        const buttonTextExpand = UI_TEXTS.dataHandling?.[lang]?.expandAll || UI_TEXTS.dataHandling?.de?.expandAll || "Alle Details Einblenden";
        const buttonTextCollapse = UI_TEXTS.dataHandling?.[lang]?.collapseAll || UI_TEXTS.dataHandling?.de?.collapseAll || "Alle Details Ausblenden";
        const buttonText = expand ? buttonTextCollapse : buttonTextExpand;

        let tooltipKeyBase = '';
        if (buttonId === 'daten-toggle-details') tooltipKeyBase = 'datenTable';
        else if (buttonId === 'auswertung-toggle-details') tooltipKeyBase = 'auswertungTable';
        
        const tooltipContentBase = TOOLTIP_CONTENT?.[lang]?.[tooltipKeyBase]?.expandAll || TOOLTIP_CONTENT?.de?.[tooltipKeyBase]?.expandAll || "Alle Details ein-/ausblenden";
        const currentTooltipText = expand ? tooltipContentBase.replace(lang === 'de' ? 'ein-' : 'expand', lang === 'de' ? 'aus-' : 'collapse') : tooltipContentBase.replace(lang === 'de' ? 'aus-' : 'collapse', lang === 'de' ? 'ein-' : 'expand');


        updateElementHTML(buttonId, `${buttonText} <i class="fas ${iconClass} ms-1"></i>`);
        button.setAttribute('data-tippy-content', currentTooltipText);
        if(button._tippy) { button._tippy.setContent(currentTooltipText); } else { initializeTooltips(button.parentElement || button); }
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
        if(!tableBodyElement || typeof tableBodyElement.id !== 'string' || collapseEventListenersAttached.has(tableBodyElement.id)) return;
        tableBodyElement.addEventListener('show.bs.collapse', handleCollapseEvent);
        tableBodyElement.addEventListener('hide.bs.collapse', handleCollapseEvent);
        collapseEventListenersAttached.add(tableBodyElement.id);
    }

    function getT2IconSVG(type, value, lang = 'de') {
        const s = APP_CONFIG.UI_SETTINGS.ICON_SIZE || 20;
        const sw = APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH || 1.5;
        const iconColor = APP_CONFIG.UI_SETTINGS.ICON_COLOR || '#212529';
        const c = s / 2;
        const r = Math.max(1, (s - sw) / 2);
        const sq = Math.max(1, s - sw * 1.5);
        const sqPos = (s - sq) / 2;
        let svgContent = '';
        let extraClass = '';
        let fillColor = 'none';
        let strokeColor = iconColor;

        const unknownIconSVG = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" stroke-dasharray="2 2" /><line x1="${sqPos}" y1="${sqPos}" x2="${sqPos+sq}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/><line x1="${sqPos+sq}" y1="${sqPos}" x2="${sqPos}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;
        let tooltipText = '';
        const effectiveLang = TOOLTIP_CONTENT?.[lang] ? lang : 'de';

        switch (type) {
            case 'form':
                if (value === 'rund') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${sw}"/>`;
                else if (value === 'oval') svgContent = `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.65}" fill="none" stroke="${strokeColor}" stroke-width="${sw}"/>`;
                else svgContent = unknownIconSVG;
                tooltipText = TOOLTIP_CONTENT?.[effectiveLang]?.t2Form?.description || 'Form';
                break;
            case 'kontur':
                const ksw = sw * 1.2;
                const kr = Math.max(1, (s - ksw) / 2);
                if (value === 'scharf') svgContent = `<circle cx="${c}" cy="${c}" r="${kr}" fill="none" stroke="${strokeColor}" stroke-width="${ksw}"/>`;
                else if (value === 'irregulär') svgContent = `<path d="M ${c + kr} ${c} A ${kr} ${kr} 0 0 1 ${c} ${c + kr} A ${kr*0.8} ${kr*1.2} 0 0 1 ${c-kr*0.9} ${c-kr*0.3} A ${kr*1.1} ${kr*0.7} 0 0 1 ${c+kr} ${c} Z" fill="none" stroke="${strokeColor}" stroke-width="${ksw}"/>`;
                else svgContent = unknownIconSVG;
                tooltipText = TOOLTIP_CONTENT?.[effectiveLang]?.t2Kontur?.description || 'Kontur';
                break;
            case 'homogenitaet':
                if (value === 'homogen') { fillColor = iconColor; svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="${fillColor}" stroke="none" rx="1" ry="1"/>`; }
                else if (value === 'heterogen') { const pSize = Math.max(1, sq / 4); svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" rx="1" ry="1"/>`; for (let i=0;i<3;i++){for(let j=0;j<3;j++){if((i+j)%2===0){svgContent+=`<rect x="${sqPos+i*pSize + pSize/2}" y="${sqPos+j*pSize + pSize/2}" width="${pSize}" height="${pSize}" fill="${iconColor}" stroke="none" style="opacity: 0.6;"/>`;}}} }
                else svgContent = unknownIconSVG;
                tooltipText = TOOLTIP_CONTENT?.[effectiveLang]?.t2Homogenitaet?.description || 'Homogenität';
                break;
            case 'signal':
                if (value === 'signalarm') fillColor = '#555555';
                else if (value === 'intermediär') fillColor = '#aaaaaa';
                else if (value === 'signalreich') fillColor = '#f0f0f0';
                else { svgContent = unknownIconSVG; tooltipText = TOOLTIP_CONTENT?.[effectiveLang]?.t2Signal?.description || 'Signalintensität'; return `<svg class="icon-t2 icon-${type} icon-value-unknown ${extraClass}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: ${lang === 'de' ? 'unbekannt' : 'unknown'}" data-tippy-content="${tooltipText}">${svgContent}</svg>`; }
                strokeColor = (value === 'signalreich') ? '#333333' : 'rgba(0,0,0,0.1)';
                svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw * 0.75}"/>`;
                if (value === 'signalreich') svgContent += `<circle cx="${c}" cy="${c}" r="${r * 0.3}" fill="${strokeColor}" stroke="none"/>`;
                else if (value === 'intermediär') svgContent += `<line x1="${c-r*0.5}" y1="${c}" x2="${c+r*0.5}" y2="${c}" stroke="${iconColor}" stroke-width="${sw/1.5}" stroke-linecap="round"/>`;
                tooltipText = TOOLTIP_CONTENT?.[effectiveLang]?.t2Signal?.description || 'Signalintensität';
                break;
            case 'ruler-horizontal':
                svgContent = `<path d="M${sw/2} ${c} H${s-sw/2} M${c} ${sw/2} V${s-sw/2} M${s*0.2} ${c-s*0.15} L${s*0.2} ${c+s*0.15} M${s*0.4} ${c-s*0.1} L${s*0.4} ${c+s*0.1} M${s*0.6} ${c-s*0.1} L${s*0.6} ${c+s*0.1} M${s*0.8} ${c-s*0.15} L${s*0.8} ${c+s*0.15}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;
                type = 'size';
                tooltipText = TOOLTIP_CONTENT?.[effectiveLang]?.t2Size?.description || (lang==='de'?'Größe (Kurzachse)':'Size (Short Axis)');
                break;
            default:
                svgContent = unknownIconSVG;
                tooltipText = type;
        }
        const valueClass = (value !== null && typeof value === 'string') ? `icon-value-${value.replace(/\s+/g, '-').toLowerCase()}` : 'icon-value-unknown';
        const ariaLabel = `${type}: ${value || (lang === 'de' ? 'unbekannt' : 'unknown')}`;
        return `<svg class="icon-t2 icon-${type} ${valueClass} ${extraClass}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${ariaLabel}" data-tippy-content="${tooltipText}">${svgContent}</svg>`;
    }

    function updateT2CriteriaControlsUI(currentCriteria, currentLogic) {
        const lang = 'de'; // T2 Criteria controls are always German in this app version
        const logicSwitch = document.getElementById('t2-logic-switch');
        const logicLabel = document.getElementById('t2-logic-label');
        if (logicSwitch && logicLabel) {
            logicSwitch.checked = currentLogic === 'ODER';
            logicLabel.textContent = UI_TEXTS.t2LogicDisplayNames[lang]?.[currentLogic] || currentLogic;
        }
        if (!currentCriteria) return;

        Object.keys(currentCriteria).forEach(key => {
            if (key === 'logic') return;
            const criterion = currentCriteria[key];
            if (!criterion || typeof criterion !== 'object') return;

            const checkbox = document.getElementById(`check-${key}`);
            const optionsContainer = checkbox?.closest('.criteria-group')?.querySelector('.criteria-options-container');

            if (checkbox && optionsContainer) {
                checkbox.checked = criterion.active;
                const dependentElements = optionsContainer.querySelectorAll('input, button, select, span.criteria-value-display');
                dependentElements.forEach(el => {
                    if (el) {
                        el.disabled = !criterion.active;
                        el.classList.toggle('disabled-criterion-control', !criterion.active);
                    }
                });

                if (key === 'size') {
                    const range = document.getElementById('range-size');
                    const input = document.getElementById('input-size');
                    const valueDisplay = document.getElementById('value-size');
                    const thresholdValue = criterion.threshold ?? getDefaultT2Criteria().size.threshold;
                    if (range) range.value = formatNumber(thresholdValue, 1, '', true, lang);
                    if (input) input.value = formatNumber(thresholdValue, 1, '', true, lang);
                    if (valueDisplay) valueDisplay.textContent = formatNumber(thresholdValue, 1, '--', false, lang);
                } else {
                    optionsContainer.querySelectorAll('.t2-criteria-button').forEach(button => {
                        if(button.dataset.criterion === key) {
                            const isActiveValue = criterion.active && button.dataset.value === String(criterion.value);
                            button.classList.toggle('active', isActiveValue);
                            button.classList.toggle('inactive-option', !criterion.active || !isActiveValue);
                        }
                    });
                }
            }
        });
    }

    function markCriteriaSavedIndicator(isUnsaved, lang = 'de') {
        const card = document.getElementById('t2-criteria-card');
        if (!card) return;
        const shouldShowIndicator = !!isUnsaved;
        card.classList.toggle('criteria-unsaved-indicator', shouldShowIndicator);

        const existingTippy = card._tippy;
        const tooltipContent = TOOLTIP_CONTENT?.[lang]?.t2CriteriaCard?.unsavedIndicator || TOOLTIP_CONTENT?.de?.t2CriteriaCard?.unsavedIndicator || "Ungespeicherte Änderungen vorhanden.";

        if (shouldShowIndicator && (!existingTippy || !existingTippy.state.isEnabled)) {
            tippy(card, { content: tooltipContent, placement: 'top-start', theme: 'glass warning', trigger: 'manual', showOnCreate: true, zIndex: 1100, hideOnClick: false });
        } else if (shouldShowIndicator && existingTippy) {
            existingTippy.setContent(tooltipContent);
            existingTippy.setProps({ theme: 'glass warning' });
            existingTippy.enable();
            existingTippy.show();
        } else if (!shouldShowIndicator && existingTippy) {
            existingTippy.hide();
            existingTippy.disable();
        }
    }

    function updateStatistikSelectorsUI(layout, kollektiv1, kollektiv2, lang = 'de') {
        const toggleBtn = document.getElementById('statistik-toggle-vergleich');
        const container1 = document.getElementById('statistik-kollektiv-select-1-container');
        const container2 = document.getElementById('statistik-kollektiv-select-2-container');
        const select1 = document.getElementById('statistik-kollektiv-select-1');
        const select2 = document.getElementById('statistik-kollektiv-select-2');
        const isVergleich = layout === 'vergleich';

        if (toggleBtn) {
            toggleBtn.classList.toggle('active', isVergleich);
            toggleBtn.setAttribute('aria-pressed', String(isVergleich));
            const buttonText = isVergleich ? (UI_TEXTS.statisticLayout?.[lang]?.vergleichAktiv || '<i class="fas fa-users-cog me-1"></i> Vergleich Aktiv') : (UI_TEXTS.statisticLayout?.[lang]?.einzelansichtAktiv ||'<i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv');
            updateElementHTML(toggleBtn.id, buttonText);
            const tooltipText = TOOLTIP_CONTENT?.[lang]?.statistikLayout?.description || TOOLTIP_CONTENT?.de?.statistikLayout?.description || 'Layout umschalten';
            if(toggleBtn._tippy) toggleBtn._tippy.setContent(tooltipText);
            else initializeTooltips(toggleBtn.parentElement || toggleBtn);
        }
        if (container1) container1.classList.toggle('d-none', !isVergleich);
        if (container2) container2.classList.toggle('d-none', !isVergleich);
        if (select1) select1.value = kollektiv1 || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1;
        if (select2) select2.value = kollektiv2 || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2;
    }

    function updatePresentationViewSelectorUI(currentView, lang = 'de') {
        const radios = document.querySelectorAll('input[name="praesentationAnsicht"]');
        radios.forEach(radio => {
            if (radio) {
                radio.checked = radio.value === currentView;
                const label = radio.nextElementSibling;
                if(label && label.tagName === 'LABEL') {
                    label.classList.toggle('active', radio.checked);
                }
            }
        });
        const studySelectContainer = document.getElementById('praes-study-select-container');
        if (studySelectContainer) {
            studySelectContainer.style.display = currentView === 'as-vs-t2' ? '' : 'none';
        }
        const viewSelectTooltipEl = document.querySelector('[aria-label="Präsentationsansicht Auswahl"]');
        if (viewSelectTooltipEl) {
             const tooltipText = TOOLTIP_CONTENT?.[lang]?.praesentation?.viewSelect?.description || TOOLTIP_CONTENT?.de?.praesentation?.viewSelect?.description || "Präsentationsansicht wählen";
             viewSelectTooltipEl.setAttribute('data-tippy-content', tooltipText);
             if(viewSelectTooltipEl._tippy) viewSelectTooltipEl._tippy.setContent(tooltipText);
        }
    }

    function updateBruteForceUI(state, data = {}, workerAvailable = true, currentKollektiv = null, lang = 'de') {
        const elements = {
            startBtn: document.getElementById('btn-start-brute-force'),
            cancelBtn: document.getElementById('btn-cancel-brute-force'),
            progressContainer: document.getElementById('brute-force-progress-container'),
            resultContainer: document.getElementById('brute-force-result-container'),
            progressBar: document.getElementById('bf-progress-bar'),
            progressPercent: document.getElementById('bf-progress-percent'),
            testedCount: document.getElementById('bf-tested-count'),
            totalCount: document.getElementById('bf-total-count'),
            metricLabel: document.getElementById('bf-metric-label'),
            bestMetric: document.getElementById('bf-best-metric'),
            bestCriteria: document.getElementById('bf-best-criteria'),
            statusText: document.getElementById('bf-status-text'),
            modalExportBtn: document.getElementById('export-bruteforce-modal-txt'),
            bfInfoKollektiv: document.getElementById('bf-kollektiv-info'),
            resultMetric: document.getElementById('bf-result-metric'),
            resultKollektiv: document.getElementById('bf-result-kollektiv'),
            resultValue: document.getElementById('bf-result-value'),
            resultLogic: document.getElementById('bf-result-logic'),
            resultCriteria: document.getElementById('bf-result-criteria'),
            resultDuration: document.getElementById('bf-result-duration'),
            resultTotalTested: document.getElementById('bf-result-total-tested'),
            applyBestBtn: document.getElementById('btn-apply-best-bf-criteria')
        };

        const uiStrings = UI_TEXTS.bruteForceCard?.[lang] || UI_TEXTS.bruteForceCard?.de;
        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l, s, lg) => 'Formatierungsfehler';
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k, lg) => k;
        const isRunning = state === 'start' || state === 'started' || state === 'progress';
        const hasResults = state === 'result' && data.results && data.results.length > 0 && data.bestResult && data.bestResult.criteria;

        if (elements.progressContainer) toggleElementClass(elements.progressContainer.id, 'd-none', !isRunning);
        if (elements.resultContainer) toggleElementClass(elements.resultContainer.id, 'd-none', state !== 'result' || !hasResults);
        if (elements.cancelBtn) toggleElementClass(elements.cancelBtn.id, 'd-none', !isRunning);
        if (elements.startBtn) setElementDisabled(elements.startBtn.id, !workerAvailable || isRunning);
        if (elements.modalExportBtn) setElementDisabled(elements.modalExportBtn.id, !hasResults);
        if (elements.applyBestBtn) setElementDisabled(elements.applyBestBtn.id, !hasResults);

        const startButtonText = isRunning ? `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> ${uiStrings?.runningButton || 'Läuft...'}` : `<i class="fas fa-cogs me-1"></i> ${workerAvailable ? (uiStrings?.startButton || 'Optimierung starten') : (uiStrings?.workerNotAvailableButton || 'Starten (Worker fehlt)')}`;
        if (elements.startBtn) updateElementHTML(elements.startBtn.id, startButtonText);

        if (elements.bfInfoKollektiv) {
            const kollektivToDisplay = data.kollektiv || currentKollektiv || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
            updateElementText(elements.bfInfoKollektiv.id, getKollektivNameFunc(kollektivToDisplay, lang));
        }

        const addOrUpdateTooltip = (el, contentKey, fallbackText, replaceValues = {}) => {
            let content = TOOLTIP_CONTENT?.[lang]?.[contentKey]?.description || TOOLTIP_CONTENT?.de?.[contentKey]?.description || fallbackText;
            for(const placeholder in replaceValues) {
                content = content.replace(`[${placeholder}]`, replaceValues[placeholder]);
            }
            if(el && content) { el.setAttribute('data-tippy-content', content); if(el._tippy) el._tippy.setContent(content); else initializeTooltips(el.parentElement || el); }
            else if (el && el._tippy && el._tippy.state.isEnabled) { el._tippy.disable(); }
        };
        
        const defaultMetricName = UI_TEXTS.statMetrics[lang]?.[(APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy').toLowerCase().replace(' ','')]?.name || (APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC || 'Balanced Accuracy');

        switch (state) {
            case 'idle': case 'cancelled': case 'error':
                if (elements.progressBar) { elements.progressBar.style.width = '0%'; elements.progressBar.setAttribute('aria-valuenow', '0'); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, '0%');
                if (elements.testedCount) updateElementText(elements.testedCount.id, '0');
                if (elements.totalCount) updateElementText(elements.totalCount.id, '0');
                if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, `${uiStrings?.bestCriteriaLabel || 'Beste Kriterien:'} --`);
                let statusMsg = '';
                if (state === 'idle') statusMsg = workerAvailable ? (uiStrings?.statusReady || 'Bereit.') : (uiStrings?.statusWorkerNotInit || 'Worker nicht verfügbar.');
                else if (state === 'cancelled') statusMsg = uiStrings?.statusCancelled || 'Abgebrochen.';
                else if (state === 'error') statusMsg = `${uiStrings?.statusErrorPrefix || 'Fehler:'} ${data?.message || (uiStrings?.statusErrorUnknown || 'Unbekannt.')}`;
                if (elements.statusText) updateElementText(elements.statusText.id, statusMsg);
                if (elements.statusText) addOrUpdateTooltip(elements.statusText, 'bruteForceInfo', `Aktueller Status: ${statusMsg}`);
                break;
            case 'start':
                if (elements.progressBar) { elements.progressBar.style.width = '0%'; elements.progressBar.setAttribute('aria-valuenow', '0'); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, '0%');
                if (elements.testedCount) updateElementText(elements.testedCount.id, '0');
                if (elements.totalCount) updateElementText(elements.totalCount.id, uiStrings?.calculating || 'berechne...');
                if (elements.metricLabel) updateElementText(elements.metricLabel.id, UI_TEXTS.statMetrics[lang]?.[data?.metric?.toLowerCase()?.replace(' ','')]?.name || data?.metric || defaultMetricName);
                if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, `${uiStrings?.bestCriteriaLabel || 'Beste Kriterien:'} --`);
                if (elements.statusText) updateElementText(elements.statusText.id, uiStrings?.statusInitializing || 'Initialisiere...');
                if (elements.statusText) addOrUpdateTooltip(elements.statusText, 'bruteForceInfo', `Aktueller Status: ${uiStrings?.statusInitializing || 'Initialisiere...'}`);
                break;
            case 'started':
                const totalComb = formatNumber(data?.totalCombinations || 0, 0, 'N/A', false, lang);
                if (elements.totalCount) updateElementText(elements.totalCount.id, totalComb);
                if (elements.statusText) updateElementText(elements.statusText.id, uiStrings?.statusTesting || 'Teste...');
                if (elements.statusText) addOrUpdateTooltip(elements.statusText, 'bruteForceInfo', `${uiStrings?.statusTesting || 'Teste...'} ${totalComb} ${uiStrings?.statusCombinations || 'Kombinationen...'}`);
                if (elements.progressContainer) addOrUpdateTooltip(elements.progressContainer, 'bruteForceProgress', (TOOLTIP_CONTENT?.de?.bruteForceProgress?.description || '').replace('[TOTAL]', totalComb), {TOTAL: totalComb});
                break;
            case 'progress':
                const percent = (data?.total && data.total > 0) ? Math.round((data.tested / data.total) * 100) : 0;
                const percentStr = `${percent}%`;
                if (elements.progressBar) { elements.progressBar.style.width = percentStr; elements.progressBar.setAttribute('aria-valuenow', String(percent)); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, percentStr);
                const testedNum = formatNumber(data?.tested || 0, 0, '--', false, lang);
                const totalNum = formatNumber(data?.total || 0, 0, '--', false, lang);
                if (elements.testedCount) updateElementText(elements.testedCount.id, testedNum);
                if (elements.totalCount) updateElementText(elements.totalCount.id, totalNum);
                if (elements.statusText) updateElementText(elements.statusText.id, uiStrings?.statusRunning || 'Läuft...');
                if (elements.statusText) addOrUpdateTooltip(elements.statusText, 'bruteForceInfo', `Aktueller Status: ${percentStr} (${testedNum}/${totalNum})`);
                const currentBestMetricName = UI_TEXTS.statMetrics[lang]?.[data?.metric?.toLowerCase()?.replace(' ','')]?.name || data?.metric || defaultMetricName;
                if (data?.currentBest && data.currentBest.criteria && isFinite(data.currentBest.metricValue)) {
                    const bestValStr = formatNumber(data.currentBest.metricValue, 4, '--', false, lang);
                    const bestCritStr = formatCriteriaFunc(data.currentBest.criteria, data.currentBest.logic, false, lang);
                    if (elements.metricLabel) updateElementText(elements.metricLabel.id, currentBestMetricName);
                    if (elements.bestMetric) updateElementText(elements.bestMetric.id, bestValStr);
                    if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, `${uiStrings?.bestCriteriaPrefix || 'Beste:'} ${UI_TEXTS.t2LogicDisplayNames[lang]?.[data.currentBest.logic.toUpperCase()] || data.currentBest.logic.toUpperCase()} - ${bestCritStr}`);
                    if (elements.bestMetric) addOrUpdateTooltip(elements.bestMetric, 'bruteForceBestMetricTooltip', `Bester Wert für '${currentBestMetricName}'.`, {METRIC_NAME: currentBestMetricName});
                    if (elements.bestCriteria) addOrUpdateTooltip(elements.bestCriteria, 'bruteForceBestCriteriaTooltip', `Kriterien für besten Wert.`);
                } else {
                    if (elements.metricLabel) updateElementText(elements.metricLabel.id, currentBestMetricName);
                    if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                    if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, `${uiStrings?.bestCriteriaLabel || 'Beste Kriterien:'} --`);
                }
                break;
            case 'result':
                const best = data?.bestResult;
                if (best && best.criteria && isFinite(best.metricValue)) {
                    const metricName = UI_TEXTS.statMetrics[lang]?.[data?.metric?.toLowerCase()?.replace(' ','')]?.name || data?.metric || defaultMetricName;
                    const kollektivName = getKollektivNameFunc(data.kollektiv || 'N/A', lang);
                    const bestValueStr = formatNumber(best.metricValue, 4, '--', false, lang);
                    const logicStr = UI_TEXTS.t2LogicDisplayNames[lang]?.[best.logic.toUpperCase()] || best.logic.toUpperCase();
                    const criteriaStr = formatCriteriaFunc(best.criteria, best.logic, false, lang);
                    const durationStr = formatNumber((data.duration || 0) / 1000, 1, '--', false, lang);
                    const totalTestedStr = formatNumber(data.totalTested || 0, 0, '--', false, lang);
                    if (elements.resultMetric) updateElementText(elements.resultMetric.id, metricName);
                    if (elements.resultKollektiv) updateElementText(elements.resultKollektiv.id, kollektivName);
                    if (elements.resultValue) updateElementText(elements.resultValue.id, bestValueStr);
                    if (elements.resultLogic) updateElementText(elements.resultLogic.id, logicStr);
                    if (elements.resultCriteria) updateElementText(elements.resultCriteria.id, criteriaStr);
                    if (elements.resultDuration) updateElementText(elements.resultDuration.id, durationStr);
                    if (elements.resultTotalTested) updateElementText(elements.resultTotalTested.id, totalTestedStr);
                    if (elements.statusText) updateElementText(elements.statusText.id, uiStrings?.statusFinished || 'Fertig.');
                    if (elements.resultContainer) addOrUpdateTooltip(elements.resultContainer, 'bruteForceResult', TOOLTIP_CONTENT?.de?.bruteForceResult?.description || '');
                } else {
                    if (elements.resultContainer) toggleElementClass(elements.resultContainer.id, 'd-none', true);
                    if (elements.statusText) updateElementText(elements.statusText.id, uiStrings?.statusFinishedNoValid || 'Fertig (kein valides Ergebnis).');
                }
                break;
        }
    }

    function updateExportButtonStates(activeTabId, hasBruteForceResults, canExportDataDependent, lang = 'de') {
        const bfDisabled = !hasBruteForceResults;
        const dataDisabled = !canExportDataDependent;
        const trySetDisabled = (id, disabled) => { const e = document.getElementById(id); if (e) e.disabled = disabled; };

        trySetDisabled('export-statistik-csv', dataDisabled);
        trySetDisabled('export-bruteforce-txt', bfDisabled);
        trySetDisabled('export-deskriptiv-md', dataDisabled);
        trySetDisabled('export-daten-md', dataDisabled);
        trySetDisabled('export-auswertung-md', dataDisabled);
        trySetDisabled('export-filtered-data-csv', dataDisabled);
        trySetDisabled('export-comprehensive-report-html', dataDisabled && bfDisabled);
        trySetDisabled('export-charts-png', dataDisabled);
        trySetDisabled('export-charts-svg', dataDisabled);
        trySetDisabled('export-publikation-md-zip', dataDisabled && bfDisabled);


        trySetDisabled('export-all-zip', dataDisabled && bfDisabled);
        trySetDisabled('export-csv-zip', dataDisabled);
        trySetDisabled('export-md-zip', dataDisabled);
        trySetDisabled('export-png-zip', dataDisabled);
        trySetDisabled('export-svg-zip', dataDisabled);

        trySetDisabled('export-statistik-xlsx', true);
        trySetDisabled('export-daten-xlsx', true);
        trySetDisabled('export-auswertung-xlsx', true);
        trySetDisabled('export-filtered-data-xlsx', true);
        trySetDisabled('export-xlsx-zip', true);

        const isPresentationTabActive = activeTabId === 'praesentation-tab';
        const praesButtons = [
            'download-performance-as-pur-csv', 'download-performance-as-pur-md',
            'download-performance-as-vs-t2-csv',
            'download-comp-table-as-vs-t2-md',
            'download-tests-as-vs-t2-md'
        ];
        praesButtons.forEach(id => {
            trySetDisabled(id, !isPresentationTabActive || dataDisabled);
        });

        document.querySelectorAll('.chart-download-btn, .table-download-png-btn').forEach(btn => {
            if (btn.closest('#statistik-tab-pane')) btn.disabled = activeTabId !== 'statistik-tab' || dataDisabled;
            else if (btn.closest('#auswertung-tab-pane .dashboard-card-col')) btn.disabled = activeTabId !== 'auswertung-tab' || dataDisabled;
            else if (btn.closest('#praesentation-tab-pane')) btn.disabled = activeTabId !== 'praesentation-tab' || dataDisabled;
            else if (btn.closest('#publikation-content-area .chart-container')) btn.disabled = activeTabId !== 'publikation-tab' || dataDisabled;

        });
         if(document.getElementById('export-bruteforce-modal-txt')) {
            trySetDisabled('export-bruteforce-modal-txt', bfDisabled);
         }
    }

    function updatePublikationUI(currentLang, currentSection, currentBfMetric) {
        const langSwitch = document.getElementById('publikation-sprache-switch');
        const langLabel = document.getElementById('publikation-sprache-label');
        const effectiveLang = UI_TEXTS?.publikationTab?.spracheSwitchLabel?.[currentLang] ? currentLang : 'de';

        if (langSwitch && langLabel) {
            langSwitch.checked = effectiveLang === 'en';
            langLabel.textContent = UI_TEXTS?.publikationTab?.spracheSwitchLabel?.[effectiveLang] || (effectiveLang === 'en' ? 'English' : 'Deutsch');
        }

        document.querySelectorAll('#publikation-sections-nav .nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.sectionId === currentSection);
        });

        const bfMetricSelect = document.getElementById('publikation-bf-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.value = currentBfMetric;
            const labelForSelect = document.querySelector('label[for="publikation-bf-metric-select"]');
            if(labelForSelect) labelForSelect.textContent = UI_TEXTS?.publikationTab?.[effectiveLang]?.bruteForceMetricSelectLabel || UI_TEXTS?.publikationTab?.de?.bruteForceMetricSelectLabel;
        }
    }

    function getMetricDescriptionHTML(key, methode = '', lang = 'de') {
       const effectiveLang = TOOLTIP_CONTENT?.[lang]?.statMetrics?.[key] ? lang : 'de';
       const desc = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[key]?.description || key;
       return desc.replace(/\[METHODE\]/g, methode);
    }

    function getMetricInterpretationHTML(key, metricData, methode = '', kollektivName = '', lang = 'de') {
        const effectiveLang = TOOLTIP_CONTENT?.[lang]?.statMetrics?.[key] ? lang : 'de';
        const interpretationTemplate = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[key]?.interpretation || (effectiveLang === 'de' ? 'Keine Interpretation verfügbar.' : 'No interpretation available.');
        const data = (typeof metricData === 'object' && metricData !== null) ? metricData : { value: metricData, ci: null, method: 'N/A' };
        const na = '--';
        const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
        const isPercent = !(key === 'f1' || key === 'auc');
        const valueStr = formatNumber(data?.value, digits, na, false, effectiveLang);
        const lowerStr = formatNumber(data?.ci?.lower, digits, na, false, effectiveLang);
        const upperStr = formatNumber(data?.ci?.upper, digits, na, false, effectiveLang);
        const ciMethodStr = data?.method || na;
        const bewertungStr = (key === 'auc') ? getAUCBewertung(data?.value, effectiveLang) : '';

        let interpretation = interpretationTemplate
            .replace(/\[METHODE\]/g, methode)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${isPercent && valueStr !== na ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, lowerStr)
            .replace(/\[UPPER\]/g, upperStr)
            .replace(/\[METHOD_CI\]/g, ciMethodStr)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

        if (lowerStr === na || upperStr === na || ciMethodStr === na) {
             const noCIData = effectiveLang === 'de' ? '(Keine CI-Daten verfügbar)' : '(No CI data available)';
             interpretation = interpretation.replace(/\(95% KI nach .*?: .*? - .*?\)/g, noCIData);
             interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
             interpretation = interpretation.replace(/by \[METHOD_CI\]:/g, '');
        }
        interpretation = interpretation.replace(/p=\[P_WERT\], \[SIGNIFIKANZ\]/g,'');
        interpretation = interpretation.replace(/<hr.*?>.*$/, '');
        return interpretation;
    }

    function getTestDescriptionHTML(key, t2ShortName = 'T2', lang = 'de') {
        const effectiveLang = TOOLTIP_CONTENT?.[lang]?.statMetrics?.[key] ? lang : 'de';
        const desc = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[key]?.description || key;
        return desc.replace(/\[T2_SHORT_NAME\]/g, t2ShortName);
    }

    function getTestInterpretationHTML(key, testData, kollektivName = '', t2ShortName = 'T2', lang = 'de') {
        const effectiveLang = TOOLTIP_CONTENT?.[lang]?.statMetrics?.[key] ? lang : 'de';
        const noInterpretation = effectiveLang === 'de' ? 'Keine Interpretation verfügbar.' : 'No interpretation available.';
        const noDataForInterpretation = effectiveLang === 'de' ? 'Keine Daten für Interpretation verfügbar.' : 'No data for interpretation available.';
        const interpretationTemplate = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[key]?.interpretation || noInterpretation;

        if (!testData) return noDataForInterpretation;
        const na = '--';
        const pValue = testData?.pValue;
        const pStr = getPValueText(pValue, effectiveLang); // Uses its own lang logic
        const sigSymbol = getStatisticalSignificanceSymbol(pValue);
        const sigText = getStatisticalSignificanceText(pValue, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, effectiveLang);
         return interpretationTemplate
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[T2_SHORT_NAME\]/g, t2ShortName)
            .replace(/<hr.*?>.*$/, '');
    }

    function getAssociationInterpretationHTML(key, assocObj, merkmalName, kollektivName, lang = 'de') {
        const effectiveLang = TOOLTIP_CONTENT?.[lang]?.statMetrics?.[key] ? lang : 'de';
        const noInterpretation = effectiveLang === 'de' ? 'Keine Interpretation verfügbar.' : 'No interpretation available.';
        const noDataForInterpretation = effectiveLang === 'de' ? 'Keine Daten für Interpretation verfügbar.' : 'No data for interpretation available.';
        const interpretationTemplate = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[key]?.interpretation || noInterpretation;

        if (!assocObj) return noDataForInterpretation;
        const na = '--';
        let valueStr = na, lowerStr = na, upperStr = na, ciMethodStr = na, bewertungStr = '', pStr = na, sigSymbol = '', sigText = '', pVal = NaN;
        const assozPValue = assocObj?.pValue;

        if (key === 'or') {
            valueStr = formatNumber(assocObj.or?.value, 2, na, false, effectiveLang);
            lowerStr = formatNumber(assocObj.or?.ci?.lower, 2, na, false, effectiveLang);
            upperStr = formatNumber(assocObj.or?.ci?.upper, 2, na, false, effectiveLang);
            ciMethodStr = assocObj.or?.method || na;
            pStr = getPValueText(assozPValue, effectiveLang);
            sigSymbol = getStatisticalSignificanceSymbol(assozPValue);
            sigText = getStatisticalSignificanceText(assozPValue, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, effectiveLang);
        } else if (key === 'rd') {
            valueStr = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, false, effectiveLang);
            lowerStr = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, false, effectiveLang);
            upperStr = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, false, effectiveLang);
            ciMethodStr = assocObj.rd?.method || na;
        } else if (key === 'phi') {
            valueStr = formatNumber(assocObj.phi?.value, 2, na, false, effectiveLang);
            bewertungStr = getPhiBewertung(assocObj.phi?.value, effectiveLang);
        } else if (key === 'fisher' || key === 'mannwhitney' || key === 'pvalue' || key === 'size_mwu' || key === 'defaultP') {
             pVal = assocObj?.pValue;
             pStr = getPValueText(pVal, effectiveLang);
             sigSymbol = getStatisticalSignificanceSymbol(pVal);
             sigText = getStatisticalSignificanceText(pVal, APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, effectiveLang);
             const templateToUse = TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.[key]?.interpretation || TOOLTIP_CONTENT?.[effectiveLang]?.statMetrics?.defaultP?.interpretation || TOOLTIP_CONTENT?.de?.statMetrics?.defaultP?.interpretation || noInterpretation;
             return templateToUse
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
                 .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[MERKMAL\]/g, `'${merkmalName}'`)
                 .replace(/\[VARIABLE\]/g, `'${merkmalName}'`)
                 .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
                 .replace(/<hr.*?>.*$/, '');
        }
        const orFaktorErhoeht = UI_TEXTS.statMetrics[effectiveLang]?.orFaktorTexte?.ERHOEHT || "erhöht";
        const orFaktorVerringert = UI_TEXTS.statMetrics[effectiveLang]?.orFaktorTexte?.VERRINGERT || "verringert";
        const orFaktorUnveraendert = UI_TEXTS.statMetrics[effectiveLang]?.orFaktorTexte?.UNVERAENDERT || "unverändert";
        const rdRichtungHoeher = UI_TEXTS.statMetrics[effectiveLang]?.rdRichtungTexte?.HOEHER || "höher";
        const rdRichtungNiedriger = UI_TEXTS.statMetrics[effectiveLang]?.rdRichtungTexte?.NIEDRIGER || "niedriger";
        const rdRichtungGleich = UI_TEXTS.statMetrics[effectiveLang]?.rdRichtungTexte?.GLEICH || "gleich";


        let interpretation = interpretationTemplate
            .replace(/\[MERKMAL\]/g, `'${merkmalName}'`)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${key === 'rd' && valueStr !== na ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, lowerStr)
            .replace(/\[UPPER\]/g, upperStr)
            .replace(/\[METHOD_CI\]/g, ciMethodStr)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivName}</strong>`)
            .replace(/\[FAKTOR_TEXT\]/g, assocObj?.or?.value > 1 ? orFaktorErhoeht : (assocObj?.or?.value < 1 && assocObj?.or?.value !== null ? orFaktorVerringert : orFaktorUnveraendert))
            .replace(/\[HOEHER_NIEDRIGER\]/g, assocObj?.rd?.value > 0 ? rdRichtungHoeher : (assocObj?.rd?.value < 0 && assocObj?.rd?.value !== null ? rdRichtungNiedriger : rdRichtungGleich))
            .replace(/\[STAERKE\]/g, `<strong>${bewertungStr}</strong>`)
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
            .replace(/<hr.*?>.*$/, '');

         if (key === 'or' || key === 'rd') {
            if (lowerStr === na || upperStr === na || ciMethodStr === na) {
                const noCIData = effectiveLang === 'de' ? '(Keine CI-Daten verfügbar)' : '(No CI data available)';
                interpretation = interpretation.replace(/\(95% KI nach .*?: .*? - .*?\)/g, noCIData);
                interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
                interpretation = interpretation.replace(/by \[METHOD_CI\]:/g, '');
            }
         }
         if (key === 'or' && pStr === na) {
             interpretation = interpretation.replace(/, p=.*?, .*?\)/g, ')');
         }
        return interpretation;
    }

    return Object.freeze({
        escapeMarkdown,
        showToast,
        initializeTooltips,
        updateElementText,
        updateElementHTML,
        toggleElementClass,
        setElementDisabled,
        updateHeaderStatsUI,
        updateKollektivButtonsUI,
        updateSortIcons,
        toggleAllDetails,
        attachRowCollapseListeners,
        handleCollapseEvent,
        getT2IconSVG,
        updateT2CriteriaControlsUI,
        markCriteriaSavedIndicator,
        updateStatistikSelectorsUI,
        updatePresentationViewSelectorUI,
        updateBruteForceUI,
        updateExportButtonStates,
        updatePublikationUI,
        getMetricDescriptionHTML,
        getMetricInterpretationHTML,
        getTestDescriptionHTML,
        getTestInterpretationHTML,
        getAssociationInterpretationHTML
    });

})();
