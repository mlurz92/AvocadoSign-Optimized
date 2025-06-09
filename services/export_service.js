const ExportService = {

    _download: function(blob, filename) {
        if (typeof saveAs === 'function') {
            saveAs(blob, filename);
        } else {
            console.error("FileSaver.js is not loaded. Cannot download file.");
            alert("Die Export-Funktion ist nicht verfügbar. Bitte kontaktieren Sie den Administrator.");
        }
    },

    exportCanvasAsPNG: function(canvasId, filename) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas mit der ID '${canvasId}' nicht gefunden.`);
            return;
        }

        if (typeof canvas.toBlob !== 'function') {
            console.error("canvas.toBlob function is not available. Please ensure canvas-toBlob.js polyfill is loaded for older browsers.");
            alert("Die Export-Funktion wird von Ihrem Browser nicht vollständig unterstützt.");
            return;
        }

        canvas.toBlob(blob => {
            if (blob) {
                this._download(blob, filename || `${canvasId}.png`);
            } else {
                console.error("Fehler bei der Erstellung des PNG-Blobs.");
            }
        }, 'image/png');
    },

    _tableToCSV: function(tableElement) {
        const rows = Array.from(tableElement.querySelectorAll('tr'));
        return rows.map(row => {
            const cols = Array.from(row.querySelectorAll('th, td'));
            const csvCols = cols.map(col => {
                let text = col.innerText.trim().replace(/"/g, '""');
                text = text.replace(/(\r\n|\n|\r)/gm," "); // Remove newlines
                return `"${text}"`;
            });
            return csvCols.join(',');
        }).join('\n');
    },

    exportTableAsCSV: function(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error(`Tabelle mit der ID '${tableId}' nicht gefunden.`);
            return;
        }

        const csvContent = this._tableToCSV(table);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this._download(blob, filename || `${tableId}.csv`);
    },

    exportTextAsFile: function(textContent, filename, type = 'text/plain') {
        if (typeof textContent !== 'string') {
            console.error("Der zu exportierende Inhalt ist kein Text.");
            return;
        }
        
        const blob = new Blob([textContent], { type: `${type};charset=utf-8;` });
        this._download(blob, filename);
    }
};

window.ExportService = ExportService;
