function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function exportElement(elementId, filename, format = 'png') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found for export.`);
        return;
    }

    const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
    });

    if (format === 'png') {
        const dataUrl = canvas.toDataURL('image/png');
        downloadDataUrl(dataUrl, `${filename}.png`);
    } else if (format === 'svg') {
        const dataUrl = canvas.toDataURL('image/png');
        const { width, height } = canvas;
        
        const svgContent = `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 width="${width / 4}" 
                 height="${height / 4}" 
                 viewBox="0 0 ${width / 4} ${height / 4}">
                <rect width="100%" height="100%" fill="white"></rect>
                <image href="${dataUrl}" x="0" y="0" width="${width / 4}" height="${height / 4}" />
            </svg>
        `;

        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        downloadDataUrl(svgUrl, `${filename}.svg`);
        URL.revokeObjectURL(svgUrl);
    }
}

export function exportElementAsPNG(elementId, filename) {
    return exportElement(elementId, filename, 'png');
}

export function exportElementAsSVG(elementId, filename) {
    return exportElement(elementId, filename, 'svg');
}

export function exportTableAsCSV(tableContainerId, filename) {
    const tableContainer = document.getElementById(tableContainerId);
    if (!tableContainer) {
        console.error(`Table container with id "${tableContainerId}" not found.`);
        return;
    }
    const table = tableContainer.querySelector('table');
    if (!table) {
        console.error(`No table found within container "${tableContainerId}".`);
        return;
    }

    const rows = table.querySelectorAll('tr');
    const csv = [];

    for (const row of rows) {
        const rowData = [];
        const cols = row.querySelectorAll('th, td');
        for (const col of cols) {
            let data = col.innerText.replace(/"/g, '""');
            if (data.includes(',') || data.includes('"') || data.includes('\n')) {
                data = `"${data}"`;
            }
            rowData.push(data);
        }
        csv.push(rowData.join(','));
    }
    
    const csvContent = csv.join('\n');
    const csvBlob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    
    downloadDataUrl(csvUrl, `${filename}.csv`);
    URL.revokeObjectURL(csvUrl);
}
