const exportRenderer = (() => {

    function _createExportButton(config) {
        return `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${config.label}</strong>
                    <p class="mb-0 text-muted small">${config.description}</p>
                </div>
                <button id="${config.id}" class="btn btn-primary export-btn" 
                        data-format="${config.format}" 
                        data-tippy-content="${config.tooltip}" 
                        ${config.disabled ? 'disabled' : ''}>
                    <i class="fas ${config.icon} fa-fw"></i>
                </button>
            </div>`;
    }

    function _createExportCard(title, description, buttons) {
        if (!buttons || buttons.length === 0) return '';
        return `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">${title}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text small">${description}</p>
                    <div class="list-group">
                        ${buttons.map(_createExportButton).join('')}
                    </div>
                </div>
            </div>`;
    }

    function render(hasBruteForceResults, canExportDataDependent) {
        const kollektiv = stateManager.getCurrentKollektiv();
        const tt = (key) => TOOLTIP_CONTENT.exportTab[key]?.description.replace(/\[KOLLEKTIV\]/g, `<strong>${getKollektivDisplayName(kollektiv)}</strong>`) || '';

        const singleExports = [
            {
                id: 'export-stats-csv',
                label: 'Statistik-Übersicht (.csv)',
                description: 'Exportiert die Haupt-Performance-Metriken und deskriptive Statistiken als CSV-Datei.',
                icon: 'fa-file-csv',
                format: 'stats-csv',
                tooltip: tt('STATS_CSV'),
                disabled: !canExportDataDependent
            },
            {
                id: 'export-bruteforce-txt',
                label: 'Brute-Force Top-Ergebnisse (.txt)',
                description: 'Exportiert die besten gefundenen Kriterien-Kombinationen aus dem letzten Brute-Force-Lauf.',
                icon: 'fa-file-alt',
                format: 'bruteforce-txt',
                tooltip: tt('BRUTEFORCE_TXT'),
                disabled: !hasBruteForceResults
            },
            {
                id: 'export-filtered-data-csv',
                label: 'Gefilterte Rohdaten (.csv)',
                description: 'Exportiert die Patientendaten des aktuell ausgewählten Kollektivs als CSV-Datei.',
                icon: 'fa-database',
                format: 'filtered-data-csv',
                tooltip: tt('FILTERED_DATA_CSV'),
                disabled: !canExportDataDependent
            },
            {
                id: 'export-comprehensive-report-html',
                label: 'Analysebericht (.html)',
                description: 'Erstellt einen umfassenden, druckbaren HTML-Bericht mit allen Tabellen und Diagrammen.',
                icon: 'fa-file-invoice',
                format: 'comprehensive-report-html',
                tooltip: tt('COMPREHENSIVE_REPORT_HTML'),
                disabled: !canExportDataDependent
            }
        ];

        const zipExports = [
            {
                id: 'export-all-zip',
                label: 'Gesamtpaket (.zip)',
                description: 'Enthält alle Einzel-Exporte (Statistik, Rohdaten, BF-Report, MD-Tabellen) in einem ZIP-Archiv.',
                icon: 'fa-file-archive',
                format: 'all-zip',
                tooltip: tt('ALL_ZIP'),
                disabled: !canExportDataDependent
            },
            {
                id: 'export-charts-png-zip',
                label: 'Alle Diagramme (.png)',
                description: 'Alle aktuell sichtbaren Diagramme als hochauflösende PNG-Dateien.',
                icon: 'fa-file-image',
                format: 'png-zip',
                tooltip: tt('PNG_ZIP'),
                disabled: !canExportDataDependent
            },
            {
                id: 'export-charts-svg-zip',
                label: 'Alle Diagramme (.svg)',
                description: 'Alle aktuell sichtbaren Diagramme als skalierbare Vektorgrafiken (SVG).',
                icon: 'fa-file-signature',
                format: 'svg-zip',
                tooltip: tt('SVG_ZIP'),
                disabled: !canExportDataDependent
            }
        ];

        const excelExports = [
             {
                id: 'export-excel-workbook',
                label: 'Excel-Gesamtmappe (.xlsx)',
                description: 'Eine einzelne Excel-Datei mit mehreren Arbeitsblättern (Daten, Auswertung, Statistiken, Konfiguration).',
                icon: 'fa-file-excel',
                format: 'excel-workbook',
                tooltip: tt('XLSX_ZIP'),
                disabled: !canExportDataDependent
            }
        ];

        return `
            <div class="row">
                <div class="col-lg-6">
                    ${_createExportCard('Einzel-Exporte', 'Laden Sie spezifische Ergebnisse und Daten als einzelne Dateien herunter.', singleExports)}
                </div>
                <div class="col-lg-6">
                    ${_createExportCard('Paket-Exporte (.zip)', 'Laden Sie thematisch gruppierte Dateien gebündelt in einem einzigen ZIP-Archiv herunter.', zipExports)}
                    ${_createExportCard('Excel-Exporte', 'Exportieren Sie alle relevanten Daten in eine einzige, gut strukturierte Excel-Arbeitsmappe.', excelExports)}
                </div>
            </div>`;
    }

    return Object.freeze({
        render
    });

})();
