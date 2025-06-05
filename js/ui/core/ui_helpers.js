const ui_helpers = (() => {

    function getIcon(name, size = APP_CONFIG.UI_SETTINGS.ICON_SIZE, color = APP_CONFIG.UI_SETTINGS.ICON_COLOR, strokeWidth = APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH, additionalClasses = '') {
        if (typeof lucide !== 'undefined' && lucide.icons[name]) {
            const iconNode = lucide.icons[name];
            const svgString = lucide.createElement(iconNode);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgString;
            const svgElement = tempDiv.firstChild;
            if (svgElement && typeof svgElement.setAttribute === 'function') {
                svgElement.setAttribute('width', size);
                svgElement.setAttribute('height', size);
                svgElement.setAttribute('stroke', color);
                svgElement.setAttribute('stroke-width', strokeWidth);
                if (additionalClasses) {
                    const existingClasses = svgElement.getAttribute('class') || '';
                    svgElement.setAttribute('class', `${existingClasses} ${additionalClasses}`.trim());
                }
                return svgElement.outerHTML;
            }
        }
        return `<span style="color:${color}; font-weight:bold;" class="${additionalClasses || ''}">[${name}]</span>`;
    }

    function showToast(message, type = 'info', duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS) {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer || typeof bootstrap === 'undefined') {
            console.warn("Toast Container oder Bootstrap nicht gefunden, Toast kann nicht angezeigt werden:", message);
            alert(message);
            return;
        }

        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
        const toastTypeClasses = {
            info: 'bg-primary text-white',
            success: 'bg-success text-white',
            warning: 'bg-warning text-dark',
            danger: 'bg-danger text-white',
            light: 'bg-light text-dark',
            dark: 'bg-dark text-white'
        };
        const btnCloseClass = (type === 'warning' || type === 'light') ? 'btn-close-dark' : 'btn-close-white';

        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center ${toastTypeClasses[type] || 'bg-secondary text-white'}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${duration}">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close ${btnCloseClass} me-2 m-auto" data-bs-dismiss="toast" aria-label="Schließen"></button>
                </div>
            </div>
        `;
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            const toast = new bootstrap.Toast(toastElement, { delay: duration });
            toast.show();
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        }
    }

    function updateElementHTML(elementId, htmlContent) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = htmlContent;
        } else {
            // console.warn(`Element mit ID '${elementId}' nicht gefunden für HTML-Update.`);
        }
    }

    function getTooltipHTML(tooltipKey, dynamicContent = null, lang = null) {
        const currentLang = lang || (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function' ? stateManager.getCurrentPublikationLang() : 'de');
        let tooltipData = null;

        if (typeof getObjectValueByPath === 'function' && typeof TOOLTIP_CONTENT === 'object' && TOOLTIP_CONTENT !== null) {
             tooltipData = getObjectValueByPath(TOOLTIP_CONTENT, tooltipKey);
        } else if (typeof TOOLTIP_CONTENT === 'object' && TOOLTIP_CONTENT !== null && TOOLTIP_CONTENT[tooltipKey]) {
             tooltipData = TOOLTIP_CONTENT[tooltipKey];
        }

        if (tooltipData && tooltipData[currentLang] && typeof tooltipData[currentLang].description === 'string') {
            let description = tooltipData[currentLang].description;
            if (dynamicContent !== null) {
                if (typeof dynamicContent === 'object') {
                    for (const key in dynamicContent) {
                         if (Object.prototype.hasOwnProperty.call(dynamicContent, key)) {
                            description = description.replace(new RegExp(`\\[${key.toUpperCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g'), String(dynamicContent[key]));
                        }
                    }
                } else {
                    description = description.replace(/\[([A-Z_]+)\]/g, String(dynamicContent));
                }
            }
            return `data-tippy-content="${description.replace(/"/g, '&quot;')}"`;
        }
        return `data-tippy-content="Info: ${tooltipKey.split('.').pop()}"`;
    }

    function initializeTooltips(parentElement = document.body) {
        if (typeof tippy !== 'undefined' && parentElement && typeof parentElement.querySelectorAll === 'function') {
            const elementsWithTooltip = parentElement.querySelectorAll('[data-tippy-content]');
            if (elementsWithTooltip.length > 0) {
                 tippy(elementsWithTooltip, {
                    allowHTML: true,
                    animation: 'fade',
                    duration: [APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY[0], APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY[1]],
                    theme: 'light-border',
                    interactive: true,
                    appendTo: () => document.body,
                    maxWidth: 350,
                    placement: 'top',
                    onShow(instance) {
                        if (!instance.props.content || String(instance.props.content).trim() === '' || String(instance.props.content).startsWith("Info: ")) {
                            return false;
                        }
                        return true;
                    }
                });
            }
        }
    }

    function initializeTippyForElement(element, options = {}) {
        if (typeof tippy !== 'undefined' && element && element.hasAttribute('data-tippy-content')) {
             tippy(element, {
                allowHTML: true,
                animation: 'fade',
                duration: [APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY[0], APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY[1]],
                theme: 'light-border',
                interactive: true,
                appendTo: () => document.body,
                maxWidth: 350,
                placement: 'top',
                ...options,
                onShow(instance) {
                    if (!instance.props.content || String(instance.props.content).trim() === '' || String(instance.props.content).startsWith("Info: ")) {
                        return false;
                    }
                    if (options.onShow && typeof options.onShow === 'function') {
                        return options.onShow(instance);
                    }
                    return true;
                }
            });
        }
    }

    function checkFirstAppStart() {
        const firstStartKey = APP_CONFIG.STORAGE_KEYS.FIRST_APP_START || 'appFirstStart_v2.3';
        if (!loadFromLocalStorage(firstStartKey)) {
            const infoModalElement = document.getElementById('infoModal');
            if (infoModalElement && typeof bootstrap !== 'undefined') {
                const infoModal = new bootstrap.Modal(infoModalElement);
                const modalBody = document.getElementById('infoModalBody');
                const modalTitle = document.getElementById('infoModalLabel');
                if(modalBody && modalTitle && typeof UI_TEXTS !== 'undefined' && UI_TEXTS.kurzanleitung) {
                    const currentLang = (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function' ? stateManager.getCurrentPublikationLang() : 'de');
                    modalTitle.textContent = UI_TEXTS.kurzanleitung.title[currentLang] || UI_TEXTS.kurzanleitung.title.de;

                    let anleitungContent = UI_TEXTS.kurzanleitung.content[currentLang] || UI_TEXTS.kurzanleitung.content.de;
                    anleitungContent = anleitungContent.replace(/\[APP_VERSION\]/g, APP_CONFIG.APP_VERSION);
                    const sigLevel = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
                    const formattedSigLevel = (typeof formatNumber === 'function') ? formatNumber(sigLevel, (sigLevel >= 0.01 ? 2:3), '--', currentLang).replace('.',',') : String(sigLevel);
                    anleitungContent = anleitungContent.replace(/\[SIGNIFICANCE_LEVEL\]/g, formattedSigLevel);

                    modalBody.innerHTML = anleitungContent;
                    infoModal.show();
                    saveToLocalStorage(firstStartKey, 'false');
                }
            }
        }
    }

    function showLoadingOverlay(show, text = null, targetTabPaneId = null) {
        const overlay = document.getElementById('loading-overlay');
        const overlayTextElement = document.getElementById('loading-overlay-text');

        if (overlay && overlayTextElement) {
            if (show) {
                const currentLang = (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function' ? stateManager.getCurrentPublikationLang() : 'de');
                const defaultText = (typeof UI_TEXTS !== 'undefined' && UI_TEXTS.LADEN?.[currentLang]) || (currentLang === 'de' ? 'Lade Daten...' : 'Loading data...');
                overlayTextElement.textContent = text || defaultText;
                overlay.classList.remove('d-none');
                 if (targetTabPaneId) {
                    overlay.dataset.targetPane = targetTabPaneId;
                 }
            } else {
                if (!targetTabPaneId || overlay.dataset.targetPane === targetTabPaneId || !overlay.dataset.targetPane) {
                    overlay.classList.add('d-none');
                    if(overlay.dataset.targetPane) delete overlay.dataset.targetPane;
                }
            }
        }
    }

    function getMetricDescriptionHTML(key, methode = '') {
       const desc = (TOOLTIP_CONTENT && TOOLTIP_CONTENT.statMetrics && TOOLTIP_CONTENT.statMetrics[key]) ? TOOLTIP_CONTENT.statMetrics[key].description : key;
       return desc.replace(/\[METHODE\]/g, methode);
    }

    function getMetricInterpretationHTML(key, metricData, methode = '', kollektivName = '', lang = null) {
        const currentLang = lang || (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function' ? stateManager.getCurrentPublikationLang() : 'de');
        const interpretationTemplate = (TOOLTIP_CONTENT && TOOLTIP_CONTENT.statMetrics && TOOLTIP_CONTENT.statMetrics[key]) ? TOOLTIP_CONTENT.statMetrics[key].interpretation : 'Keine Interpretation verfügbar.';
        const data = (typeof metricData === 'object' && metricData !== null) ? metricData : { value: metricData, ci: null, method: 'N/A' };
        const na = '--';
        const digits = (key === 'f1' || key === 'auc') ? 3 : 1;
        const isPercent = !(key === 'f1' || key === 'auc');
        const valueStr = formatNumber(data?.value, digits, na, currentLang);
        const lowerStr = formatNumber(data?.ci?.lower, digits, na, currentLang);
        const upperStr = formatNumber(data?.ci?.upper, digits, na, currentLang);
        const ciMethodStr = data?.method || 'N/A';
        const bewertungStr = (key === 'auc' && typeof getAUCBewertung === 'function') ? getAUCBewertung(data?.value, currentLang) : '';

        let interpretation = interpretationTemplate
            .replace(/\[METHODE\]/g, methode)
            .replace(/\[WERT\]/g, `<strong>${isPercent ? formatPercent(data?.value, digits,na,currentLang) : valueStr}</strong>`)
            .replace(/\[LOWER\]/g, isPercent ? formatPercent(data?.ci?.lower, digits,na,currentLang) : lowerStr)
            .replace(/\[UPPER\]/g, isPercent ? formatPercent(data?.ci?.upper, digits,na,currentLang) : upperStr)
            .replace(/\[METHOD_CI\]/g, ciMethodStr)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${getKollektivDisplayName(kollektivName)}</strong>`)
            .replace(/\[BEWERTUNG\]/g, `<strong>${bewertungStr}</strong>`);

        if (lowerStr === na || upperStr === na) {
             interpretation = interpretation.replace(/\(95% KI.*?nach .*?: .*? - .*?\)/g, '(Keine CI-Daten verfügbar)');
             interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
        }
         interpretation = interpretation.replace(/p=\[P_WERT\], \[SIGNIFIKANZ\]/g,'');
         interpretation = interpretation.replace(/<hr.*?>.*$/, '');

        return interpretation;
    }

    function getTestDescriptionHTML(key, t2ShortName = 'T2') {
        const desc = (TOOLTIP_CONTENT && TOOLTIP_CONTENT.statMetrics && TOOLTIP_CONTENT.statMetrics[key]) ? TOOLTIP_CONTENT.statMetrics[key].description : key;
        return desc.replace(/\[T2_SHORT_NAME\]/g, t2ShortName);
    }

    function getTestInterpretationHTML(key, testData, kollektivName = '', t2ShortName = 'T2', lang = null) {
        const currentLang = lang || (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function' ? stateManager.getCurrentPublikationLang() : 'de');
        const interpretationTemplate = (TOOLTIP_CONTENT && TOOLTIP_CONTENT.statMetrics && TOOLTIP_CONTENT.statMetrics[key]) ? TOOLTIP_CONTENT.statMetrics[key].interpretation : 'Keine Interpretation verfügbar.';
         if (!testData) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        const pValue = testData?.pValue;
        const pStr = (pValue !== null && !isNaN(pValue)) ? (pValue < 0.001 ? '&lt;0.001' : formatNumber(pValue, 3, na, true)) : na;
        const sigSymbol = getStatisticalSignificanceSymbol(pValue);
        const sigText = getStatisticalSignificanceText(pValue, currentLang);
         return interpretationTemplate
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${getKollektivDisplayName(kollektivName)}</strong>`)
            .replace(/\[T2_SHORT_NAME\]/g, t2ShortName)
            .replace(/<hr.*?>.*$/, '');
    }

    function getAssociationInterpretationHTML(key, assocObj, merkmalName, kollektivName, lang = null) {
        const currentLang = lang || (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function' ? stateManager.getCurrentPublikationLang() : 'de');
        const interpretationTemplate = (TOOLTIP_CONTENT && TOOLTIP_CONTENT.statMetrics && TOOLTIP_CONTENT.statMetrics[key]) ? TOOLTIP_CONTENT.statMetrics[key].interpretation : 'Keine Interpretation verfügbar.';
        if (!assocObj) return 'Keine Daten für Interpretation verfügbar.';
        const na = '--';
        let valueStr = na, lowerStr = na, upperStr = na, ciMethodStr = na, bewertungStr = '', pStr = na, sigSymbol = '', sigText = '', pVal = NaN;
        const assozPValue = assocObj?.pValue;

        const ttContentStatMetrics = (TOOLTIP_CONTENT && TOOLTIP_CONTENT.statMetrics) ? TOOLTIP_CONTENT.statMetrics : {};

        if (key === 'or') {
            valueStr = formatNumber(assocObj.or?.value, 2, na, currentLang);
            lowerStr = formatNumber(assocObj.or?.ci?.lower, 2, na, currentLang);
            upperStr = formatNumber(assocObj.or?.ci?.upper, 2, na, currentLang);
            ciMethodStr = assocObj.or?.method || na;
            pStr = (assozPValue !== null && !isNaN(assozPValue)) ? (assozPValue < 0.001 ? '&lt;0.001' : formatNumber(assozPValue, 3, na, true)) : na;
            sigSymbol = getStatisticalSignificanceSymbol(assozPValue);
            sigText = getStatisticalSignificanceText(assozPValue, currentLang);
        } else if (key === 'rd') {
            valueStr = formatNumber(assocObj.rd?.value !== null && !isNaN(assocObj.rd?.value) ? assocObj.rd.value * 100 : NaN, 1, na, currentLang);
            lowerStr = formatNumber(assocObj.rd?.ci?.lower !== null && !isNaN(assocObj.rd?.ci?.lower) ? assocObj.rd.ci.lower * 100 : NaN, 1, na, currentLang);
            upperStr = formatNumber(assocObj.rd?.ci?.upper !== null && !isNaN(assocObj.rd?.ci?.upper) ? assocObj.rd.ci.upper * 100 : NaN, 1, na, currentLang);
            ciMethodStr = assocObj.rd?.method || na;
        } else if (key === 'phi') {
            valueStr = formatNumber(assocObj.phi?.value, 2, na, currentLang);
            bewertungStr = typeof getPhiBewertung === 'function' ? getPhiBewertung(assocObj.phi?.value, currentLang) : '';
        } else if (key === 'fisher' || key === 'mannwhitney' || key === 'defaultP' || key === 'pvalue') {
             pVal = assocObj?.pValue;
             pStr = (pVal !== null && !isNaN(pVal)) ? (pVal < 0.001 ? '&lt;0.001' : formatNumber(pVal, 3, na, true)) : na;
             sigSymbol = getStatisticalSignificanceSymbol(pVal);
             sigText = getStatisticalSignificanceText(pVal, currentLang);
             const specificInterpretation = ttContentStatMetrics[key]?.interpretation;
             const templateToUse = specificInterpretation || ttContentStatMetrics.defaultP.interpretation;
             return templateToUse
                 .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
                 .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
                 .replace(/\[SIGNIFIKANZ_TEXT\]/g, `<strong>${sigText}</strong>`)
                 .replace(/\[MERKMAL\]/g, `'${merkmalName}'`)
                 .replace(/\[VARIABLE\]/g, `'${merkmalName}'`)
                 .replace(/\[KOLLEKTIV\]/g, `<strong>${getKollektivDisplayName(kollektivName)}</strong>`)
                 .replace(/<hr.*?>.*$/, '');
        }

        const orFaktorTexte = ttContentStatMetrics.orFaktorTexte || {ERHOEHT: 'erhöht', VERRINGERT: 'verringert', UNVERAENDERT: 'unverändert'};
        const rdRichtungTexte = ttContentStatMetrics.rdRichtungTexte || {HOEHER: 'höher', NIEDRIGER: 'niedriger', GLEICH: 'gleich'};

        let interpretation = interpretationTemplate
            .replace(/\[MERKMAL\]/g, `'${merkmalName}'`)
            .replace(/\[WERT\]/g, `<strong>${valueStr}${key === 'rd' ? '%' : ''}</strong>`)
            .replace(/\[LOWER\]/g, lowerStr)
            .replace(/\[UPPER\]/g, upperStr)
            .replace(/\[METHOD_CI\]/g, ciMethodStr)
            .replace(/\[KOLLEKTIV\]/g, `<strong>${getKollektivDisplayName(kollektivName)}</strong>`)
            .replace(/\[FAKTOR_TEXT\]/g, assocObj?.or?.value > 1 ? orFaktorTexte.ERHOEHT : (assocObj?.or?.value < 1 ? orFaktorTexte.VERRINGERT : orFaktorTexte.UNVERAENDERT))
            .replace(/\[HOEHER_NIEDRIGER\]/g, assocObj?.rd?.value > 0 ? rdRichtungTexte.HOEHER : (assocObj?.rd?.value < 0 ? rdRichtungTexte.NIEDRIGER : rdRichtungTexte.GLEICH))
            .replace(/\[STAERKE\]/g, `<strong>${bewertungStr}</strong>`)
            .replace(/\[P_WERT\]/g, `<strong>${pStr}</strong>`)
            .replace(/\[SIGNIFIKANZ\]/g, sigSymbol)
            .replace(/<hr.*?>.*$/, '');

         if (key === 'or' || key === 'rd') {
            if (lowerStr === na || upperStr === na) {
                interpretation = interpretation.replace(/\(95% KI.*?nach .*?: .*? - .*?\)/g, '(Keine CI-Daten verfügbar)');
                interpretation = interpretation.replace(/nach \[METHOD_CI\]:/g, '');
            }
         }
         if (key === 'or' && pStr === na) {
             interpretation = interpretation.replace(/, p=.*?, .*?\)/g, ')');
         }

        return interpretation;
    }

    function getCriteriaSetTooltipHTML(criteriaSet, lang = null, isBruteForceResult = false, bfMetricName = null, targetKollektivForBF = null) {
        const currentLang = lang || (typeof stateManager !== 'undefined' && typeof stateManager.getCurrentPublikationLang === 'function' ? stateManager.getCurrentPublikationLang() : 'de');
        if (!criteriaSet) return '';
        let html = `<strong>${criteriaSet.name || (currentLang === 'de' ? 'Kriteriensatz' : 'Criteria Set')}</strong>`;

        if (criteriaSet.description) {
            html += `<p class="small mt-1 mb-1">${criteriaSet.description}</p>`;
        } else if (isBruteForceResult) {
             html += `<p class="small mt-1 mb-1">${currentLang === 'de' ? 'Optimierter Kriteriensatz' : 'Optimized Criteria Set'}</p>`;
        }

        if (isBruteForceResult && criteriaSet.metricValue !== undefined && !isNaN(criteriaSet.metricValue) && bfMetricName) {
            const metricValStr = (typeof formatNumber === 'function') ? formatNumber(criteriaSet.metricValue, 3, '--', currentLang) : String(criteriaSet.metricValue);
            const kollektivName = targetKollektivForBF ? ((typeof getKollektivDisplayName === 'function') ? getKollektivDisplayName(targetKollektivForBF) : targetKollektivForBF) : '';
            html += `<p class="small mb-1"><em>${bfMetricName}${kollektivName ? ` (${kollektivName})` : ''}: ${metricValStr}</em></p>`;
        }

        if(criteriaSet.criteria && criteriaSet.logic && typeof studyT2CriteriaManager !== 'undefined') {
            const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(criteriaSet.criteria, criteriaSet.logic, false, currentLang);
            html += `<p class="small mb-1" style="white-space: normal;"><strong>${currentLang === 'de' ? 'Kriterien' : 'Criteria'}:</strong> ${formattedCriteria}</p>`;
        }
        if (criteriaSet.applicableKollektiv && !isBruteForceResult) {
            html += `<p class="small mb-1"><em>${currentLang === 'de' ? 'Eval. auf' : 'Eval. on'}: ${typeof getKollektivDisplayName === 'function' ? getKollektivDisplayName(criteriaSet.applicableKollektiv) : criteriaSet.applicableKollektiv}</em></p>`;
        }
        if (criteriaSet.context) {
            html += `<p class="small mb-0"><em>${currentLang === 'de' ? 'Kontext' : 'Context'}: ${criteriaSet.context}</em></p>`;
        }
        return `<div style='text-align: left; max-width: 320px;'>${html}</div>`;
    }

    function htmlToMarkdown(htmlString) {
        if (typeof htmlString !== 'string') return '';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        function getListDepth(node) {
            let depth = 0;
            let parent = node.parentNode;
            while (parent) {
                if (parent.tagName === 'UL' || parent.tagName === 'OL') {
                    depth++;
                }
                parent = parent.parentNode;
            }
            return depth;
        }

        function processNode(node) {
            let markdown = '';
            switch (node.nodeType) {
                case Node.ELEMENT_NODE:
                    const tagName = node.tagName.toLowerCase();
                    let childrenMarkdown = '';
                    node.childNodes.forEach(child => {
                        childrenMarkdown += processNode(child);
                    });

                    switch (tagName) {
                        case 'h1': markdown = `# ${childrenMarkdown.trim()}\n\n`; break;
                        case 'h2': markdown = `## ${childrenMarkdown.trim()}\n\n`; break;
                        case 'h3': markdown = `### ${childrenMarkdown.trim()}\n\n`; break;
                        case 'h4': markdown = `#### ${childrenMarkdown.trim()}\n\n`; break;
                        case 'h5': markdown = `##### ${childrenMarkdown.trim()}\n\n`; break;
                        case 'h6': markdown = `###### ${childrenMarkdown.trim()}\n\n`; break;
                        case 'p':
                            const parentTagP = node.parentNode ? node.parentNode.tagName.toLowerCase() : '';
                            if (parentTagP === 'li' || parentTagP === 'blockquote') {
                                markdown = `${childrenMarkdown.trim().replace(/\n\n$/, '\n')}`;
                            } else {
                                markdown = `${childrenMarkdown.trim()}\n\n`;
                            }
                            break;
                        case 'strong': case 'b': markdown = `**${childrenMarkdown.trim()}**`; break;
                        case 'em': case 'i': markdown = `*${childrenMarkdown.trim()}*`; break;
                        case 's': case 'del': case 'strike': markdown = `~~${childrenMarkdown.trim()}~~`; break;
                        case 'code':
                            if (node.parentNode && node.parentNode.tagName.toLowerCase() === 'pre') {
                                markdown = childrenMarkdown;
                            } else {
                                markdown = `\`${childrenMarkdown.trim()}\``;
                            }
                            break;
                        case 'pre':
                            const codeContent = node.textContent || '';
                            markdown = "```\n" + codeContent.trim() + "\n```\n\n";
                            break;
                        case 'a':
                            const href = node.getAttribute('href') || '';
                            const title = node.getAttribute('title') || '';
                            const linkText = childrenMarkdown.trim();
                            if (href.startsWith('#') && (linkText.toLowerCase().includes('figure') || linkText.toLowerCase().includes('table') || linkText.toLowerCase().includes('abbildung') || linkText.toLowerCase().includes('tabelle') )) {
                                 markdown = linkText;
                            } else {
                                markdown = `[${linkText}](${href}${title ? ` "${title}"` : ''})`;
                            }
                            break;
                        case 'img':
                            const src = node.getAttribute('src') || '';
                            const alt = node.getAttribute('alt') || '';
                            const imgTitle = node.getAttribute('title') || '';
                            markdown = `![${alt}](${src}${imgTitle ? ` "${imgTitle}"` : ''})\n\n`;
                            break;
                        case 'hr': markdown = '---\n\n'; break;
                        case 'br': markdown = '  \n';
                            break;
                        case 'ul': markdown = `${childrenMarkdown.trimEnd()}\n\n`; break;
                        case 'ol': markdown = `${childrenMarkdown.trimEnd()}\n\n`; break;
                        case 'li':
                            const parentLiTag = node.parentNode ? node.parentNode.tagName.toLowerCase() : '';
                            const depth = getListDepth(node);
                            const indent = '    '.repeat(depth > 0 ? depth -1 : 0);
                            let liContent = childrenMarkdown.trim();
                            liContent = liContent.replace(/(\n\n|\n\s*\n)$/, '\n');

                            if (parentLiTag === 'ul') {
                                markdown = `${indent}* ${liContent}\n`;
                            } else if (parentLiTag === 'ol') {
                                const start = node.parentNode.hasAttribute('start') ? parseInt(node.parentNode.getAttribute('start')) : 1;
                                const index = Array.from(node.parentNode.children).filter(el => el.tagName === 'LI').indexOf(node);
                                markdown = `${indent}${start + index}. ${liContent}\n`;
                            } else {
                                markdown = liContent;
                            }
                            break;
                        case 'blockquote':
                            const lines = childrenMarkdown.trim().split('\n');
                            markdown = lines.map(line => `> ${line}`).join('\n') + '\n\n';
                            break;
                        case 'table':
                            let tableMd = '';
                            const tHead = node.querySelector('thead');
                            const tBody = node.querySelector('tbody');
                            const headerRowsHtml = tHead ? Array.from(tHead.querySelectorAll('tr')) : [];
                            const bodyRowsHtml = tBody ? Array.from(tBody.querySelectorAll('tr')) :
                                                 (headerRowsHtml.length === 0 ? Array.from(node.querySelectorAll('tr')) : []);

                            if (headerRowsHtml.length > 0 || bodyRowsHtml.length > 0) {
                                const getCells = (rowNode) => Array.from(rowNode.children)
                                    .filter(cell => cell.tagName === 'TH' || cell.tagName === 'TD')
                                    .map(cell => processNode(cell).trim().replace(/\|/g, '\\|').replace(/\n/g, ' '));

                                let numCols = 0;
                                if(headerRowsHtml.length > 0) numCols = getCells(headerRowsHtml[0]).length;
                                else if(bodyRowsHtml.length > 0) numCols = getCells(bodyRowsHtml[0]).length;

                                if (numCols > 0) {
                                    if (headerRowsHtml.length > 0) {
                                        headerRowsHtml.forEach(hr => {
                                            tableMd += `| ${getCells(hr).join(' | ')} |\n`;
                                        });
                                        tableMd += `| ${Array(numCols).fill('---').join(' | ')} |\n`;
                                    } else if (bodyRowsHtml.length > 0) {
                                        tableMd += `| ${getCells(bodyRowsHtml[0]).join(' | ')} |\n`;
                                        tableMd += `| ${Array(numCols).fill('---').join(' | ')} |\n`;
                                    }

                                    const dataRowsToProcess = headerRowsHtml.length > 0 ? bodyRowsHtml : bodyRowsHtml.slice(1);
                                    dataRowsToProcess.forEach(br => {
                                        tableMd += `| ${getCells(br).join(' | ')} |\n`;
                                    });
                                    markdown = tableMd + '\n';
                                } else {
                                     markdown = childrenMarkdown;
                                }
                            } else {
                                markdown = childrenMarkdown;
                            }
                            break;
                        case 'thead': case 'tbody': case 'tr': case 'caption':
                            markdown = childrenMarkdown;
                            break;
                        case 'th': case 'td':
                            markdown = ` ${childrenMarkdown.trim().replace(/\s+/g, ' ')} `;
                            break;
                        case 'style': case 'script': case 'button': case 'select': case 'input': case 'textarea':
                        case 'svg':
                            markdown = '';
                            break;
                        default:
                            markdown = childrenMarkdown;
                    }
                    break;
                case Node.TEXT_NODE:
                    let text = node.textContent || '';
                    if (node.parentNode && node.parentNode.tagName.toLowerCase() !== 'pre' && node.parentNode.tagName.toLowerCase() !== 'code') {
                         text = text.replace(/\s\s+/g, ' ').replace(/\n\s*\n/g, '\n');
                    }
                    markdown = text;
                    break;
                case Node.COMMENT_NODE:
                    break;
                default:
                    break;
            }
            return markdown;
        }

        let resultMarkdown = processNode(tempDiv);
        resultMarkdown = resultMarkdown.replace(/\n{3,}/g, '\n\n').trim();
        resultMarkdown = resultMarkdown.replace(/(\n\s*){2,}\n/g, '\n\n');
        return resultMarkdown;
    }

    return Object.freeze({
        getIcon,
        showToast,
        updateElementHTML,
        getTooltipHTML,
        initializeTooltips,
        initializeTippyForElement,
        checkFirstAppStart,
        showLoadingOverlay,
        getMetricDescriptionHTML,
        getMetricInterpretationHTML,
        getTestDescriptionHTML,
        getTestInterpretationHTML,
        getAssociationInterpretationHTML,
        getCriteriaSetTooltipHTML,
        htmlToMarkdown
    });
})();
