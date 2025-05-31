const chart_renderer = (() => {
    let activeResizeListeners = [];

    function _clearResizeListeners() {
        activeResizeListeners.forEach(listener => {
            window.removeEventListener('resize', listener.handler);
            if (listener.observer) listener.observer.disconnect();
        });
        activeResizeListeners = [];
    }

    function _getBaseSVG(containerId, options = {}) {
        d3.select(`#${containerId}`).select("svg").remove();
        const container = d3.select(`#${containerId}`);
        if (container.empty()) {
            console.error(`Chart container #${containerId} not found.`);
            return { svg: null, width: 0, height: 0, margin: APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN };
        }
        container.html(''); // Ensure container is empty before appending

        const margin = { ...APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options.margin };
        
        let clientWidth = container.node()?.clientWidth || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        let clientHeight = options.fixedHeight || container.node()?.clientHeight || APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;

        if (clientWidth <= 0) clientWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        if (clientHeight <= 0) clientHeight = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;


        const width = clientWidth - margin.left - margin.right;
        const height = clientHeight - margin.top - margin.bottom;

        if (width <= 0 || height <= 0) {
            console.warn(`Calculated chart dimensions for #${containerId} are invalid (width: ${width}, height: ${height}). Using defaults.`);
             const defaultWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH - margin.left - margin.right;
             const defaultHeight = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT - margin.top - margin.bottom;
             if (width <= 0) clientWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
             if (height <= 0) clientHeight = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;
        }


        const svg = container.append("svg")
            .attr("width", clientWidth)
            .attr("height", clientHeight)
            .style("font-family", APP_CONFIG.CHART_SETTINGS.RSNA_CHART_FONT_FAMILY || "sans-serif")
            .style("background-color", options.backgroundColor || APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || "#ffffff")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        return { svg, width, height, margin, clientWidth, clientHeight };
    }

    function _addTitle(svg, title, width, margin) {
        if (title) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - (margin.top / 2) + (parseFloat(APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TITLE_FONT_SIZE) / 2 || 6) )
                .attr("text-anchor", "middle")
                .attr("class", "title-text")
                .style("font-size", APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TITLE_FONT_SIZE || "12pt")
                .style("font-weight", "bold")
                .style("fill", APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || "#000")
                .text(title);
        }
    }

    function _addAxes(svg, xScale, yScale, width, height, options = {}) {
        const xAxis = d3.axisBottom(xScale);
        if (options.xAxisTickFormat) xAxis.tickFormat(options.xAxisTickFormat);
        if (options.xAxisTickValues) xAxis.tickValues(options.xAxisTickValues);
        if (options.maxTicksX) xAxis.ticks(options.maxTicksX > xScale.domain().length ? xScale.domain().length : options.maxTicksX);


        const xAxisGroup = svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        xAxisGroup.selectAll("text")
            .style("font-size", APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TICK_LABEL_FONT_SIZE || "9pt")
            .style("fill", APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || "#000");
        
        if (options.rotateXLabels) {
            xAxisGroup.selectAll("text")
                .attr("transform", `translate(-10,0)rotate(-${options.rotateXLabelsAngle || 45})`)
                .style("text-anchor", "end");
        }

        const yAxis = d3.axisLeft(yScale);
        if (options.yAxisTickFormat) yAxis.tickFormat(options.yAxisTickFormat);
        if (options.maxTicksY) yAxis.ticks(options.maxTicksY);

        const yAxisGroup = svg.append("g")
            .attr("class", "y-axis axis")
            .call(yAxis);

        yAxisGroup.selectAll("text")
            .style("font-size", APP_CONFIG.CHART_SETTINGS.RSNA_CHART_TICK_LABEL_FONT_SIZE || "9pt")
            .style("fill", APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || "#000");

        svg.selectAll(".axis path, .axis line")
            .style("fill", "none")
            .style("stroke", APP_CONFIG.CHART_SETTINGS.CHART_AXIS_COLOR || "#333")
            .style("shape-rendering", "crispEdges")
            .style("stroke-width", "1px");

        if (options.xAxisLabel) {
            svg.append("text")
                .attr("class", "x-axis-label axis-label")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + options.margin.bottom - (parseFloat(APP_CONFIG.CHART_SETTINGS.RSNA_CHART_AXIS_LABEL_FONT_SIZE) / 1.5 || 10) )
                .style("font-size", APP_CONFIG.CHART_SETTINGS.RSNA_CHART_AXIS_LABEL_FONT_SIZE || "10pt")
                .style("fill", APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || "#000")
                .text(options.xAxisLabel);
        }
        if (options.yAxisLabel) {
            svg.append("text")
                .attr("class", "y-axis-label axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - options.margin.left + (parseFloat(APP_CONFIG.CHART_SETTINGS.RSNA_CHART_AXIS_LABEL_FONT_SIZE) || 12) )
                .attr("x", 0 - (height / 2))
                .style("font-size", APP_CONFIG.CHART_SETTINGS.RSNA_CHART_AXIS_LABEL_FONT_SIZE || "10pt")
                .style("fill", APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || "#000")
                .text(options.yAxisLabel);
        }
    }

    function _addGridlines(svg, xScale, yScale, width, height, options = {}) {
        if (!APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES && !options.forceGridlines) return;

        const xGrid = d3.axisBottom(xScale).tickSize(-height).tickFormat("").ticks(options.maxTicksX || 5);
        const yGrid = d3.axisLeft(yScale).tickSize(-width).tickFormat("").ticks(options.maxTicksY || 5);

        svg.append("g")
            .attr("class", "grid x-grid")
            .attr("transform", `translate(0,${height})`)
            .call(xGrid)
            .selectAll(".tick line")
            .style("stroke", APP_CONFIG.CHART_SETTINGS.GRIDLINE_COLOR || "#e0e0e0")
            .style("stroke-opacity", "0.6");

        svg.append("g")
            .attr("class", "grid y-grid")
            .call(yGrid)
            .selectAll(".tick line")
            .style("stroke", APP_CONFIG.CHART_SETTINGS.GRIDLINE_COLOR || "#e0e0e0")
            .style("stroke-opacity", "0.6");

        svg.selectAll(".grid path").style("stroke-width", 0);
    }

    function _addLegend(svg, series, width, margin, options = {}) {
        if (!options.showLegend || !series || series.length === 0) return;
        const legendItemSize = 12;
        const legendSpacing = 5;
        const legendPadding = 10;
        let legendX = width; // Default right
        let legendY = 0;
        const legendFontSize = APP_CONFIG.CHART_SETTINGS.RSNA_CHART_LEGEND_FONT_SIZE || "9pt";

        const legend = svg.append("g")
            .attr("class", "legend-container")
            .attr("font-family", APP_CONFIG.CHART_SETTINGS.RSNA_CHART_FONT_FAMILY || "sans-serif")
            .attr("font-size", legendFontSize)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(series)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`);

        legend.append("rect")
            .attr("x", legendX - legendItemSize - legendPadding)
            .attr("width", legendItemSize)
            .attr("height", legendItemSize)
            .attr("fill", d => d.color || '#ccc');

        legend.append("text")
            .attr("x", legendX - legendItemSize - legendPadding - legendSpacing)
            .attr("y", legendItemSize / 2)
            .attr("dy", "0.35em")
            .style("fill", APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || "#000")
            .style("text-anchor", "end")
            .text(d => d.name);

        if (options.legendPosition === 'bottom') {
            let totalLegendWidth = 0;
            const legendItems = legend.nodes();
            legendItems.forEach(node => { totalLegendWidth += node.getBBox().width + legendSpacing * 3; });
            totalLegendWidth -= legendSpacing * 3;

            let currentX = (width - totalLegendWidth) / 2;
            if (totalLegendWidth > width) currentX = 0; // Prevent negative start

            legend.attr("transform", function(d, i) {
                const itemWidth = this.getBBox().width;
                const tx = currentX;
                currentX += itemWidth + legendSpacing * 3;
                return `translate(${tx}, ${margin.top + options.height + (options.margin.bottom / 2) - (parseFloat(legendFontSize)/2) })`;
            });
        } else { // Default: right
             legend.attr("transform", (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing) + legendY})`);
        }
    }

    function _addTooltipToElements(elements, tooltipFn) {
        if (!tooltipFn || !elements) return;
        const tooltipDiv = d3.select("body").selectAll(".chart-tooltip").data([null]).join("div")
            .attr("class", "chart-tooltip")
            .style("position", "absolute")
            .style("background-color", "rgba(255,255,255,0.95)")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("padding", "8px 12px")
            .style("font-size", APP_CONFIG.CHART_SETTINGS.TOOLTIP_FONT_SIZE || "11px")
            .style("color", "#333")
            .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
            .style("opacity", 0)
            .style("pointer-events", "none")
            .style("transition", "opacity 0.2s ease-out, transform 0.2s ease-out")
            .style("transform", "translateY(10px)")
            .style("z-index", "3000");

        elements
            .on("mouseover", function(event, d) {
                const tooltipContent = tooltipFn(d, event, this);
                if(tooltipContent && String(tooltipContent).trim() !== '') {
                    tooltipDiv.transition().duration(200)
                        .style("opacity", 1)
                        .style("transform", "translateY(0px)");
                    tooltipDiv.html(tooltipContent)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 15) + "px");
                }
            })
            .on("mousemove", function(event) {
                tooltipDiv.style("left", (event.pageX + 15) + "px")
                          .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function() {
                tooltipDiv.transition().duration(200)
                    .style("opacity", 0)
                    .style("transform", "translateY(10px)");
            });
    }

    function _handleChartResize(containerId, renderFn, data, options) {
        _clearResizeListeners();
        let resizeTimer;
        const debouncedRender = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (document.getElementById(containerId)) {
                    renderFn(containerId, data, options);
                } else {
                    _clearResizeListeners(); // Container nicht mehr vorhanden
                }
            }, APP_CONFIG.PERFORMANCE_SETTINGS.DEBOUNCE_DELAY_MS || 250);
        };

        window.addEventListener('resize', debouncedRender);
        activeResizeListeners.push({ handler: debouncedRender, observer: null });
    }

    function renderAgeDistributionChart(containerId, ageData, kollektivName, options = {}) {
        _clearResizeListeners();
        const { svg, width, height, margin } = _getBaseSVG(containerId, options);
        if (!svg || !Array.isArray(ageData) || ageData.length === 0) return;

        const title = options.title || `${UI_TEXTS.chartTitles.ageDistribution} (${getKollektivDisplayName(kollektivName)})`;
        _addTitle(svg, title, width, margin);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(ageData, d => d))
            .range([0, width]);

        const histogram = d3.histogram()
            .value(d => d)
            .domain(xScale.domain())
            .thresholds(xScale.ticks(options.bins || 10));

        const bins = histogram(ageData);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length) * 1.1 || 10])
            .range([height, 0]);

        _addAxes(svg, xScale, yScale, width, height, { ...options, margin, xAxisLabel: UI_TEXTS.axisLabels.age, yAxisLabel: UI_TEXTS.axisLabels.patientCount, maxTicksX: options.bins || 10 });
        _addGridlines(svg, xScale, yScale, width, height, { maxTicksX: options.bins || 10, maxTicksY: 5, forceGridlines: options.forceGridlines });

        const bars = svg.selectAll("rect.bar")
            .data(bins)
            .join("rect")
            .attr("class", "bar age-distribution-bar")
            .attr("x", d => xScale(d.x0) + 1)
            .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
            .attr("y", d => yScale(d.length))
            .attr("height", d => height - yScale(d.length))
            .style("fill", APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE);

        _addTooltipToElements(bars, d => `<strong>Alter:</strong> ${d.x0}-${d.x1} Jahre<br><strong>Anzahl:</strong> ${d.length}`);
        _handleChartResize(containerId, renderAgeDistributionChart, ageData, kollektivName, options);
    }

    function renderPieChart(containerId, data, options = {}) {
        _clearResizeListeners();
        const baseOptions = { margin: options.compact ? APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN : APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options};
        const { svg, width, height, margin } = _getBaseSVG(containerId, baseOptions);
        if (!svg || !Array.isArray(data) || data.length === 0) return;

        _addTitle(svg, options.title, width, margin);

        const radius = Math.min(width, height) / 2 - (options.compact ? 0 : 10);
        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(options.donut ? radius * 0.6 : 0).outerRadius(radius);
        const totalValue = d3.sum(data, d => d.value);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const path = g.selectAll("path")
            .data(pie(data))
            .join("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .attr("stroke", options.strokeColor || "#fff")
            .style("stroke-width", options.strokeWidth || "2px");

        _addTooltipToElements(path, d => `<strong>${d.data.label}:</strong> ${formatNumber(d.data.value, 0)} (${formatPercent(d.data.value / totalValue, 1)})`);

        if (options.showLegend && !options.compact) {
             _addLegend(svg, data.map(d => ({name: `${d.label} (${formatNumber(d.value,0)})`, color: d.color})), width, margin, {...options, height:height});
        }
        _handleChartResize(containerId, renderPieChart, data, options);
    }


    function renderComparisonBarChart(containerId, data, series, options = {}) {
        _clearResizeListeners();
        const { svg, width, height, margin } = _getBaseSVG(containerId, options);
        if (!svg || !Array.isArray(data) || data.length === 0 || !series || series.length === 0) return;
        _addTitle(svg, options.title, width, margin);

        const groupKey = options.groupKey || 'group';
        const groups = data.map(d => d[groupKey]);
        const x0Scale = d3.scaleBand().domain(groups).range([0, width]).padding(options.groupPadding || 0.2);
        const x1Scale = d3.scaleBand().domain(series.map(s => s.key)).range([0, x0Scale.bandwidth()]).padding(options.barPadding || 0.05);
        
        let yDomainMin = 0;
        let yDomainMax = d3.max(data, d => d3.max(series, s => {
            const metric = d[s.key];
            if (options.includeCI && metric && metric.ci && typeof metric.ci.upper === 'number') {
                return metric.ci.upper;
            }
            return (typeof metric === 'object' && metric !== null && typeof metric.value === 'number') ? metric.value : (typeof metric === 'number' ? metric : 0);
        })) || 1;

        if(options.yDomain) { yDomainMin = options.yDomain[0] ?? yDomainMin; yDomainMax = options.yDomain[1] ?? yDomainMax; }
        if (yDomainMin > yDomainMax) yDomainMax = yDomainMin + 0.1; // Ensure max is greater than min
        if (yDomainMin === yDomainMax && yDomainMin === 0) yDomainMax = 0.1; // Avoid 0-0 domain
        else if (yDomainMin === yDomainMax) { yDomainMin -= 0.05; yDomainMax += 0.05;}


        const yScale = d3.scaleLinear().domain([yDomainMin, yDomainMax * 1.05]).range([height, 0]).nice();

        _addAxes(svg, x0Scale, yScale, width, height, { ...options, margin, yAxisTickFormat: options.yAxisTickFormat || (d => d3.format(".0%")(d)), xAxisLabel: options.xAxisLabel, yAxisLabel: options.yAxisLabel });
        _addGridlines(svg, x0Scale, yScale, width, height, {maxTicksY: 5, forceGridlines: options.forceGridlines });

        const group = svg.selectAll(".bargroup")
            .data(data)
            .join("g")
            .attr("class", "bargroup")
            .attr("transform", d => `translate(${x0Scale(d[groupKey])},0)`);

        const bars = group.selectAll("rect.bar")
            .data(d => series.map(s => ({ key: s.key, value: d[s.key]?.value ?? d[s.key], ci: d[s.key]?.ci, color: s.color, seriesName: s.name })))
            .join("rect")
            .attr("class", "bar comparison-bar")
            .attr("x", d => x1Scale(d.key))
            .attr("y", d => yScale(Math.max(0, d.value ?? 0)))
            .attr("width", x1Scale.bandwidth())
            .attr("height", d => Math.max(0, height - yScale(Math.max(0, d.value ?? 0))))
            .style("fill", d => d.color || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE);

        if(options.includeCI) {
            group.selectAll(".error-bar-group")
                .data(d => series.filter(s => s.showCI).map(s => ({
                    key: s.key,
                    value: d[s.key]?.value ?? d[s.key],
                    ci: d[s.key]?.ci,
                    seriesName: s.name
                })))
                .enter()
                .append("g")
                .attr("class", "error-bar-group")
                .each(function(d) {
                    if (d.ci && typeof d.value === 'number' && typeof d.ci.lower === 'number' && typeof d.ci.upper === 'number') {
                        const barX = x1Scale(d.key) + x1Scale.bandwidth() / 2;
                        const yVal = yScale(d.value);
                        const yLower = yScale(d.ci.lower);
                        const yUpper = yScale(d.ci.upper);

                        if(isFinite(barX) && isFinite(yLower) && isFinite(yUpper)){
                            d3.select(this).append("line") // Main CI line
                                .attr("class", "error-bar-line")
                                .attr("x1", barX).attr("x2", barX)
                                .attr("y1", yUpper).attr("y2", yLower)
                                .style("stroke", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_COLOR)
                                .style("stroke-width", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_WIDTH + "px");
                            d3.select(this).append("line") // Top cap
                                .attr("class", "error-bar-cap")
                                .attr("x1", barX - APP_CONFIG.CHART_SETTINGS.ERROR_BAR_CAP_SIZE)
                                .attr("x2", barX + APP_CONFIG.CHART_SETTINGS.ERROR_BAR_CAP_SIZE)
                                .attr("y1", yUpper).attr("y2", yUpper)
                                .style("stroke", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_COLOR)
                                .style("stroke-width", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_WIDTH + "px");
                            d3.select(this).append("line") // Bottom cap
                                .attr("class", "error-bar-cap")
                                .attr("x1", barX - APP_CONFIG.CHART_SETTINGS.ERROR_BAR_CAP_SIZE)
                                .attr("x2", barX + APP_CONFIG.CHART_SETTINGS.ERROR_BAR_CAP_SIZE)
                                .attr("y1", yLower).attr("y2", yLower)
                                .style("stroke", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_COLOR)
                                .style("stroke-width", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_WIDTH + "px");
                        }
                    }
            });
        }

        _addTooltipToElements(bars, d => {
            let tooltipText = `<strong>${options.groupDisplayName || 'Gruppe'}:</strong> ${d3.select(this.parentNode).datum()[groupKey]}<br><strong>${d.seriesName || d.key}:</strong> ${formatNumber(d.value, (d.value < 1 && d.value > -1 ? 3 : 1), '--', true)}`;
            if(options.includeCI && d.ci && typeof d.ci.lower === 'number' && typeof d.ci.upper === 'number') {
                 tooltipText += ` (95% CI: ${formatNumber(d.ci.lower, 3, '--', true)} - ${formatNumber(d.ci.upper, 3, '--', true)})`;
            }
            return tooltipText;
        });
        _addLegend(svg, series, width, margin, {...options, height: height});
        _handleChartResize(containerId, renderComparisonBarChart, data, series, options);
    }

    function renderASPerformanceChart(containerId, data, kollektivName, options = {}) { // Data: { sens: {value, ci}, spez: ... }
         _clearResizeListeners();
        if(!data) { console.warn(`Keine Daten für AS Performance Chart (${kollektivName})`); return; }
        const chartData = Object.keys(data)
            .filter(key => ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'].includes(key) && data[key] && typeof data[key].value === 'number')
            .map(key => {
                const displayName = UI_TEXTS.statMetrics[key]?.name || key.toUpperCase();
                return {
                    metric: displayName,
                    value: data[key].value,
                    ci: data[key].ci
                };
            });

        if(chartData.length === 0) { console.warn(`Keine validen Metriken für AS Performance Chart (${kollektivName})`); return; }

        const { svg, width, height, margin } = _getBaseSVG(containerId, options);
        if (!svg) return;

        const title = options.title || `${UI_TEXTS.chartTitles.asPerformance} (${getKollektivDisplayName(kollektivName)})`;
        _addTitle(svg, title, width, margin);

        const xScale = d3.scaleBand()
            .domain(chartData.map(d => d.metric))
            .range([0, width])
            .padding(0.3);

        let yDomainMin = 0;
        let yDomainMax = d3.max(chartData, d => options.includeCI && d.ci && typeof d.ci.upper === 'number' ? d.ci.upper : d.value) || 1;
        if(options.yDomain) { yDomainMin = options.yDomain[0] ?? yDomainMin; yDomainMax = options.yDomain[1] ?? yDomainMax; }
        if (yDomainMin > yDomainMax) yDomainMax = yDomainMin + 0.1;
        if (yDomainMin === yDomainMax && yDomainMin === 0) yDomainMax = 0.1;
        else if (yDomainMin === yDomainMax) { yDomainMin -= 0.05; yDomainMax += 0.05;}


        const yScale = d3.scaleLinear()
            .domain([yDomainMin, Math.min(1, yDomainMax) * 1.05]) // Max 100%
            .range([height, 0]).nice();

        _addAxes(svg, xScale, yScale, width, height, { ...options, margin, yAxisTickFormat: d => d3.format(".0%")(d), xAxisLabel: UI_TEXTS.axisLabels.metric, yAxisLabel: UI_TEXTS.axisLabels.metricValue, rotateXLabels: true, rotateXLabelsAngle: 30});
        _addGridlines(svg, xScale, yScale, width, height, {maxTicksY: 5, forceGridlines: options.forceGridlines});

        const bars = svg.selectAll(".bar")
            .data(chartData)
            .join("rect")
            .attr("class", "bar as-performance-bar")
            .attr("x", d => xScale(d.metric))
            .attr("y", d => yScale(Math.max(0, d.value)))
            .attr("width", xScale.bandwidth())
            .attr("height", d => Math.max(0, height - yScale(Math.max(0, d.value))))
            .style("fill", APP_CONFIG.CHART_SETTINGS.AS_COLOR);

        if(options.includeCI) {
            svg.selectAll(".error-bar-group")
                .data(chartData.filter(d => d.ci && typeof d.ci.lower === 'number' && typeof d.ci.upper === 'number'))
                .enter()
                .append("g")
                .attr("class", "error-bar-group")
                .each(function(d) {
                    const barX = xScale(d.metric) + xScale.bandwidth() / 2;
                    const yLower = yScale(d.ci.lower);
                    const yUpper = yScale(d.ci.upper);
                    if(isFinite(barX) && isFinite(yLower) && isFinite(yUpper)){
                        d3.select(this).append("line").attr("class", "error-bar-line").attr("x1", barX).attr("x2", barX).attr("y1", yUpper).attr("y2", yLower).style("stroke", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_COLOR).style("stroke-width", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_WIDTH + "px");
                        d3.select(this).append("line").attr("class", "error-bar-cap").attr("x1", barX - APP_CONFIG.CHART_SETTINGS.ERROR_BAR_CAP_SIZE).attr("x2", barX + APP_CONFIG.CHART_SETTINGS.ERROR_BAR_CAP_SIZE).attr("y1", yUpper).attr("y2", yUpper).style("stroke", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_COLOR).style("stroke-width", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_WIDTH + "px");
                        d3.select(this).append("line").attr("class", "error-bar-cap").attr("x1", barX - APP_CONFIG.CHART_SETTINGS.ERROR_BAR_CAP_SIZE).attr("x2", barX + APP_CONFIG.CHART_SETTINGS.ERROR_BAR_CAP_SIZE).attr("y1", yLower).attr("y2", yLower).style("stroke", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_COLOR).style("stroke-width", APP_CONFIG.CHART_SETTINGS.ERROR_BAR_WIDTH + "px");
                    }
                });
        }

        _addTooltipToElements(bars, d => {
            let tooltipText = `<strong>${d.metric}:</strong> ${formatPercent(d.value, 1)}`;
            if(options.includeCI && d.ci && typeof d.ci.lower === 'number' && typeof d.ci.upper === 'number') {
                 tooltipText += ` (95% CI: ${formatPercent(d.ci.lower, 1)} - ${formatPercent(d.ci.upper, 1)})`;
            }
            return tooltipText;
        });
        _handleChartResize(containerId, renderASPerformanceChart, data, kollektivName, options);
    }


    function renderROCChart(containerId, data, methodenName, kollektivName, options = {}) { // data = [{fpr, tpr, threshold, color (optional)}, aucData: {value, ci}]
        _clearResizeListeners();
        const { svg, width, height, margin } = _getBaseSVG(containerId, options);
        if (!svg || !Array.isArray(data) || data.length === 0) {
            console.warn(`Keine Daten für ROC Chart (${methodenName}, ${kollektivName})`);
             svg?.append("text").attr("x", width/2).attr("y", height/2).attr("text-anchor", "middle").text("Keine ROC-Daten verfügbar.");
            return;
        }
        
        const title = options.title || `${UI_TEXTS.chartTitles.rocCurve.replace('{Method}', methodenName)} (${getKollektivDisplayName(kollektivName)})`;
        _addTitle(svg, title, width, margin);

        const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

        _addAxes(svg, xScale, yScale, width, height, { ...options, margin, xAxisLabel: UI_TEXTS.axisLabels.oneMinusSpecificity, yAxisLabel: UI_TEXTS.axisLabels.sensitivity, yAxisTickFormat: d3.format(".0%"), xAxisTickFormat: d3.format(".0%") });
        _addGridlines(svg, xScale, yScale, width, height, {maxTicksX:5, maxTicksY: 5, forceGridlines: options.forceGridlines});

        svg.append("line") // Reference line
            .attr("class", "reference-line")
            .attr("x1", 0).attr("y1", height)
            .attr("x2", width).attr("y2", 0)
            .style("stroke", "#adb5bd").style("stroke-width", "1px").style("stroke-dasharray", "4 2");

        const line = d3.line().x(d => xScale(d.fpr)).y(d => yScale(d.tpr)).curve(d3.curveLinear);
        svg.append("path")
            .datum(data)
            .attr("class", "roc-curve")
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", options.lineColor || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE)
            .style("stroke-width", (APP_CONFIG.CHART_SETTINGS.LINE_STROKE_WIDTH || 2) + "px");

        if (options.showPoints) {
            const points = svg.selectAll(".roc-point")
                .data(data.filter(d => d.threshold !== undefined)) // Nur Punkte mit Threshold anzeigen
                .join("circle")
                .attr("class", "roc-point")
                .attr("cx", d => xScale(d.fpr))
                .attr("cy", d => yScale(d.tpr))
                .attr("r", APP_CONFIG.CHART_SETTINGS.POINT_RADIUS || 3)
                .style("fill", options.pointColor || options.lineColor || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE)
                .style("stroke", "#fff")
                .style("stroke-width", "1px");
            _addTooltipToElements(points, d => `<strong>Schwellenwert:</strong> ${formatNumber(d.threshold, 2)}<br><strong>Sens:</strong> ${formatPercent(d.tpr,1)}<br><strong>1-Spez:</strong> ${formatPercent(d.fpr,1)}`);
        }
        
        if (options.aucData && typeof options.aucData.value === 'number') {
            const aucText = `AUC = ${formatNumber(options.aucData.value, 3)}`;
            let aucFullText = aucText;
            if (options.aucData.ci && typeof options.aucData.ci.lower === 'number' && typeof options.aucData.ci.upper === 'number') {
                aucFullText += ` (95% CI: ${formatNumber(options.aucData.ci.lower, 3)} - ${formatNumber(options.aucData.ci.upper, 3)})`;
            }
            svg.append("text")
                .attr("class", "auc-label")
                .attr("x", width - 10)
                .attr("y", height - 10)
                .attr("text-anchor", "end")
                .style("font-size", APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE || "10pt")
                .style("font-weight", "bold")
                .style("fill", APP_CONFIG.CHART_SETTINGS.CHART_LABEL_COLOR || "#000")
                .text(aucFullText);
        }
        _handleChartResize(containerId, renderROCChart, data, methodenName, kollektivName, options);
    }


    return Object.freeze({
        renderAgeDistributionChart,
        renderPieChart,
        renderComparisonBarChart,
        renderASPerformanceChart,
        renderROCChart,
        clearAllCharts: _clearResizeListeners
    });

})();
