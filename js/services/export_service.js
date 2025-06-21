window.exportService = (() => {

    function _isLibraryAvailable(libName) {
        let isAvailable = false;
        switch (libName) {
            case 'JSZip': isAvailable = !!window.JSZip; break;
            case 'canvg': isAvailable = !!window.canvg?.Canvg; break;
            case 'docx': isAvailable = !!window.docx; break;
            default: isAvailable = false;
        }
        if (!isAvailable) {
            window.uiManager.showToast(`Export failed: '${libName}' library not loaded. Check internet connection.`, 'danger');
        }
        return isAvailable;
    }

    function _downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    function _generateFilename(base, cohortName, ext) {
        const date = getCurrentDateString('YYYYMMDD');
        const cohortStr = cohortName.replace(/\s/g, '_');
        return `${base}_${cohortStr}_${date}.${ext}`;
    }

    async function _getChartBlob(chartContainerId, type = 'svg') {
        if (type === 'png' && !_isLibraryAvailable('canvg')) return null;
        
        const chartContainer = document.getElementById(chartContainerId);
        if (!chartContainer) return null;
        const svgElement = chartContainer.querySelector('svg');
        if (!svgElement) return null;

        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgElement);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }

        if (type === 'svg') {
            return new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        }

        if (type === 'png') {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const v = await window.canvg.Canvg.from(ctx, source);
            await v.render();
            return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        }
        return null;
    }

    function _getMarkdownFromData(headers, rows) {
        let markdown = `| ${headers.join(' | ')} |\n`;
        markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
        rows.forEach(row => {
            const cells = row.map(cell => String(cell ?? '').replace(/\|/g, ''));
            markdown += `| ${cells.join(' | ')} |\n`;
        });
        return markdown;
    }

    function _getStatsCsvBlob(stats) {
        let csv = 'Cohort,Method,Metric,Value,CI_Lower,CI_Upper,N_Success,N_Trials\n';
        if (!stats) return new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        Object.keys(stats).forEach(cohortId => {
            const cohortStats = stats[cohortId];
            if (!cohortStats) return;

            const processPerf = (methodName, perfData) => {
                if (!perfData) return;
                Object.keys(perfData).forEach(metricKey => {
                    const metric = perfData[metricKey];
                    if (typeof metric === 'object' && metric !== null && 'value' in metric) {
                        csv += [
                            cohortId,
                            `"${methodName.replace(/"/g, '""')}"`,
                            metricKey,
                            metric.value ?? '',
                            metric.ci?.lower ?? '',
                            metric.ci?.upper ?? '',
                            metric.n_success ?? '',
                            metric.n_trials ?? ''
                        ].join(',') + '\n';
                    }
                });
            };
            processPerf('Avocado Sign', cohortStats.performanceAS);
            processPerf('Applied T2', cohortStats.performanceT2Applied);
            if(cohortStats.performanceT2Literature) {
                Object.entries(cohortStats.performanceT2Literature).forEach(([studyId, perfData]) => {
                    const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
                    processPerf(`Literature: ${studySet?.name || studyId}`, perfData);
                });
            }
        });
        return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    }
    
    function _getFilteredDataCsvBlob(data) {
        if (!data || data.length === 0) return new Blob(["id,lastName,firstName,sex,age,therapy,nStatus,asStatus,t2Status\n"], { type: 'text/csv;charset=utf-8;' });
        const headers = "id,lastName,firstName,sex,age,therapy,nStatus,asStatus,t2Status,pathologyPositiveNodeCount,pathologyTotalNodeCount,asPositiveNodeCount,asTotalNodeCount,t2PositiveNodeCount,t2TotalNodeCount\n";
        const rows = data.map(p => [
            p.id, p.lastName, p.firstName, p.sex, p.age, p.therapy, p.nStatus, p.asStatus, p.t2Status,
            p.countPathologyNodesPositive, p.countPathologyNodes,
            p.countASNodesPositive, p.countASNodes,
            p.countT2NodesPositive, p.countT2Nodes
        ].join(',')).join('\n');
        return new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    }

    async function _getPublicationDocxBlob(publicationHTML) {
        if (!_isLibraryAvailable('docx')) return null;
        
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = window.docx;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = publicationHTML;
        
        const sections = [];
        
        tempDiv.querySelectorAll('h1, h2, h3, h4, p, ul, ol, table').forEach(el => {
            if (el.tagName === 'H1') {
                sections.push(new Paragraph({ text: el.textContent, heading: HeadingLevel.TITLE }));
            } else if (el.tagName === 'H2') {
                sections.push(new Paragraph({ text: el.textContent, heading: HeadingLevel.HEADING_2, style: "heading2" }));
            } else if (el.tagName === 'H3') {
                sections.push(new Paragraph({ text: el.textContent, heading: HeadingLevel.HEADING_3, style: "heading3" }));
            } else if (el.tagName === 'H4') {
                sections.push(new Paragraph({ text: el.textContent, heading: HeadingLevel.HEADING_4, style: "heading4" }));
            } else if (el.tagName === 'P') {
                const runs = Array.from(el.childNodes).map(node => {
                    if (node.nodeType === Node.TEXT_NODE) return new TextRun(node.textContent);
                    if (node.tagName === 'STRONG') return new TextRun({ text: node.textContent, bold: true });
                    if (node.tagName === 'EM') return new TextRun({ text: node.textContent, italics: true });
                    return new TextRun(node.textContent);
                });
                sections.push(new Paragraph({ children: runs, style: "paragraph" }));
            } else if (el.tagName === 'UL' || el.tagName === 'OL') {
                Array.from(el.querySelectorAll('li')).forEach(li => {
                    sections.push(new Paragraph({ text: li.textContent, bullet: { level: 0 }, style: "list" }));
                });
            } else if (el.tagName === 'TABLE') {
                const tableRows = [];
                Array.from(el.rows).forEach(row => {
                    const tableCells = Array.from(row.cells).map(cell => {
                        return new TableCell({
                            children: [new Paragraph(cell.textContent)],
                            borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } }
                        });
                    });
                    tableRows.push(new TableRow({ children: tableCells }));
                });
                sections.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
            }
        });

        const doc = new Document({
            styles: {
                paragraphStyles: [
                    { id: "paragraph", name: "Normal", run: { size: 22, font: "Calibri" } },
                    { id: "heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { size: 28, bold: true } },
                    { id: "heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", run: { size: 24, bold: true } },
                    { id: "heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", run: { size: 22, bold: true } },
                    { id: "list", name: "List Paragraph", basedOn: "Normal", next: "Normal" }
                ]
            },
            sections: [{ children: sections }]
        });

        return await Packer.toBlob(doc);
    }

    async function _createZip(files) {
        if (!_isLibraryAvailable('JSZip')) return null;
        const zip = new JSZip();
        for (const file of files) {
            if (file && file.filename && file.blob) {
                zip.file(file.filename, file.blob);
            }
        }
        return await zip.generateAsync({ type: "blob" });
    }

    const exportStrategies = {
        'stats-csv': async (appData) => _downloadBlob(_getStatsCsvBlob(appData.allPublicationStats), _generateFilename('statistics', 'all_cohorts', 'csv')),
        'bruteforce-txt': async (appData) => _downloadBlob(_getBruteForceReportTxtBlob(appData.bruteForceResults), _generateFilename('bruteforce_report', 'all_cohorts', 'txt')),
        'datatable-md': async (appData) => {
            const headers = window.APP_CONFIG.TABLE_COLUMN_DEFINITIONS.DATA_TABLE_COLUMNS.map(c => c.label);
            const rows = appData.currentCohortData.map(p => [p.id, p.lastName, p.firstName, p.sex, p.age, p.therapy, `${p.nStatus}/${p.asStatus}/${p.t2Status}`, p.notes, '']);
            _downloadBlob(new Blob([_getMarkdownFromData(headers, rows)], { type: 'text/markdown;charset=utf-8;' }), _generateFilename('data_table', appData.currentCohortId, 'md'));
        },
        'analysistable-md': async (appData) => {
            const headers = window.APP_CONFIG.TABLE_COLUMN_DEFINITIONS.ANALYSIS_TABLE_COLUMNS.map(c => c.label);
            const rows = appData.currentCohortData.map(p => [p.id, p.lastName, p.therapy, `${p.nStatus}/${p.asStatus}/${p.t2Status}`, `${p.countPathologyNodesPositive}/${p.countPathologyNodes}`, `${p.countASNodesPositive}/${p.countASNodes}`, `${p.countT2NodesPositive}/${p.countT2Nodes}`, '']);
            _downloadBlob(new Blob([_getMarkdownFromData(headers, rows)], { type: 'text/markdown;charset=utf-8;' }), _generateFilename('analysis_table', appData.currentCohortId, 'md'));
        },
        'filtered-data-csv': async (appData) => _downloadBlob(_getFilteredDataCsvBlob(appData.currentCohortData), _generateFilename('filtered_data', appData.currentCohortId, 'csv')),
        'comprehensive-report-html': async (appData) => _downloadBlob(new Blob([appData.publicationHTML], { type: 'text/html;charset=utf-8;' }), _generateFilename('comprehensive_report', appData.currentCohortId, 'html')),
        
        'png-zip': async () => {
            const chartIds = ['figure-1-flowchart-container'];
            const files = await Promise.all(chartIds.map(async (id, i) => {
                const blob = await _getChartBlob(id, 'png');
                return blob ? { filename: `figures/Figure_${i + 1}.png`, blob } : null;
            }));
            const zipBlob = await _createZip(files.filter(f => f));
            if(zipBlob) _downloadBlob(zipBlob, _generateFilename('png_graphics', 'all', 'zip'));
        },
        
        'svg-zip': async () => {
            const chartIds = ['figure-1-flowchart-container'];
            const files = await Promise.all(chartIds.map(async (id, i) => {
                const blob = await _getChartBlob(id, 'svg');
                return blob ? { filename: `figures/Figure_${i + 1}.svg`, blob } : null;
            }));
            const zipBlob = await _createZip(files.filter(f => f));
            if(zipBlob) _downloadBlob(zipBlob, _generateFilename('svg_graphics', 'all', 'zip'));
        },
        
        'csv-zip': async (appData) => {
            const files = [
                { filename: 'statistics.csv', blob: _getStatsCsvBlob(appData.allPublicationStats) },
                { filename: 'filtered_data.csv', blob: _getFilteredDataCsvBlob(appData.currentCohortData) }
            ];
            const zipBlob = await _createZip(files);
            if(zipBlob) _downloadBlob(zipBlob, _generateFilename('csv_package', appData.currentCohortId, 'zip'));
        },
        
        'md-zip': async (appData) => {
            const dataHeaders = window.APP_CONFIG.TABLE_COLUMN_DEFINITIONS.DATA_TABLE_COLUMNS.map(c => c.label);
            const dataRows = appData.currentCohortData.map(p => [p.id, p.lastName, p.firstName, p.sex, p.age, p.therapy, `${p.nStatus}/${p.asStatus}/${p.t2Status}`, p.notes, '']);
            const analysisHeaders = window.APP_CONFIG.TABLE_COLUMN_DEFINITIONS.ANALYSIS_TABLE_COLUMNS.map(c => c.label);
            const analysisRows = appData.currentCohortData.map(p => [p.id, p.lastName, p.therapy, `${p.nStatus}/${p.asStatus}/${p.t2Status}`, `${p.countPathologyNodesPositive}/${p.countPathologyNodes}`, `${p.countASNodesPositive}/${p.countASNodes}`, `${p.countT2NodesPositive}/${p.countT2Nodes}`, '']);
            
            const files = [
                { filename: 'data_table.md', blob: new Blob([_getMarkdownFromData(dataHeaders, dataRows)], { type: 'text/markdown;charset=utf-8;' }) },
                { filename: 'analysis_table.md', blob: new Blob([_getMarkdownFromData(analysisHeaders, analysisRows)], { type: 'text/markdown;charset=utf-8;' }) }
            ];
            const zipBlob = await _createZip(files);
            if(zipBlob) _downloadBlob(zipBlob, _generateFilename('markdown_tables', appData.currentCohortId, 'zip'));
        },

        'all-zip': async (appData) => {
            const files = await Promise.all([
                _getStatsCsvBlob(appData.allPublicationStats).then(b => ({ filename: 'statistics.csv', blob: b })),
                _getBruteForceReportTxtBlob(appData.bruteForceResults).then(b => ({ filename: 'bruteforce_report.txt', blob: b })),
                _getFilteredDataCsvBlob(appData.currentCohortData).then(b => ({ filename: 'filtered_data.csv', blob: b })),
                new Blob([appData.publicationHTML], { type: 'text/html;charset=utf-8;' }).then(b => ({ filename: 'comprehensive_report.html', blob: b })),
                _getChartBlob('figure-1-flowchart-container', 'svg').then(b => ({ filename: 'figures/Figure_1.svg', blob: b })),
                _getChartBlob('figure-1-flowchart-container', 'png').then(b => ({ filename: 'figures/Figure_1.png', blob: b }))
            ]);
            const zipBlob = await _createZip(files.filter(f => f && f.blob));
            if(zipBlob) _downloadBlob(zipBlob, _generateFilename('full_export', appData.currentCohortId, 'zip'));
        },

        'radiology-submission-zip': async (appData) => {
            const docxBlob = await _getPublicationDocxBlob(appData.publicationHTML);
            const flowchartPngBlob = await _getChartBlob('figure-1-flowchart-container', 'png');
            
            const files = [];
            if (docxBlob) files.push({ filename: `manuscript_${appData.currentCohortId}.docx`, blob: docxBlob });
            if (flowchartPngBlob) files.push({ filename: 'figures/Figure_1.png', blob: flowchartPngBlob });
            
            const zipBlob = await _createZip(files);
            if(zipBlob) _downloadBlob(zipBlob, _generateFilename('radiology_submission', appData.currentCohortId, 'zip'));
        }
    };

    async function triggerExport(exportType, appData) {
        if (!appData) {
            window.uiManager.showToast('Data for export is not available.', 'danger');
            return;
        }

        const strategy = exportStrategies[exportType];
        if (strategy) {
            try {
                window.uiManager.showToast(`Generating export: ${exportType}...`, 'info', 2000);
                await strategy(appData);
            } catch (error) {
                console.error(`Export failed for type '${exportType}':`, error);
                window.uiManager.showToast(`Export failed: ${error.message || 'Unknown error'}`, 'danger');
            }
        } else {
            window.uiManager.showToast(`Export type '${exportType}' is not yet implemented.`, 'warning');
        }
    }

    return {
        triggerExport
    };

})();