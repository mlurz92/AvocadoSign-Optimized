const ui_helpers = (() => {

    let collapseEventListenersAttached = new Set();
    let kurzanleitungModalInstance = null;
    let confirmModalInstance = null;
    let initialTabRenderFixed = false;

    function escapeMarkdown(text) {
        if (typeof text !== 'string' || text === null) return text === null ? '' : String(text);
        const map = { '\\': '\\\\', '`': '\\`', '*': '\\*', '_': '\\_', '{': '\\{', '}': '\\}', '[': '\\[', ']': '\\[', '(': '\\(', ')': '\\)', '#': '\\#', '+': '\\+', '-': '\\-', '.': '\\.', '!': '\\!', '|': '\\|' };
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
          toastElement.setAttribute('role', 'alert'); toastElement.setAttribute('aria-live', 'assertive'); toastElement.setAttribute('aria-atomic', 'true');
          toastElement.setAttribute('data-bs-delay', String(duration));
          toastElement.setAttribute('data-bs-autohide', 'true');

          toastElement.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fas ${iconClass} fa-fw me-2"></i> ${escapeMarkdown(message)}</div><button type="button" class="btn-close me-2 m-auto ${textClass === 'text-white' ? 'btn-close-white' : ''}" data-bs-dismiss="toast" aria-label="Schließen"></button></div>`;
          toastContainer.appendChild(toastElement);

          try {
              const toastInstance = new bootstrap.Toast(toastElement, { delay: duration, autohide: true });
              toastElement.addEventListener('hidden.bs.toast', () => { if(toastContainer.contains(toastElement)) { toastElement.remove(); } }, { once: true });
              toastInstance.show();
          } catch (e) { console.error("Fehler beim Erstellen/Anzeigen des Toasts:", e); if(toastContainer.contains(toastElement)) { toastElement.remove(); } }
    }

    function initializeTooltips(scope = document.body) {
        if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) {
            console.warn("Bootstrap Tooltip ist nicht verfügbar. Tooltips werden nicht initialisiert.");
            return;
        }

        let tooltipTriggerElements = [];
        if (scope && typeof scope.querySelectorAll === 'function') {
            tooltipTriggerElements = Array.from(scope.querySelectorAll('[data-bs-toggle="tooltip"]'));
            if (scope.matches && scope.matches('[data-bs-toggle="tooltip"]')) {
                if (!tooltipTriggerElements.includes(scope)) {
                    tooltipTriggerElements.push(scope);
                }
            }
        } else if (scope && scope.hasAttribute && scope.hasAttribute('data-bs-toggle') && scope.getAttribute('data-bs-toggle') === 'tooltip') {
            tooltipTriggerElements.push(scope);
        }


        tooltipTriggerElements.forEach(tooltipTriggerEl => {
            if (!document.body.contains(tooltipTriggerEl)) return;

            const existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (existingTooltip) {
                existingTooltip.dispose();
            }

            const title = tooltipTriggerEl.getAttribute('data-bs-title') || tooltipTriggerEl.getAttribute('title') || '';
            if (String(title).trim() === '') {
                return;
            }

            const delayConfig = APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY;
            let bsDelay = { show: 200, hide: 100 };
            if (Array.isArray(delayConfig) && delayConfig.length === 2) {
                bsDelay = { show: delayConfig[0], hide: delayConfig[1] };
            } else if (typeof delayConfig === 'number') {
                bsDelay = { show: delayConfig, hide: delayConfig };
            }


            try {
                new bootstrap.Tooltip(tooltipTriggerEl, {
                    html: tooltipTriggerEl.getAttribute('data-bs-html') === 'true',
                    placement: tooltipTriggerEl.getAttribute('data-bs-placement') || 'top',
                    fallbackPlacements: ['bottom', 'left', 'right'],
                    boundary: document.body,
                    trigger: 'hover focus',
                    delay: bsDelay,
                    customClass: tooltipTriggerEl.getAttribute('data-bs-custom-class') || '',
                    container: 'body'
                });
            } catch (error) {
                console.error("Fehler bei der Bootstrap Tooltip Initialisierung für Element:", error, tooltipTriggerEl);
            }
        });
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
        if (element) { element.classList.toggle(className, add); }
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
            const subSpans = th.querySelectorAll('.sortable-sub-header'); let isSubKeySortActive = false;

            if (subSpans.length > 0) {
                subSpans.forEach(span => {
                    const subKey = span.dataset.subKey;
                    const isActiveSort = (key === sortState.key && subKey === sortState.subKey);
                    span.style.fontWeight = isActiveSort ? 'bold' : 'normal';
                    span.style.textDecoration = isActiveSort ? 'underline' : 'none';
                    span.style.color = isActiveSort ? 'var(--primary-color)' : 'inherit';
                    const thLabel = th.getAttribute('data-bs-title')?.split('.')[0] || th.textContent.split('(')[0].trim() || key;
                    const spanLabel = span.textContent.trim();
                    span.setAttribute('data-bs-title', `Sortieren nach: ${thLabel} -> ${spanLabel}`);
                    if (isActiveSort) {
                        icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1`;
                        isSubKeySortActive = true;
                    }
                });
                if (!isSubKeySortActive && key === sortState.key && (sortState.subKey === null || sortState.subKey === undefined)) {
                     th.style.color = 'var(--primary-color)';
                     icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1`;
                } else if (!isSubKeySortActive && (!sortState.key || key !== sortState.key)) {
                    const thIcon = th.querySelector('i.fas');
                    if (thIcon) thIcon.className = 'fas fa-sort text-muted opacity-50 ms-1';
                }
            } else {
                if (key === sortState.key && (sortState.subKey === null || sortState.subKey === undefined)) {
                    icon.className = `fas ${sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} text-primary ms-1`;
                    th.style.color = 'var(--primary-color)';
                }
            }
        });
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip && tableHeader.querySelectorAll('[data-bs-toggle="tooltip"]').length > 0) {
            initializeTooltips(tableHeader);
        }
    }

    function toggleAllDetails(tableBodyId, buttonId) {
        const button = document.getElementById(buttonId);
        const tableBody = document.getElementById(tableBodyId);
        if (!button || !tableBody) return;

        const action = button.dataset.action || 'expand';
        const expand = action === 'expand';
        const collapseElements = tableBody.querySelectorAll('.collapse');

        if (typeof bootstrap === 'undefined' || !bootstrap.Collapse) {
            console.error("Bootstrap Collapse nicht verfügbar.");
            return;
        }

        collapseElements.forEach(el => {
            const instance = bootstrap.Collapse.getOrCreateInstance(el);
            if (instance) {
                if (expand && !el.classList.contains('show')) { instance.show(); }
                else if (!expand && el.classList.contains('show')) { instance.hide(); }
            }
        });

        const newAction = expand ? 'collapse' : 'expand';
        button.dataset.action = newAction;
        const iconClass = expand ? 'fa-chevron-up' : 'fa-chevron-down';
        const currentLang = typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function' ? stateManager.getCurrentPublikationLang() : 'de';
        const buttonText = expand ? (UI_TEXTS.datenTab.toggleDetailsButton?.collapse || (currentLang === 'de' ? 'Alle Details Ausblenden' : 'Collapse All Details'))
                                  : (UI_TEXTS.datenTab.toggleDetailsButton?.expand || (currentLang === 'de' ? 'Alle Details Anzeigen' : 'Expand All Details'));

        let tooltipKeyBase = '';
        if (buttonId === 'daten-toggle-details') tooltipKeyBase = 'datenTable';
        else if (buttonId === 'auswertung-toggle-details') tooltipKeyBase = 'auswertungTable';

        const tooltipContentBase = (TOOLTIP_CONTENT[tooltipKeyBase]?.expandAll || (currentLang === 'de' ? 'Alle Details ein-/ausblenden' : 'Expand/collapse all details'));
        const currentTooltipText = expand ? tooltipContentBase.replace(currentLang === 'de' ? 'ein-' : 'Expand', currentLang === 'de' ? 'aus-' : 'Collapse').replace(currentLang === 'de' ? 'anzeigen' : 'Expand', currentLang === 'de' ? 'ausblenden' : 'Collapse')
                                      : tooltipContentBase.replace(currentLang === 'de' ? 'aus-' : 'Collapse', currentLang === 'de' ? 'ein-' : 'Expand').replace(currentLang === 'de' ? 'ausblenden' : 'Collapse', currentLang === 'de' ? 'anzeigen' : 'Expand');

        updateElementHTML(buttonId, `${buttonText} <i class="fas ${iconClass} ms-1"></i>`);
        button.setAttribute('data-bs-title', currentTooltipText);
        const existingTooltip = bootstrap.Tooltip.getInstance(button);
        if (existingTooltip) {
            existingTooltip.setContent({ '.tooltip-inner': currentTooltipText });
        } else {
            initializeTooltips(button.parentElement || button);
        }
    }

    function handleCollapseEvent(event) {
        const collapseElement = event.target;
        if (!collapseElement || !collapseElement.matches('.collapse')) return;

        const triggerRow = collapseElement.closest('tr.sub-row')?.previousElementSibling;
        if (!triggerRow || !triggerRow.matches('tr[data-bs-target]')) return;

        const icon = triggerRow.querySelector('.row-toggle-icon');
        const isShowing = event.type === 'show.bs.collapse' || event.type === 'shown.bs.collapse';

        if (icon) {
            icon.classList.toggle('fa-chevron-up', isShowing);
            icon.classList.toggle('fa-chevron-down', !isShowing);
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
        const s = APP_CONFIG.UI_SETTINGS.ICON_SIZE || 18;
        const sw = APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH || 1.25;
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
                else if (value === 'irregulär') svgContent = `<path d="M ${c + kr} ${c} A ${kr} ${kr} 0 0 1 ${c} ${c + kr} A ${kr*0.8} ${kr*1.2} 0 0 1 ${c-kr*0.9} ${c-kr*0.3} A ${kr*1.1} ${kr*0.7} 0 0 1 ${c+kr} ${c} Z" fill="none" stroke="${strokeColor}" stroke-width="${ksw}"/>`;
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
                else { svgContent = unknownIconSVG; return `<svg class="icon-t2 icon-${type} icon-value-unknown ${extraClass}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: unbekannt">${svgContent}</svg>`; }
                strokeColor = (value === 'signalreich') ? '#333333' : 'rgba(0,0,0,0.1)';
                svgContent = `<circle cx="${c}" cy="${c}" r="${r}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${sw * 0.75}"/>`;
                if (value === 'signalreich') svgContent += `<circle cx="${c}" cy="${c}" r="${r * 0.3}" fill="${strokeColor}" stroke="none"/>`;
                else if (value === 'intermediär') svgContent += `<line x1="${c-r*0.5}" y1="${c}" x2="${c+r*0.5}" y2="${c}" stroke="${iconColor}" stroke-width="${sw/1.5}" stroke-linecap="round"/>`;
                break;
            case 'ruler-horizontal':
                svgContent = `<path d="M${sw/2} ${c} H${s-sw/2} M${c} ${sw/2} V${s-sw/2} M${s*0.2} ${c-s*0.15} L${s*0.2} ${c+s*0.15} M${s*0.4} ${c-s*0.1} L${s*0.4} ${c+s*0.1} M${s*0.6} ${c-s*0.1} L${s*0.6} ${c+s*0.1} M${s*0.8} ${c-s*0.15} L${s*0.8} ${c+s*0.15}" stroke="${iconColor}" stroke-width="${sw/2}" stroke-linecap="round"/>`;
                type = 'size';
                break;
            default:
                svgContent = unknownIconSVG;
        }
        const valueClass = (value !== null && typeof value === 'string') ? `icon-value-${value.replace(/\s+/g, '-').toLowerCase()}` : 'icon-value-unknown';
        return `<svg class="icon-t2 icon-${type} ${valueClass} ${extraClass}" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}: ${value || 'unbekannt'}">${svgContent}</svg>`;
    }

    function updateT2CriteriaControlsUI(currentCriteria, currentLogic) {
        const logicSwitch = document.getElementById('t2-logic-switch');
        const logicLabel = document.getElementById('t2-logic-label');
        if (logicSwitch && logicLabel) {
            logicSwitch.checked = currentLogic === 'ODER';
            logicLabel.textContent = UI_TEXTS.t2LogicDisplayNames[currentLogic] || currentLogic;
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
                        if (el.matches('.t2-criteria-button')) {
                            el.classList.toggle('inactive-option', !criterion.active);
                             const buttonCriterionKey = el.dataset.criterion;
                             const buttonValue = el.dataset.value;
                             if (criterion.active && currentCriteria[buttonCriterionKey]?.value === buttonValue) {
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
                    const thresholdValue = criterion.threshold ?? getDefaultT2Criteria().size.threshold;
                    if (range) range.value = formatNumber(thresholdValue, 1, '', 'en');
                    if (input) input.value = formatNumber(thresholdValue, 1, '', 'en');
                    if (valueDisplay) valueDisplay.textContent = formatNumber(thresholdValue, 1);
                }
            }
        });
    }

    function markCriteriaSavedIndicator(isUnsaved) {
        const card = document.getElementById('t2-criteria-card');
        if (!card) return;
        const shouldShowIndicator = !!isUnsaved;
        card.classList.toggle('criteria-unsaved-indicator', shouldShowIndicator);

        const tooltipInstance = bootstrap.Tooltip.getInstance(card);
        const tooltipContent = TOOLTIP_CONTENT?.t2CriteriaCard?.unsavedIndicator || "Ungespeicherte Änderungen vorhanden.";

        if (shouldShowIndicator) {
            card.setAttribute('data-bs-title', tooltipContent);
            card.setAttribute('data-bs-custom-class', 'tooltip-warning');
            if (tooltipInstance) {
                tooltipInstance.setContent({ '.tooltip-inner': tooltipContent });
                tooltipInstance.enable();
            } else {
                 if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                    new bootstrap.Tooltip(card);
                 }
            }
        } else {
            const originalTooltip = card.dataset.originalTitle || TOOLTIP_CONTENT?.t2CriteriaCard?.description || "T2 Malignitäts-Kriterien definieren";
            card.setAttribute('data-bs-title', originalTooltip);
            card.removeAttribute('data-bs-custom-class');
            if (tooltipInstance) {
                tooltipInstance.setContent({ '.tooltip-inner': originalTooltip });
            }
        }
        if (tooltipInstance) {
            tooltipInstance.update();
        }
    }

    function updateStatistikSelectorsUI(layout, kollektiv1, kollektiv2) {
        const toggleBtn = document.getElementById('statistik-toggle-vergleich');
        const container1 = document.getElementById('statistik-kollektiv-select-1-container');
        const container2 = document.getElementById('statistik-kollektiv-select-2-container');
        const select1 = document.getElementById('statistik-kollektiv-select-1');
        const select2 = document.getElementById('statistik-kollektiv-select-2');
        const isVergleich = layout === 'vergleich';
        const currentLang = stateManager.getCurrentPublikationLang();


        if (toggleBtn) {
            toggleBtn.classList.toggle('active', isVergleich);
            toggleBtn.classList.toggle('btn-primary', isVergleich);
            toggleBtn.classList.toggle('btn-outline-primary', !isVergleich);
            toggleBtn.setAttribute('aria-pressed', String(isVergleich));
            const buttonText = isVergleich ? (UI_TEXTS.statistikTab.layoutSwitchLabel.vergleich || '<i class="fas fa-users-cog me-1"></i> Vergleich Aktiv')
                                          : (UI_TEXTS.statistikTab.layoutSwitchLabel.einzel || '<i class="fas fa-user-cog me-1"></i> Einzelansicht Aktiv');
            updateElementHTML(toggleBtn.id, buttonText);

            const tooltipTextKey = isVergleich ? 'vergleich' : 'einzel';
            const tooltipText = (TOOLTIP_CONTENT.statistikLayoutSwitch?.[tooltipTextKey] || (currentLang === 'de' ? 'Layout umschalten.' : 'Toggle layout.'));
            toggleBtn.setAttribute('data-bs-title', tooltipText);
            const existingTooltip = bootstrap.Tooltip.getInstance(toggleBtn);
            if(existingTooltip) existingTooltip.setContent({ '.tooltip-inner': tooltipText });
        }
        if (container1) container1.classList.toggle('d-none', !isVergleich);
        if (container2) container2.classList.toggle('d-none', !isVergleich);

        const einzelSelectContainer = document.getElementById('statistik-kollektiv-select-einzel-container');
        if (einzelSelectContainer) einzelSelectContainer.classList.toggle('d-none', isVergleich);

        const einzelSelect = document.getElementById('statistik-kollektiv-select-einzel');
        if(einzelSelect) einzelSelect.value = stateManager.getCurrentKollektiv();

        if (select1) select1.value = kollektiv1;
        if (select2) select2.value = kollektiv2;
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

    function updateBruteForceUI(status, data = {}, workerAvailable = true, currentKollektiv = null) {
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

        const formatCriteriaFunc = typeof studyT2CriteriaManager !== 'undefined' ? studyT2CriteriaManager.formatCriteriaForDisplay : (c, l) => 'Formatierungsfehler';
        const getKollektivNameFunc = typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName : (k) => k;
        const isRunning = status === 'start' || status === 'started' || status === 'progress';
        const hasResults = status === 'result' && data.results && data.results.length > 0 && data.bestResult && data.bestResult.criteria;

        if (elements.progressContainer) toggleElementClass(elements.progressContainer.id, 'd-none', !isRunning);
        if (elements.resultContainer) toggleElementClass(elements.resultContainer.id, 'd-none', status !== 'result' || !hasResults);
        if (elements.cancelBtn) toggleElementClass(elements.cancelBtn.id, 'd-none', !isRunning);
        if (elements.startBtn) setElementDisabled(elements.startBtn.id, !workerAvailable || isRunning);
        if (elements.modalExportBtn) setElementDisabled(elements.modalExportBtn.id, !hasResults);
        if (elements.applyBestBtn) setElementDisabled(elements.applyBestBtn.id, !hasResults);

        const startButtonText = isRunning ? '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Läuft...' : `<i class="fas fa-cogs me-1"></i> ${workerAvailable ? 'Optimierung starten' : 'Starten (Worker fehlt)'}`;
        if (elements.startBtn) updateElementHTML(elements.startBtn.id, startButtonText);

        const kollektivToDisplayForInfo = data?.kollektiv || currentKollektiv || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        if (elements.bfInfoKollektiv) {
            updateElementText(elements.bfInfoKollektiv.id, getKollektivNameFunc(kollektivToDisplayForInfo));
        }

        const addOrUpdateBsTooltip = (el, content) => {
            if (el && typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                const existingTooltip = bootstrap.Tooltip.getInstance(el);
                if (content) {
                    el.setAttribute('data-bs-title', content);
                    if (existingTooltip) {
                        existingTooltip.setContent({ '.tooltip-inner': content });
                    } else {
                         if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                            new bootstrap.Tooltip(el);
                         }
                    }
                } else if (existingTooltip) {
                    existingTooltip.dispose();
                    el.removeAttribute('data-bs-title');
                }
            }
        };

        const bfInfoElement = elements.bfInfoKollektiv?.closest('#brute-force-info');

        switch (status) {
            case 'idle': case 'cancelled': case 'error':
                if (elements.progressBar) { elements.progressBar.style.width = '0%'; elements.progressBar.setAttribute('aria-valuenow', '0'); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, '0%');
                if (elements.testedCount) updateElementText(elements.testedCount.id, '0');
                if (elements.totalCount) updateElementText(elements.totalCount.id, '0');
                if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, 'Beste Kriterien: --');
                let statusMsg = '';
                if (status === 'idle') statusMsg = workerAvailable ? 'Bereit.' : 'Worker nicht verfügbar.';
                else if (status === 'cancelled') statusMsg = 'Abgebrochen.';
                else if (status === 'error') statusMsg = `Fehler: ${data?.message || 'Unbekannt.'}`;
                if (elements.statusText) updateElementText(elements.statusText.id, statusMsg);
                if (bfInfoElement) addOrUpdateBsTooltip(bfInfoElement, (TOOLTIP_CONTENT.bruteForceInfo.description || '').replace('[KOLLEKTIV_NAME]', `<strong>${getKollektivNameFunc(kollektivToDisplayForInfo)}</strong>`) + ` Aktueller Status: ${statusMsg}`);
                break;
            case 'start':
                if (elements.progressBar) { elements.progressBar.style.width = '0%'; elements.progressBar.setAttribute('aria-valuenow', '0'); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, '0%');
                if (elements.testedCount) updateElementText(elements.testedCount.id, '0');
                if (elements.totalCount) updateElementText(elements.totalCount.id, 'berechne...');
                if (elements.metricLabel) updateElementText(elements.metricLabel.id, data?.metric || 'Metrik');
                if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, 'Beste Kriterien: --');
                if (elements.statusText) updateElementText(elements.statusText.id, 'Initialisiere...');
                if (bfInfoElement) addOrUpdateBsTooltip(bfInfoElement, (TOOLTIP_CONTENT.bruteForceInfo.description || '').replace('[KOLLEKTIV_NAME]', `<strong>${getKollektivNameFunc(kollektivToDisplayForInfo)}</strong>`) + ` Status: Initialisiere...`);
                break;
            case 'started':
                const totalComb = formatNumber(data?.totalCombinations || 0, 0, 'N/A');
                if (elements.totalCount) updateElementText(elements.totalCount.id, totalComb);
                if (elements.statusText) updateElementText(elements.statusText.id, 'Teste...');
                if (bfInfoElement) addOrUpdateBsTooltip(bfInfoElement, (TOOLTIP_CONTENT.bruteForceInfo.description || '').replace('[KOLLEKTIV_NAME]', `<strong>${getKollektivNameFunc(kollektivToDisplayForInfo)}</strong>`) + ` Status: Teste ${totalComb} Kombinationen...`);
                if (elements.progressContainer) addOrUpdateBsTooltip(elements.progressContainer, (TOOLTIP_CONTENT.bruteForceProgress?.description || '').replace('[TOTAL]', totalComb));
                break;
            case 'progress':
                const percent = (data?.total && data.total > 0) ? Math.round((data.tested / data.total) * 100) : 0;
                const percentStr = `${percent}%`;
                if (elements.progressBar) { elements.progressBar.style.width = percentStr; elements.progressBar.setAttribute('aria-valuenow', String(percent)); }
                if (elements.progressPercent) updateElementText(elements.progressPercent.id, percentStr);
                const testedNum = formatNumber(data?.tested || 0, 0);
                const totalNumProg = formatNumber(data?.total || 0, 0);
                if (elements.testedCount) updateElementText(elements.testedCount.id, testedNum);
                if (elements.totalCount) updateElementText(elements.totalCount.id, totalNumProg);
                if (elements.statusText) updateElementText(elements.statusText.id, 'Läuft...');
                if (bfInfoElement) addOrUpdateBsTooltip(bfInfoElement, (TOOLTIP_CONTENT.bruteForceInfo.description || '').replace('[KOLLEKTIV_NAME]', `<strong>${getKollektivNameFunc(kollektivToDisplayForInfo)}</strong>`) + ` Status: ${percentStr} (${testedNum}/${totalNumProg})`);
                if (data?.currentBest && data.currentBest.criteria && isFinite(data.currentBest.metricValue)) {
                    const bestValStr = formatNumber(data.currentBest.metricValue, 4);
                    const bestCritStr = formatCriteriaFunc(data.currentBest.criteria, data.currentBest.logic, false);
                    if (elements.metricLabel) updateElementText(elements.metricLabel.id, data.metric || 'Metrik');
                    if (elements.bestMetric) updateElementText(elements.bestMetric.id, bestValStr);
                    if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, `Beste: ${data.currentBest.logic?.toUpperCase()} - ${bestCritStr}`);
                } else {
                    if (elements.bestMetric) updateElementText(elements.bestMetric.id, '--');
                    if (elements.bestCriteria) updateElementText(elements.bestCriteria.id, 'Beste Kriterien: --');
                }
                break;
            case 'result':
                const best = data?.bestResult;
                const resultKollektivName = getKollektivNameFunc(data.kollektiv || 'N/A');
                if (best && best.criteria && isFinite(best.metricValue)) {
                    const metricName = data.metric || 'N/A';
                    const bestValueStr = formatNumber(best.metricValue, 4);
                    const logicStr = best.logic?.toUpperCase() || 'N/A';
                    const criteriaStr = formatCriteriaFunc(best.criteria, best.logic, false);
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
                     if (bfInfoElement) addOrUpdateBsTooltip(bfInfoElement, (TOOLTIP_CONTENT.bruteForceInfo.description || '').replace('[KOLLEKTIV_NAME]', `<strong>${resultKollektivName}</strong>`) + ` Status: Fertig.`);
                     if (elements.resultContainer) {
                         const resultTooltip = (TOOLTIP_CONTENT.bruteForceResult.description || '')
                            .replace('[N_GESAMT]', formatNumber(data.nGesamt,0,'?'))
                            .replace('[N_PLUS]', formatNumber(data.nPlus,0,'?'))
                            .replace('[N_MINUS]', formatNumber(data.nMinus,0,'?'));
                         addOrUpdateBsTooltip(elements.resultContainer, resultTooltip);
                     }
                } else {
                    if (elements.resultContainer) toggleElementClass(elements.resultContainer.id, 'd-none', true);
                    if (elements.statusText) updateElementText(elements.statusText.id, 'Fertig (kein valides Ergebnis).');
                     if (bfInfoElement) addOrUpdateBsTooltip(bfInfoElement, (TOOLTIP_CONTENT.bruteForceInfo.description || '').replace('[KOLLEKTIV_NAME]', `<strong>${resultKollektivName}</strong>`) + ` Status: Fertig (kein Ergebnis).`);
                }
                break;
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
        trySetDisabled('export-charts-png', dataDisabled);
        trySetDisabled('export-charts-svg', dataDisabled);

        trySetDisabled('export-all-zip', dataDisabled && bfDisabled);
        trySetDisabled('export-csv-zip', dataDisabled);
        trySetDisabled('export-md-zip', dataDisabled);
        trySetDisabled('export-png-zip', dataDisabled);
        trySetDisabled('export-svg-zip', dataDisabled);

        const isPresentationTabActive = activeTabId === 'praesentation-tab-pane';
        const praesButtons = [
            'download-performance-as-pur-csv', 'download-performance-as-pur-md',
            'download-performance-as-vs-t2-csv',
            'download-comp-table-as-vs-t2-md',
            'download-tests-as-vs-t2-md'
        ];
        praesButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = !isPresentationTabActive || dataDisabled;
            }
        });

        document.querySelectorAll('.chart-download-btn, .table-download-png-btn').forEach(btn => {
            if (btn.closest('#statistik-tab-pane')) btn.disabled = activeTabId !== 'statistik-tab-pane' || dataDisabled;
            else if (btn.closest('#auswertung-tab-pane .dashboard-card-col')) btn.disabled = activeTabId !== 'auswertung-tab-pane' || dataDisabled;
            else if (btn.closest('#praesentation-tab-pane')) btn.disabled = activeTabId !== 'praesentation-tab-pane' || dataDisabled;
            else if (btn.closest('#publikation-tab-pane')) btn.disabled = activeTabId !== 'publikation-tab-pane' || dataDisabled;
        });
         if(document.getElementById('export-bruteforce-modal-txt')) {
            trySetDisabled('export-bruteforce-modal-txt', bfDisabled);
         }
    }

    function updatePublikationUI(currentLang, currentSection, currentBfMetric) {
        const langSwitch = document.getElementById('publikation-sprache-switch');
        const langLabel = document.getElementById('publikation-sprache-label');
        if (langSwitch && langLabel) {
            langSwitch.checked = currentLang === 'en';
            langLabel.textContent = UI_TEXTS?.publikationTab?.spracheSwitchLabel?.[currentLang] || (currentLang === 'en' ? 'English' : 'Deutsch');
        }

        document.querySelectorAll('#publikation-sections-nav .nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.sectionId === currentSection);
        });

        const bfMetricSelect = document.getElementById('publikation-bf-metric-select');
        if (bfMetricSelect) {
            bfMetricSelect.value = currentBfMetric;
        }
    }

    function getMetricDescriptionHTML(key, methode = '') {
       const desc = TOOLTIP_CONTENT.statMetrics[key]?.description || key;
       return desc.replace(/\[METHODE\]/g, `<strong>${methode}</strong>`);
    }

    function getMetricInterpretationHTML(key, metricData, methode = '', kollektivName = '') {
        const interpretationTemplate = TOOLTIP_CONTENT.statMetrics[key]?.interpretation || 'Keine Interpretation verfügbar.';
        const data = (typeof metricData === 'object' && metricData !== null) ? metricData : { value: metricData, ci: null, method: null, n_trials: null, matrix_components: null };
        const na = '--';
        const currentLang = stateManager.getCurrentPublikationLang();
        const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
        const isPercent = !(key === 'f1' || key === 'auc');
        const valueStr = formatNumber(data?.value, digits, na, currentLang === 'en');
        const lowerStr = formatNumber(data?.ci?.lower, digits, na, currentLang === 'en');
        const upperStr = formatNumber(data?.ci?.upper, digits, na, currentLang === 'en');
        const ciMethodStr = data?.method || 'N/A';
        const bewertungStr = (key === 'auc') ? getAUCBewertung(data?.value) : ((key === 'phi') ? getPhiBewertung(data?.value) : '');
        const kollektivNameToUse = getKollektivDisplayName(kollektivName) || kollektivName || 'Unbekannt';

        let ciWarning = '';
        const ciWarningThreshold = APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD || 10;
        const warningTextDe = `<hr class="my-1"><i>Hinweis: Konfidenzintervall ggf. unsicher aufgrund kleiner Fallzahlen.</i>`;
        const warningTextEn = `<hr class="my-1"><i>Note: Confidence interval may be unreliable due to small sample sizes.</i>`;
        const currentWarningText = currentLang === 'de' ? warningTextDe : warningTextEn;

        if (data?.n_trials !== undefined && data?.n_trials !== null && data.n_trials < ciWarningThreshold && (key === 'sens' || key === 'spez' || key === 'ppv' || key === 'npv' || key === 'acc')) {
            const nTrialsWarningDe = ` (Nenner=${data.n_trials}).`;
            const nTrialsWarningEn = ` (denominator=${data.n_trials}).`;
            ciWarning = currentWarningText.replace(currentLang === 'de' ? 'Fallzahlen.' : 'sample sizes.', (currentLang === 'de' ? 'Fallzahlen' : 'sample sizes') + (currentLang === 'de' ? nTrialsWarningDe : nTrialsWarningEn));
        } else if (data?.matrix_components && (key === 'balAcc' || key === 'f1' || key === 'auc')) {
            const mc = data.matrix_components;
            if (mc && (mc.total < ciWarningThreshold * 2 || (mc.rp ?? 0) < ciWarningThreshold/2 || (mc.fp ?? 0) < ciWarningThreshold/2 || (mc.fn ?? 0) < ciWarningThreshold/2 || (mc.rn ?? 0) < ciWarningThreshold/2 )) {
                 const matrixWarningDe = ` in der Konfusionsmatrix (Gesamt=${mc.total}).`;
                 const matrixWarningEn = ` in confusion matrix (Total=${mc.total}).`;
                 ciWarning = currentWarningText.replace(currentLang === 'de' ? 'Fallzahlen.' : 'sample sizes.', (currentLang === 'de' ? 'Fallzahlen' : 'sample sizes') + (currentLang === 'de' ? matrixWarningDe : matrixWarningEn));
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
             interpretation = interpretation.replace(/\(95%-KI nach .*?: .*? – .*?\)/g, currentLang === 'de' ? '(Keine CI-Daten verfügbar)' : '(No CI data available)');
             interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
        }
        interpretation = interpretation.replace(/, p=\[P_WERT\], \[SIGNIFIKANZ\]/g,'');
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
        const currentLang = stateManager.getCurrentPublikationLang();
        const pValue = testData?.pValue;
        const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? (currentLang === 'de' ? '&lt;0,001' : '&lt;0.001') : formatNumber(pValue, 3, na, currentLang === 'en')) : na;
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
        const currentLang = stateManager.getCurrentPublikationLang();
        let valueStr = na, lowerStr = na, upperStr = na, ciMethodStr = na, bewertungStr = '', pStr = na, sigSymbol = '', sigText = '', pVal = NaN, ciWarning = '';
        const assozPValue = assocObj?.pValue;
        const kollektivNameToUse = getKollektivDisplayName(kollektivName) || kollektivName || 'Unbekannt';
        const ciWarningThreshold = APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD || 10;
        const warningTextDe = `<hr class="my-1"><i>Hinweis: Konfidenzintervall oder Maß ggf. unsicher aufgrund kleiner Fallzahlen.</i>`;
        const warningTextEn = `<hr class="my-1"><i>Note: Confidence interval or measure may be unreliable due to small sample sizes.</i>`;
        const currentWarningText = currentLang === 'de' ? warningTextDe : warningTextEn;

        if(assocObj.matrix && (key === 'or' || key === 'rd' || key === 'phi')) {
            const m = assocObj.matrix;
            const totalInMatrix = (m.rp || 0) + (m.fp || 0) + (m.fn || 0) + (m.rn || 0) ;
            if (totalInMatrix < ciWarningThreshold * 2 || (m.rp || 0) < ciWarningThreshold/2 || (m.fp || 0) < ciWarningThreshold/2 || (m.fn || 0) < ciWarningThreshold/2 || (m.rn || 0) < ciWarningThreshold/2) {
                 const matrixWarningDe = ` in der zugrundeliegenden 2x2 Tabelle (Gesamt=${totalInMatrix}).`;
                 const matrixWarningEn = ` in the underlying 2x2 table (Total=${totalInMatrix}).`;
                 ciWarning = currentWarningText.replace(currentLang === 'de' ? 'Fallzahlen.' : 'sample sizes.', (currentLang === 'de' ? 'Fallzahlen' : 'sample sizes') + (currentLang === 'de' ? matrixWarningDe : matrixWarningEn));
            }
        }

        if (key === 'or') {
            valueStr = formatNumber(assocObj.or?.value, 2, na, currentLang === 'en');
            lowerStr = formatNumber(assocObj.or?.ci?.lower, 2, na, currentLang === 'en');
            upperStr = formatNumber(assocObj.or?.ci?.upper, 2, na, currentLang === 'en');
            ciMethodStr = assocObj.or?.method || na;
            pStr = (assozPValue !== null && !isNaN(assozPValue)) ? (assozPValue < 0.001 ? (currentLang === 'de' ? '&lt;0,001' : '&lt;0.001') : formatNumber(assozPValue, 3, na, currentLang === 'en')) : na;
            sigSymbol = getStatisticalSignificanceSymbol(assozPValue);
            sigText = getStatisticalSignificanceText(assozPValue);
        } else if (key === 'rd') {
            valueStr = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, currentLang === 'en');
            lowerStr = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, currentLang === 'en');
            upperStr = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, currentLang === 'en');
            ciMethodStr = assocObj.rd?.method || na;
        } else if (key === 'phi') {
            valueStr = formatNumber(assocObj.phi?.value, 2, na, currentLang === 'en');
            bewertungStr = getPhiBewertung(assocObj.phi?.value);
        } else if (key === 'fisher' || key === 'mannwhitney' || key === 'pvalue' || key === 'size_mwu' || key === 'defaultP') {
             pVal = assocObj?.pValue;
             pStr = (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? (currentLang === 'de' ? '&lt;0,001' : '&lt;0.001') : formatNumber(pVal, 3, na, currentLang === 'en')) : na;
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
            .replace(/<hr.*?>.*$/, '');

         if (key === 'or' || key === 'rd') {
            if (lowerStr === na || upperStr === na || ciMethodStr === na || !assocObj?.[key]?.ci) {
                interpretation = interpretation.replace(/\(95%-KI nach .*?: .*? – .*?\)/g, currentLang === 'de' ? '(Keine CI-Daten verfügbar)' : '(No CI data available)');
                interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
            }
         }
         if (key === 'or' && pStr === na) {
             interpretation = interpretation.replace(/, p=.*?, \[SIGNIFIKANZ\]/g, ')');
         }
        interpretation += ciWarning;
        return interpretation;
    }

    function showKurzanleitung() {
        const modalElement = document.getElementById('kurzanleitung-modal');
        let mainAppInterfaceInstance = null;
        if (typeof mainAppInterface !== 'undefined') {
            mainAppInterfaceInstance = mainAppInterface;
        }

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
            const newModalElement = document.getElementById('kurzanleitung-modal');
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                 kurzanleitungModalInstance = new bootstrap.Modal(newModalElement);
            } else {
                console.error("Bootstrap Modal nicht verfügbar für Kurzanleitung.");
                return;
            }
        } else if (!kurzanleitungModalInstance && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
             kurzanleitungModalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        }

        if (kurzanleitungModalInstance && modalElement && !modalElement.classList.contains('show')) {
            if (!initialTabRenderFixed && typeof mainAppInterfaceInstance?.refreshCurrentTab === 'function') {
                modalElement.addEventListener('hidden.bs.modal', () => {
                    if (!initialTabRenderFixed) {
                        const defaultInitialTabId = (APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION === 'methoden' && APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG) ? 'publikation-tab-pane' : 'daten-tab-pane';
                        if (typeof stateManager !== 'undefined' && (stateManager.getActiveTabId() === defaultInitialTabId || stateManager.getActiveTabId() === 'publikation-tab-pane')) {
                             try { mainAppInterfaceInstance.refreshCurrentTab(); } catch (e) { console.error("Fehler beim Refresh nach Kurzanleitung:", e); }
                        }
                    }
                    initialTabRenderFixed = true;
                }, { once: true });
            }
            kurzanleitungModalInstance.show();
        } else if (!kurzanleitungModalInstance) {
             console.error("Kurzanleitung Modal Instanz konnte nicht erstellt werden.");
        }
    }

    function showConfirmModal(message, confirmCallback, confirmButtonText = 'OK', cancelButtonText = 'Abbrechen') {
        if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
            console.error("Bootstrap Modal ist nicht verfügbar. Bestätigungsmodal kann nicht angezeigt werden.");
            showToast("Bestätigungsfunktion nicht verfügbar.", "danger");
            if (confirmCallback) confirmCallback(); 
            return;
        }

        let modalElement = document.getElementById('confirm-modal');
        if (!modalElement) {
            modalElement = document.createElement('div');
            modalElement.id = 'confirm-modal';
            modalElement.className = 'modal fade';
            modalElement.setAttribute('tabindex', '-1');
            modalElement.setAttribute('aria-labelledby', 'confirmModalLabel');
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.innerHTML = `
                <div class="modal-dialog modal-sm modal-dialog-centered">
                    <div class="modal-content modal-glass">
                        <div class="modal-header">
                            <h5 class="modal-title" id="confirmModalLabel">${UI_TEXTS.general.confirm || "Bestätigen"}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button>
                        </div>
                        <div class="modal-body" id="confirmModalBody"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal" id="confirmCancelButton"></button>
                            <button type="button" class="btn btn-primary btn-sm" id="confirmOkButton"></button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalElement);
            confirmModalInstance = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
        } else if (!confirmModalInstance) {
            confirmModalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        }

        document.getElementById('confirmModalBody').innerHTML = escapeMarkdown(message);
        const okButton = document.getElementById('confirmOkButton');
        const cancelButton = document.getElementById('confirmCancelButton');

        okButton.textContent = confirmButtonText;
        cancelButton.textContent = cancelButtonText;

        const cleanUp = () => {
            okButton.removeEventListener('click', onConfirm);
            cancelButton.removeEventListener('click', onCancel);
            modalElement.removeEventListener('hidden.bs.modal', cleanUp);
            if (modalElement.parentNode) {
                modalElement.parentNode.removeChild(modalElement);
            }
            confirmModalInstance = null; 
        };

        const onConfirm = () => {
            if (confirmCallback) confirmCallback();
            confirmModalInstance.hide();
        };

        const onCancel = () => {
            confirmModalInstance.hide();
        };

        okButton.addEventListener('click', onConfirm);
        cancelButton.addEventListener('click', onCancel);
        modalElement.addEventListener('hidden.bs.modal', cleanUp, { once: true });

        confirmModalInstance.show();
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
        getAssociationInterpretationHTML,
        showKurzanleitung,
        showConfirmModal
    });

})();

window.ui_helpers = ui_helpers;
