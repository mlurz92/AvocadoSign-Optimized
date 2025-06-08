const exportService = (() => {

    function _generateFilename(typeKey, kollektiv, extension, options = {}) {
        const dateStr = getCurrentDateString('YYYYMMDD');
        const safeKollektiv = getKollektivDisplayName(kollektiv).replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
        let filenameType = APP_CONFIG.EXPORT.FILENAME_TYPES[typeKey] || typeKey || 'Export';

        if (options.chartName) {
            filenameType = filenameType.replace('{ChartName}', options.chartName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        }
        if (options.tableName) {
            filenameType = filenameType.replace('{TableName}', options.tableName.replace(/[^a-z0-9_-]/gi, '_').substring(0, 30));
        }
        if (options.studyId) {
             const safeStudyId = String(options.studyId).replace(/[^a-z0-9_-]/gi, '_');
             filenameType = filenameType.replace('{StudyID}', safeStudyId);
        }
        if (options.sectionName) {
            const safeSectionName = String(options.sectionName).replace(/[^a-z0-9_-]/gi, '_').substring(0,20);
            filenameType = filenameType.replace('{SectionName}', safeSectionName);
        }

        return APP_CONFIG.EXPORT.FILENAME_TEMPLATE
            .replace('{TYPE}', filenameType)
            .replace('{KOLLEKTIV}', safeKollektiv)
            .replace('{DATE}', dateStr)
            .replace('{EXT}', extension);
    }

    function _downloadFile(content, filename, mimeType) {
        if (content === null || content === undefined) return false;
        
        const blob = (content instanceof Blob) ? content : new Blob([String(content)], { type: mimeType });
        if (blob.size === 0) return false;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 150);
        return true;
    }
    
    async function _convertSvgToPngBlob(svgElement, scale = 2) {
        return new Promise((resolve, reject) => {
            if (!svgElement) return reject(new Error("SVG Element nicht gefunden."));
            const svgXml = new XMLSerializer().serializeToString(svgElement);
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgXml)))}`;

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const bbox = svgElement.getBBox();
                canvas.width = bbox.width * scale;
                canvas.height = bbox.height * scale;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, 'image/png');
            };
            img.onerror = () => reject(new Error("Fehler beim Laden des SVG als Bild."));
            img.src = svgDataUrl;
        });
    }
    
    async function _convertTableToPngBlob(tableElement, scale = 2) {
         return new Promise((resolve, reject) => {
             if (typeof html2canvas === 'undefined') {
                return reject(new Error("html2canvas Bibliothek nicht gefunden."));
             }
             html2canvas(tableElement, { scale: scale, backgroundColor: '#ffffff', useCORS: true })
                .then(canvas => {
                    canvas.toBlob(resolve, 'image/png');
                })
                .catch(err => {
                    reject(new Error(`Fehler bei der Konvertierung von Tabelle zu PNG: ${err.message}`));
                });
        });
    }

    function _generateStatistikCSV(stats, kollektiv, criteria, logic) {
        if (!stats || !stats.deskriptiv) return null;
        // This function will be fully implemented to generate a detailed CSV from the stats object.
        const csvData = [
            ['Kategorie', 'Metrik', 'Wert', 'CI Lower', 'CI Upper', 'Methode']
        ];
        // ... full implementation would follow here
        return Papa.unparse(csvData, { delimiter: APP_CONFIG.EXPORT.CSV_DELIMITER });
    }

    function _generateBruteForceTXT(resultsData) {
        if (!resultsData || !resultsData.results) return null;
        // This function will be fully implemented to generate a detailed text report.
        let report = `Brute-Force Report\nKollektiv: ${resultsData.kollektiv}\n`;
        resultsData.results.forEach(res => {
            report += `Metrik: ${res.metricValue.toFixed(4)}, Logik: ${res.logic}\n`;
        });
        return report;
    }

    function _generateMarkdownTable(dataOrStats, tableType, options = {}) {
        // This function will be fully implemented to generate various markdown tables.
        return `## ${options.title || tableType}\n\n| Header | Header |\n|---|---|\n| Data | Data |`;
    }

    async function exportFullPublicationMarkdown(allKollektivStats, commonData, lang) {
        let fullMarkdown = `# Manuskript: ${commonData.publicationTitle || 'Analyse Avocado Sign vs. T2 Kriterien'}\n\n`;
        PUBLICATION_CONFIG.sections.forEach(mainSection => {
            fullMarkdown += `## ${TEXT_CONFIG.de.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}\n\n`;
            mainSection.subSections.forEach(subSection => {
                fullMarkdown += `### ${subSection.label}\n\n`;
                fullMarkdown += publicationTextGenerator.getSectionTextAsMarkdown(subSection.id, lang, allKollektivStats, commonData);
                fullMarkdown += "\n\n";
            });
        });
        const filename = _generateFilename('PUBLICATION_FULL_MD', appState.getCurrentKollektiv(), 'md');
        if(!_downloadFile(fullMarkdown, filename, 'text/markdown;charset=utf-8;')) {
            uiManager.showToast('Export des Manuskripts fehlgeschlagen.', 'danger');
        }
    }

    async function exportCategoryZip(category, data, bfResults, kollektiv, criteria, logic) {
        if (!window.JSZip) {
            uiManager.showToast('JSZip-Bibliothek fehlt für ZIP-Export.', 'danger');
            return;
        }
        const zip = new JSZip();
        let filesAdded = 0;

        const addFileToZip = (filename, content) => {
            if (content) {
                zip.file(filename, content);
                filesAdded++;
            }
        };

        if (category === 'all' || category === 'csv') {
            const stats = statisticsService.calculateAllStatsForPublication(data, criteria, logic, bfResults)[kollektiv];
            addFileToZip(_generateFilename('STATS_CSV', kollektiv, 'csv'), _generateStatistikCSV(stats, kollektiv, criteria, logic));
            addFileToZip(_generateFilename('FILTERED_DATA_CSV', kollektiv, 'csv'), Papa.unparse(dataManager.filterDataByKollektiv(data, kollektiv)));
        }

        if (category === 'all' || category === 'txt') {
            if (bfResults && bfResults[kollektiv]) {
                addFileToZip(_generateFilename('BRUTEFORCE_TXT', kollektiv, 'txt'), _generateBruteForceTXT(bfResults[kollektiv]));
            }
        }
        
        if (category === 'all' || category === 'md') {
            // Markdown files generation
        }

        if (category === 'all' || category === 'images') {
            const chartElements = document.querySelectorAll('.chart-container svg');
            for (const el of chartElements) {
                const id = el.parentElement.id;
                const pngBlob = await _convertSvgToPngBlob(el);
                addFileToZip(_generateFilename('CHART_PNG', kollektiv, 'png', { chartName: id }), pngBlob);
            }
        }

        if (filesAdded > 0) {
            const content = await zip.generateAsync({type:"blob"});
            _downloadFile(content, _generateFilename(`${category.toUpperCase()}_PAKET`, kollektiv, 'zip'), 'application/zip');
            uiManager.showToast(`${filesAdded} Dateien erfolgreich exportiert.`, 'success');
        } else {
            uiManager.showToast('Keine Dateien für den Export gefunden.', 'warning');
        }
    }

    return Object.freeze({
        exportFullPublicationMarkdown,
        exportCategoryZip
    });
})();
