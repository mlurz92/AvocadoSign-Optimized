window.exportTabLogic = (() => {
    const TAB_ID = 'export-tab-pane';
    let currentKollektiv = null;
    let currentRawData = null;
    let currentAppliedT2Criteria = null;
    let currentAppliedT2Logic = null;
    let currentBruteForceResults = null;

    function initializeExportTab() {
        currentKollektiv = state.getCurrentKollektiv();
        currentRawData = kollektivStore.getAllProcessedData();
        currentAppliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        currentAppliedT2Logic = t2CriteriaManager.getAppliedLogic();
        currentBruteForceResults = bruteForceManager.getAllResults();
        renderExportTab();
        setupExportTabEventHandlers();
    }

    function renderExportTab() {
        const tabContainer = document.getElementById(TAB_ID);
        if (!tabContainer) {
            ui_helpers.showLoadingSpinner(TAB_ID, `Container '${TAB_ID}' nicht gefunden.`);
            return;
        }
        tabContainer.innerHTML = '';

        const header = ui_helpers.createElementWithAttributes('p', { class: 'lead text-center mb-4' });
        header.innerHTML = `Datenexport für Kollektiv: <span class="fw-bold text-primary">${getKollektivDisplayName(currentKollektiv)}</span>`;
        tabContainer.appendChild(header);

        const exportOptionsContainer = ui_helpers.createElementWithAttributes('div', { class: 'row g-4 export-options-container' });

        exportOptionsContainer.appendChild(createSingleExportsCard());
        exportOptionsContainer.appendChild(createZipPackagesCard());
        exportOptionsContainer.appendChild(createExportSettingsCard());

        tabContainer.appendChild(exportOptionsContainer);
        ui_helpers.initTooltips(tabContainer);
    }

    function createSingleExportsCard() {
        const card = uiComponents.createCard({
            headerText: 'Einzelexporte',
            cardClass: 'shadow-sm',
            bodyClass: 'p-3'
        });
        const body = card.querySelector('.card-body');
        const listGroup = ui_helpers.createElementWithAttributes('div', { class: 'list-group list-group-flush' });

        const singleExportItems = [
            { id: 'btn-export-stats-csv', text: 'Statistik-Übersicht (CSV)', icon: 'fas fa-file-csv', tooltipKey: 'tooltip.exportTab.statsCSV', action: () => exportService.exportStatistikCSV(currentRawData, currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) },
            { id: 'btn-export-bruteforce-txt', text: 'Brute-Force Bericht (TXT)', icon: 'fas fa-file-alt', tooltipKey: 'tooltip.exportTab.bruteForceTXT', action: () => exportService.exportBruteForceReport(currentBruteForceResults ? currentBruteForceResults[currentKollektiv] : null, false) },
            { id: 'btn-export-bruteforce-full-csv', text: 'Brute-Force Rohdaten (CSV)', icon: 'fas fa-file-csv', tooltipKey: 'tooltip.exportTab.bruteForceFullCSV', action: () => exportService.exportBruteForceReport(currentBruteForceResults ? currentBruteForceResults[currentKollektiv] : null, true) },
            { id: 'btn-export-deskriptiv-md', text: 'Deskriptive Statistik (MD)', icon: 'fab fa-markdown', tooltipKey: 'tooltip.exportTab.deskriptivMD', action: () => exportService.exportTableMarkdown(statisticsService.calculateAllStatsForPublication(currentRawData, currentAppliedT2Criteria, currentAppliedT2Logic, currentBruteForceResults)[currentKollektiv]?.deskriptiv, 'deskriptiv', currentKollektiv) },
            { id: 'btn-export-daten-md', text: 'Datenliste (MD)', icon: 'fab fa-markdown', tooltipKey: 'tooltip.exportTab.datenMD', action: () => exportService.exportTableMarkdown(dataProcessor.filterDataByKollektiv(currentRawData, currentKollektiv), 'daten', currentKollektiv) },
            { id: 'btn-export-auswertung-md', text: 'Auswertungstabelle (MD)', icon: 'fab fa-markdown', tooltipKey: 'tooltip.exportTab.auswertungMD', action: () => exportService.exportTableMarkdown(t2CriteriaManager.evaluateDataset(dataProcessor.filterDataByKollektiv(currentRawData, currentKollektiv), currentAppliedT2Criteria, currentAppliedT2Logic), 'auswertung', currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) },
            { id: 'btn-export-filtered-data-csv', text: 'Gefilterte Rohdaten (CSV)', icon: 'fas fa-file-csv', tooltipKey: 'tooltip.exportTab.filteredDataCSV', action: () => exportService.exportFilteredDataCSV(dataProcessor.filterDataByKollektiv(currentRawData, currentKollektiv), currentKollektiv) },
            { id: 'btn-export-comprehensive-report', text: 'Umfassender Bericht (HTML)', icon: 'fas fa-file-code', tooltipKey: 'tooltip.exportTab.comprehensiveReportHTML', action: () => exportService.exportComprehensiveReportHTML(currentRawData, currentBruteForceResults ? currentBruteForceResults[currentKollektiv] : null, currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) }
        ];

        singleExportItems.forEach(item => {
            const button = uiComponents.createButton({
                id: item.id,
                text: item.text,
                iconClass: item.icon,
                btnClass: 'list-group-item list-group-item-action text-start',
                tooltipKey: item.tooltipKey,
                onClick: item.action
            });
            listGroup.appendChild(button);
        });
        body.appendChild(listGroup);
        const col = ui_helpers.createElementWithAttributes('div', { class: 'col-lg-6' });
        col.appendChild(card);
        return col;
    }

    function createZipPackagesCard() {
        const card = uiComponents.createCard({
            headerText: 'Export-Pakete (.zip)',
            cardClass: 'shadow-sm',
            bodyClass: 'p-3'
        });
        const body = card.querySelector('.card-body');
        const listGroup = ui_helpers.createElementWithAttributes('div', { class: 'list-group list-group-flush' });

        const zipExportItems = [
            { id: 'btn-export-all-zip', text: 'Alles (CSV, MD, TXT, HTML)', icon: 'fas fa-file-archive', tooltipKey: 'tooltip.exportTab.allZIP', action: () => exportService.exportCategoryZip('all-zip', currentRawData, currentBruteForceResults, currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) },
            { id: 'btn-export-csv-zip', text: 'Alle CSV-Dateien', icon: 'fas fa-file-csv', tooltipKey: 'tooltip.exportTab.csvZIP', action: () => exportService.exportCategoryZip('csv-zip', currentRawData, currentBruteForceResults, currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) },
            { id: 'btn-export-md-zip', text: 'Alle Markdown-Dateien', icon: 'fab fa-markdown', tooltipKey: 'tooltip.exportTab.mdZIP', action: () => exportService.exportCategoryZip('md-zip', currentRawData, currentBruteForceResults, currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) },
            { id: 'btn-export-png-zip', text: 'Diagramme & Tabellen (PNG)', icon: 'fas fa-file-image', tooltipKey: 'tooltip.exportTab.pngZIP', action: () => exportService.exportCategoryZip('png-zip', currentRawData, currentBruteForceResults, currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) },
            { id: 'btn-export-svg-zip', text: 'Diagramme (SVG)', icon: 'fas fa-file-code', tooltipKey: 'tooltip.exportTab.svgZIP', action: () => exportService.exportCategoryZip('svg-zip', currentRawData, currentBruteForceResults, currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) },
            { id: 'btn-export-publication-charts-zip', text: 'Publikations-Charts (PNG+SVG)', icon: 'fas fa-photo-video', tooltipKey: 'tooltip.exportTab.publicationChartsZIP', action: () => exportService.exportCategoryZip('publication-charts-zip', currentRawData, currentBruteForceResults, currentKollektiv, currentAppliedT2Criteria, currentAppliedT2Logic) }
        ];

        zipExportItems.forEach(item => {
            const button = uiComponents.createButton({
                id: item.id,
                text: item.text,
                iconClass: item.icon,
                btnClass: 'list-group-item list-group-item-action text-start',
                tooltipKey: item.tooltipKey,
                onClick: item.action
            });
            listGroup.appendChild(button);
        });
        body.appendChild(listGroup);
        const col = ui_helpers.createElementWithAttributes('div', { class: 'col-lg-6' });
        col.appendChild(card);
        return col;
    }

    function createExportSettingsCard() {
        const card = uiComponents.createCard({
            headerText: 'Export-Einstellungen',
            cardClass: 'shadow-sm',
            bodyClass: 'p-3'
        });
        const body = card.querySelector('.card-body');

        const dpiOptions = APP_CONFIG.EXPORT_SETTINGS.PNG_EXPORT_DPI_OPTIONS.map(dpi => ({ value: String(dpi), text: `${dpi} DPI` }));
        const currentDpi = String(state.getCurrentPngExportDpi ? state.getCurrentPngExportDpi() : APP_CONFIG.DEFAULT_SETTINGS.PNG_EXPORT_DPI);
        const dpiSelect = uiComponents.createSelect({
            id: 'png-export-dpi-select',
            label: 'PNG Export Auflösung (Diagramme/Tabellen):',
            selectOptions: dpiOptions,
            value: currentDpi,
            selectClass: 'form-select-sm',
            wrapperClass: 'mb-3',
            tooltipKey: 'tooltip.exportTab.pngExportDpiSelect',
            onChange: (event) => {
                if (state.setCurrentPngExportDpi) state.setCurrentPngExportDpi(parseInt(event.target.value));
            }
        });
        body.appendChild(dpiSelect);

        const embedFontsCheckbox = uiComponents.createCheckbox({
            id: 'svg-export-embed-fonts',
            label: 'Schriften in SVG einbetten',
            checked: state.getCurrentSvgEmbedFonts ? state.getCurrentSvgEmbedFonts() : APP_CONFIG.DEFAULT_SETTINGS.SVG_EXPORT_EMBED_FONTS,
            isSwitch: true,
            tooltipKey: 'tooltip.exportTab.svgExportEmbedFonts',
            onChange: (event) => {
                if (state.setCurrentSvgEmbedFonts) state.setCurrentSvgEmbedFonts(event.target.checked);
            }
        });
        body.appendChild(embedFontsCheckbox);

        const inlineStylesCheckbox = uiComponents.createCheckbox({
            id: 'svg-export-inline-styles',
            label: 'CSS-Stile in SVG inline einfügen',
            checked: state.getCurrentSvgInlineStyles ? state.getCurrentSvgInlineStyles() : APP_CONFIG.DEFAULT_SETTINGS.SVG_EXPORT_INLINE_STYLES,
            isSwitch: true,
            tooltipKey: 'tooltip.exportTab.svgExportInlineStyles',
            onChange: (event) => {
                if (state.setCurrentSvgInlineStyles) state.setCurrentSvgInlineStyles(event.target.checked);
            }
        });
        body.appendChild(inlineStylesCheckbox);

        const col = ui_helpers.createElementWithAttributes('div', { class: 'col-lg-12' });
        col.appendChild(card);
        return col;
    }


    function setupExportTabEventHandlers() {
    }

    function refreshExportTab() {
        currentKollektiv = state.getCurrentKollektiv();
        currentRawData = kollektivStore.getAllProcessedData();
        currentAppliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        currentAppliedT2Logic = t2CriteriaManager.getAppliedLogic();
        currentBruteForceResults = bruteForceManager.getAllResults();
        renderExportTab();
    }
    
    function handleGlobalDataChange() {
        const tabPane = document.getElementById(TAB_ID);
        const isActive = tabPane && tabPane.classList.contains('active') && tabPane.classList.contains('show');
        
        currentKollektiv = state.getCurrentKollektiv();
        currentRawData = kollektivStore.getAllProcessedData();
        currentAppliedT2Criteria = t2CriteriaManager.getAppliedCriteria();
        currentAppliedT2Logic = t2CriteriaManager.getAppliedLogic();
        currentBruteForceResults = bruteForceManager.getAllResults();
        
        if (isActive) {
            renderExportTab();
        }
    }


    return {
        init: initializeExportTab,
        render: renderExportTab,
        refresh: refreshExportTab,
        handleGlobalDataChange
    };
})();
