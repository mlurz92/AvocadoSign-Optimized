const TableRenderer = {

    _formatValue: function(value, precision = 3) {
        if (typeof value !== 'number') return value;
        return value.toFixed(precision);
    },

    _formatCI: function(ciObject, precision = 3) {
        if (!ciObject || typeof ciObject.lower !== 'number' || typeof ciObject.upper !== 'number') {
            return 'N/A';
        }
        return `(${this._formatValue(ciObject.lower, precision)} - ${this._formatValue(ciObject.upper, precision)})`;
    },
    
    renderDataTable: function(containerId, headers, data) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container mit der ID '${containerId}' nicht gefunden.`);
            return;
        }

        let tableHtml = '<table class="w-full text-left border-collapse">';
        
        tableHtml += '<thead><tr>';
        headers.forEach(header => {
            tableHtml += `<th class="p-2 border border-gray-300 bg-gray-100">${header.replace(/_/g, ' ')}</th>`;
        });
        tableHtml += '</tr></thead>';
        
        tableHtml += '<tbody>';
        data.forEach(row => {
            tableHtml += '<tr>';
            headers.forEach(header => {
                tableHtml += `<td class="p-2 border border-gray-300">${row[header]}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody>';
        
        tableHtml += '</table>';
        container.innerHTML = tableHtml;
    },

    renderResultsTable: function(containerId, resultsData) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container mit der ID '${containerId}' nicht gefunden.`);
            return;
        }
        
        const styleGuide = AppConfig.radiologyStyleGuide.table;
        const textLabels = AppConfig.text.labels;

        let tableHtml = `<table class="w-full text-left border-collapse" style="border-color: ${styleGuide.borderColor};">`;
        
        tableHtml += `<thead><tr style="background-color: ${styleGuide.headerBackground};">
            <th class="p-3 border" style="border-color: ${styleGuide.borderColor};">Metrik</th>
            <th class="p-3 border" style="border-color: ${styleGuide.borderColor};">Wert</th>
            <th class="p-3 border" style="border-color: ${styleGuide.borderColor};">${textLabels.confidenceInterval}</th>
        </tr></thead>`;
        
        tableHtml += '<tbody>';
        
        Object.keys(resultsData).forEach(key => {
            const metric = resultsData[key];
            const label = textLabels[key] || key;
            
            if(key === 'tp' || key === 'fp' || key === 'tn' || key === 'fn') {
                 tableHtml += `<tr>
                    <td class="p-3 border" style="border-color: ${styleGuide.borderColor};">${label}</td>
                    <td class="p-3 border" style="border-color: ${styleGuide.borderColor};">${metric.value}</td>
                    <td class="p-3 border" style="border-color: ${styleGuide.borderColor};">--</td>
                </tr>`;
            } else if (metric.value !== undefined) {
                tableHtml += `<tr>
                    <td class="p-3 border" style="border-color: ${styleGuide.borderColor};">${label}</td>
                    <td class="p-3 border" style="border-color: ${styleGuide.borderColor};">${this._formatValue(metric.value)}</td>
                    <td class="p-3 border" style="border-color: ${styleGuide.borderColor};">${metric.ci ? this._formatCI(metric.ci) : '--'}</td>
                </tr>`;
            }
        });

        tableHtml += '</tbody></table>';
        container.innerHTML = tableHtml;
    }
};

window.TableRenderer = TableRenderer;
