const publicationRenderer = (() => {

    function _basicMarkdownToHtml(markdown) {
        if (typeof markdown !== 'string') return '';
        let html = markdown;
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(\n<li>.*<\/li>)+/g, (match) => `<ul>${match.replace(/\n/g, '')}</ul>`);
        html = html.replace(/(\r\n|\r|\n){2,}/g, '</p><p>');
        html = `<p>${html}</p>`;
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<(h[1-6]|ul|ol|li|strong|em|table|thead|tbody|tr|th|td|caption|figure|figcaption|div).*?>)/gim, '$1');
        html = html.replace(/(<\/(h[1-6]|ul|ol|li|strong|em|table|thead|tbody|tr|th|td|caption|figure|figcaption|div)>)<\/p>/gim, '$1');
        html = html.replace(/<\/ul><\/p>/g, '</ul>');
        html = html.replace(/<p><ul>/g, '<ul>');
        return html;
    }

    function _renderTableFromPlaceholder(placeholder, allStats, lang, commonData) {
        const parts = placeholder.replace(/[{}]/g, '').split(':');
        if (parts.length < 2 || parts[0] !== 'Table') return null;

        const params = parts[1].split('_');
        const tableType = params[0];
        const subType = params.length > 2 ? params.slice(1, params.length -1).join('_') : null;
        const kollektivId = params[params.length -1];

        const kollektivStats = allStats?.[kollektivId];
        const tableCaptionBase = `${tableType}${subType ? ' '+subType : ''} für ${getKollektivDisplayName(kollektivId)}`;

        try {
            if (tableType === 'Patientencharakteristika') {
                if (kollektivStats?.deskriptiv) {
                    return uiComponents.createPatientCharacteristicTable(kollektivStats.deskriptiv, `pub-table-char-${kollektivId.replace(/\s/g,'')}`, `Tabelle: ${tableCaptionBase}`);
                }
            } else if (tableType === 'Performance') {
                let perfData = null;
                let methodName = '';
                if (subType === 'AS') {
                    perfData = kollektivStats?.gueteAS;
                    methodName = 'Avocado Sign';
                } else if (subType && subType.startsWith('LitT2')) {
                    const litSetId = subType.substring('LitT2_'.length);
                    const litSet = studyT2CriteriaManager.getStudyCriteriaSetById(litSetId);
                    methodName = litSet?.name || litSetId;
                    const evalKollektivId = litSet?.applicableKollektiv || kollektivId;
                    perfData = allStats?.[evalKollektivId]?.gueteT2_literatur?.[litSetId];
                } else if (subType && subType.startsWith('OptT2')) {
                     const bfData = kollektivStats?.bruteforce_definition;
                     perfData = kollektivStats?.gueteT2_bruteforce;
                     methodName = `Optimierte T2 (für ${bfData?.metricName || commonData.bruteForceMetricForPublication})`;
                }
                if (perfData) {
                    return uiComponents.createPerformanceTable(perfData, methodName, `pub-table-perf-${subType}-${kollektivId.replace(/\s/g,'')}`, `Tabelle: Performance von ${methodName} für ${getKollektivDisplayName(kollektivId)}`);
                }
            } else if (tableType === 'Vergleich' && subType === 'Performance') {
                const methods = params[2].split('vs');
                const method1 = methods[0];
                const method2 = methods[1];
                let comparisonData = null;
                let m1Name = '', m2Name = '';

                if (method1 === 'AS' && method2 === 'T2angewandt') {
                    comparisonData = kollektivStats?.vergleichASvsT2_angewandt;
                    m1Name = 'AS'; m2Name = 'Angewandte T2';
                } else if (method1 === 'AS' && method2 === 'T2optimiert') {
                    comparisonData = kollektivStats?.vergleichASvsT2_bruteforce;
                    m1Name = 'AS'; m2Name = `Optimierte T2 (für ${commonData.bruteForceMetricForPublication})`;
                } else if (method1 === 'AS' && method2.startsWith('LitT2')) {
                    const litSetId = method2.substring('LitT2_'.length);
                    const litSet = studyT2CriteriaManager.getStudyCriteriaSetById(litSetId);
                    m1Name = 'AS'; m2Name = litSet?.name || litSetId;
                    comparisonData = kollektivStats?.[`vergleichASvsT2_literatur_${litSetId}`];
                }

                if (comparisonData) {
                    return uiComponents.createComparisonTestTable(comparisonData, m1Name, m2Name, `pub-table-comp-${method1}-${method2}-${kollektivId.replace(/\s/g,'')}`, `Tabelle: Stat. Vergleich ${m1Name} vs. ${m2Name} für ${getKollektivDisplayName(kollektivId)}`);
                }
            }
        } catch (e) {
            console.error(`Fehler beim Erstellen der Tabelle für Placeholder '${placeholder}':`, e);
            const errorP = ui_helpers.createElementWithAttributes('p', { class: 'text-danger text-center my-3' });
            errorP.innerHTML = `[Fehler beim Rendern von Tabelle: ${ui_helpers.escapeHTML(placeholder)}. Details siehe Konsole.]`;
            return errorP;
        }
        const notFoundP = ui_helpers.createElementWithAttributes('p', { class: 'text-warning text-center my-3' });
        notFoundP.innerHTML = `[Tabelle nicht implementiert oder Daten fehlen für: ${ui_helpers.escapeHTML(placeholder)}]`;
        return notFoundP;
    }

    function _createFigurePlaceholderDiv(placeholder, allStats, lang, commonData) {
        const parts = placeholder.replace(/[{}]/g, '').split(':');
        if (parts.length < 2 || parts[0] !== 'Figure') return null;

        const params = parts[1].split('_');
        const figureType = params[0];
        const subType = params.length > 2 ? params.slice(1, params.length-1).join('_') : null;
        const kollektivId = params[params.length-1];

        const chartId = `pub-chart-${figureType.toLowerCase()}${subType ? `-${subType.toLowerCase()}` : ''}-${kollektivId.replace(/\s/g, '').toLowerCase()}`;
        const figureDiv = ui_helpers.createElementWithAttributes('figure', { class: 'publication-figure my-4 text-center' });
        const chartContainerDiv = ui_helpers.createElementWithAttributes('div', { id: chartId, class: 'publication-chart-render-area mx-auto', style: 'max-width: 600px; min-height:350px; border: 1px solid #eee; padding:10px;' });
        const figcaption = ui_helpers.createElementWithAttributes('figcaption', { class: 'figure-caption text-center mt-2' });
        figcaption.textContent = `Abbildung: ${figureType} ${subType || ''} für Kollektiv ${getKollektivDisplayName(kollektivId)} (Platzhalter für Beschriftung).`;

        figureDiv.appendChild(chartContainerDiv);
        figureDiv.appendChild(figcaption);

        figureDiv.dataset.chartRenderInfo = JSON.stringify({
            chartIdToRender: figureType,
            subType: subType,
            kollektivId: kollektivId,
            targetDivId: chartId
        });
        return figureDiv;
    }


    function renderPublicationSection(sectionId, lang, allStats, commonData) {
        const wrapper = ui_helpers.createElementWithAttributes('div', { class: 'publication-section-content' });
        let markdownContent = '';
        try {
            markdownContent = publicationTextGenerator.getSectionTextAsMarkdown(sectionId, lang, allStats, commonData);
        } catch (error) {
            console.error(`Fehler beim Abrufen des Markdown-Textes für Sektion ${sectionId}:`, error);
            wrapper.innerHTML = `<div class="alert alert-danger">Fehler beim Laden des Textgenerators für Sektion '${sectionId}'.</div>`;
            return wrapper;
        }

        let htmlContent = _basicMarkdownToHtml(markdownContent);

        const placeholderRegex = /\{(Table|Figure):([a-zA-Z0-9_]+)\}/g;
        let match;
        const elementsToReplace = [];

        while ((match = placeholderRegex.exec(htmlContent)) !== null) {
            elementsToReplace.push({ placeholder: match[0], type: match[1], params: match[2] });
        }
        
        let tempDiv = ui_helpers.createElementWithAttributes('div');
        tempDiv.innerHTML = htmlContent;

        elementsToReplace.forEach(item => {
            const placeholderNode = Array.from(tempDiv.querySelectorAll('* , #text'))
                                   .find(node => node.textContent && node.textContent.includes(item.placeholder));
            
            if (placeholderNode) {
                let renderedElement = null;
                if (item.type === 'Table') {
                    renderedElement = _renderTableFromPlaceholder(item.placeholder, allStats, lang, commonData);
                } else if (item.type === 'Figure') {
                    renderedElement = _createFigurePlaceholderDiv(item.placeholder, allStats, lang, commonData);
                }

                if (renderedElement) {
                    if (placeholderNode.textContent === item.placeholder && placeholderNode.parentNode) {
                        placeholderNode.parentNode.replaceChild(renderedElement, placeholderNode);
                    } else if (placeholderNode.innerHTML && placeholderNode.innerHTML.includes(item.placeholder)) {
                        placeholderNode.innerHTML = placeholderNode.innerHTML.replace(item.placeholder, renderedElement.outerHTML);
                    } else if (placeholderNode.textContent && placeholderNode.textContent.includes(item.placeholder)){
                         const parts = placeholderNode.textContent.split(item.placeholder);
                         const newFragment = document.createDocumentFragment();
                         newFragment.appendChild(document.createTextNode(parts[0]));
                         newFragment.appendChild(renderedElement);
                         if (parts.length > 1) newFragment.appendChild(document.createTextNode(parts[1]));
                         if(placeholderNode.parentNode) placeholderNode.parentNode.replaceChild(newFragment, placeholderNode);
                    }
                } else {
                    const errorP = ui_helpers.createElementWithAttributes('p', { class: 'text-danger' });
                    errorP.textContent = `[Platzhalter ${item.placeholder} konnte nicht gerendert werden.]`;
                    if (placeholderNode.parentNode) placeholderNode.parentNode.replaceChild(errorP, placeholderNode);
                }
            }
        });

        wrapper.appendChild(tempDiv);
        return wrapper;
    }

    return Object.freeze({
        renderPublicationSection
    });

})();
