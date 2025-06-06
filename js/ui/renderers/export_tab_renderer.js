const exportTabRenderer = (() => {

    function _createExportButtonHTML(typeKey, typeConfig, currentKollektiv) {
        if (!typeKey || !typeConfig || typeof typeConfig.description !== 'string' || typeof typeConfig.type !== 'string' || typeof typeConfig.ext !== 'string') {
            console.warn(`Ungültige Konfiguration für Export-Typ: ${typeKey}`);
            return '';
        }
        const buttonId = `export-${typeKey}`;
        const buttonText = typeKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace('Md', 'MD').replace('Csv', 'CSV').replace('Txt', 'TXT').replace('Png', 'PNG').replace('Svg', 'SVG').replace('Zip', 'ZIP').replace('Xlsx', 'XLSX');
        const fileExtension = `(.${typeConfig.ext})`;
        let tippyContent = typeConfig.description.replace('[KOLLEKTIV]', getKollektivDisplayName(currentKollektiv));

        let iconClass = 'fa-file-alt'; // Default icon
        if (typeConfig.ext === 'csv') iconClass = 'fa-file-csv';
        else if (typeConfig.ext === 'zip') iconClass = 'fa-file-archive';
        else if (typeConfig.ext === 'png') iconClass = 'fa-file-image';
        else if (typeConfig.ext === 'svg') iconClass = 'fa-file-code';
        else if (typeConfig.ext === 'html') iconClass = 'fa-file-code';
        else if (typeConfig.ext === 'xlsx') iconClass = 'fa-file-excel';


        return `
            <div class="col">
                <button class="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center align-items-center p-3 export-btn-fixed-height" 
                        id="${buttonId}" 
                        data-export-type="${typeConfig.type}" 
                        data-export-ext="${typeConfig.ext}"
                        data-tippy-content="${tippyContent}">
                    <i class="fas ${iconClass} fa-2x mb-2"></i>
                    <span class="export-btn-text">${buttonText}</span>
                    <small class="text-muted export-btn-ext">${fileExtension}</small>
                </button>
            </div>
        `;
    }


    function renderExportTab(currentKollektiv) {
        if (typeof APP_CONFIG === 'undefined' || typeof APP_CONFIG.EXPORT_SETTINGS === 'undefined' || typeof UI_TEXTS === 'undefined' || typeof TOOLTIP_CONTENT === 'undefined') {
            console.error("Abhängigkeiten für exportTabRenderer (APP_CONFIG, UI_TEXTS, TOOLTIP_CONTENT) nicht vollständig geladen.");
            return '<p class="text-danger p-3">Fehler: Wichtige Konfigurationskomponenten für den Export-Tab nicht geladen.</p>';
        }

        const exportSettings = APP_CONFIG.EXPORT_SETTINGS;
        const filenameTypes = exportSettings.FILENAME_TYPES;
        const kollektivName = getKollektivDisplayName(currentKollektiv);

        let einzeleporteHtml = '';
        let paketexporteHtml = '';

        const singleExportOrder = [
            'STATS_CSV', 'STATS_XLSX', 'BRUTEFORCE_TXT',
            'DESKRIPTIV_MD', 'DATEN_MD', 'DATEN_XLSX',
            'AUSWERTUNG_MD', 'AUSWERTUNG_XLSX',
            'FILTERED_DATA_CSV', 'FILTERED_DATA_XLSX',
            'COMPREHENSIVE_REPORT_HTML',
            'CRITERIA_COMPARISON_MD',
            'PUBLIKATION_ABSTRACT_MD', 'PUBLIKATION_INTRODUCTION_MD', 'PUBLIKATION_METHODEN_MD',
            'PUBLIKATION_ERGEBNISSE_MD', 'PUBLIKATION_DISCUSSION_MD', 'PUBLIKATION_REFERENCES_MD'
        ];

        const packageExportOrder = [
            'ALL_ZIP', 'CSV_ZIP', 'MD_ZIP', 'PNG_ZIP', 'SVG_ZIP', 'XLSX_ZIP'
        ];


        singleExportOrder.forEach(key => {
            if (filenameTypes[key]) {
                einzeleporteHtml += _createExportButtonHTML(key, filenameTypes[key], currentKollektiv);
            }
        });

        packageExportOrder.forEach(key => {
             if (filenameTypes[key]) {
                paketexporteHtml += _createExportButtonHTML(key, filenameTypes[key], currentKollektiv);
            }
        });


        let html = `
            <div class="export-tab-container p-md-3">
                <div class="alert alert-info small" role="alert">
                    ${TOOLTIP_CONTENT.exportTab.description.replace('[KOLLEKTIV]', `<strong>${kollektivName}</strong>`)}
                </div>

                <h3 class="mt-4 mb-3">${UI_TEXTS.exportTab.singleExports || 'Einzelexporte'}</h3>
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3 mb-4 export-options-container">
                    ${einzeleporteHtml || `<p class="col-12 text-muted">${UI_TEXTS.generalMessages.noDataAvailable || 'Keine Einzelexporte definiert.'}</p>`}
                </div>

                <h3 class="mt-4 mb-3">${UI_TEXTS.exportTab.exportPackages || 'Export-Pakete (.zip)'}</h3>
                 <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3 mb-3 export-options-container">
                    ${paketexporteHtml || `<p class="col-12 text-muted">${UI_TEXTS.generalMessages.noDataAvailable || 'Keine Export-Pakete definiert.'}</p>`}
                </div>
            </div>
        `;
        return html;
    }
    return Object.freeze({
        renderExportTab
    });
})();
