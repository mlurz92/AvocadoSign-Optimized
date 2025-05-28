const chartManager = (() => {

    async function exportChart(chartContainerId, format, kollektiv, chartNameForFilenamePrefix = 'Chart') {
        if (!exportService) {
            ui_helpers.showToast("ExportService nicht verfügbar.", "danger");
            return;
        }
        if (!APP_CONFIG || !state) {
            ui_helpers.showToast("Konfiguration oder State nicht verfügbar.", "danger");
            return;
        }

        const svgElement = document.getElementById(chartContainerId)?.querySelector('svg');
        if (!svgElement) {
            ui_helpers.showToast(`Diagramm-SVG im Container '${chartContainerId}' nicht gefunden.`, "warning");
            return;
        }

        const chartNameFromTitle = svgElement.closest('.card')?.querySelector('.card-header')?.textContent?.trim()
                                 || svgElement.closest('[data-chart-title]')?.dataset.chartTitle
                                 || chartNameForFilenamePrefix;

        const sanitizedChartName = chartNameFromTitle.replace(/[^a-zA-Z0-9_-]/gi, '_').substring(0, 30);

        const options = {};
        let filenameKey;
        let exportFunction;

        if (format === 'png') {
            options.dpi = state.getCurrentPngExportDpi ? state.getCurrentPngExportDpi() : APP_CONFIG.DEFAULT_SETTINGS.PNG_EXPORT_DPI;
            filenameKey = 'CHART_SINGLE_PNG';
            exportFunction = exportService.exportSingleChart;
        } else if (format === 'svg') {
            options.svgEmbedFonts = state.getCurrentSvgEmbedFonts ? state.getCurrentSvgEmbedFonts() : APP_CONFIG.DEFAULT_SETTINGS.SVG_EXPORT_EMBED_FONTS;
            options.svgInlineStyles = state.getCurrentSvgInlineStyles ? state.getCurrentSvgInlineStyles() : APP_CONFIG.DEFAULT_SETTINGS.SVG_EXPORT_INLINE_STYLES;
            filenameKey = 'CHART_SINGLE_SVG';
            exportFunction = exportService.exportSingleChart;
        } else {
            ui_helpers.showToast(`Ungültiges Exportformat: ${format}`, "danger");
            return;
        }

        const currentKollektiv = kollektiv || state.getCurrentKollektiv();

        try {
            await exportFunction(chartContainerId, format, currentKollektiv, options);
        } catch (error) {
            ui_helpers.showToast(`Fehler beim Export von Diagramm '${sanitizedChartName}' als ${format.toUpperCase()}.`, 'danger');
        }
    }

    function addChartExportButtons(chartContainerId, kollektiv, chartNameForFilenamePrefix = 'Chart', targetElementSelector = null) {
        const container = document.getElementById(chartContainerId);
        if (!container) return;

        let buttonContainer;
        if (targetElementSelector) {
            buttonContainer = container.querySelector(targetElementSelector);
        }

        if (!buttonContainer) {
            const cardHeader = container.closest('.card')?.querySelector('.card-header .card-header-buttons');
            if (cardHeader) {
                buttonContainer = cardHeader;
            } else {
                buttonContainer = ui_helpers.createElementWithAttributes('div', { class: 'chart-export-buttons text-end mt-1 mb-1' });
                container.insertAdjacentElement('afterend', buttonContainer);
            }
        }
        buttonContainer.innerHTML = '';

        const btnPng = uiComponents.createButton({
            text: '',
            iconClass: 'fas fa-file-image',
            btnClass: 'btn-outline-secondary btn-sm chart-download-btn',
            tooltipKey: 'tooltip.exportTab.chartSinglePNG',
            extraAttributes: {'aria-label': 'Als PNG exportieren'},
            onClick: () => exportChart(chartContainerId, 'png', kollektiv, chartNameForFilenamePrefix)
        });

        const btnSvg = uiComponents.createButton({
            text: '',
            iconClass: 'fas fa-file-code',
            btnClass: 'btn-outline-secondary btn-sm chart-download-btn ms-1',
            tooltipKey: 'tooltip.exportTab.chartSingleSVG',
            extraAttributes: {'aria-label': 'Als SVG exportieren'},
            onClick: () => exportChart(chartContainerId, 'svg', kollektiv, chartNameForFilenamePrefix)
        });

        buttonContainer.appendChild(btnPng);
        buttonContainer.appendChild(btnSvg);
        if(typeof ui_helpers !== 'undefined' && typeof ui_helpers.initTooltips === 'function') {
            ui_helpers.initTooltips(buttonContainer);
        }
    }

    function manageChartContainer(containerId, chartRenderFunction, data, options = {}) {
         const chartContainer = document.getElementById(containerId);
         if (!chartContainer) {
             console.warn(`Chart-Container mit ID '${containerId}' nicht gefunden.`);
             if (options.showLoadingError !== false) {
                  ui_helpers.showLoadingSpinner(containerId, `Fehler: Container '${containerId}' nicht gefunden.`);
             }
             return;
         }

         ui_helpers.showLoadingSpinner(containerId);

         try {
            const chartRendered = chartRenderFunction(containerId, data, options);
            if (chartRendered === false && options.showLoadingError !== false) {
                 ui_helpers.showLoadingSpinner(containerId, `Keine Daten für Diagramm '${containerId}' verfügbar.`);
            } else if (chartRendered !== false) {
                 hideLoadingSpinnerWithCheck(containerId);
                 if(options.enableExport !== false) {
                     addChartExportButtons(containerId, options.kollektivForExport || state.getCurrentKollektiv(), options.chartNameForFilename || containerId.replace(/^chart-/, ''));
                 }
            }
         } catch (error) {
             console.error(`Fehler beim Rendern von Diagramm '${containerId}':`, error);
             if (options.showLoadingError !== false) {
                  ui_helpers.showLoadingSpinner(containerId, `Fehler beim Rendern von Diagramm '${containerId}'. Details in Konsole.`);
             }
         }
    }

    function hideLoadingSpinnerWithCheck(containerId) {
        const container = document.getElementById(containerId);
        if (container && container.querySelector('.spinner-border')) {
            container.innerHTML = '';
        } else if (container && container.firstChild && container.firstChild.id === `spinner-${containerId}`) {
            container.innerHTML = '';
        }
    }


    return Object.freeze({
        exportChartAsPNG: (chartContainerId, kollektiv, chartName) => exportChart(chartContainerId, 'png', kollektiv, chartName),
        exportChartAsSVG: (chartContainerId, kollektiv, chartName) => exportChart(chartContainerId, 'svg', kollektiv, chartName),
        addChartExportButtons,
        manageChartContainer
    });

})();
