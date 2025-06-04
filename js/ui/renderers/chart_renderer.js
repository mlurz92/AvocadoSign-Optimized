const chartRenderer = (() => {
    const safeGetChartSettings = () => {
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG && typeof APP_CONFIG.CHART_SETTINGS !== 'undefined' && APP_CONFIG.CHART_SETTINGS) {
            return APP_CONFIG.CHART_SETTINGS;
        }
        console.warn("APP_CONFIG.CHART_SETTINGS nicht verfügbar, verwende Fallback-Werte für Diagramme.");
        return {
            DEFAULT_WIDTH: 450,
            DEFAULT_HEIGHT: 300,
            DEFAULT_MARGIN: Object.freeze({ top: 20, right: 20, bottom: 40, left: 45 }),
            COMPACT_PIE_MARGIN: Object.freeze({ top: 10, right: 10, bottom: 40, left: 10 }),
            NEW_PRIMARY_COLOR_BLUE: '#4472C4',
            NEW_SECONDARY_COLOR_YELLOW_GREEN: '#A9D18E',
            DEFAULT_COLORS: Object.freeze(['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab']),
            AXIS_LABEL_FONT_SIZE: '11px',
            TICK_LABEL_FONT_SIZE: '10px',
            LEGEND_FONT_SIZE: '10px',
            POINT_RADIUS: 4,
            LINE_STROKE_WIDTH: 2,
            ENABLE_GRIDLINES: true
        };
    };

    const defaultMargin = () => cloneDeep(safeGetChartSettings().DEFAULT_MARGIN);
    const defaultColors = () => safeGetChartSettings().DEFAULT_COLORS || ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'];

    function _getColors(numColors, schemeName = null) {
        const chartSettings = safeGetChartSettings();
        const currentSchemeName = schemeName || (typeof stateManager !== 'undefined' && typeof stateManager.getChartColorScheme === 'function' ? stateManager.getChartColorScheme() : 'default');
        const schemes = {
            default: chartSettings.DEFAULT_COLORS,
            primary: [chartSettings.NEW_PRIMARY_COLOR_BLUE, chartSettings.NEW_SECONDARY_COLOR_YELLOW_GREEN, '#76b7b2', '#e15759', '#59a14f', '#edc949'],
            accent: [chartSettings.NEW_SECONDARY_COLOR_YELLOW_GREEN, chartSettings.NEW_PRIMARY_COLOR_BLUE, '#e15759', '#76b7b2', '#59a14f', '#edc949'],
            grayscale: ['#333333', '#666666', '#999999', '#cccccc', '#dddddd', '#eeeeee'],
            print_friendly_qualitative: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
            radiology_publication: ['#000000', '#505050', '#808080', '#B0B0B0', '#D0D0D0', '#E0E0E0'] 
        };
        const selectedScheme = schemes[currentSchemeName] || schemes.default;
        return Array.from({ length: numColors }, (_, i) => selectedScheme[i % selectedScheme.length]);
    }

    function _createTooltip(targetElementId) {
        const tooltip = d3.select(`#${targetElementId}`)
            .append("div")
            .attr("class", "chart-tooltip bg-light border rounded shadow-sm p-2 small")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("opacity", 0)
            .style("pointer-events", "none")
            .style("transition", "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out")
            .style("font-family", "var(--font-family-sans-serif)")
            .style("z-index", "10");
        return tooltip;
    }

    function _addChartTitle(svg, title, width, margin) {
        if (title) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", margin.top / 2 + 5)
                .attr("text-anchor", "middle")
                .style("font-size", "13px")
                .style("font-weight", "600")
                .style("fill", "var(--chart-label-color)")
                .text(title);
        }
    }

    function _addAxisLabels(svg, xLabel, yLabel, width, height, margin) {
        const chartSettings = safeGetChartSettings();
        if (xLabel) {
            svg.append("text")
                .attr("class", "axis-label x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + margin.top + margin.bottom - (margin.bottom / 4) )
                .style("font-size", chartSettings.AXIS_LABEL_FONT_SIZE)
                .style("fill", "var(--chart-label-color)")
                .text(xLabel);
        }
        if (yLabel) {
            svg.append("text")
                .attr("class", "axis-label y-axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + (margin.left / 3))
                .attr("x", 0 - (height / 2) - margin.top)
                .style("font-size", chartSettings.AXIS_LABEL_FONT_SIZE)
                .style("fill", "var(--chart-label-color)")
                .text(yLabel);
        }
    }

    function _addLegend(svg, legendData, width, margin, options = {}) {
        if (!legendData || legendData.length === 0) return;
        const chartSettings = safeGetChartSettings();
        const legendFontSize = options.legendFontSize || chartSettings.LEGEND_FONT_SIZE;
        const itemHeight = parseInt(legendFontSize, 10) + 8;
        const itemWidth = options.legendItemWidth || 120;
        const symbolSize = parseInt(legendFontSize, 10);
        const legendPadding = 5;
        const legendX = width + margin.right / 2 - (options.legendHorizontalOffset || 0);
        const legendY = margin.top + (options.legendVerticalOffset || 0);

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${legendX}, ${legendY})`);

        const legendItems = legend.selectAll(".legend-item")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * itemHeight})`)
            .style("cursor", "default")
            .attr("data-bs-toggle", "tooltip")
            .attr("data-bs-placement", "top")
            .attr("data-bs-html", "true")
            .attr("data-bs-title", d => d.tooltip || d.name);

        legendItems.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", symbolSize)
            .attr("height", symbolSize)
            .style("fill", d => d.color);

        legendItems.append("text")
            .attr("x", symbolSize + legendPadding)
            .attr("y", symbolSize / 2)
            .attr("dy", "0.35em")
            .style("font-size", legendFontSize)
            .style("fill", "var(--chart-label-color)")
            .text(d => d.name);
            
        if (typeof ui_helpers !== 'undefined' && ui_helpers.initializeTooltips && legendItems.nodes().length > 0) {
            ui_helpers.initializeTooltips(legend.node());
        }
    }

    function _addGridlines(svg, xScale, yScale, width, height, xGrid, yGrid) {
        const chartSettings = safeGetChartSettings();
        if (chartSettings.ENABLE_GRIDLINES) {
            if (yGrid && yScale.ticks) {
                svg.append("g")
                    .attr("class", "grid y-grid")
                    .call(d3.axisLeft(yScale)
                        .ticks(5)
                        .tickSize(-width)
                        .tickFormat("")
                    );
            }
            if (xGrid && xScale.ticks) {
                 svg.append("g")
                    .attr("class", "grid x-grid")
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(xScale)
                        .ticks(5)
                        .tickSize(-height)
                        .tickFormat("")
                    );
            }
        }
    }

    function renderBarChart(data, targetElementId, options = {}) {
        d3.select(`#${targetElementId}`).select("svg").remove();
        const chartSettings = safeGetChartSettings();
        const { width = chartSettings.DEFAULT_WIDTH, height = chartSettings.DEFAULT_HEIGHT, margin = defaultMargin(), xLabel = '', yLabel = '', title = '', colorScheme = null, barLabel = false, yAxisMin = 0 } = options;
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const colors = _getColors(data.length, colorScheme);

        const svg = d3.select(`#${targetElementId}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand().range([0, chartWidth]).padding(0.2);
        const y = d3.scaleLinear().range([chartHeight, 0]);

        x.domain(data.map(d => d.label));
        const yMax = d3.max(data, d => d.value);
        y.domain([yAxisMin, yMax > 0 ? yMax * 1.05 : 10]);
        
        _addGridlines(svg, x, y, chartWidth, chartHeight, false, true);

        const tooltip = _createTooltip(targetElementId);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.value))
            .attr("height", d => chartHeight - y(d.value))
            .attr("fill", (d, i) => colors[i])
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible").style("opacity", 1);
                d3.select(event.currentTarget).style("filter", "brightness(0.9)");
            })
            .on("mousemove", (event, d) => {
                tooltip.html(`<strong>${d.label}</strong><br>${formatNumber(d.value, d.value < 1 && d.value !==0 ? 2 : 0, 'N/A')}${d.unit || ''}`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", (event, d) => {
                tooltip.style("visibility", "hidden").style("opacity", 0);
                d3.select(event.currentTarget).style("filter", "none");
            });

        if (barLabel) {
            svg.selectAll(".bar-label")
                .data(data)
                .enter().append("text")
                .attr("class", "bar-label")
                .attr("x", d => x(d.label) + x.bandwidth() / 2)
                .attr("y", d => y(d.value) - 5)
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .style("fill", "var(--chart-label-color)")
                .text(d => formatNumber(d.value, d.value < 1 && d.value !==0 ? 2 : 0, ''));
        }

        svg.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).tickSizeOuter(0));
        svg.append("g").attr("class", "axis y-axis").call(d3.axisLeft(y).ticks(5).tickSizeOuter(0));
        
        _addChartTitle(svg.node().parentNode, title, width, margin);
        _addAxisLabels(svg, xLabel, yLabel, chartWidth, chartHeight, margin);
        if (typeof ui_helpers !== 'undefined' && ui_helpers.initializeTooltips) ui_helpers.initializeTooltips(d3.select(`#${targetElementId}`).node());
    }

    function renderPieChart(data, targetElementId, options = {}) {
        d3.select(`#${targetElementId}`).select("svg").remove();
        const chartSettings = safeGetChartSettings();
        const { width = chartSettings.DEFAULT_WIDTH / 1.5, height = chartSettings.DEFAULT_HEIGHT / 1.5, margin = chartSettings.COMPACT_PIE_MARGIN, title = '', colorScheme = null, innerRadiusFactor = 0.4, legendBelow = false, legendItemCount = 2, fontSize = chartSettings.LEGEND_FONT_SIZE } = options;
        const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom - (legendBelow ? (legendItemCount * (parseInt(fontSize,10) + 8) + 10) : 0) ) / 2;
        const colors = _getColors(data.length, colorScheme);

        const svg = d3.select(`#${targetElementId}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${(width - margin.left - margin.right) / 2 + margin.left}, ${(height - margin.top - margin.bottom - (legendBelow ? (legendItemCount * (parseInt(fontSize,10) + 8) + 10) : 0)) / 2 + margin.top})`);

        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(radius * innerRadiusFactor).outerRadius(radius);
        const total = d3.sum(data, d => d.value);

        const tooltip = _createTooltip(targetElementId);

        svg.selectAll("path")
            .data(pie(data))
            .enter().append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => colors[i])
            .attr("stroke", "var(--bg-white)")
            .style("stroke-width", "1px")
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible").style("opacity", 1);
                d3.select(event.currentTarget).style("filter", "brightness(0.9)");
            })
            .on("mousemove", (event, d) => {
                const percent = total > 0 ? formatPercent(d.data.value / total, 1) : 'N/A';
                tooltip.html(`<strong>${d.data.label}</strong><br>${formatNumber(d.data.value, 0)} (${percent})`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", (event, d) => {
                tooltip.style("visibility", "hidden").style("opacity", 0);
                d3.select(event.currentTarget).style("filter", "none");
            });
        
        _addChartTitle(svg.node().parentNode.parentNode, title, width, margin);
        if (legendBelow) {
            const legendData = data.map((d,i) => ({name: d.label, color: colors[i], tooltip: `${d.label}: ${formatNumber(d.value, 0)} (${total > 0 ? formatPercent(d.value / total, 1) : 'N/A'})` }));
            _addLegend(d3.select(svg.node().parentNode), legendData, width, { ...margin, top: height - margin.bottom - (legendItemCount * (parseInt(fontSize,10) + 8))}, {legendHorizontalOffset: width/2 - margin.left, legendItemWidth: width / legendData.length - 5, legendFontSize: fontSize });
        }
    }
    
    function renderHistogram(data, targetElementId, options = {}) {
        d3.select(`#${targetElementId}`).select("svg").remove();
        const chartSettings = safeGetChartSettings();
        const { width = chartSettings.DEFAULT_WIDTH, height = chartSettings.DEFAULT_HEIGHT, margin = defaultMargin(), xLabel = '', yLabel = '', title = '', color = chartSettings.NEW_PRIMARY_COLOR_BLUE, numBins = 10 } = options;
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svg = d3.select(`#${targetElementId}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xMin = d3.min(data);
        const xMax = d3.max(data);
        const x = d3.scaleLinear().domain([xMin, xMax]).range([0, chartWidth]);
        
        const histogram = d3.histogram()
            .value(d => d)
            .domain(x.domain())
            .thresholds(x.ticks(numBins));
        const bins = histogram(data);

        const y = d3.scaleLinear().range([chartHeight, 0]);
        y.domain([0, d3.max(bins, d => d.length) * 1.05]);
        
        _addGridlines(svg, x, y, chartWidth, chartHeight, false, true);

        const tooltip = _createTooltip(targetElementId);

        svg.selectAll("rect")
            .data(bins)
            .enter().append("rect")
            .attr("x", d => x(d.x0) + 1)
            .attr("transform", d => `translate(0, ${y(d.length)})`)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("height", d => chartHeight - y(d.length))
            .style("fill", color)
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible").style("opacity", 1);
                d3.select(event.currentTarget).style("filter", "brightness(0.9)");
            })
            .on("mousemove", (event, d) => {
                tooltip.html(`Range: ${formatNumber(d.x0,1)}–${formatNumber(d.x1,1)}<br>Anzahl: ${d.length}`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", (event, d) => {
                tooltip.style("visibility", "hidden").style("opacity", 0);
                d3.select(event.currentTarget).style("filter", "none");
            });

        svg.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).ticks(Math.min(numBins, 10)).tickFormat(d3.format(".1f")).tickSizeOuter(0));
        svg.append("g").attr("class", "axis y-axis").call(d3.axisLeft(y).ticks(5).tickSizeOuter(0));

        _addChartTitle(svg.node().parentNode, title, width, margin);
        _addAxisLabels(svg, xLabel, yLabel, chartWidth, chartHeight, margin);
        if (typeof ui_helpers !== 'undefined' && ui_helpers.initializeTooltips) ui_helpers.initializeTooltips(d3.select(`#${targetElementId}`).node());
    }

    function renderROCCurve(rocDataSets, targetElementId, options = {}) {
        d3.select(`#${targetElementId}`).select("svg").remove();
        const chartSettings = safeGetChartSettings();
        const { width = chartSettings.DEFAULT_WIDTH, height = chartSettings.DEFAULT_HEIGHT, margin = defaultMargin(), title = "ROC-Kurve(n)", xLabel = "1 - Spezifität", yLabel = "Sensitivität", colorScheme = null } = options;
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const colors = _getColors(rocDataSets.length, colorScheme);

        const svg = d3.select(`#${targetElementId}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, 1]).range([0, chartWidth]);
        const y = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0]);

        svg.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".1f")).tickSizeOuter(0));
        svg.append("g").attr("class", "axis y-axis").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".1f")).tickSizeOuter(0));
        _addGridlines(svg, x, y, chartWidth, chartHeight, true, true);

        svg.append("line")
            .attr("class", "reference-line")
            .attr("x1", 0).attr("y1", chartHeight)
            .attr("x2", chartWidth).attr("y2", 0);
            
        const tooltip = _createTooltip(targetElementId);

        rocDataSets.forEach((dataSet, index) => {
            if (!dataSet.points || dataSet.points.length === 0) return;
            
            const line = d3.line()
                .x(d => x(d.fpr))
                .y(d => y(d.tpr))
                .curve(d3.curveLinear);

            svg.append("path")
                .datum(dataSet.points)
                .attr("class", "roc-curve")
                .attr("fill", "none")
                .attr("stroke", colors[index])
                .attr("stroke-width", chartSettings.LINE_STROKE_WIDTH)
                .attr("d", line);

            svg.selectAll(`.dot-${index}`)
                .data(dataSet.points.filter(p => p.threshold !== undefined)) 
                .enter().append("circle")
                .attr("class", `roc-point dot-${index}`)
                .attr("cx", d => x(d.fpr))
                .attr("cy", d => y(d.tpr))
                .attr("r", chartSettings.POINT_RADIUS / 1.5)
                .attr("fill", colors[index])
                .on("mouseover", (event, d) => {
                    tooltip.style("visibility", "visible").style("opacity", 1);
                    d3.select(event.currentTarget).attr("r", chartSettings.POINT_RADIUS * 1.2);
                })
                .on("mousemove", (event, d) => {
                    let tooltipText = `<strong>${dataSet.name}</strong><br>1-Spez: ${formatNumber(d.fpr, 3, 'N/A', 'en')}<br>Sens: ${formatNumber(d.tpr, 3, 'N/A', 'en')}`;
                    if (d.threshold !== undefined) tooltipText += `<br>Schwelle: ${formatNumber(d.threshold, 2, 'N/A', 'en')}`;
                    tooltip.html(tooltipText)
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", (event, d) => {
                    tooltip.style("visibility", "hidden").style("opacity", 0);
                    d3.select(event.currentTarget).attr("r", chartSettings.POINT_RADIUS / 1.5);
                });

            if (dataSet.auc !== undefined) {
                 let aucText = `AUC (${dataSet.name}) = ${formatNumber(dataSet.auc.value, 3, 'N/A', 'en')}`;
                 if (dataSet.auc.ci && dataSet.auc.ci.lower !== undefined) {
                     aucText += ` (95% CI: ${formatNumber(dataSet.auc.ci.lower, 3, 'N/A', 'en')} – ${formatNumber(dataSet.auc.ci.upper, 3, 'N/A', 'en')})`;
                 }
                 svg.append("text")
                    .attr("class", "auc-label")
                    .attr("x", chartWidth - 10)
                    .attr("y", margin.top + index * (parseInt(chartSettings.AXIS_LABEL_FONT_SIZE, 10) + 5))
                    .attr("text-anchor", "end")
                    .style("fill", colors[index])
                    .text(aucText);
            }
        });
        
        _addChartTitle(svg.node().parentNode, title, width, margin);
        _addAxisLabels(svg, xLabel, yLabel, chartWidth, chartHeight, margin);
        
        const legendData = rocDataSets.map((d,i) => ({ name: d.name, color: colors[i], tooltip: d.name }));
        _addLegend(svg, legendData, chartWidth - margin.right, margin, { legendHorizontalOffset: 0, legendVerticalOffset: 0, legendFontSize: '9px' });

    }

    function renderComparisonBarChart(data, targetElementId, options = {}, t2LabelOverride = "T2-optimiert") {
        d3.select(`#${targetElementId}`).select("svg").remove();
        const chartSettings = safeGetChartSettings();
        const { width = chartSettings.DEFAULT_WIDTH / 1.2, height = chartSettings.DEFAULT_HEIGHT / 1.3, margin = {top:30, right: 20, bottom:50, left:50}, title = "", yLabel = "Wert", colorScheme = null, axisLabelFontSize = '10px', tickLabelFontSize = '9px', legendFontSize = '9px' } = options;

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const groups = data.map(d => d.metric);
        const subgroups = ["AS", "T2"]; 
        const colors = _getColors(subgroups.length, colorScheme === 'default_comparison' ? 'primary' : colorScheme);


        const svg = d3.select(`#${targetElementId}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x0 = d3.scaleBand().domain(groups).rangeRound([0, chartWidth]).paddingInner(0.2);
        const x1 = d3.scaleBand().domain(subgroups).rangeRound([0, x0.bandwidth()]).padding(0.05);
        const y = d3.scaleLinear().domain([0, 1]).rangeRound([chartHeight, 0]);

        _addGridlines(svg, x0, y, chartWidth, chartHeight, false, true);

        const tooltip = _createTooltip(targetElementId);

        svg.append("g")
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("transform", d => `translate(${x0(d.metric)},0)`)
            .selectAll("rect")
            .data(d => subgroups.map(key => ({ key, value: d[key], metric: d.metric })))
            .join("rect")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(isNaN(parseFloat(d.value)) ? 0 : parseFloat(d.value)))
            .attr("width", x1.bandwidth())
            .attr("height", d => chartHeight - y(isNaN(parseFloat(d.value)) ? 0 : parseFloat(d.value)))
            .attr("fill", d => d.key === "AS" ? colors[0] : colors[1])
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible").style("opacity", 1);
                d3.select(event.currentTarget).style("filter", "brightness(0.9)");
            })
            .on("mousemove", (event, d) => {
                tooltip.html(`<strong>${d.metric} (${d.key === "T2" ? t2LabelOverride : d.key})</strong><br>Wert: ${formatPercent(d.value, d.metric === 'AUC' ? 3 : 1)}`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", (event,d)=>{
                tooltip.style("visibility", "hidden").style("opacity", 0);
                d3.select(event.currentTarget).style("filter", "none");
            });

        svg.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x0).tickSizeOuter(0)).selectAll("text").style("font-size", tickLabelFontSize);
        svg.append("g").attr("class", "axis y-axis").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".1f")).tickSizeOuter(0)).selectAll("text").style("font-size", tickLabelFontSize);
        
        _addChartTitle(svg.node().parentNode, title, width, margin);
        _addAxisLabels(svg, "", yLabel, chartWidth, chartHeight, { ...margin, bottom: margin.bottom -10});

        const legendData = [
            { name: "AS", color: colors[0] },
            { name: t2LabelOverride, color: colors[1] }
        ];
        _addLegend(svg, legendData, chartWidth, {top: -margin.top/1.5 , right: margin.right, bottom: margin.bottom, left:margin.left}, {legendHorizontalOffset: -chartWidth +5, legendItemWidth: 80, legendFontSize: legendFontSize});
    }
    
    function renderPerformanceComparisonPlot(data, targetElementId, options = {}) {
        d3.select(`#${targetElementId}`).select("svg").remove();
        const chartSettings = safeGetChartSettings();
        const { width = chartSettings.DEFAULT_WIDTH * 1.2, height = chartSettings.DEFAULT_HEIGHT * 0.8, margin = { top: 30, right: 30, bottom: 50, left: 200 }, title = "Performance Vergleich", xLabel = "AUC (95% CI)", colorScheme = null, valueDomain = [0.4, 1.0] } = options;

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const colors = _getColors(data.length, colorScheme);

        const svg = d3.select(`#${targetElementId}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const y = d3.scaleBand()
            .range([0, chartHeight])
            .domain(data.map(d => d.name))
            .padding(0.3);

        const x = d3.scaleLinear()
            .domain(valueDomain)
            .range([0, chartWidth]);

        _addGridlines(svg, x, y, chartWidth, chartHeight, true, false);
        
        svg.append("line") 
            .attr("x1", x(0.5))
            .attr("x2", x(0.5))
            .attr("y1", 0)
            .attr("y2", chartHeight)
            .attr("stroke", "var(--chart-grid-color)")
            .attr("stroke-dasharray", "3,3");


        const tooltip = _createTooltip(targetElementId);

        svg.selectAll(".error-bar")
            .data(data)
            .enter()
            .append("line")
            .attr("class", "error-bar")
            .attr("x1", d => x(d.ci_low))
            .attr("x2", d => x(d.ci_up))
            .attr("y1", d => y(d.name) + y.bandwidth() / 2)
            .attr("y2", d => y(d.name) + y.bandwidth() / 2)
            .attr("stroke", (d,i) => colors[i])
            .attr("stroke-width", 1.5)
            .on("mouseover", (event, d) => tooltip.style("visibility", "visible").style("opacity", 1))
            .on("mousemove", (event, d) => {
                tooltip.html(`<strong>${d.name}</strong><br>${xLabel.split('(')[0].trim()}: ${formatNumber(d.value, 3, 'N/A', 'en')}<br>95% CI: ${formatNumber(d.ci_low, 3, 'N/A', 'en')} – ${formatNumber(d.ci_up, 3, 'N/A', 'en')}`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden").style("opacity", 0));
            
        svg.selectAll(".ci-cap-low")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", d => x(d.ci_low))
            .attr("x2", d => x(d.ci_low))
            .attr("y1", d => y(d.name) + y.bandwidth() / 2 - 4)
            .attr("y2", d => y(d.name) + y.bandwidth() / 2 + 4)
            .attr("stroke", (d,i) => colors[i])
            .attr("stroke-width", 1.5);
            
        svg.selectAll(".ci-cap-high")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", d => x(d.ci_up))
            .attr("x2", d => x(d.ci_up))
            .attr("y1", d => y(d.name) + y.bandwidth() / 2 - 4)
            .attr("y2", d => y(d.name) + y.bandwidth() / 2 + 4)
            .attr("stroke", (d,i) => colors[i])
            .attr("stroke-width", 1.5);

        svg.selectAll(".dot-estimate")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot-estimate")
            .attr("cx", d => x(d.value))
            .attr("cy", d => y(d.name) + y.bandwidth() / 2)
            .attr("r", chartSettings.POINT_RADIUS)
            .attr("fill", (d,i) => colors[i])
            .on("mouseover", (event, d) => tooltip.style("visibility", "visible").style("opacity", 1))
            .on("mousemove", (event, d) => {
                 tooltip.html(`<strong>${d.name}</strong><br>${xLabel.split('(')[0].trim()}: ${formatNumber(d.value, 3, 'N/A', 'en')}<br>95% CI: ${formatNumber(d.ci_low, 3, 'N/A', 'en')} – ${formatNumber(d.ci_up, 3, 'N/A', 'en')}`)
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden").style("opacity", 0));

        svg.append("g").attr("class", "axis x-axis").attr("transform", `translate(0, ${chartHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2f")).tickSizeOuter(0));
        svg.append("g").attr("class", "axis y-axis").call(d3.axisLeft(y).tickSizeOuter(0));

        _addChartTitle(svg.node().parentNode, title, width, margin);
        _addAxisLabels(svg, xLabel, "", chartWidth, chartHeight, margin);
    }

    function renderAgeDistributionChart(targetElementId, ageData, kollektivName) {
        if (!ageData || ageData.length === 0) {
            ui_helpers.updateElementHTML(targetElementId, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung (${kollektivName}).</p>`);
            return;
        }
        const chartSettings = safeGetChartSettings();
        const options = {
            title: `Altersverteilung (${kollektivName})`,
            xLabel: 'Alter (Jahre)',
            yLabel: 'Anzahl Patienten',
            color: chartSettings.NEW_PRIMARY_COLOR_BLUE,
            numBins: 10,
            width: chartSettings.DEFAULT_WIDTH,
            height: chartSettings.DEFAULT_HEIGHT / 1.5,
            margin: { top: 20, right: 20, bottom: 40, left: 45 }
        };
        renderHistogram(ageData, targetElementId, options);
    }

    function renderGenderDistributionChart(targetElementId, genderData, kollektivName) {
        const data = [
            { label: UI_TEXTS.legendLabels.male, value: genderData.m ?? 0 },
            { label: UI_TEXTS.legendLabels.female, value: genderData.f ?? 0 }
        ];
        if (genderData.unbekannt > 0) {
            data.push({ label: UI_TEXTS.legendLabels.unknownGender, value: genderData.unbekannt });
        }
        if (data.every(d => d.value === 0)) {
            ui_helpers.updateElementHTML(targetElementId, `<p class="text-muted small text-center p-3">Keine Daten für Geschlechterverteilung (${kollektivName}).</p>`);
            return;
        }
        const chartSettings = safeGetChartSettings();
        const options = {
            title: `Geschlechterverteilung (${kollektivName})`,
            colorScheme: 'default', 
            width: chartSettings.DEFAULT_WIDTH,
            height: chartSettings.DEFAULT_HEIGHT / 1.5,
            margin: chartSettings.COMPACT_PIE_MARGIN,
            innerRadiusFactor: 0.4,
            legendBelow: true,
            legendItemCount: data.length,
            fontSize: chartSettings.LEGEND_FONT_SIZE
        };
        renderPieChart(data, targetElementId, options);
    }

    function renderASPerformanceBarChart(targetElementId, stats, kollektivName) {
        if (!stats || !stats.matrix || (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) === 0) {
            ui_helpers.updateElementHTML(targetElementId, `<p class="text-center text-muted p-3">Keine Daten für Chart (${kollektivName}).</p>`);
            return;
        }

        const data = [
            { label: 'Sens.', value: stats.sens?.value, unit: '%' },
            { label: 'Spez.', value: stats.spez?.value, unit: '%' },
            { label: 'PPV', value: stats.ppv?.value, unit: '%' },
            { label: 'NPV', value: stats.npv?.value, unit: '%' },
            { label: 'Acc.', value: stats.acc?.value, unit: '%' },
            { label: 'AUC', value: stats.auc?.value, unit: '' }
        ].filter(d => d.value !== undefined && !isNaN(d.value));
        
        const chartSettings = safeGetChartSettings();
        const options = {
            title: `Diagnostische Güte (AS vs. N) - Kollektiv: ${kollektivName}`,
            yLabel: 'Wert (%)',
            colorScheme: 'primary',
            barLabel: true,
            yAxisMin: 0,
            width: chartSettings.DEFAULT_WIDTH,
            height: chartSettings.DEFAULT_HEIGHT,
            margin: { top: 30, right: 20, bottom: 40, left: 50 }
        };
        renderBarChart(data, targetElementId, options);
    }

    function renderASvsT2ComparisonBarChart(targetElementId, statsAS, statsT2, t2Label, kollektivName) {
        if (!statsAS || !statsT2 || !statsAS.matrix || !statsT2.matrix || (statsAS.matrix.rp + statsAS.matrix.fp + statsAS.matrix.fn + statsAS.matrix.rn) === 0 || (statsT2.matrix.rp + statsT2.matrix.fp + statsT2.matrix.fn + statsT2.matrix.rn) === 0) {
            ui_helpers.updateElementHTML(targetElementId, `<p class="text-center text-muted p-3">Keine validen Vergleichsdaten für Chart (${kollektivName}).</p>`);
            return;
        }

        const data = [
            { metric: 'Sens.', AS: statsAS.sens?.value, T2: statsT2.sens?.value },
            { metric: 'Spez.', AS: statsAS.spez?.value, T2: statsT2.spez?.value },
            { metric: 'PPV', AS: statsAS.ppv?.value, T2: statsT2.ppv?.value },
            { metric: 'NPV', AS: statsAS.npv?.value, T2: statsT2.npv?.value },
            { metric: 'Acc.', AS: statsAS.acc?.value, T2: statsT2.acc?.value },
            { metric: 'AUC', AS: statsAS.auc?.value, T2: statsT2.auc?.value }
        ].filter(d => d.AS !== undefined && d.T2 !== undefined && !isNaN(d.AS) && !isNaN(d.T2));

        const chartSettings = safeGetChartSettings();
        const options = {
            title: `Vergleich: AS vs. ${t2Label} (${kollektivName})`,
            yLabel: 'Wert (%)',
            colorScheme: 'default_comparison',
            width: chartSettings.DEFAULT_WIDTH,
            height: chartSettings.DEFAULT_HEIGHT,
            margin: { top: 30, right: 20, bottom: 50, left: 50 }
        };
        renderComparisonBarChart(data, targetElementId, options, t2Label);
    }


    function exportChartAsPNG(svgElementOrId, filename, options = {}) {
        const svgElement = typeof svgElementOrId === 'string' ? document.getElementById(svgElementOrId)?.querySelector('svg') : svgElementOrId;
        if (!svgElement) { console.error("SVG Element für PNG-Export nicht gefunden."); return; }
        
        const scale = options.scale || (typeof APP_CONFIG !== 'undefined' && APP_CONFIG?.EXPORT_SETTINGS?.TABLE_PNG_EXPORT_SCALE) || 2;
        const backgroundColor = options.backgroundColor || 'var(--bg-white)';

        if (typeof _svgToPngDataURL === 'function') {
            _svgToPngDataURL(svgElement, scale, backgroundColor)
                .then(dataUrl => {
                    saveAs(dataUrl, filename);
                })
                .catch(err => {
                    console.error("Fehler beim Erstellen des PNG für Export:", err);
                    ui_helpers.showToast("PNG-Export fehlgeschlagen.", "danger");
                });
        } else {
             console.error("_svgToPngDataURL Funktion nicht global verfügbar.");
             ui_helpers.showToast("PNG-Export-Funktion nicht initialisiert.", "danger");
        }
    }

    function exportChartAsSVG(svgElementOrId, filename) {
        const svgElement = typeof svgElementOrId === 'string' ? document.getElementById(svgElementOrId)?.querySelector('svg') : svgElementOrId;
        if (!svgElement) { console.error("SVG Element für SVG-Export nicht gefunden."); return; }

        const svgClone = svgElement.cloneNode(true);
        svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        
        const styles = document.styleSheets;
        let cssText = "";
        for (let i = 0; i < styles.length; i++) {
            try {
                const rules = styles[i].cssRules || styles[i].rules;
                if (rules) {
                    for (let j = 0; j < rules.length; j++) {
                        if (rules[j].cssText.includes('.axis') || rules[j].cssText.includes('.grid') || rules[j].cssText.includes('.legend') || rules[j].cssText.includes('chart-tooltip') || rules[j].cssText.includes('.roc-curve') || rules[j].cssText.includes('.reference-line')) {
                             cssText += rules[j].cssText + "\n";
                        }
                    }
                }
            } catch (e) { /* Skip cross-origin stylesheets */ }
        }
        
        const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
        styleElement.textContent = cssText;
        svgClone.insertBefore(styleElement, svgClone.firstChild);
        
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgClone);
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
        const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        saveAs(blob, filename);
    }

    return Object.freeze({
        renderBarChart,
        renderPieChart,
        renderHistogram,
        renderROCCurve,
        renderComparisonBarChart,
        renderPerformanceComparisonPlot,
        renderAgeDistributionChart,
        renderGenderDistributionChart,
        renderASPerformanceBarChart,
        renderASvsT2ComparisonBarChart,
        exportChartAsPNG,
        exportChartAsSVG
    });
})();

window.chartRenderer = chartRenderer;
