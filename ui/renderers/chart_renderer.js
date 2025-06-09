const ChartRenderer = {
    _chartInstance: null,

    renderRocChart: function(canvasId, chartDataSets) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas mit der ID '${canvasId}' konnte nicht gefunden werden.`);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error("2D-Kontext des Canvas konnte nicht abgerufen werden.");
            return;
        }

        if (this._chartInstance) {
            this._chartInstance.destroy();
        }

        if (typeof Chart === 'undefined') {
            console.error("Chart.js ist nicht geladen. Bitte CDN-Link in index.html einfügen.");
            return;
        }

        const styleGuide = AppConfig.radiologyStyleGuide;
        const chartColors = AppConfig.settings.chartColors;

        const referenceLine = {
            label: 'Reference',
            data: [{x: 0, y: 0}, {x: 1, y: 1}],
            borderColor: styleGuide.chart.axisColor,
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0
        };

        const datasets = [...chartDataSets, referenceLine];

        const config = {
            type: 'scatter',
            data: {
                datasets: datasets.map(ds => ({
                    ...ds,
                    showLine: true,
                    tension: 0.1,
                    pointBackgroundColor: ds.borderColor,
                    pointRadius: ds.pointRadius === undefined ? 2 : ds.pointRadius,
                    pointHoverRadius: ds.pointRadius === undefined ? 4 : ds.pointRadius + 2
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: styleGuide.chart.legendPosition,
                        labels: {
                            font: {
                                family: styleGuide.font.family,
                                size: 12
                            },
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 20
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: { family: styleGuide.font.family, size: 14 },
                        bodyFont: { family: styleGuide.font.family, size: 12 },
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                if (label) {
                                    return `${label}: (1-Spez: ${context.parsed.x.toFixed(3)}, Sens: ${context.parsed.y.toFixed(3)})`;
                                }
                                return null;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: 0,
                        max: 1,
                        ticks: {
                            stepSize: 0.2,
                            font: {
                                family: styleGuide.font.family,
                                size: 12
                            },
                            color: styleGuide.chart.axisColor
                        },
                        grid: {
                            color: styleGuide.chart.gridLineColor,
                            drawOnChartArea: true
                        },
                        title: {
                            display: true,
                            text: '1 - Specificity',
                            font: {
                                family: styleGuide.font.family,
                                size: 14,
                                weight: 'bold'
                            },
                            color: styleGuide.chart.axisColor
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        min: 0,
                        max: 1,
                        ticks: {
                            stepSize: 0.2,
                            font: {
                                family: styleGuide.font.family,
                                size: 12
                            },
                            color: styleGuide.chart.axisColor
                        },
                        grid: {
                            color: styleGuide.chart.gridLineColor,
                            drawOnChartArea: true
                        },
                        title: {
                            display: true,
                            text: 'Sensitivity',
                            font: {
                                family: styleGuide.font.family,
                                size: 14,
                                weight: 'bold'
                            },
                            color: styleGuide.chart.axisColor
                        }
                    }
                },
                elements: {
                    line: {
                        borderWidth: styleGuide.chart.lineWidth
                    }
                }
            }
        };

        this._chartInstance = new Chart(ctx, config);
    }
};

window.ChartRenderer = ChartRenderer;
