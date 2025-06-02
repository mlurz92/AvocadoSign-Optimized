const ui_helpers = (() => {

    let globalTippyInstances = [];
    let collapseEventListenersAttached = new Set();
    let kurzanleitungModalInstance = null;
    let initialTabRenderFixed = false; // Wird in showKurzanleitung verwendet

    function escapeHTML(unsafeText) {
        if (typeof unsafeText !== 'string') {
            return unsafeText === null || unsafeText === undefined ? '' : String(unsafeText);
        }
        return unsafeText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showToast(message, type = 'info', duration = (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS : 4000)) {
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
          toastElement.setAttribute('role', 'alert'); toastElement.setAttribute('aria-live', 'assertive'); toastElement.setAttribute('aria-atomic', 'true');
          toastElement.setAttribute('data-bs-delay', String(duration));
          toastElement.setAttribute('data-bs-autohide', 'true');

          toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${iconClass} fa-fw me-2"></i> ${escapeHTML(String(message))}</div><button type="button" class="btn-close me-2 m-auto ${textClass === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Schließen"></button></div>`;
          toastContainer.appendChild(toastElement);

          try {
              const toastInstance = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
              toastElement.addEventListener('hidden.bs.toast', () => { if(toastContainer.contains(toastElement)) { toastElement.remove(); } }, { once: true });
              toastInstance.show();
          } catch (e) { console.error("Fehler beim Erstellen/Anzeigen des Toasts:", e); if(toastContainer.contains(toastElement)) { toastElement.remove(); } }
    }

    function initializeTooltips(scope = document.body) {
        const appConfig = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG : { UI_SETTINGS: { TOOLTIP_DELAY: [150, 50] } };
        if (!window.tippy || !scope || typeof scope.querySelectorAll !== 'function') {
            console.warn("Tippy.js nicht verfügbar oder ungültiger Scope für Tooltips. Scope:", scope);
            return;
        }

        const elementsInScope = Array.from(scope.matches('[data-tippy-content]') ? [scope] : scope.querySelectorAll('[data-tippy-content]'));
        const elementSet = new Set(elementsInScope);

        globalTippyInstances = globalTippyInstances.filter(instance => {
            if (!instance || !instance.reference || !document.body.contains(instance.reference)) {
                try { instance?.destroy(); } catch(e){}
                return false;
            }
            if (elementSet.has(instance.reference) && instance.state?.isEnabled) {
                 try { instance.destroy(); } catch (e) {}
                 return false;
            }
            return true;
        });

        if (elementsInScope.length > 0) {
           const newInstances = tippy(elementsInScope, {
               allowHTML: true, theme: 'glass', placement: 'top', animation: 'fade',
               interactive: false, appendTo: () => document.body, delay: appConfig.UI_SETTINGS.TOOLTIP_DELAY,
               maxWidth: 400, duration: [150, 150], zIndex: 3050,
               onCreate(instance) { if (!instance.props.content || String(instance.props.content).trim() === '') { instance.disable(); } },
               onShow(instance) {
                   const content = instance.reference.getAttribute('data-tippy-content');
                   if (content && String(content).trim() !== '') {
                       instance.setContent(content); return true;
                   } else {
                       return false;
                   }
                }
           });
           if (Array.isArray(newInstances)) { globalTippyInstances = globalTippyInstances.concat(newInstances.filter(inst => inst !== null && inst !== undefined)); }
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

    function updateHeaderStatsUI(stats) {
        if (!stats) { stats = {}; }
        updateElementText('header-kollektiv', stats.kollektiv || '--');
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
            th.style.color = 'inherit';
            th.style.fontWeight = 'normal';

            const subSpans = th.querySelectorAll('.sortable-sub-header'); let isSubKeySortActive = false;

            if (subSpans.length > 0) {
                subSpans.forEach(span => {
                    const subKey = span.dataset.subKey;
                    const isActiveSort = (key === sortState.key && subKey === sortState.subKey);
                    span.style.fontWeight = isActiveSort ? 'bold' : 'normal';
                    span.style.textDecoration = isActiveSort ? 'underline' : 'none';
                    span.style.color = isActiveSort ? 'var(--primary-color)' : 'inherit';
                    const thLabel = th.getAttribute('data-tippy-content')?.split('.')[0] || th.textContent.split('(')[0].trim() || key;
                    const spanLabel = span.textContent.trim();
                    span.setAttribute('data-tippy-content', `Sortieren nach: ${thLabel} -> ${spanLabel}`);
                    if (isActiveSort) {
                        icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1`;
                        isSubKeySortActive = true;
                    }
                });
                if (!isSubKeySortActive && key === sortState.key && (sortState.subKey === null || sortState.subKey === undefined)) {
                     th.style.color = 'var(--primary-color)';
                     th.style.fontWeight = 'bold';
                     icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1`;
                }
            } else {
                if (key === sortState.key && (sortState.subKey === null || sortState.subKey === undefined)) {
                    icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1`;
                    th.style.color = 'var(--primary-color)';
                    th.style.fontWeight = 'bold';
                }
            }
        });
        initializeTooltips(tableHeader);
    }

    function updateSortIconsForTab(tabId, datenSortState, auswertungSortState) {
        if (tabId === 'daten-tab' && datenSortState) {
            updateSortIcons('daten-table-header', datenSortState);
        } else if (tabId === 'auswertung-tab' && auswertungSortState) {
            updateSortIcons('auswertung-table-header', auswertungSortState);
        }
    }

    function updateTabSpecificControls(tabId, stateSnapshot) {
        if (!stateSnapshot || typeof APP_CONFIG === 'undefined') return;
        if (tabId === 'statistik-tab') {
            updateStatistikSelectorsUI(stateSnapshot.statistikLayout, stateSnapshot.statistikVergleichKollektiv1, stateSnapshot.statistikVergleichKollektiv2);
        } else if (tabId === 'auswertung-tab') {
            if (typeof t2CriteriaManager !== 'undefined') {
                 updateT2CriteriaControlsUI(stateSnapshot.appliedT2Criteria, stateSnapshot.appliedT2Logic);
                 markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
            }
            if (typeof bruteForceManager !== 'undefined') {
                updateBruteForceUI(stateSnapshot.bruteForceResults?.status || 'idle', stateSnapshot.bruteForceResults, bruteForceManager.isWorkerAvailable(), stateSnapshot.currentKollektiv);
            }
        } else if (tabId === 'praesentation-tab') {
            updatePresentationViewSelectorUI(stateSnapshot.praesentationView);
            const studySelect = document.getElementById('praes-study-select');
            if (studySelect) studySelect.value = stateSnapshot.praesentationStudyId || APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_PRAESENTATION_STUDY_ID;
        } else if (tabId === 'publikation-tab') {
            updatePublikationUI(stateSnapshot.publikationLang, stateSnapshot.publikationSection, stateSnapshot.publikationBruteForceMetric);
        }

        const kollektivNameElementId = `${tabId.replace('-tab', '')}-tab-kollektiv-name`;
        const kollektivNameElement = document.getElementById(kollektivNameElementId);
        if (kollektivNameElement) {
            updateElementText(kollektivNameElementId, getKollektivDisplayName(stateSnapshot.currentKollektiv));
        }
    }

    function updateKollektivSelectorsForTab(tabId, currentGlobalKollektiv, statsLayout, statsKollektiv1, statsKollektiv2) {
        if (tabId === 'statistik-tab') {
            updateStatistikSelectorsUI(statsLayout, statsKollektiv1, statsKollektiv2);
        } else {
            const kollektivNameElementId = `${tabId.replace('-tab', '')}-tab-kollektiv-name`;
            const kollektivNameElement = document.getElementById(kollektivNameElementId);
            if (kollektivNameElement) {
                updateElementText(kollektivNameElementId, getKollektivDisplayName(currentGlobalKollektiv));
            }
        }
    }


    function toggleAllDetails(tableBodyId, buttonId) {
        const button = document.getElementById(buttonId);
        const tableBody = document.getElementById(tableBodyId);
        if (!button || !tableBody || typeof UI_TEXTS === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined') return;

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
        const buttonText = expand ? (UI_TEXTS.datenTable?.collapseAll || 'Alle Details Ausblenden') : (UI_TEXTS.datenTable?.expandAll || 'Alle Details Einblenden');

        let tooltipKeyBase = '';
        if (buttonId === 'daten-toggle-details') tooltipKeyBase = 'datenTable';
        else if (buttonId === 'auswertung-toggle-details') tooltipKeyBase = 'auswertungTable';
        const tooltipContentBase = (TOOLTIP_CONTENT[tooltipKeyBase]?.expandAll || 'Alle Details ein-/ausblenden');
        const currentTooltipText = expand ? tooltipContentBase.replace('ein-', 'aus-').replace('anzeigen', 'ausblenden') : tooltipContentBase.replace('aus-', 'ein-').replace('ausblenden', 'anzeigen');

        updateElementHTML(buttonId, `${escapeHTML(buttonText)} <i class="fas ${iconClass} ms-1"></i>`);
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

    function getT2IconSVG(type, value) {
        const appConfig = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG : { UI_SETTINGS: {} };
        const s = appConfig.UI_SETTINGS.ICON_SIZE || 18;
        const sw = appConfig.UI_SETTINGS.ICON_STROKE_WIDTH || 1.2;
        const iconColor = appConfig.UI_SETTINGS.ICON_COLOR || '#495057';
        const c = s / 2;
        const r = Math.max(1, (s - sw) / 2);
        const sq = Math.max(1, s - sw * 1.5);
        const sqPos = (s - sq) / 2;
        let svgContent = '';
        let extraClass = '';
        let fillColor = 'none';
        let strokeColor = iconColor;

        const unknownIconSVG = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" stroke-dasharray="2 2" /><line x1="${sqPos}" y1="${sqPos}" x2="${sqPos+sq}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/><line x1="${sqPos+sq}" y1="${sqPos}" x2="${sqPos}" y2="${sqPos+sq}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;

        switch (type) {
            case 'form':
                if (value === 'rund') svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${sw}"/>`;
                else if (value === 'oval') svgContent = `<ellipse cx="${c}" cy="${c}" rx="${r}" ry="${r * 0.65}" fill="none" stroke="${strokeColor}" stroke-width="${sw}"/>`;
                else svgContent = unknownIconSVG;
                break;
            case 'kontur':
                const ksw = sw * 1.2;
                const kr = Math.max(1, (s - ksw) / 2);
                if (value === 'scharf') svgContent = `<circle cx="${c}" cy="${c}" r="${kr}" fill="none" stroke="${strokeColor}" stroke-width="${ksw}"/>`;
                else if (value === 'irregulär') svgContent = `<path d="M ${c + kr*0.9} ${c} A ${kr} ${kr*0.8} 0 0 1 ${c - kr*0.2} ${c + kr*0.9} A ${kr*0.8} ${kr*1.1} 0 0 1 ${c-kr*0.9} ${c-kr*0.3} A ${kr*1.1} ${kr*0.7} 0 0 1 ${c+kr*0.9} ${c} Z" fill="none" stroke="${strokeColor}" stroke-width="${ksw*0.8}"/>`;
                else if (value === 'spikuliert') svgContent = `<path d="M${c} ${c-r*0.8} L${c+r*0.2} ${c-r*0.2} L${c+r*0.8} ${c} L${c+r*0.2} ${c+r*0.2} L${c} ${c+r*0.8} L${c-r*0.2} ${c+r*0.2} L${c-r*0.8} ${c} L${c-r*0.2} ${c-r*0.2} Z" fill="none" stroke="${strokeColor}" stroke-width="${sw*0.7}"/>`;
                else svgContent = unknownIconSVG;
                break;
            case 'homogenitaet':
                if (value === 'homogen') { fillColor = iconColor; svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="${fillColor}" stroke="none" rx="1" ry="1"/>`; }
                else if (value === 'heterogen') { const pSize = Math.max(1, sq / 4); svgContent = `<rect x="${sqPos}" y="${sqPos}" width="${sq}" height="${sq}" fill="none" stroke="${iconColor}" stroke-width="${sw/2}" rx="1" ry="1"/>`; for (let i=0;i<3;i++){for(let j=0;j<3;j++){if((i+j)%2===0){svgContent+=`<rect x="${sqPos+i*pSize + pSize/2}" y="${sqPos+j*pSize + pSize/2}" width="${pSize}" height="${pSize}" fill="${iconColor}" stroke="none" style="opacity: 0.6;"/>`;}}} }
                else svgContent = unknownIconSVG;
                break;
            case 'signal':
                if (value === 'signalarm') fillColor = '#555555';
                else if (value === 'intermediär') fillColor = '#aaaaaa';
                else if (value === 'signalreich') fillColor = '#f0f0f0';
                else if (value === 'null') { svgContent = unknownIconSVG; extraClass = 'icon-null-value'; }
                else { svgContent = unknownIconSVG; }

                if (value !== 'null') {
                    strokeColor = (value === 'signalreich') ? '#333333' : 'rgba(0,0,0,0.1)';
                    svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw * 0.75}"/>`;
                    if (value === 'signalreich') svgContent += `<circle cx="${c}" cy="${c}" r="${r * 0.3}" fill="${strokeColor}" stroke="none"/>`;
                    else if (value === 'intermediär') svgContent += `<line x1="${c-r*0.5}" y1="${c}" x2="${c+r*0.5}" y2="${c}" stroke="${iconColor}" stroke-width="${sw/1.5}" stroke-linecap="round"/>`;
                }
                break;
            case 'ruler-horizontal':
                svgContent = `<path d="M${sw/2} ${c} H${s-sw/2} M${c} ${sw/2} V${s-sw/2} M${s*0.2} ${c-s*0.15} L${s*0.2} ${c+s*0.15} M${s*0.4} ${c-s*0.1} L${s*0.4} ${c+s*0.1} M${s*0.6} ${c-s*0.1} L${s*0.6} ${c+s*0.1} M${s*0.8} ${c-s*0.15} L${s*0.8} ${c+s*0.15}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;
                type = 'size';
                break;
            default:
                svgContent = unknownIconSVG;
        }
        const valueClass = (value !== null && typeof value === 'string') ? `icon-value-${value.replace(/\s+/g, '-').toLowerCase()}` : 'icon-value-unknown';
        return `<svg class="icon-t2 icon-${type} ${valueClass} ${extraClass}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHTML(String(type))}: ${escapeHTML(String(value)) || 'unbekannt'}">${svgContent}</svg>`;
    }

    function updateT2CriteriaControlsUI(currentCriteria, currentLogic) {
        const logicSwitch = document.getElementById('t2-logic-switch');
        const logicLabel = document.getElementById('t2-logic-label');
        if (logicSwitch && logicLabel && typeof UI_TEXTS !== 'undefined') {
            logicSwitch.checked = currentLogic === 'ODER';
            logicLabel.textContent = UI_TEXTS.t2LogicDisplayNames[currentLogic] || currentLogic;
        }
        if (!currentCriteria || typeof APP_CONFIG === 'undefined') return;
        const defaultCriteriaConfig = APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_T2_CRITERIA;

        Object.keys(defaultCriteriaConfig).forEach(key => {
            if (key === 'logic') return;
            const criterion = currentCriteria[key] !== undefined ? currentCriteria[key] : defaultCriteriaConfig[key]; 
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
                        if (el.matches('.t2-criteria-button')) {
                            el.classList.toggle('inactive-option', !criterion.active);
                             const buttonCriterionKey = el.dataset.criterion;
                             const buttonValue = el.dataset.value;
                             if (criterion.active && criterion.value === buttonValue) {
                                el.classList.add('active');
                             } else {
                                el.classList.remove('active');
                             }
                        }
                    }
                });

                if (key === 'size') {
                    const range = document.getElementById('range-size');
                    const input = document.getElementById('input-size');
                    const valueDisplay = document.getElementById('value-size');
                    const thresholdValue = criterion.threshold ?? defaultCriteriaConfig.size.threshold;
                    const formattedNum = formatNumber(thresholdValue, 1, String(defaultCriteriaConfig.size.threshold.toFixed(1)), true);
                    if (range) range.value = formattedNum;
                    if (input) input.value = formattedNum;
                    if (valueDisplay) valueDisplay.textContent = formatNumber(thresholdValue, 1);
                }
            }
        });
    }

    function markCriteriaSavedIndicator(isUnsaved) {
        const card = document.getElementById('t2-criteria-card');
        if (!card || typeof TOOLTIP_CONTENT === 'undefined') return;
        const shouldShowIndicator = !!isUnsaved;
        card.classList.toggle('criteria-unsaved-indicator', shouldShowIndicator);

        const existingTippy = card._tippy;
        const tooltipText = (TOOLTIP_CONTENT?.t2CriteriaCard?.unsavedIndicator || "Ungespeicherte Änderungen vorhanden.");

        if (shouldShowIndicator) {
            if (!existingTippy || !existingTippy.state?.isEnabled) {
                tippy(card, { content: tooltipText, placement: 'top-start', theme: 'glass warning', trigger: 'manual', showOnCreate: true, zIndex: 1100, hideOnClick: false });
            } else {
                existingTippy.setContent(tooltipText);
                existingTippy.setProps({ theme: 'glass warning' });
                if(!existingTippy.state.isVisible) existingTippy.show();
            }
        } else if (!shouldShowIndicator && existingTippy && existingTippy.state?.isEnabled) {
            if(existingTippy.state.isVisible) existingTippy.hide();
            existingTippy.disable();
        }
    }

    function updateStatistikSelectorsUI(layout, kollektiv1, kollektiv2) {
        const toggleBtn = document.getElementById('statistik-toggle-vergleich');
        const container1 = document.getElementById('statistik-kollektiv-select-1-container');
        const container2 = document.getElementById('statistik-kollektiv-select-2-container');
        const select1 = document.getElementById('statistik-kollektiv-select-1');
        const select2 = document.getElementById('statistik-kollektiv-select-2');
        const isVergleich = layout === 'vergleich';

        if (toggleBtn && typeof TOOLTIP_CONTENT !== 'undefined') {
            toggleBtn.classList.toggle('active', isVergleich);
            toggleBtn.setAttribute('aria-pressed', String(isVergleich));
            updateElementHTML(toggleBtn.id, isVergleich ? '<i class="fas fa-users-cog me-1"></i> Vergleich Aktiv' : '<i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv');
            const tooltipText = TOOLTIP_CONTENT?.statistikLayout?.description || 'Layout umschalten';
            toggleBtn.setAttribute('data-tippy-content', tooltipText);
            if(toggleBtn._tippy) { toggleBtn._tippy.setContent(tooltipText); } else { initializeTooltips(toggleBtn.parentElement || toggleBtn); }
        }
        if (container1) container1.classList.toggle('d-none', !isVergleich);
        if (container2) container2.classList.toggle('d-none', !isVergleich);
        if (select1 && typeof APP_CONFIG !== 'undefined') select1.value = kollektiv1 || APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_KOLLEKTIV_VERGLEICH1;
        if (select2 && typeof APP_CONFIG !== 'undefined') select2.value = kollektiv2 || APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_KOLLEKTIV_VERGLEICH2;
    }

    function updatePresentationViewSelectorUI(currentView) {
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
    }

    function updateBruteForceUI(stateValue, data = {}, workerAvailable = true, currentKollektiv = null) {
        if (typeof APP_CONFIG === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined') return;
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
            resultKollektivN: document.getElementById('bf-result-kollektiv-n'),
            resultKollektivNplus: document.getElementById('bf-result-kollektiv-nplus'),
            resultKollektivNminus: document.getElementById('bf-result-kollektiv-nminus'),
            applyBestBtn: document.getElementById('btn-apply-best-bf-criteria')
        };

        const formatCriteriaFunc = (typeof studyT2CriteriaManager !== 'undefined' && studyT2CriteriaManager.formatCriteriaForDisplay) ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
        const isRunning = stateValue === 'start' || stateValue === 'started' || stateValue === 'progress' || stateValue === 'running';
        const hasCompletedResults = stateValue === 'completed' && data && data.results && data.results.length > 0 && data.bestResult && data.bestResult.criteria;


        if (elements.progressContainer) toggleElementClass(elements.progressContainer.id, 'd-none', !isRunning);
        if (elements.resultContainer) toggleElementClass(elements.resultContainer.id, 'd-none', !hasCompletedResults);
        if (elements.cancelBtn) toggleElementClass(elements.cancelBtn.id, 'd-none', !isRunning);
        if (elements.startBtn) setElementDisabled(elements.startBtn.id, !workerAvailable || isRunning);
        if (elements.modalExportBtn) setElementDisabled(elements.modalExportBtn.id, !hasCompletedResults && !(data && data.results && data.results.length > 0));
        if (elements.applyBestBtn) setElementDisabled(elements.applyBestBtn.id, !hasCompletedResults);


        const startButtonText = isRunning ? '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Läuft...' : `<i class="fas fa-cogs me-1"></i> ${workerAvailable ? 'Optimierung starten' : 'Starten (Worker fehlt)'}`;
        if (elements.startBtn) updateElementHTML(elements.startBtn.id, startButtonText);

        const kollektivToDisplayForInfo = data?.kollektiv || currentKollektiv || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        if (elements.bfInfoKollektiv) {
            updateElementText(elements.bfInfoKollektiv.id, getKollektivNameFunc(kollektivToDisplayForInfo));
        }
        
        const bfInfoElement = elements.bfInfoKollektiv?.closest('#brute-force-info');
        const addOrUpdateTooltip = (el, contentKey, replacements = {}) => {
            if(el && TOOLTIP_CONTENT && TOOLTIP_CONTENT[contentKey]) {
                let content = TOOLTIP_CONTENT[contentKey]?.description || '';
                Object.keys(replacements).forEach(placeholder => {
                    content = content.replace(new RegExp(`\\[${placeholder}\\]`, 'g'), `<strong>${escapeHTML(String(replacements[placeholder]))}</strong>`);
                });
                el.setAttribute('data-tippy-content', content);
                if(el._tippy && el._tippy.setContent) { el._tippy.setContent(content); } else { initializeTooltips(el.parentElement || el); }
            }
        };

        switch (stateValue) {
            case 'idle': case 'cancelled': case 'error':
                if (elements.progressBar) { elements.progressBar.style.width = '0%'; elements.progressBar.setAttribute('aria-valuenow', '0'); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, '0%');
                if (elements.testedCount) updateElementText(elements.testedCount.id, '0');
                if (elements.totalCount) updateElementText(elements.totalCount.id, '0');
                if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, 'Beste Kriterien: --');
                let statusMsg = '';
                if (stateValue === 'idle') statusMsg = workerAvailable ? 'Bereit.' : 'Worker nicht verfügbar.';
                else if (stateValue === 'cancelled') statusMsg = 'Abgebrochen.';
                else if (stateValue === 'error') statusMsg = `Fehler: ${escapeHTML(String(data?.message || data?.error || 'Unbekannt.'))}`;
                if (elements.statusText) updateElementText(elements.statusText.id, statusMsg);
                if (bfInfoElement && TOOLTIP_CONTENT.bruteForceInfo) addOrUpdateTooltip(bfInfoElement, 'bruteForceInfo', { KOLLEKTIV_NAME: getKollektivNameFunc(kollektivToDisplayForInfo), STATUS_TEXT: statusMsg });
                break;
            case 'start': case 'starting':
                if (elements.progressBar) { elements.progressBar.style.width = '0%'; elements.progressBar.setAttribute('aria-valuenow', '0'); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, '0%');
                if (elements.testedCount) updateElementText(elements.testedCount.id, '0');
                if (elements.totalCount) updateElementText(elements.totalCount.id, 'berechne...');
                const metricToUseStart = data?.metric || (currentKollektiv && _mainAppInterface?.getStateSnapshot()?.currentBruteForceMetric) || 'Metrik';
                if (elements.metricLabel) updateElementText(elements.metricLabel.id, metricToUseStart);
                if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, 'Beste Kriterien: --');
                if (elements.statusText) updateElementText(elements.statusText.id, 'Initialisiere...');
                if (bfInfoElement && TOOLTIP_CONTENT.bruteForceInfo) addOrUpdateTooltip(bfInfoElement, 'bruteForceInfo', { KOLLEKTIV_NAME: getKollektivNameFunc(kollektivToDisplayForInfo), STATUS_TEXT: 'Initialisiere...' });
                break;
            case 'started': case 'running': 
                const totalComb = formatNumber(data?.totalCombinations || data?.total || 0, 0, 'N/A');
                if (elements.totalCount) updateElementText(elements.totalCount.id, totalComb);
                if (elements.statusText) updateElementText(elements.statusText.id, 'Teste...');
                if (bfInfoElement && TOOLTIP_CONTENT.bruteForceInfo) addOrUpdateTooltip(bfInfoElement, 'bruteForceInfo', { KOLLEKTIV_NAME: getKollektivNameFunc(kollektivToDisplayForInfo), STATUS_TEXT: `Teste ${totalComb} Kombinationen...` });
                if (elements.progressContainer && TOOLTIP_CONTENT.bruteForceProgress) addOrUpdateTooltip(elements.progressContainer, 'bruteForceProgress', { TOTAL: totalComb });
                 if (stateValue === 'running' && data.progress !== undefined && data.totalCombinations !== undefined) {
                    const percentRunning = (data.totalCombinations > 0) ? Math.round((data.progress / data.totalCombinations) * 100) : 0;
                    const percentStrRunning = `${percentRunning}%`;
                    if (elements.progressBar) { elements.progressBar.style.width = percentStrRunning; elements.progressBar.setAttribute('aria-valuenow', String(percentRunning)); }
                    if (elements.progressPercent) updateElementText(elements.progressPercent.id, percentStrRunning);
                    if (elements.testedCount) updateElementText(elements.testedCount.id, formatNumber(data.progress, 0));
                    if (data.currentBestResult && data.currentBestResult.criteria && isFinite(data.currentBestResult.metricValue)) {
                        const metricToUseRunning = data.metric || _mainAppInterface?.getStateSnapshot()?.currentBruteForceMetric || 'Metrik';
                        if (elements.metricLabel) updateElementText(elements.metricLabel.id, metricToUseRunning);
                        if (elements.bestMetric) updateElementText(elements.bestMetric.id, formatNumber(data.currentBestResult.metricValue, 4));
                        if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, `Beste: ${data.currentBestResult.logic?.toUpperCase()} - ${formatCriteriaFunc(data.currentBestResult.criteria, data.currentBestResult.logic)}`);
                    }
                }
                break;
            case 'progress':
                const percent = (data?.totalCombinations && data.totalCombinations > 0) ? Math.round((data.testedCount / data.totalCombinations) * 100) : 0;
                const percentStr = `${percent}%`;
                if (elements.progressBar) { elements.progressBar.style.width = percentStr; elements.progressBar.setAttribute('aria-valuenow', String(percent)); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, percentStr);
                const testedNum = formatNumber(data?.testedCount || 0, 0);
                const totalNumProg = formatNumber(data?.totalCombinations || 0, 0);
                if (elements.testedCount) updateElementText(elements.testedCount.id, testedNum);
                if (elements.totalCount) updateElementText(elements.totalCount.id, totalNumProg);
                if (elements.statusText) updateElementText(elements.statusText.id, 'Läuft...');
                if (bfInfoElement && TOOLTIP_CONTENT.bruteForceInfo) addOrUpdateTooltip(bfInfoElement, 'bruteForceInfo', { KOLLEKTIV_NAME: getKollektivNameFunc(kollektivToDisplayForInfo), STATUS_TEXT: `${percentStr} (${testedNum}/${totalNumProg})` });
                if (data?.currentBestResult && data.currentBestResult.criteria && isFinite(data.currentBestResult.metricValue)) {
                     const metricToUseProgress = data.metric || _mainAppInterface?.getStateSnapshot()?.currentBruteForceMetric || 'Metrik';
                    if (elements.metricLabel) updateElementText(elements.metricLabel.id, metricToUseProgress);
                    if (elements.bestMetric) updateElementText(elements.bestMetric.id, formatNumber(data.currentBestResult.metricValue, 4));
                    if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, `Beste: ${data.currentBestResult.logic?.toUpperCase()} - ${formatCriteriaFunc(data.currentBestResult.criteria, data.currentBestResult.logic)}`);
                } else {
                    if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                    if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, 'Beste Kriterien: --');
                }
                break;
            case 'completed':
                const best = data?.bestResult;
                const resultKollektivName = getKollektivNameFunc(data.kollektiv || 'N/A');
                if (best && best.criteria && isFinite(best.metricValue)) {
                    const metricName = data.metric || 'N/A';
                    const bestValueStr = formatNumber(best.metricValue, 4);
                    const logicStr = best.logic?.toUpperCase() || 'N/A';
                    const criteriaStr = formatCriteriaFunc(best.criteria, best.logic);
                    const durationStr = formatNumber((data.duration || 0) / 1000, 1);
                    const totalTestedStr = formatNumber(data.totalTested || 0, 0);
                    if (elements.resultMetric) updateElementText(elements.resultMetric.id, metricName);
                    if (elements.resultKollektiv) updateElementText(elements.resultKollektiv.id, resultKollektivName);
                    if (elements.resultValue) updateElementText(elements.resultValue.id, bestValueStr);
                    if (elements.resultLogic) updateElementText(elements.resultLogic.id, logicStr);
                    if (elements.resultCriteria) updateElementText(elements.resultCriteria.id, criteriaStr);
                    if (elements.resultDuration) updateElementText(elements.resultDuration.id, durationStr);
                    if (elements.resultTotalTested) updateElementText(elements.resultTotalTested.id, totalTestedStr);
                    if (elements.resultKollektivN) updateElementText(elements.resultKollektivN.id, formatNumber(data.nGesamt,0,'--'));
                    if (elements.resultKollektivNplus) updateElementText(elements.resultKollektivNplus.id, formatNumber(data.nPlus,0,'--'));
                    if (elements.resultKollektivNminus) updateElementText(elements.resultKollektivNminus.id, formatNumber(data.nMinus,0,'--'));
                    if (elements.statusText) updateElementText(elements.statusText.id, 'Fertig.');
                     if (bfInfoElement && TOOLTIP_CONTENT.bruteForceInfo) addOrUpdateTooltip(bfInfoElement, 'bruteForceInfo', { KOLLEKTIV_NAME: resultKollektivName, STATUS_TEXT: 'Fertig.'});
                     if (elements.resultContainer && TOOLTIP_CONTENT.bruteForceResult) addOrUpdateTooltip(elements.resultContainer, 'bruteForceResult', { N_GESAMT: formatNumber(data.nGesamt,0,'?'), N_PLUS: formatNumber(data.nPlus,0,'?'), N_MINUS: formatNumber(data.nMinus,0,'?') });
                } else {
                    if (elements.resultContainer) toggleElementClass(elements.resultContainer.id, 'd-none', true);
                    if (elements.statusText) updateElementText(elements.statusText.id, 'Fertig (kein valides Ergebnis).');
                     if (bfInfoElement && TOOLTIP_CONTENT.bruteForceInfo) addOrUpdateTooltip(bfInfoElement, 'bruteForceInfo', { KOLLEKTIV_NAME: resultKollektivName, STATUS_TEXT: 'Fertig (kein Ergebnis).'});
                }
                break;
        }
    }

    function populateBruteForceModal(resultsData, currentKollektiv) {
        const modalBody = document.getElementById('brute-force-modal-body');
        const modalTitle = document.getElementById('bruteForceModalLabel');
        if (!modalBody || !modalTitle) return;

        if (!resultsData || resultsData.status === 'nodata' || !resultsData.results || resultsData.results.length === 0) {
            modalTitle.textContent = `Brute-Force Optimierungsergebnisse (${getKollektivDisplayName(currentKollektiv)})`;
            modalBody.innerHTML = `<p class="text-muted p-3">${escapeHTML(String(resultsData.message || 'Keine detaillierten Ergebnisse für diese Optimierung verfügbar.'))}</p>`;
            return;
        }
        
        const metricForTitle = resultsData.metric || resultsData.bestResult?.metric || 'Ausgewählte Metrik';
        modalTitle.textContent = `Top Brute-Force Ergebnisse für ${escapeHTML(String(metricForTitle))} (${getKollektivDisplayName(resultsData.kollektiv || currentKollektiv)})`;
        
        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createBruteForceModalContent === 'function') {
            modalBody.innerHTML = uiComponents.createBruteForceModalContent(resultsData);
            initializeTooltips(modalBody);
        } else {
            modalBody.innerHTML = `<p class="text-danger">Fehler: UI Komponente für Brute-Force Modal Inhalt nicht geladen.</p>`;
        }
    }

    function updateExportButtonStates(activeTabId, hasBruteForceResults, canExportDataDependent) {
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
        trySetDisabled('export-publication-gesamt-md', dataDisabled);

        trySetDisabled('export-charts-png', dataDisabled);
        trySetDisabled('export-charts-svg', dataDisabled);

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
            'dl-praes-as-pur-csv', 'dl-praes-as-pur-md',
            'download-performance-as-vs-t2-csv',
            'download-comp-table-as-vs-t2-md',
            'download-tests-as-vs-t2-md'
        ];
        praesButtons.forEach(id => {
            trySetDisabled(id, !isPresentationTabActive || dataDisabled);
        });

        document.querySelectorAll('.chart-download-btn, .table-download-png-btn').forEach(btn => {
            if (btn.closest('#statistik-tab-pane')) btn.disabled = activeTabId !== 'statistik-tab' || dataDisabled;
            else if (btn.closest('#auswertung-dashboard-container')) btn.disabled = activeTabId !== 'auswertung-tab' || dataDisabled;
            else if (btn.closest('#praesentation-tab-pane')) btn.disabled = activeTabId !== 'praesentation-tab' || dataDisabled;
            else if (btn.closest('#publikation-tab-pane')) btn.disabled = activeTabId !== 'publikation-tab' || dataDisabled;
        });
         const modalExportButton = document.getElementById('export-bruteforce-modal-txt');
         if(modalExportButton) {
            trySetDisabled('export-bruteforce-modal-txt', bfDisabled);
         }
    }

    function updatePublikationUI(currentLang, currentSection, currentBfMetric) {
        if (typeof UI_TEXTS === 'undefined') return;
        const langSwitch = document.getElementById('publikation-sprache-switch');
        const langLabel = document.getElementById('publikation-sprache-label');
        if (langSwitch && langLabel) {
            langSwitch.checked = currentLang === 'en';
            langLabel.textContent = UI_TEXTS?.publikationTab?.spracheSwitchLabel?.[currentLang] || (currentLang === 'en' ? 'English' : 'Deutsch');
        }

        document.querySelectorAll('#publikation-sidebar-nav-container .nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.sectionId === currentSection);
        });

        const bfMetricSelect = document.getElementById('publikation-bf-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.value = currentBfMetric;
        }
    }

    function getMetricDescriptionHTML(key, methode = '') {
       if (typeof TOOLTIP_CONTENT === 'undefined') return escapeHTML(String(key));
       const desc = TOOLTIP_CONTENT?.statMetrics?.[key]?.description || escapeHTML(String(key));
       return desc.replace(/\[METHODE\]/g, `<strong>${escapeHTML(String(methode))}</strong>`);
    }

    function getMetricInterpretationHTML(key, metricData, methode = '', kollektivName = '', lang = null) {
        if (typeof TOOLTIP_CONTENT === 'undefined' || typeof APP_CONFIG === 'undefined') return 'Keine Interpretation verfügbar.';
        const interpretationTemplate = TOOLTIP_CONTENT?.statMetrics?.[key]?.interpretation || 'Keine Interpretation verfügbar.';
        const data = (typeof metricData === 'object' && metricData !== null) ? metricData : { value: metricData, ci: null, method: null, n_trials: null, matrix_components: null };
        const na = '--';
        const pValuePrecision = APP_CONFIG?.STATISTICAL_CONSTANTS?.P_VALUE_PRECISION_TEXT || 3;
        const digits = (key === 'f1' || key === 'auc' || key === 'balAcc') ? pValuePrecision : 1;
        const isPercent = !(key === 'f1' || key === 'auc' || key === 'balAcc');
        const valueStr = formatNumber(data?.value, digits, na, true);
        const lowerStr = formatNumber(data?.ci?.lower, digits, na, true);
        const upperStr = formatNumber(data?.ci?.upper, digits, na, true);
        const ciMethodStr = data?.method || 'N/A';
        const bewertungStr = (key === 'auc') ? getAUCBewertung(data?.value) : ((key === 'phi') ? getPhiBewertung(data?.value) : '');
        const kollektivNameToUse = getKollektivDisplayName(kollektivName) || kollektivName || 'Unbekannt';

        let ciWarning = '';
        const ciWarningThreshold = APP_CONFIG?.STATISTICAL_CONSTANTS?.CI_WARNING_SAMPLE_SIZE_THRESHOLD || 10;
        if (data?.n_trials !== undefined && data?.n_trials !== null && data.n_trials < ciWarningThreshold && (key === 'sens' || key === 'spez' || key === 'ppv' || key === 'npv' || key === 'acc')) {
            ciWarning = `<hr class='my-1'><small class='text-muted'><i>Hinweis: Konfidenzintervall ggf. unsicher aufgrund kleiner Fallzahl im Nenner (N=${data.n_trials}).</i></small>`;
        } else if (data?.matrix && (key === 'balAcc' || key === 'f1' || key === 'auc')) {
            const mc = data.matrix;
            if (mc && (mc.tp + mc.fp + mc.fn + mc.tn < ciWarningThreshold * 2 || (mc.tp + mc.fn < ciWarningThreshold && key !== 'f1') || (mc.fp + mc.tn < ciWarningThreshold && key !== 'f1'))) {
                 ciWarning = `<hr class='my-1'><small class='text-muted'><i>Hinweis: Konfidenzintervall ggf. unsicher aufgrund kleiner Fallzahlen in der Konfusionsmatrix.</i></small>`;
            }
        }

        let interpretation = interpretationTemplate
            .replace(/\[METHODE\]/g, `<strong>${escapeHTML(String(methode))}</strong>`)
            .replace(/\[WERT\]/g, `<strong>${isPercent ? formatPercent(data?.value, digits, na) : valueStr}</strong>`)
            .replace(/\[LOWER\]/g, `<strong>${isPercent ? formatPercent(data?.ci?.lower, digits, na) : lowerStr}</strong>`)
            .replace(/\[UPPER\]/g, `<strong>${isPercent ? formatPercent(data?.ci?.upper, digits, na) : upperStr}</strong>`)
            .replace(/\[METHOD_CI\]/g, `<em>${escapeHTML(String(ciMethodStr))}</em>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${escapeHTML(String(kollektivNameToUse))}</strong>`)
            .replace(/\[BEWERTUNG\]/g, `<strong>${escapeHTML(String(bewertungStr))}</strong>`);

        if (lowerStr === na || upperStr === na || ciMethodStr === na || !data?.ci) {
             interpretation = interpretation.replace(/\(95%-KI nach .*?: .*? – .*?\)/g, '(Keine CI-Daten verfügbar)');
             interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
        }
        interpretation = interpretation.replace(/, p=\[P_WERT\], \[SIGNIFIKANZ\]/g,'');
        interpretation = interpretation.replace(/<hr.*?>.*$/, '');
        interpretation += ciWarning;
        return interpretation;
    }

    function getTestDescriptionHTML(key, t2ShortName = 'T2') {
        if (typeof TOOLTIP_CONTENT === 'undefined') return escapeHTML(String(key));
        const desc = TOOLTIP_CONTENT?.statMetrics?.[key]?.description || escapeHTML(String(key));
        return desc.replace(/\[T2_SHORT_NAME\]/g, `<strong>${escapeHTML(String(t2ShortName))}</strong>`);
    }

    function getTestInterpretationHTML(key, testData, kollektivName = '', t2ShortName = 'T2', methodeName = '', metricName = '', lang = null) {
        if (typeof TOOLTIP_CONTENT === 'undefined' || typeof APP_CONFIG === 'undefined') return 'Keine Interpretation verfügbar.';
        let interpretationTemplate = TOOLTIP_CONTENT?.statMetrics?.[key]?.interpretation || 'Keine Interpretation verfügbar.';
        if (key === 'cohortComparison') {
            interpretationTemplate = `Der Unterschied in der Metrik '[METRIC_NAME]' für die Methode '[METHODE_NAME]' zwischen den Kohorten [KOLLEKTIV1] ([VAL1]) und [KOLLEKTIV2] ([VAL2]) ist <strong>[SIGNIFIKANZ_TEXT]</strong> (p=[P_WERT] [SIGNIFIKANZ]).`;
        }

        if (!testData) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        const pValue = testData?.pValue;
        const effectiveLang = lang || APP_CONFIG?.DEFAULT_SETTINGS?.DEFAULT_PUBLIKATION_LANG || 'de';
        const pStr = getPValueText(pValue, effectiveLang);
        const sigSymbol = getStatisticalSignificanceSymbol(pValue);
        const sigText = getStatisticalSignificanceText(pValue);
        const kollektivNameToUse = getKollektivDisplayName(kollektivName) || kollektivName || 'Unbekannt';
        const alphaLevelText = formatNumber(APP_CONFIG?.STATISTICAL_CONSTANTS?.SIGNIFICANCE_LEVEL || 0.05, 2).replace('.', ',');

        let interpretation = interpretationTemplate
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${escapeHTML(String(kollektivNameToUse))}</strong>`)
            .replace(/\[KOLLEKTIV1\]/g, `<strong>${escapeHTML(String(kollektivNameToUse))}</strong>`)
            .replace(/\[KOLLEKTIV2\]/g, `<strong>${escapeHTML(String(t2ShortName))}</strong>`)
            .replace(/\[T2_SHORT_NAME\]/g, `<strong>${escapeHTML(String(t2ShortName))}</strong>`)
            .replace(/\[ALPHA_LEVEL\]/g, alphaLevelText)
            .replace(/\[METHODE_NAME\]/g, `<strong>${escapeHTML(String(methodeName))}</strong>`)
            .replace(/\[METRIC_NAME\]/g, `<strong>${escapeHTML(String(metricName))}</strong>`);
        
        if (key === 'cohortComparison') {
             const pValuePrecision = APP_CONFIG?.STATISTICAL_CONSTANTS?.P_VALUE_PRECISION_TEXT || 3;
             const digits = (metricName.toLowerCase() === 'auc' || metricName.toLowerCase() === 'f1-score' || metricName.toLowerCase() === 'balanced accuracy') ? pValuePrecision : 1;
             const isPercent = !(metricName.toLowerCase() === 'auc' || metricName.toLowerCase() === 'f1-score' || metricName.toLowerCase() === 'balanced accuracy');
             const val1Str = formatCI(testData.val1, testData.ci1_lower, testData.ci1_upper, digits, isPercent, na);
             const val2Str = formatCI(testData.val2, testData.ci2_lower, testData.ci2_upper, digits, isPercent, na);
             interpretation = interpretation.replace(/\[VAL1\]/g, `<strong>${val1Str}</strong>`);
             interpretation = interpretation.replace(/\[VAL2\]/g, `<strong>${val2Str}</strong>`);
        }
        interpretation = interpretation.replace(/<hr.*?>.*$/, '');
        return interpretation;
    }

    function getAssociationInterpretationHTML(key, assocObj, merkmalName, kollektivName, lang = null) {
        if (typeof TOOLTIP_CONTENT === 'undefined' || typeof APP_CONFIG === 'undefined' || typeof UI_TEXTS === 'undefined') return 'Keine Interpretation verfügbar.';
        const interpretationTemplate = TOOLTIP_CONTENT?.statMetrics?.[key]?.interpretation || 'Keine Interpretation verfügbar.';
        if (!assocObj) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        let valueStr = na, lowerStr = na, upperStr = na, ciMethodStr = na, bewertungStr = '', pStr = na, sigSymbol = '', sigText = '', ciWarning = '';
        const assozPValue = assocObj?.fisherTest?.pValue ?? assocObj?.oddsRatio?.pValue ?? assocObj?.pValue;
        const kollektivNameToUse = getKollektivDisplayName(kollektivName) || kollektivName || 'Unbekannt';
        const ciWarningThreshold = APP_CONFIG?.STATISTICAL_CONSTANTS?.CI_WARNING_SAMPLE_SIZE_THRESHOLD || 10;
        const effectiveLang = lang || APP_CONFIG?.DEFAULT_SETTINGS?.DEFAULT_PUBLIKATION_LANG || 'de';

        if(assocObj.matrix && (key === 'or' || key === 'rd' || key === 'phi')) {
            const m = assocObj.matrix;
            const totalInMatrix = m.tp + m.fp + m.fn + m.tn;
             if (totalInMatrix < ciWarningThreshold * 2 || Math.min(m.tp, m.fp, m.fn, m.tn) < (APP_CONFIG?.STATISTICAL_CONSTANTS?.FISHER_EXACT_THRESHOLD || 5) ) {
                ciWarning = `<hr class='my-1'><small class='text-muted'><i>Hinweis: Konfidenzintervall oder Maß ggf. unsicher aufgrund kleiner Fallzahlen in der zugrundeliegenden 2x2 Tabelle (Gesamt=${totalInMatrix}).</i></small>`;
            }
        }

        if (key === 'or' || key === 'oddsRatio') {
            const orData = assocObj.oddsRatio || assocObj.or || {};
            valueStr = formatNumber(orData.value, 2, na, true);
            lowerStr = formatNumber(orData.ci?.lower, 2, na, true);
            upperStr = formatNumber(orData.ci?.upper, 2, na, true);
            ciMethodStr = orData.method || 'Woolf Logit (Haldane-Anscombe correction)';
            pStr = getPValueText(assozPValue, effectiveLang);
            sigSymbol = getStatisticalSignificanceSymbol(assozPValue);
        } else if (key === 'rd') {
            valueStr = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, true);
            lowerStr = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, true);
            upperStr = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, true);
            ciMethodStr = assocObj.rd?.method || 'Wald';
        } else if (key === 'phi') {
            valueStr = formatNumber(assocObj.phi?.value, 2, na, true);
            lowerStr = formatNumber(assocObj.phi?.ci?.lower, 2, na, true);
            upperStr = formatNumber(assocObj.phi?.ci?.upper, 2, na, true);
            ciMethodStr = assocObj.phi?.ci ? (APP_CONFIG?.STATISTICAL_CONSTANTS?.DEFAULT_CI_METHOD_EFFECTSIZE || 'Bootstrap') : 'N/A';
            bewertungStr = getPhiBewertung(assocObj.phi?.value);
        } else if (['fisher', 'mannwhitney', 'pvalue', 'size_mwu', 'defaultP'].includes(key)) {
             pStr = getPValueText(assozPValue, effectiveLang);
             sigSymbol = getStatisticalSignificanceSymbol(assozPValue);
             sigText = getStatisticalSignificanceText(assozPValue);
             const templateToUse = TOOLTIP_CONTENT?.statMetrics?.[key]?.interpretation || TOOLTIP_CONTENT?.statMetrics?.defaultP?.interpretation || "P-Wert: [P_WERT] ([SIGNIFIKANZ]). Ergebnis: [SIGNIFIKANZ_TEXT].";
             return templateToUse
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
                 .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[MERKMAL\]/g, `<strong>'${escapeHTML(String(merkmalName))}'</strong>`)
                 .replace(/\[VARIABLE\]/g, `<strong>'${escapeHTML(String(merkmalName))}'</strong>`)
                 .replace(/\[KOLLEKTIV\]/g, `<strong>${escapeHTML(String(kollektivNameToUse))}</strong>`)
                 .replace(/\[ALPHA_LEVEL_FORMATTED\]/g, formatNumber(APP_CONFIG?.STATISTICAL_CONSTANTS?.SIGNIFICANCE_LEVEL || 0.05, 2).replace('.',','))
                 .replace(/<hr.*?>.*$/, '');
        }

        let interpretation = interpretationTemplate
            .replace(/\[MERKMAL\]/g, `<strong>'${escapeHTML(String(merkmalName))}'</strong>`)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${key === 'rd' && valueStr !== na ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, `<strong>${lowerStr}${key === 'rd' && lowerStr !== na ? '%' : ''}</strong>`)
            .replace(/\[UPPER\]/g, `<strong>${upperStr}${key === 'rd' && upperStr !== na ? '%' : ''}</strong>`)
            .replace(/\[METHOD_CI\]/g, `<em>${escapeHTML(String(ciMethodStr))}</em>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${escapeHTML(String(kollektivNameToUse))}</strong>`)
            .replace(/\[FAKTOR_TEXT\]/g, UI_TEXTS?.statMetrics?.orFaktorTexte?.[(assocObj?.oddsRatio?.value || assocObj?.or?.value) > 1 ? 'ERHOEHT' : ((assocObj?.oddsRatio?.value || assocObj?.or?.value) < 1 && (assocObj?.oddsRatio?.value || assocObj?.or?.value) > 0 ? 'VERRINGERT' : 'UNVERAENDERT')] || '')
            .replace(/\[HOEHER_NIEDRIGER\]/g, UI_TEXTS?.statMetrics?.rdRichtungTexte?.[assocObj?.rd?.value > 0 ? 'HOEHER' : (assocObj?.rd?.value < 0 ? 'NIEDRIGER' : 'GLEICH')] || '')
            .replace(/\[BEWERTUNG\]/g, `<strong>${escapeHTML(String(bewertungStr))}</strong>`)
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/<hr.*?>.*$/, '');

         if (key === 'oddsRatio' || key === 'or' || key === 'rd' || (key === 'phi' && assocObj.phi?.ci)) {
            if (lowerStr === na || upperStr === na || ciMethodStr === na || (key === 'oddsRatio' && !assocObj?.or?.ci) || (key === 'or' && !assocObj?.or?.ci) || (key === 'rd' && !assocObj.rd?.ci) ) {
                interpretation = interpretation.replace(/\(95%-KI nach .*?: .*? – .*?\)/g, '(Keine CI-Daten verfügbar)');
                interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
            }
         }
         if ((key === 'oddsRatio' || key === 'or') && pStr === na) {
             interpretation = interpretation.replace(/, p=.*?, \[SIGNIFIKANZ\]/g, '');
         }
        interpretation += ciWarning;
        return interpretation;
    }

    function showKurzanleitung() {
        const modalElement = document.getElementById('kurzanleitung-modal');
        if (!modalElement || typeof UI_TEXTS === 'undefined' || typeof APP_CONFIG === 'undefined') {
            console.error("Kurzanleitung Modal Element, UI_TEXTS oder APP_CONFIG nicht gefunden.");
            return;
        }
        
        const kurzanleitungContent = (UI_TEXTS?.kurzanleitung?.content || "")
            .replace(/\$\{APP_CONFIG\.APP_VERSION\}/g, APP_CONFIG?.APP_VERSION || 'N/A')
            .replace(/\$\{APP_CONFIG\.STATISTICAL_CONSTANTS\.SIGNIFICANCE_LEVEL\}/g, formatNumber(APP_CONFIG?.STATISTICAL_CONSTANTS?.SIGNIFICANCE_LEVEL || 0.05, 2).replace('.',','));

        const modalTitleEl = modalElement.querySelector('.modal-title');
        const modalBodyEl = modalElement.querySelector('.modal-body');

        if(modalTitleEl && UI_TEXTS?.kurzanleitung?.title) modalTitleEl.innerHTML = escapeHTML(UI_TEXTS.kurzanleitung.title);
        if(modalBodyEl) modalBodyEl.innerHTML = kurzanleitungContent; // HTML content is allowed here

        if (!kurzanleitungModalInstance) {
             if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                kurzanleitungModalInstance = new bootstrap.Modal(modalElement);
             } else {
                console.error("Bootstrap Modal nicht verfügbar für Kurzanleitung.");
                return;
             }
        }

        if (kurzanleitungModalInstance && modalElement && !modalElement.classList.contains('show')) {
            kurzanleitungModalInstance.show();
        }
    }

    return Object.freeze({
        escapeHTML,
        showToast,
        initializeTooltips,
        updateElementText,
        updateElementHTML,
        toggleElementClass,
        setElementDisabled,
        highlightElement,
        updateHeaderStatsUI,
        updateKollektivButtonsUI,
        updateSortIcons,
        updateSortIconsForTab,
        updateTabSpecificControls,
        updateKollektivSelectorsForTab,
        toggleAllDetails,
        attachRowCollapseListeners,
        handleCollapseEvent,
        getT2IconSVG,
        updateT2CriteriaControlsUI,
        markCriteriaSavedIndicator,
        updateStatistikSelectorsUI,
        updatePresentationViewSelectorUI,
        updateBruteForceUI,
        populateBruteForceModal,
        updateExportButtonStates,
        updatePublikationUI,
        getMetricDescriptionHTML,
        getMetricInterpretationHTML,
        getTestDescriptionHTML,
        getTestInterpretationHTML,
        getAssociationInterpretationHTML,
        showKurzanleitung
    });

})();
