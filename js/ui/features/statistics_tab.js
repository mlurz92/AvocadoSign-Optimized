import { getElement, clearContainer, createElement } from '../../utils/dom_helpers.js';
import { createStatisticsTable } from '../components/tables.js';
import { createRocChart, createForestPlot } from '../components/charts.js';
import { calculateDiagnosticMetrics, calculateRocCurve } from '../../services/statistics_service.js';
import { studyCriteria, evaluatePatient } from '../../core/criteria_manager.js';

function calculateAllStatistics(state) {
    const { processedData, bruteForce } = state;
    if (!processedData || processedData.length === 0) return {};

    const allStats = {};
    const groundTruth = processedData.map(p => p.groundTruth);

    const criteriaToEvaluate = { ...studyCriteria };

    if (bruteForce.bestResult) {
        criteriaToEvaluate.bruteForce = {
            id: 'bruteForce',
            name: 'Optimiertes T2 (Brute-Force)',
            type: 'brute-force',
            citation: 'Diese Studie',
            parameters: bruteForce.bestResult.parameters,
        };
    }
    
    for (const key in criteriaToEvaluate) {
        const criterion = criteriaToEvaluate[key];
        const evaluations = processedData.map(p => evaluatePatient(p, criterion));
        const predictions = evaluations.map(e => e.prediction);
        const scores = evaluations.map(e => e.score);

        const metrics = calculateDiagnosticMetrics(predictions, groundTruth);
        const roc = calculateRocCurve(scores, groundTruth);

        allStats[criterion.id] = {
            ...metrics,
            auc: roc.auc,
            rocPoints: roc.rocPoints,
            name: criterion.name,
            id: criterion.id
        };
    }

    return allStats;
}


export function renderStatisticsTab(state) {
    const container = getElement('#statistics-output');
    clearContainer(container);

    const allStatistics = calculateAllStatistics(state);

    if (Object.keys(allStatistics).length === 0) {
        container.textContent = 'Keine Daten für die statistische Analyse vorhanden.';
        return;
    }

    const rocChartData = [
        { ...allStatistics.LurzSchaefer, color: '#0d47a1' },
        { ...allStatistics.Brown, color: '#f57f17' },
        { ...allStatistics.Koh, color: '#2e7d32' },
        { ...allStatistics.Horvat, color: '#c62828' }
    ];
    if (allStatistics.bruteForce) {
        rocChartData.push({ ...allStatistics.bruteForce, color: '#5e35b1' });
    }

    const rocChartContainer = createRocChart(rocChartData, 'roc-chart');
    container.appendChild(rocChartContainer);
    
    const forestPlotContainer = createForestPlot(allStatistics, 'forest-plot');
    container.appendChild(forestPlotContainer);

    for (const key in allStatistics) {
        const stats = allStatistics[key];
        const tableContainer = createStatisticsTable(stats, `Statistik: ${stats.name}`);
        container.appendChild(tableContainer);
    }
}
