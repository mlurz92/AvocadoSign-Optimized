const praesentationTabRenderer = (() => {

    function _createViewAndStudySelectControls(currentView, currentStudyId, currentKollektiv, appliedCriteria) {
        let html = `<div class="row mb-4 align-items-end">
                        <div class="col-md-5 mb-3 mb-md-0">
                            <label class="form-label fw-bold">${UI_TEXTS.praesentationTab.viewSelect.label}:</label>
                            <div data-tippy-content="${TOOLTIP_CONTENT.praesentation.viewSelect.description}">`;

        const views = [
            { value: 'as-pur', label: UI_TEXTS.praesentationTab.viewSelect.asPurLabel, icon: 'fa-bullseye' },
            { value: 'as-vs-t2', label: UI_TEXTS.praesentationTab.viewSelect.asVsT2Label, icon: 'fa-balance-scale-right' }
        ];

        views.forEach(view => {
            const isChecked = view.value === currentView;
            html += `<div class="form-check form-check-inline">
                        <input class="form-check-input praes-view-radio" type="radio" name="praesentationAnsicht" id="praes-ansicht-${view.value}" value="${view.value}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label praes-view-btn" for="praes-ansicht-${view.value}"><i class="fas ${view.icon} fa-fw me-1"></i>${view.label}</label>
                     </div>`;
        });
        html += `</div></div>`;

        const studySelectDisplay = currentView === 'as-vs-t2' ? 'block' : 'none';
        html += `<div class="col-md-7" id="praes-study-select-group" style="display: ${studySelectDisplay};">
                    <label for="praes-study-select" class="form-label fw-bold">${UI_TEXTS.praesentationTab.studySelect.label}:</label>
                    <select class="form-select" id="praes-study-select" data-tippy-content="${TOOLTIP_CONTENT.praesentation.studySelect.description}">`;

        const appliedCriteriaName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME || "Aktuell angewandte Kriterien";
        html += `<option value="${APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID}" ${currentStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID ? 'selected' : ''}>${appliedCriteriaName}</option>`;

        if (typeof studyT2CriteriaManager !== 'undefined') {
            const literatureSets = studyT2CriteriaManager.getAllStudyCriteriaSetsSorted();
            literatureSets.forEach(set => {
                html += `<option value="${set.id}" ${currentStudyId === set.id ? 'selected' : ''}>${set.displayShortName || set.name}</option>`;
            });
        }
        html += `</select></div></div>`;
        return html;
    }

    function _createCardHTML(cardId, title, contentPlaceholderId, downloadButtonIds = [], extraCardClasses = '', cardTooltipKey = null, isInitiallyHidden = false) {
        let buttonsHTML = '';
        if (downloadButtonIds && downloadButtonIds.length > 0) {
            buttonsHTML += '<div class="card-header-buttons">';
            downloadButtonIds.forEach(btn => {
                const btnId = btn.id || `dl-${contentPlaceholderId.replace(/[^a-zA-Z0-9_-]/g, '')}-${btn.format || 'action'}`;
                const iconClass = btn.icon || 'fa-download';
                let tooltip = btn.tooltip || `Als ${String(btn.format || 'Aktion').toUpperCase()} herunterladen`;

                const safeDefaultTitle = String(title).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const safeChartName = String(btn.chartName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);
                const safeTableName = String(btn.tableName || safeDefaultTitle).replace(/[^a-zA-Z0-9_-\s]/gi, '').substring(0, 50);

                if (btn.format === 'png' && btn.chartId && TOOLTIP_CONTENT.exportTab.CHART_SINGLE_PNG?.description) {
                    tooltip = TOOLTIP_CONTENT.exportTab.CHART_SINGLE_PNG.description.replace('{ChartName}', `<strong>${safeChartName}</strong>`);
                } else if (btn.format === 'svg' && btn.chartId && TOOLTIP_CONTENT.exportTab.CHART_SINGLE_SVG?.description) {
                    tooltip = TOOLTIP_CONTENT.exportTab.CHART_SINGLE_SVG.description.replace('{ChartName}', `<strong>${safeChartName}</strong>`);
                } else if (btn.format === 'png' && btn.tableId && TOOLTIP_CONTENT.exportTab.TABLE_PNG_EXPORT?.description) {
                    tooltip = TOOLTIP_CONTENT.exportTab.TABLE_PNG_EXPORT.description.replace('{TableName}', `<strong>${safeTableName}</strong>`);
                }


                const dataAttributes = [];
                if (btn.chartId) dataAttributes.push(`data-chart-id="${btn.chartId}"`);
                if (btn.tableId) dataAttributes.push(`data-table-id="${btn.tableId}"`);
                
                if (btn.tableName) dataAttributes.push(`data-table-name="${safeTableName.replace(/\s/g, '_')}"`);
                else if (btn.chartId) dataAttributes.push(`data-chart-name="${safeChartName.replace(/\s/g, '_')}"`);
                else dataAttributes.push(`data-default-name="${safeDefaultTitle.replace(/\s/g, '_')}"`);


                if (btn.format) dataAttributes.push(`data-format="${btn.format}"`);

                return `<button class="btn btn-sm btn-outline-secondary ms-1 ${btn.extraClass || ''}" id="${btnId}" ${dataAttributes.join(' ')} data-tippy-content="${tooltip}" ${btn.disabled ? 'disabled' : ''}><i class="fas ${iconClass} fa-fw"></i> ${btn.label || ''}</button>`;
            }).join('');
        }

        const tooltipText = cardTooltipKey && TOOLTIP_CONTENT.praesentation[cardTooltipKey] ? TOOLTIP_CONTENT.praesentation[cardTooltipKey].description.replace('[CURRENT_KOLLEKTIV_PRAES]', getKollektivDisplayName(window.stateManager.getCurrentKollektivForPresentation() || window.stateManager.getCurrentKollektiv())) : title;
        const displayStyle = isInitiallyHidden ? 'style="display: none;"' : '';

        return `
            <div class="card praesentation-card mb-4 ${extraCardClasses}" id="${cardId}" ${displayStyle} data-tippy-content="${tooltipText}">
                <div class="card-header">
                    <h5 class="mb-0 card-title-praes">${title}</h5>
                    ${buttonsHTML}
                </div>
                <div class="card-body p-0" id="${contentPlaceholderId}">
                    <p class="text-muted text-center p-3">Inhalt wird geladen...</p>
                </div>
            </div>`;
    }


    function renderPresentationTab(currentView, currentStudyId, currentKollektiv, processedData, appliedCriteria, appliedLogic) {
        if (typeof window.uiComponents === 'undefined' || typeof window.TOOLTIP_CONTENT === 'undefined' || typeof window.UI_TEXTS === 'undefined' || typeof window.APP_CONFIG === 'undefined' || typeof window.stateManager === 'undefined') {
            console.error("Abhängigkeiten für praesentationTabRenderer nicht vollständig geladen.");
            return '<p class="text-danger p-3">Fehler: Wichtige UI Komponenten für den Präsentation-Tab nicht geladen.</p>';
        }
        let html = _createViewAndStudySelectControls(currentView, currentStudyId, currentKollektiv, appliedCriteria);
        html += `<div id="praesentation-content-area" class="mt-4">`;

        const t2BasisInfoDownloads = [
            { id: 'download-praes-t2-info-md', label: 'MD', icon: 'fa-file-alt'}
        ];
        html += _createCardHTML(
            'praes-t2-basis-info-card',
            UI_TEXTS.praesentationTab.t2BasisInfoCard.title,
            'praes-t2-basis-info-content',
            t2BasisInfoDownloads,
            '',
            't2BasisInfoCard',
            currentView !== 'as-vs-t2'
        );

        const demographieDownloads = [
            { id: 'download-praes-demographics-table-png', label: 'PNG', icon: 'fa-image', extraClass: 'table-download-png-btn', tableIdAttribute: 'praes-demographics-table'},
            { id: 'download-praes-demographics-md', label: 'MD', icon: 'fa-file-alt'}
        ];
        html += _createCardHTML(
            'praes-demographics-card',
            UI_TEXTS.praesentationTab.demographicsCard.title,
            'praes-demographics-content',
            demographieDownloads,
            '',
            'demographicsCard',
            currentView === 'as-vs-t2'
        );

        const asPerfDownloads = [
            { id: 'download-praes-as-perf-table-png', label: 'PNG', icon: 'fa-image', extraClass: 'table-download-png-btn', tableIdAttribute: 'praes-as-perf-table' },
            { id: 'download-praes-as-perf-csv', label: 'CSV', icon: 'fa-file-csv' },
            { id: 'download-praes-as-perf-md', label: 'MD', icon: 'fa-file-alt' }
        ];
        html += _createCardHTML(
            'praes-as-performance-card',
            UI_TEXTS.praesentationTab.asPerformanceCard.title,
            'praes-as-performance-content',
            asPerfDownloads,
            '',
            'asPerformanceCard',
            currentView === 'as-vs-t2'
        );

        html += `<div class="presentation-comparison-row" id="praes-as-vs-t2-comparison-row" ${currentView !== 'as-vs-t2' ? 'style="display:none;"' : ''}>
                    <div class="col-lg-7 presentation-comparison-col-left">`;

        const compTableDownloads = [
            { id: 'download-praes-comp-table-png', label: 'PNG', icon: 'fa-image', extraClass: 'table-download-png-btn', tableIdAttribute: 'praes-as-vs-t2-perf-table'},
            { id: 'download-praes-comp-table-csv', label: 'CSV', icon: 'fa-file-csv'},
            { id: 'download-praes-comp-table-md', label: 'MD', icon: 'fa-file-alt'}
        ];
        html += _createCardHTML(
            'praes-as-vs-t2-perf-card',
            UI_TEXTS.praesentationTab.asVsT2PerformanceCard.title,
            'praes-as-vs-t2-perf-content',
            compTableDownloads,
            '',
            'asVsT2PerformanceCard'
        );

        const compTestDownloads = [
            { id: 'download-praes-comp-tests-table-png', label: 'PNG', icon: 'fa-image', extraClass: 'table-download-png-btn', tableIdAttribute: 'praes-as-vs-t2-tests-table'},
            { id: 'download-praes-comp-tests-md', label: 'MD', icon: 'fa-file-alt' }
        ];
        html += _createCardHTML(
            'praes-as-vs-t2-tests-card',
            UI_TEXTS.praesentationTab.asVsT2TestsCard.title,
            'praes-as-vs-t2-tests-content',
            compTestDownloads,
            '',
            'asVsT2TestsCard'
        );
        html += `   </div>
                    <div class="col-lg-5 presentation-comparison-col-right">`;

        const compChartDownloads = [
             { id: 'download-praes-comp-chart-png', label: 'PNG', icon: 'fa-image', extraClass: 'chart-download-btn', chartIdAttribute: 'praes-as-vs-t2-comparison-chart-area', formatAttribute: 'png'},
             { id: 'download-praes-comp-chart-svg', label: 'SVG', icon: 'fa-file-alt', extraClass: 'chart-download-btn', chartIdAttribute: 'praes-as-vs-t2-comparison-chart-area', formatAttribute: 'svg'}
        ];
        html += _createCardHTML(
            'praes-as-vs-t2-chart-card',
            UI_TEXTS.praesentationTab.asVsT2ChartCard.title,
            'praes-as-vs-t2-chart-content',
            compChartDownloads,
            '',
            'asVsT2ChartCard'
        );
        html += `       </div>
                 </div>`;

        html += `</div>`;
        return html;
    }

    return Object.freeze({
        renderPresentationTab
    });
})();
