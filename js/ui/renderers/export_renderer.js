const exportRenderer = (() => {

    function _createExportButton(config) {
        return `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${config.label}</strong>
                    <p class="mb-0 text-muted small">${config.description}</p>
                </div>
                <button id="${config.id}" class="btn btn-sm btn-primary export-btn" 
                        data-format="${config.format}" 
                        data-tippy-content="${config.tooltip}" 
                        ${config.disabled ? 'disabled' : ''}>
                    <i class="fas ${config.icon} fa-fw"></i>
                </button>
            </div>`;
    }

    function _createExportCard(title, description, buttons) {
        return `
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">${title}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">${description}</p>
                    <div class="list-group">
                        ${buttons.map(_createExportButton).join('')}
                    </div>
                </div>
            </div>`;
    }

    function render(hasBruteForceResults, canExportDataDependent) {

        const singleExports = [
            {
                id: 'export-statistik-csv',
                label: 'Statistik-Übersicht (.csv)',
                description: 'Exportiert die Haupt-Performance-Metriken aller Kriteriensets als CSV-Datei.',
                icon: 'fa-file-csv',
                format: 'stats-csv',
                tooltip: TOOLTIP_CONTENT.exportTab.statsCsv.description,
                disabled: !canExportDataDependent
            },
            {
                id: 'export-bruteforce-txt',
                label: 'Brute-Force Top-Ergebnisse (.txt)',
                description: 'Exportiert die besten gefundenen Kriterien-Kombinationen aus dem Brute-Force-Lauf.',
                icon: 'fa-file-alt',
                format: 'bruteforce-txt',
                tooltip: TOOLTIP_CONTENT.exportTab.bruteForceTxt.description,
                disabled: !hasBruteForceResults
            },
            {
                id: 'export-filtered-data-csv',
                label: 'Gefilterte Rohdaten (.csv)',
                description: 'Exportiert die Patientendaten des aktuell ausgewählten Kollektivs als CSV-Datei.',
                icon: 'fa-file-csv',
                format: 'filtered-data-csv',
                tooltip: TOOLTIP_CONTENT.exportTab.filteredDataCsv.description,
                disabled: !canExportDataDependent
            },
             {
                id: 'export-comprehensive-report-html',
                label: 'Analysebericht (.html)',
                description: 'Erstellt einen umfassenden, interaktiven HTML-Bericht mit allen Tabellen und Diagrammen.',
                icon: 'fa-file-code',
                format: 'comprehensive-report-html',
                tooltip: TOOLTIP_CONTENT.exportTab.comprehensiveReport.description,
                disabled: !canExportDataDependent
            }
        ];

        const zipExports = [
            {
                id: 'export-all-zip',
                label: 'Gesamtpaket (.zip)',
                description: 'Enthält alle Einzel-Exporte (CSV, MD, PNG, SVG) in einem ZIP-Archiv.',
                icon: 'fa-file-archive',
                format: 'all-zip',
                tooltip: TOOLTIP_CONTENT.exportTab.allZip.description,
                disabled: !canExportDataDependent
            },
            {
                id: 'export-csv-zip',
                label: 'Alle CSV-Dateien (.zip)',
                description: 'Alle relevanten Daten und Statistiken, exportiert in separate CSV-Dateien.',
                icon: 'fa-file-csv',
                format: 'csv-zip',
                tooltip: TOOLTIP_CONTENT.exportTab.csvZip.description,
                disabled: !canExportDataDependent
            },
            {
                id: 'export-md-zip',
                label: 'Alle Markdown-Dateien (.zip)',
                description: 'Alle Tabellen als Markdown-Dateien, ideal für Dokumentationen oder Berichte.',
                icon: 'fa-file-alt',
                format: 'md-zip',
                tooltip: TOOLTIP_CONTENT.exportTab.mdZip.description,
                disabled: !canExportDataDependent
            },
            {
                id: 'export-png-zip',
                label: 'Alle Diagramme (.png)',
                description: 'Alle generierten Diagramme in hoher Auflösung als PNG-Dateien.',
                icon: 'fa-file-image',
                format: 'png-zip',
                tooltip: TOOLTIP_CONTENT.exportTab.pngZip.description,
                disabled: !canExportDataDependent
            },
            {
                id: 'export-svg-zip',
                label: 'Alle Diagramme (.svg)',
                description: 'Alle generierten Diagramme als skalierbare Vektorgrafiken (SVG).',
                icon: 'fa-file-image',
                format: 'svg-zip',
                tooltip: TOOLTIP_CONTENT.exportTab.svgZip.description,
                disabled: !canExportDataDependent
            }
        ];

        const excelExports = [
             {
                id: 'export-xlsx-zip',
                label: 'Excel-Gesamtmappe (.xlsx)',
                description: 'Eine einzelne Excel-Datei mit mehreren Arbeitsblättern (Daten, Auswertung, Statistiken).',
                icon: 'fa-file-excel',
                format: 'xlsx-zip',
                tooltip: TOOLTIP_CONTENT.exportTab.xlsxZip.description,
                disabled: !canExportDataDependent
            }
        ];

        return `
            <div class="row">
                <div class="col-lg-6">
                    ${_createExportCard('Einzel-Exporte', 'Laden Sie spezifische Ergebnisse und Daten als einzelne Dateien herunter. Diese Optionen sind ideal für schnelle Analysen oder die Einbindung in bestehende Dokumente.', singleExports)}
                </div>
                <div class="col-lg-6">
                    ${_createExportCard('Paket-Exporte (.zip)', 'Laden Sie thematisch gruppierte Dateien gebündelt in einem einzigen ZIP-Archiv herunter. Dies ist nützlich für die Archivierung oder Weitergabe vollständiger Analyse-Sets.', zipExports)}
                    ${_createExportCard('Excel-Exporte', 'Exportieren Sie alle relevanten Daten in eine einzige, gut strukturierte Excel-Arbeitsmappe zur weiteren Analyse in Tabellenkalkulationsprogrammen.', excelExports)}
                </div>
            </div>`;
    }

    return Object.freeze({
        render
    });

})();
