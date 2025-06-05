const ui_helpers = (() => {

    function getIcon(name, size = APP_CONFIG.UI_SETTINGS.ICON_SIZE, color = APP_CONFIG.UI_SETTINGS.ICON_COLOR, strokeWidth = APP_CONFIG.UI_SETTINGS.ICON_STROKE_WIDTH, additionalClasses = '') {
        if (typeof lucide !== 'undefined' && lucide.icons[name]) {
            const iconNode = lucide.icons[name];
            // CreateElement function of lucide returns a string.
            const svgString = lucide.createElement(iconNode);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = svgString;
            const svgElement = tempDiv.firstChild;
            if (svgElement) {
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
        return `<span style="color:${color}; font-weight:bold;" class="${additionalClasses}">[${name}]</span>`;
    }

    function showToast(message, type = 'info', duration = APP_CONFIG.UI_SETTINGS.TOAST_DURATION_MS) {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer || typeof bootstrap === 'undefined') {
            console.warn("Toast Container oder Bootstrap nicht gefunden, Toast kann nicht angezeigt werden:", message);
            alert(message); // Fallback
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
            console.warn(`Element mit ID '${elementId}' nicht gefunden für HTML-Update.`);
        }
    }
    
    function getTooltipHTML(tooltipKey, dynamicContent = null, lang = null) {
        const currentLang = lang || राज्य?.userSettings?.publikationLang || 'de';
        let tooltipData = null;
        if (TOOLTIP_CONTENT && typeof TOOLTIP_CONTENT === 'object') {
             tooltipData = getObjectValueByPath(TOOLTIP_CONTENT, tooltipKey);
        }

        if (tooltipData && tooltipData[currentLang] && tooltipData[currentLang].description) {
            let description = tooltipData[currentLang].description;
            if (dynamicContent !== null) {
                if (typeof dynamicContent === 'object') {
                    for (const key in dynamicContent) {
                         if (Object.prototype.hasOwnProperty.call(dynamicContent, key)) {
                            description = description.replace(new RegExp(`\\[${key.toUpperCase()}\\]`, 'g'), dynamicContent[key]);
                        }
                    }
                } else {
                    description = description.replace(/\[.*?\]/, String(dynamicContent));
                }
            }
            return `data-tippy-content="${description.replace(/"/g, '&quot;')}"`;
        }
        return `data-tippy-content="Tooltip für ${tooltipKey} nicht gefunden."`;
    }

    function initializeTooltips(parentElement = document.body) {
        if (typeof tippy !== 'undefined' && parentElement && typeof parentElement.querySelectorAll === 'function') {
            const elementsWithTooltip = parentElement.querySelectorAll('[data-tippy-content]');
            if (elementsWithTooltip.length > 0) {
                 tippy(elementsWithTooltip, {
                    allowHTML: true,
                    animation: 'fade',
                    duration: [APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY[0], APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY[1]],
                    theme: 'light-border', // Or a custom theme defined in CSS
                    interactive: true,
                    appendTo: () => document.body,
                    maxWidth: 350,
                    placement: 'top',
                    onShow(instance) { // Ensure content is not empty
                        if (!instance.props.content || String(instance.props.content).trim() === '') {
                            return false;
                        }
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
                    if (!instance.props.content || String(instance.props.content).trim() === '') {
                        return false;
                    }
                    if (options.onShow) {
                        return options.onShow(instance);
                    }
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
                if(modalBody && modalTitle && UI_TEXTS && UI_TEXTS.kurzanleitung) {
                    const currentLang = राज्य?.userSettings?.publikationLang || 'de';
                    modalTitle.textContent = UI_TEXTS.kurzanleitung.title[currentLang] || UI_TEXTS.kurzanleitung.title.de;
                    modalBody.innerHTML = UI_TEXTS.kurzanleitung.content[currentLang] || UI_TEXTS.kurzanleitung.content.de;
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
                const currentLang = राज्य?.userSettings?.publikationLang || 'de';
                overlayTextElement.textContent = text || (UI_TEXTS.LADEN?.[currentLang] || (currentLang === 'de' ? 'Lade Daten...' : 'Loading data...'));
                overlay.classList.remove('d-none');
                 if (targetTabPaneId) {
                    overlay.dataset.targetPane = targetTabPaneId;
                 }
            } else {
                // Hide only if not targeted or target matches
                if (!targetTabPaneId || overlay.dataset.targetPane === targetTabPaneId || !overlay.dataset.targetPane) {
                    overlay.classList.add('d-none');
                    delete overlay.dataset.targetPane;
                }
            }
        }
    }

    function getMetricInterpretationHTML(metricKey, metricData, lang = 'de', forRadiology = false) {
        if (!metricData || typeof metricData.value !== 'number') return '';
        
        const uiTextMetricBase = TOOLTIP_CONTENT.statMetrics?.[metricKey.toLowerCase()];
        if (!uiTextMetricBase) return `${metricKey}: ${radiologyFormatter.formatRadiologyNumber(metricData.value, 2, forRadiology)}`;

        const name = uiTextMetricBase.name?.[lang] || uiTextMetricBase.name?.de || metricKey.toUpperCase();
        let description = uiTextMetricBase.description?.[lang] || uiTextMetricBase.description?.de || '';
        const formula = uiTextMetricBase.formula || '';
        const interpretation = uiTextMetricBase.interpretation?.[lang] || uiTextMetricBase.interpretation?.de || '';
        const range = uiTextMetricBase.range?.[lang] || uiTextMetricBase.range?.de || '';
        
        const isRate = !['f1', 'auc', 'phi', 'or', 'rd'].includes(metricKey.toLowerCase());
        const digits = (metricKey.toLowerCase() === 'auc' || metricKey.toLowerCase() === 'phi' || metricKey.toLowerCase() === 'or' || metricKey.toLowerCase() === 'rd') ? (forRadiology ? 2 : 3) : (forRadiology ? 0 : 1);

        const formattedValue = forRadiology 
            ? radiologyFormatter.formatRadiologyNumber(metricData.value, digits, (metricKey.toLowerCase()==='auc'), !isRate) 
            : (isRate ? formatPercent(metricData.value, digits, '--%', lang) : formatNumber(metricData.value, digits, '--', lang));
        
        let formattedCI = '';
        if (metricData.ci && typeof metricData.ci.lower === 'number' && typeof metricData.ci.upper === 'number') {
            formattedCI = forRadiology 
                ? radiologyFormatter.formatRadiologyCI(metricData.value, metricData.ci.lower, metricData.ci.upper, digits, isRate, true) // true as value is already formatted string for CI fn
                : ` (95% KI: ${isRate ? formatPercent(metricData.ci.lower, digits, '--', lang) : formatNumber(metricData.ci.lower, digits, '--', lang)} – ${isRate ? formatPercent(metricData.ci.upper, digits, '--', lang) : formatNumber(metricData.ci.upper, digits, '--', lang)})`;
                if(forRadiology && formattedCI.startsWith(String(metricData.value))) { // radiologyFormatter.formatRadiologyCI returns value + CI
                    formattedCI = formattedCI.substring(String(metricData.value).length).trim();
                }
        }
        
        let html = `<strong>${name}: ${formattedValue}${forRadiology && formattedCI ? ' ' + formattedCI.replace('(95% CI:','(95%-KI:') : formattedCI}</strong>`;
        if (description) html += `<p class="small mt-1 mb-1">${description}</p>`;
        if (formula) html += `<p class="small mb-1"><em>${lang === 'de' ? 'Formel' : 'Formula'}: ${formula}</em></p>`;
        if (interpretation) html += `<p class="small mb-1">${interpretation}</p>`;
        if (range) html += `<p class="small mb-0"><em>${lang === 'de' ? 'Wertebereich' : 'Range'}: ${range}</em></p>`;
        
        if (metricKey.toLowerCase() === 'phi' || metricKey.toLowerCase() === 'auc') {
            const bewertungFn = metricKey.toLowerCase() === 'phi' ? getPhiBewertung : getAUCBewertung;
            const bewertungText = bewertungFn(metricData.value, lang);
            html += `<p class="small mt-1 mb-0"><em>${lang==='de'?'Bewertung':'Assessment'}: ${bewertungText}</em></p>`;
        }

        return `<div style='text-align: left;'>${html}</div>`;
    }
    
    function getCriteriaSetTooltipHTML(criteriaSet, lang = 'de', isBruteForceResult = false, bfMetricName = null) {
        if (!criteriaSet) return '';
        let html = `<strong>${criteriaSet.name || (lang === 'de' ? 'Unbenannter Kriteriensatz' : 'Unnamed Criteria Set')}</strong>`;
        html += `<p class="small mt-1 mb-1">${criteriaSet.description || (lang === 'de' ? 'Keine Beschreibung verfügbar.' : 'No description available.')}</p>`;
        
        if (isBruteForceResult && criteriaSet.metricValue !== undefined && bfMetricName) {
            const metricValStr = formatNumber(criteriaSet.metricValue, 3, '--', lang);
            html += `<p class="small mb-1"><em>${bfMetricName}: ${metricValStr}</em></p>`;
        }
        
        if(criteriaSet.criteria && criteriaSet.logic) {
            const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(criteriaSet.criteria, criteriaSet.logic, false, lang);
            html += `<p class="small mb-1"><strong>${lang === 'de' ? 'Angewandte Kriterien' : 'Applied Criteria'}:</strong> ${formattedCriteria}</p>`;
        }
        if (criteriaSet.applicableKollektiv) {
            html += `<p class="small mb-1"><em>${lang === 'de' ? 'Zielkollektiv (Orig.)' : 'Target Cohort (Orig.)'}: ${getKollektivDisplayName(criteriaSet.applicableKollektiv)}</em></p>`;
        }
        if (criteriaSet.context) {
            html += `<p class="small mb-0"><em>${lang === 'de' ? 'Kontext' : 'Context'}: ${criteriaSet.context}</em></p>`;
        }
        return `<div style='text-align: left;'>${html}</div>`;
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
                            if (parentTagP === 'li' || parentTagP === 'blockquote') { // Less newlines if P in LI or BQ
                                markdown = `${childrenMarkdown.trim()}\n`; 
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
                            if (href.startsWith('#') && childrenMarkdown.trim().toLowerCase().includes('figure') || childrenMarkdown.trim().toLowerCase().includes('table')) {
                                 markdown = childrenMarkdown.trim(); // Keep internal figure/table links as plain text
                            } else {
                                markdown = `[${childrenMarkdown.trim()}](${href}${title ? ` "${title}"` : ''})`;
                            }
                            break;
                        case 'img':
                            const src = node.getAttribute('src') || '';
                            const alt = node.getAttribute('alt') || '';
                            const imgTitle = node.getAttribute('title') || '';
                            markdown = `![${alt}](${src}${imgTitle ? ` "${imgTitle}"` : ''})\n\n`;
                            break;
                        case 'hr': markdown = '---\n\n'; break;
                        case 'br': markdown = '  \n'; break; 
                        case 'ul': markdown = `${childrenMarkdown.trimEnd()}\n\n`; break; 
                        case 'ol': markdown = `${childrenMarkdown.trimEnd()}\n\n`; break; 
                        case 'li':
                            const parentLiTag = node.parentNode ? node.parentNode.tagName.toLowerCase() : '';
                            const depth = getListDepth(node);
                            const indent = '    '.repeat(depth > 0 ? depth -1 : 0); 
                            if (parentLiTag === 'ul') {
                                markdown = `${indent}* ${childrenMarkdown.trim().replace(/\n+$/, '')}\n`;
                            } else if (parentLiTag === 'ol') {
                                const start = node.parentNode.hasAttribute('start') ? parseInt(node.parentNode.getAttribute('start')) : 1;
                                const index = Array.from(node.parentNode.children).indexOf(node);
                                markdown = `${indent}${start + index}. ${childrenMarkdown.trim().replace(/\n+$/, '')}\n`;
                            } else {
                                markdown = childrenMarkdown; 
                            }
                            break;
                        case 'blockquote':
                            const lines = childrenMarkdown.trim().split('\n');
                            markdown = lines.map(line => `> ${line}`).join('\n') + '\n\n';
                            break;
                        case 'table':
                            let tableMd = '';
                            const headerRows = Array.from(node.querySelectorAll('thead tr'));
                            const bodyRows = Array.from(node.querySelectorAll('tbody tr'));
                            const allRows = headerRows.concat(bodyRows);
                            
                            if (allRows.length > 0) {
                                const firstRowCells = Array.from(allRows[0].children).filter(cell => cell.tagName === 'TH' || cell.tagName === 'TD');
                                const numCols = firstRowCells.length;

                                if (headerRows.length > 0 || (bodyRows.length > 0 && numCols > 0) ) {
                                    const headerCells = headerRows.length > 0 ? 
                                        Array.from(headerRows[0].children).map(th => processNode(th).trim()) :
                                        firstRowCells.map(td => processNode(td).trim()); 

                                    tableMd += `| ${headerCells.join(' | ')} |\n`;
                                    tableMd += `| ${Array(numCols).fill('---').join(' | ')} |\n`;
                                }
                                
                                const rowsToProcess = headerRows.length > 0 ? bodyRows : (allRows.length > 1 ? allRows.slice(1) : []);
                                rowsToProcess.forEach(row => {
                                    const cells = Array.from(row.children).map(td => processNode(td).trim().replace(/\|/g, '\\|').replace(/\n/g,'<br>')); 
                                    tableMd += `| ${cells.join(' | ')} |\n`;
                                });
                                markdown = tableMd + '\n';
                            } else {
                                markdown = childrenMarkdown; 
                            }
                            break;
                        case 'thead': case 'tbody': case 'tr':
                            markdown = childrenMarkdown; 
                            break;
                        case 'th': case 'td':
                            markdown = ` ${childrenMarkdown.trim().replace(/\s+/g, ' ')} `; 
                            break;
                        case 'style': case 'script': case 'button': case 'select': case 'input': case 'textarea':
                            markdown = ''; // Ignore these tags and their content
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
        getMetricInterpretationHTML,
        getCriteriaSetTooltipHTML,
        htmlToMarkdown
    });
})();
