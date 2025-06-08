// js/ui/view_logic/export_tab.js

class ExportViewLogic {
    constructor() {
        this.exportCsvButton = document.getElementById('export-csv-button');
        this.exportJsonButton = document.getElementById('export-json-button');
        this.exportChartPngButton = document.getElementById('export-chart-png');
        this.exportChartSvgButton = document.getElementById('export-chart-svg');

        this.addEventListeners();
    }

    addEventListeners() {
        if (this.exportCsvButton) {
            this.exportCsvButton.addEventListener('click', () => this.handleExportCsv());
        }
        if (this.exportJsonButton) {
            this.exportJsonButton.addEventListener('click', () => this.handleExportJson());
        }
        if (this.exportChartPngButton) {
            this.exportChartPngButton.addEventListener('click', () => this.handleExportChart('png'));
        }
        if (this.exportChartSvgButton) {
            this.exportChartSvgButton.addEventListener('click', () => this.handleExportChart('svg'));
        }
    }

    /**
     * Behandelt den Export der Patientendaten als CSV.
     * Nutzt den ExportService zur Konvertierung und zum Download.
     */
    handleExportCsv() {
        const dataToExport = AppState.patientData;
        if (dataToExport && dataToExport.length > 0) {
            ExportServiceInstance.exportCsv(dataToExport, 'patient_data');
        } else {
            console.warn("Keine Daten zum Exportieren als CSV vorhanden.");
            // Hier könnte eine Benutzermeldung angezeigt werden (z.B. ein temporäres DIV)
        }
    }

    /**
     * Behandelt den Export der Patientendaten als JSON.
     * Nutzt den ExportService zur Konvertierung und zum Download.
     */
    handleExportJson() {
        const dataToExport = AppState.patientData;
        if (dataToExport) {
            ExportServiceInstance.exportJson(dataToExport, 'patient_data');
        } else {
            console.warn("Keine Daten zum Exportieren als JSON vorhanden.");
        }
    }

    /**
     * Behandelt den Export des aktuellen Diagramms.
     * Die ChartsInstance muss eine Methode zum Export der Charts bereitstellen.
     * @param {string} format - Das gewünschte Exportformat ('png' oder 'svg').
     */
    handleExportChart(format) {
        // Annahme: Es gibt ein Canvas-Element für Charts, z.B. 'roc-chart'
        // und die ChartsInstance kann darauf zugreifen und die Export-Funktion bereitstellen.
        const chartCanvas = document.getElementById('roc-chart');
        if (chartCanvas && ChartsInstance && ChartsInstance.exportChart) {
            ChartsInstance.exportChart(chartCanvas, 'roc_curve_chart', format);
        } else {
            console.warn("Diagramm oder Export-Funktion nicht verfügbar für den Export.", { chartCanvas, ChartsInstance });
        }
    }

    /**
     * Aktualisiert die Ansicht des Export-Tabs.
     * Kann für zukünftige UI-Updates oder Statusanzeigen genutzt werden.
     */
    updateView() {
        // Der Export-Tab benötigt keine komplexe UI-Aktualisierung basierend auf App-Zustand,
        // da er hauptsächlich Schaltflächen für Aktionen enthält.
        // Diese Methode ist hier zur Konsistenz mit anderen ViewLogic-Klassen.
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen.
// Die Instanziierung erfolgt hier, um sicherzustellen, dass die Event Listener gesetzt werden,
// sobald das DOM geladen und die abhängigen Services verfügbar sind.
const ExportViewLogicInstance = new ExportViewLogic();
