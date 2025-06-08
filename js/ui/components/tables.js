import { createElement } from '../../utils/dom_helpers.js';
import { formatNumber } from '../../utils/helpers.js';

function createHeader(columns) {
    const thead = createElement('thead');
    const headerRow = createElement('tr');
    columns.forEach(col => {
        const th = createElement('th', { textContent: col });
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    return thead;
}

export function createPatientDataTable(processedData) {
    const container = createElement('div', { classes: ['table-container'] });
    const table = createElement('table', { classes: ['data-table'] });
    
    const columns = [
        'ID', 'Alter', 'Geschlecht', 'Therapie', 'AS Status', 'Patho-Status (N)',
        'AS+ LK', 'Total AS LK', 'Patho+ LK', 'Total Patho LK'
    ];

    const tbody = createElement('tbody');
    processedData.forEach(p => {
        const row = createElement('tr');
        row.innerHTML = `
            <td>${p.nr}</td>
            <td>${p.age}</td>
            <td>${p.geschlecht.toUpperCase()}</td>
            <td>${p.therapie}</td>
            <td>${p.as}</td>
            <td>${p.n}</td>
            <td>${p.anzahl_as_plus_lk}</td>
            <td>${p.anzahl_as_lk}</td>
            <td>${p.anzahl_patho_n_plus_lk}</td>
            <td>${p.anzahl_patho_lk}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(createHeader(columns));
    table.appendChild(tbody);
    container.appendChild(table);

    return container;
}


export function createStatisticsTable(statisticsData, title) {
    const container = createElement('div', { classes: ['card', 'publication-table'] });
    const tableTitle = createElement('h3', { textContent: title });
    const tableWrapper = createElement('div', { classes: ['table-container'] });
    const table = createElement('table', { classes: ['data-table'] });

    const columns = ['Metrik', 'Wert', '95% Konfidenzintervall'];
    
    const formatPercent = (metric) => {
        if (!metric || typeof metric.value !== 'number') return 'N/A';
        return `${formatNumber(metric.value * 100, 1)}%`;
    };

    const formatCI = (metric) => {
        if (!metric || typeof metric.lower !== 'number' || typeof metric.upper !== 'number') return 'N/A';
        return `[${formatNumber(metric.lower * 100, 1)}% - ${formatNumber(metric.upper * 100, 1)}%]`;
    };

    const metricsToShow = [
        { key: 'accuracy', label: 'Genauigkeit' },
        { key: 'sensitivity', label: 'Sensitivität' },
        { key: 'specificity', label: 'Spezifität' },
        { key: 'ppv', label: 'Positiver Prädiktionswert (PPV)' },
        { key: 'npv', label: 'Negativer Prädiktionswert (NPV)' },
    ];

    const tbody = createElement('tbody');
    metricsToShow.forEach(metricInfo => {
        const metricData = statisticsData[metricInfo.key];
        const row = createElement('tr');
        row.innerHTML = `
            <td><strong>${metricInfo.label}</strong></td>
            <td>${formatPercent(metricData)}</td>
            <td>${formatCI(metricData)}</td>
        `;
        tbody.appendChild(row);
    });

    const aucRow = createElement('tr');
    aucRow.innerHTML = `
        <td><strong>AUC</strong></td>
        <td>${statisticsData.auc ? formatNumber(statisticsData.auc.value, 3) : 'N/A'}</td>
        <td>${statisticsData.auc && statisticsData.auc.lower ? `[${formatNumber(statisticsData.auc.lower, 3)} - ${formatNumber(statisticsData.auc.upper, 3)}]` : 'N/A'}</td>
    `;
    tbody.appendChild(aucRow);


    table.appendChild(createHeader(columns));
    table.appendChild(tbody);
    
    tableWrapper.appendChild(table);
    container.appendChild(tableTitle);
    container.appendChild(tableWrapper);

    return container;
}
