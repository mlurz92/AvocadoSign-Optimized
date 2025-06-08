import { createElement } from '../../utils/dom_helpers.js';

const PUBLICATION_STYLE_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                font: {
                    family: "'Roboto', sans-serif",
                    size: 12,
                },
                boxWidth: 20,
                padding: 20
            }
        },
        tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
        }
    },
    scales: {
        x: {
            title: {
                display: true,
                font: {
                    size: 14,
                    weight: '500'
                }
            },
            grid: {
                display: false,
                drawBorder: true,
                borderColor: '#424242'
            },
            ticks: {
                font: {
                    size: 12
                },
                color: '#212121'
            }
        },
        y: {
            title: {
                display: true,
                font: {
                    size: 14,
                    weight: '500'
                }
            },
            grid: {
                display: false,
                drawBorder: true,
                borderColor: '#424242'
            },
            ticks: {
                font: {
                    size: 12
                },
                color: '#212121'
            }
        }
    }
};

function createChartContainer(canvasId, title) {
    const container = createElement('div', { classes: ['card', 'publication-figure'] });
    const chartTitle = createElement('h3', { textContent: title });
    const chartWrapper = createElement('div', { classes: ['chart-container'] });
    const canvas = createElement('canvas', { id: canvasId });
    
    chartWrapper.appendChild(canvas);
    container.appendChild(chartTitle);
    container.appendChild(chartWrapper);
    
    return { container, canvas };
}

export function createRocChart(rocDataSets, canvasId) {
    const { container, canvas } = createChartContainer(canvasId, 'ROC-Kurven-Analyse');
    const ctx = canvas.getContext('2d');

    const datasets = rocDataSets.map(dataSet => ({
        label: `${dataSet.name} (AUC = ${dataSet.auc.value.toFixed(3)})`,
        data: dataSet.rocPoints.map(p => ({ x: p.fpr, y: p.tpr })),
        borderColor: dataSet.color,
        borderWidth: 2.5,
        fill: false,
        pointRadius: 0,
        tension: 0.1
    }));
    
    datasets.push({
        label: 'Zufallsgrenze',
        data: [{x: 0, y: 0}, {x: 1, y: 1}],
        borderColor: 'rgba(158, 158, 158, 0.8)',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
    });

    const chartOptions = {
        ...PUBLICATION_STYLE_OPTIONS,
        scales: {
            x: {
                ...PUBLICATION_STYLE_OPTIONS.scales.x,
                title: { ...PUBLICATION_STYLE_OPTIONS.scales.x.title, text: '1 - Spezifität (Falsch-Positiv-Rate)' },
                min: 0,
                max: 1
            },
            y: {
                ...PUBLICATION_STYLE_OPTIONS.scales.y,
                title: { ...PUBLICATION_STYLE_OPTIONS.scales.y.title, text: 'Sensitivität (Wahr-Positiv-Rate)' },
                min: 0,
                max: 1
            }
        }
    };
    
    new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: chartOptions
    });

    return container;
}


export function createForestPlot(statistics, canvasId) {
    const { container, canvas } = createChartContainer(canvasId, 'Forest Plot der diagnostischen Güte');
    const ctx = canvas.getContext('2d');

    const labels = [];
    const sensitivityData = [];
    const specificityData = [];
    
    for (const key in statistics) {
        if (Object.hasOwnProperty.call(statistics, key) && statistics[key].sensitivity) {
            labels.push(statistics[key].name);
            sensitivityData.push({
                x: statistics[key].sensitivity.value,
                xMin: statistics[key].sensitivity.lower,
                xMax: statistics[key].sensitivity.upper
            });
            specificityData.push({
                x: statistics[key].specificity.value,
                xMin: statistics[key].specificity.lower,
                xMax: statistics[key].specificity.upper
            });
        }
    }

    const chartOptions = {
        ...PUBLICATION_STYLE_OPTIONS,
        indexAxis: 'y',
        scales: {
            x: {
                ...PUBLICATION_STYLE_OPTIONS.scales.x,
                title: { ...PUBLICATION_STYLE_OPTIONS.scales.x.title, text: 'Wert' },
                min: 0,
                max: 1.05
            },
            y: {
                ...PUBLICATION_STYLE_OPTIONS.scales.y,
                 title: { ...PUBLICATION_STYLE_OPTIONS.scales.y.title, text: 'Kriterium' },
            }
        },
        plugins: {
            ...PUBLICATION_STYLE_OPTIONS.plugins,
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const item = context.dataset.data[context.dataIndex];
                        return `${context.dataset.label}: ${item.x.toFixed(2)} [${item.xMin.toFixed(2)} - ${item.xMax.toFixed(2)}]`;
                    }
                }
            }
        }
    };

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sensitivität',
                    data: sensitivityData,
                    backgroundColor: 'rgba(13, 71, 161, 0.7)',
                    borderColor: 'rgba(13, 71, 161, 1)',
                    borderWidth: 1,
                    barPercentage: 0.5,
                    errorBarWhiskerRatio: 0.5,
                    errorBarColor: 'rgba(13, 71, 161, 1)',
                    errorBarWhiskerSize: 6
                },
                {
                    label: 'Spezifität',
                    data: specificityData,
                    backgroundColor: 'rgba(245, 127, 23, 0.7)',
                    borderColor: 'rgba(245, 127, 23, 1)',
                    borderWidth: 1,
                    barPercentage: 0.5,
                    errorBarWhiskerRatio: 0.5,
                    errorBarColor: 'rgba(245, 127, 23, 1)',
                    errorBarWhiskerSize: 6
                }
            ]
        },
        options: chartOptions,
        plugins: [{
            id: 'errorBars',
            afterDatasetsDraw(chart) {
                const { ctx, data, scales: {x, y} } = chart;
                ctx.save();
                ctx.lineWidth = 1.5;

                data.datasets.forEach((dataset, i) => {
                    ctx.strokeStyle = dataset.errorBarColor || dataset.borderColor;
                    dataset.data.forEach((value, index) => {
                        const yPos = y.getPixelForValue(index);
                        const xMin = x.getPixelForValue(value.xMin);
                        const xMax = x.getPixelForValue(value.xMax);
                        
                        ctx.beginPath();
                        ctx.moveTo(xMin, yPos);
                        ctx.lineTo(xMax, yPos);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(xMin, yPos - dataset.errorBarWhiskerSize);
                        ctx.lineTo(xMin, yPos + dataset.errorBarWhiskerSize);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(xMax, yPos - dataset.errorBarWhiskerSize);
                        ctx.lineTo(xMax, yPos + dataset.errorBarWhiskerSize);
                        ctx.stroke();
                    });
                });
                ctx.restore();
            }
        }]
    });

    return container;
}
