const publicationTabRenderer = (() => {

    function _createSingleTableHTML(tableData, lang, sectionId) {
        if (!tableData || !Array.isArray(tableData.headers) || !Array.isArray(tableData.rows)) {
            return `<p class="text-muted small">${lang === 'de' ? 'Tabellendaten fehlerhaft oder nicht verfügbar.' : 'Table data erroneous or not available.'}</p>`;
        }
        const tableId = `pub-table-${sectionId}-${ui_helpers.generateUUID ? ui_helpers.generateUUID() : Date.now()}`;
        let tableHTML = `<div class="table-responsive mb-3 publication-table-container">`;

        if (tableData.title) {
            tableHTML += `<h6 class="publication-table-title">${ui_helpers.escapeMarkdown(tableData.title)}</h6>`;
        }

        tableHTML += `<table class="table table-sm table-bordered table-hover small publication-table" id="${tableId}">`;
        if (tableData.caption) {
             tableHTML += `<caption class="publication-table-caption">${ui_helpers.escapeMarkdown(tableData.caption)}</caption>`;
        }
        tableHTML += `<thead><tr>`;
        tableData.headers.forEach(header => {
            const headerText = (typeof header === 'object' && header !== null && header.text !== undefined) ? header.text : String(header);
            const tooltipContent = (typeof header === 'object' && header !== null && header.tooltip !== undefined) ? header.tooltip : String(headerText);
            tableHTML += `<th data-tippy-content="${ui_helpers.escapeMarkdown(tooltipContent)}">${ui_helpers.escapeMarkdown(String(headerText))}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;
        if (tableData.rows.length === 0) {
            tableHTML += `<tr><td colspan="${tableData.headers.length}" class="text-center text-muted">${lang === 'de' ? 'Keine Datenzeilen für diese Tabelle.' : 'No data rows for this table.'}</td></tr>`;
        } else {
            tableData.rows.forEach(row => {
                tableHTML += `<tr>`;
                (row || []).forEach((cell, index) => {
                    const headerDef = tableData.headers[index];
                    const cellText = (cell === null || cell === undefined) ? (lang === 'de' ? 'N/V' : 'N/A') : String(cell);
                    let cellTooltip = cellText;

                    if (typeof headerDef === 'object' && headerDef !== null && headerDef.cell_tooltip_template) {
                        cellTooltip = String(headerDef.cell_tooltip_template).replace(/\[CELL_VALUE\]/g, cellText);
                    } else if (typeof headerDef === 'object' && headerDef !== null && headerDef.tooltip) {
                        cellTooltip = `${headerDef.tooltip} Wert: ${cellText}`;
                    } else if (typeof headerDef === 'string') {
                        cellTooltip = `${String(headerDef)}: ${cellText}`;
                    }

                    tableHTML += `<td data-tippy-content="${ui_helpers.escapeMarkdown(cellTooltip)}">${cellText}</td>`;
                });
                tableHTML += `</tr>`;
            });
        }
        tableHTML += `</tbody></table>`;
        if (tableData.notes) {
            tableHTML += `<p class="small text-muted mt-1 publication-table-notes">${ui_helpers.escapeMarkdown(tableData.notes)}</p>`;
        }
        tableHTML += `</div>`;
        return tableHTML;
    }

    function _renderChartsForPublication(chartsToRender, lang) {
        if (!Array.isArray(chartsToRender) || chartsToRender.length === 0) return;
        if (typeof chartRenderer === 'undefined' || !chartRenderer) {
            console.error("chartRenderer ist nicht verfügbar.");
            chartsToRender.forEach(chartInfo => {
                const chartContainer = document.getElementById(chartInfo.chartId);
                if (chartContainer) ui_helpers.updateElementHTML(chartInfo.chartId, `<p class="text-danger small">${lang === 'de' ? 'Chart Renderer nicht geladen.' : 'Chart Renderer not loaded.'}</p>`);
            });
            return;
        }

        chartsToRender.forEach(chartInfo => {
            const chartContainer = document.getElementById(chartInfo.chartId);
            if (chartContainer) {
                chartContainer.innerHTML = '';
                try {
                    const defaultChartHeight = chartInfo.type === 'roc' ? (APP_CONFIG.CHART_SETTINGS.DEFAULT_ROC_HEIGHT || 380) : (APP_CONFIG.CHART_SETTINGS.DEFAULT_BAR_HEIGHT || 350);
                    const chartOptions = {
                        ...(chartInfo.options || {}),
                        width: chartContainer.clientWidth || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH,
                        height: chartInfo.options?.height || defaultChartHeight,
                        margin: chartInfo.options?.margin || APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN,
                        title: chartInfo.options?.title || (lang === 'de' ? 'Diagramm' : 'Chart')
                    };

                    switch (chartInfo.type) {
                        case 'bar':
                            chartRenderer.renderASPerformanceChart(chartInfo.chartId, chartInfo.data, chartOptions, chartInfo.options?.kollektivName || '');
                            break;
                        case 'groupedBar':
                             chartRenderer.renderComparisonBarChart(chartInfo.data, chartInfo.chartId, chartOptions, chartInfo.options?.t2Label || 'T2');
                            break;
                        case 'roc':
                             chartRenderer.renderROCCurve(chartInfo.data, chartInfo.chartId, chartOptions);
                            break;
                        default:
                            ui_helpers.updateElementHTML(chartInfo.chartId, `<p class="text-warning small">${lang === 'de' ? 'Unbekannter Diagrammtyp angefordert' : 'Unknown chart type requested'}: ${chartInfo.type}</p>`);
                    }
                } catch (e) {
                    ui_helpers.updateElementHTML(chartInfo.chartId, `<p class="text-danger small">${lang === 'de' ? 'Fehler beim Rendern von Diagramm' : 'Error rendering chart'} ${chartInfo.chartId}: ${e.message}</p>`);
                    console.error(`Chart render error for ${chartInfo.chartId}:`, e);
                }
            } else {
                console.warn(`Chart-Container #${chartInfo.chartId} nicht im DOM gefunden.`);
            }
        });
    }

    function renderPublikationTabContent(currentLang, currentSection, allProcessedData, activeTabPaneId = 'publikation-tab-pane') {
        if (typeof publicationLogic === 'undefined' || typeof publicationLogic.getPublicationSectionContent !== 'function') {
            return '<p class="text-danger">publicationLogic ist nicht verfügbar. Stellen Sie sicher, dass alle Skripte geladen wurden.</p>';
        }
        if (typeof uiComponents === 'undefined' || typeof uiComponents.createPublikationTabSteuerung !== 'function' || typeof uiComponents.createPublikationSectionTextCard !== 'function' || typeof uiComponents.createPublikationSectionDataCard !== 'function') {
             return '<p class="text-danger">UI Komponenten für den Publikations-Tab sind nicht verfügbar.</p>';
        }

        const navHTML = uiComponents.createPublikationTabSteuerung(currentSection, currentLang);
        let contentHTML = '';
        const naText = currentLang === 'de' ? 'N/V' : 'N/A';

        try {
            const sectionData = publicationLogic.getPublicationSectionContent(currentSection, currentLang, allProcessedData);

            const textCardId = `pub-text-card-${currentSection}-${ui_helpers.generateUUID ? ui_helpers.generateUUID() : Date.now()}`;
            const dataCardId = `pub-data-card-${currentSection}-${ui_helpers.generateUUID ? ui_helpers.generateUUID() : Date.now() +1}`;

            let textCardTitleKey = currentSection === 'methoden' ? 'methodenCardTitle' : 'ergebnisseCardTitle';
            const textCardTitle = UI_TEXTS.publikationTab[textCardTitleKey]?.[currentLang] || (currentLang === 'de' ? 'Textabschnitt' : 'Text Section');
            const dataCardTitle = UI_TEXTS.publikationTab.publicationDataCardTitle?.[currentLang] || (currentLang === 'de' ? 'Unterstützende Daten & Visualisierungen' : 'Supporting Data & Visualizations');

            contentHTML += uiComponents.createPublikationSectionTextCard(textCardTitleKey, sectionData.mainTextHTML || `<p class="text-muted">${currentLang === 'de' ? 'Kein Textinhalt verfügbar.' : 'No text content available.'}</p>`, textCardId, null, currentLang);

            let supportingDataHTML = '';
            const chartsToRenderLater = [];

            if (sectionData.supportingData && Array.isArray(sectionData.supportingData.tables) && sectionData.supportingData.tables.length > 0) {
                supportingDataHTML += sectionData.supportingData.tables.map(tableObj => _createSingleTableHTML(tableObj, currentLang, currentSection)).join('');
            }

            if (sectionData.supportingData && Array.isArray(sectionData.supportingData.charts) && sectionData.supportingData.charts.length > 0) {
                sectionData.supportingData.charts.forEach(chartInfo => {
                    if (!chartInfo || !chartInfo.type || !chartInfo.data) {
                        console.warn("Ungültige Chart-Info von publicationLogic erhalten:", chartInfo);
                        return;
                    }
                    const chartPlaceholderId = chartInfo.chartId || `pub-chart-${currentSection}-${ui_helpers.generateUUID ? ui_helpers.generateUUID() : Date.now() + Math.random()}`;
                    chartInfo.chartId = chartPlaceholderId;
                    chartsToRenderLater.push(cloneDeep(chartInfo));

                    const chartTitleText = chartInfo.options?.title || (currentLang === 'de' ? 'Diagramm' : 'Chart');
                    const downloadPngTooltip = UI_TEXTS.singleChartDownload.pngLabel || 'Als PNG';
                    const downloadSvgTooltip = UI_TEXTS.singleChartDownload.svgLabel || 'Als SVG';
                    const downloadButtonsHTML = `
                        <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" data-chart-id="${chartPlaceholderId}" data-format="png" data-tippy-content="${downloadPngTooltip}" aria-label="${downloadPngTooltip}">
                            <i class="fas fa-image fa-fw"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" data-chart-id="${chartPlaceholderId}" data-format="svg" data-tippy-content="${downloadSvgTooltip}" aria-label="${downloadSvgTooltip}">
                            <i class="fas fa-file-code fa-fw"></i>
                        </button>`;

                    supportingDataHTML += `
                        <div class="publication-chart-placeholder-wrapper mb-4">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <h6 class="publication-chart-title mb-0">${ui_helpers.escapeMarkdown(chartTitleText)}</h6>
                                <span class="card-header-buttons">${downloadButtonsHTML}</span>
                            </div>
                            <div id="${chartPlaceholderId}" class="publication-chart-placeholder" style="min-height: ${chartInfo.options?.height || (APP_CONFIG.CHART_SETTINGS.DEFAULT_BAR_HEIGHT || 350)}px; width: 100%; border: 1px dashed var(--border-color); background-color: var(--bg-light-gray);">
                                <p class="text-muted small p-3 text-center">${currentLang === 'de' ? 'Lade Diagramm...' : 'Loading chart...'}</p>
                            </div>
                        </div>`;
                });
            }

            if (supportingDataHTML.trim() === '') {
                supportingDataHTML = `<p class="text-muted small">${currentLang === 'de' ? 'Keine unterstützenden Daten oder Visualisierungen für diesen Abschnitt generiert.' : 'No supporting data or visualizations generated for this section.'}</p>`;
            }

            contentHTML += uiComponents.createPublikationSectionDataCard(
                'publicationDataCardTitle',
                supportingDataHTML,
                dataCardId,
                null,
                currentLang
            );

            setTimeout(() => {
                _renderChartsForPublication(chartsToRenderLater, currentLang);
                const tabPaneElement = document.getElementById(activeTabPaneId);
                if (tabPaneElement) {
                    ui_helpers.initializeTooltips(tabPaneElement);
                } else {
                     console.warn(`Tab-Pane '${activeTabPaneId}' für Tooltip-Initialisierung nicht gefunden im publicationTabRenderer.`);
                     ui_helpers.initializeTooltips(document.body);
                }
            }, 100);


        } catch (e) {
            console.error("Fehler im publicationTabRenderer beim Aufruf von publicationLogic:", e);
            contentHTML = `<div class="alert alert-danger">${currentLang === 'de' ? 'Ein Fehler ist beim Laden der Inhalte für den Publikations-Abschnitt aufgetreten:' : 'An error occurred while loading content for the publication section:'} ${e.message}</div>`;
        }

        return navHTML + `<div id="publikation-section-content-area" class="mt-3">${contentHTML}</div>`;
    }


    return Object.freeze({
        renderPublikationTabContent
    });

})();