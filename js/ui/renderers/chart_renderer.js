const chart_renderer = (() => {

    function _getAppConfig() {
        return typeof APP_CONFIG !== 'undefined' ? APP_CONFIG : { UI_SETTINGS: {}, CHART_SETTINGS: {}, STATISTICAL_CONSTANTS: {} };
    }
    function _getUiTexts() {
        return typeof UI_TEXTS !== 'undefined' ? UI_TEXTS : { chartTooltips: {}, statMetrics: {}, legendLabels: {} };
    }

    function _prepareChartArea(containerId, data, options) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Chart-Container #${containerId} nicht gefunden.`);
            return null;
        }
        container.innerHTML = ''; // Clear previous chart

        const appConfig = _getAppConfig();
        const defaultOptions = {
            width: appConfig.CHART_SETTINGS.DEFAULT_WIDTH || 600,
            height: appConfig.CHART_SETTINGS.DEFAULT_HEIGHT || 400,
            margin: { ... (appConfig.CHART_SETTINGS.DEFAULT_MARGIN || { top: 40, right: 30, bottom: 60, left: 70 }) },
            backgroundColor: appConfig.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#FFFFFF',
            title: '',
            xAxisLabel: '',
            yAxisLabel: '',
            showLegend: false,
            legendPosition: 'top', // 'top', 'bottom', 'left', 'right'
            fontFamily: appConfig.CHART_SETTINGS.RSNA_CHART_FONT_FAMILY || 'sans-serif',
            titleFontSize: appConfig.CHART_SETTINGS.RSNA_CHART_TITLE_FONT_SIZE || '12pt',
            axisLabelFontSize: appConfig.CHART_SETTINGS.RSNA_CHART_AXIS_LABEL_FONT_SIZE || '10pt',
            tickLabelFontSize: appConfig.CHART_SETTINGS.RSNA_CHART_TICK_LABEL_FONT_SIZE || '9pt',
            legendFontSize: appConfig.CHART_SETTINGS.RSNA_CHART_LEGEND_FONT_SIZE || '9pt',
            gridlines: appConfig.CHART_SETTINGS.ENABLE_GRIDLINES !== false,
            gridlineColor: appConfig.CHART_SETTINGS.GRIDLINE_COLOR || '#e0e0e0',
            axisColor: appConfig.CHART_SETTINGS.CHART_AXIS_COLOR || '#444444',
            labelColor: appConfig.CHART_SETTINGS.CHART_LABEL_COLOR || '#333333',
            tooltipContent: (d) => `Wert: ${formatNumber(d.value, 2)}`
        };
        const mergedOptions = { ...defaultOptions, ...options, margin: { ...defaultOptions.margin, ...options?.margin } };

        const width = Math.max(100, mergedOptions.width - mergedOptions.margin.left - mergedOptions.margin.right);
        const height = Math.max(50, mergedOptions.height - mergedOptions.margin.top - mergedOptions.margin.bottom);

        if (width <= 0 || height <= 0) {
            container.innerHTML = '<p class="text-danger small p-2">Chart-Dimensionen sind ungültig (zu klein nach Abzug der Margins).</p>';
            return null;
        }

        const svg = d3.select(container)
            .append("svg")
            .attr("width", mergedOptions.width)
            .attr("height", mergedOptions.height)
            .attr("font-family", mergedOptions.fontFamily)
            .style("background-color", mergedOptions.backgroundColor)
            .append("g")
            .attr("transform", `translate(${mergedOptions.margin.left},${mergedOptions.margin.top})`);

        return { svg, width, height, options: mergedOptions };
    }

    function _addAxes(svg, xScale, yScale, width, height, options) {
        if (!xScale || !yScale) return;

        const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

        if (options.gridlines) {
            yAxis.tickSizeInner(-width);
            svg.append("g")
                .attr("class", "grid")
                .call(yAxis)
                .selectAll("line")
                .attr("stroke", options.gridlineColor)
                .attr("stroke-dasharray", "2,2");
            svg.selectAll(".grid .domain").remove(); // Remove y-axis line, keep ticks
             // Re-add yAxis without grid for proper domain line and ticks
            svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(yScale).tickSizeOuter(0))
                .attr("font-size", options.tickLabelFontSize)
                .attr("color", options.axisColor);

        } else {
            svg.append("g")
                .attr("class", "y-axis")
                .call(yAxis)
                .attr("font-size", options.tickLabelFontSize)
                .attr("color", options.axisColor);
        }

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .attr("font-size", options.tickLabelFontSize)
            .attr("color", options.axisColor)
            .selectAll("text")
            .filter(function(d, i) { // Rotate labels only if they might overlap
                const numTicks = xScale.domain().length;
                const availableWidthPerTick = width / numTicks;
                return this.getComputedTextLength() > availableWidthPerTick - 5 && numTicks > 5;
            })
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");


        if (options.xAxisLabel) {
            svg.append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + options.margin.bottom * 0.8)
                .text(options.xAxisLabel)
                .attr("font-size", options.axisLabelFontSize)
                .attr("fill", options.labelColor);
        }

        if (options.yAxisLabel) {
            svg.append("text")
                .attr("class", "y-axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -options.margin.left * 0.7)
                .text(options.yAxisLabel)
                .attr("font-size", options.axisLabelFontSize)
                .attr("fill", options.labelColor);
        }
    }

    function _addTitle(svg, width, options) {
        if (options.title) {
            svg.append("text")
                .attr("class", "chart-title")
                .attr("x", width / 2)
                .attr("y", -options.margin.top / 2)
                .attr("text-anchor", "middle")
                .text(options.title)
                .attr("font-size", options.titleFontSize)
                .attr("font-weight", "bold")
                .attr("fill", options.labelColor);
        }
    }
    
    function _createTooltip(containerId) {
        const tooltipId = `tooltip-${containerId}`;
        let tooltip = d3.select(`#${tooltipId}`);
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div")
                .attr("id", tooltipId)
                .attr("class", "chart-tooltip")
                .style("opacity", 0);
        }
        return tooltip;
    }

    function _showTooltip(event, tooltip, htmlContent) {
        tooltip.transition().duration(100).style("opacity", .95);
        tooltip.html(htmlContent)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function _moveTooltip(event, tooltip) {
        tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function _hideTooltip(tooltip) {
        tooltip.transition().duration(200).style("opacity", 0);
    }

    function renderPieChart(containerId, data, options = {}) {
        const prep = _prepareChartArea(containerId, data, options);
        if (!prep) return;
        const { svg, width, height, options: opts } = prep;
        
        if (!data || !Array.isArray(data) || data.length === 0 || data.some(d => isNaN(d.value) || d.value < 0)) {
            svg.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine validen Daten für Pie-Chart.");
            return;
        }

        _addTitle(svg, width, opts);
        const radius = Math.min(width, height) / 2 * (opts.compact ? 0.9 : 0.8);
        const pieGroup = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
        const color = d3.scaleOrdinal().domain(data.map(d => d.label)).range(data.map(d => d.color || d3.schemeCategory10[data.indexOf(d) % 10]));
        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(opts.donut ? radius * 0.5 : 0).outerRadius(radius);
        const tooltip = _createTooltip(containerId);

        const path = pieGroup.selectAll("path")
            .data(pie(data))
            .enter().append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.label))
            .attr("stroke", opts.backgroundColor || "white")
            .style("stroke-width", "2px")
            .on("mouseover", (event, d) => _showTooltip(event, tooltip, opts.tooltipContent(d.data)))
            .on("mousemove", (event) => _moveTooltip(event, tooltip))
            .on("mouseout", () => _hideTooltip(tooltip));
            
        if (opts.showLabels) { // Optional labels on slices
            pieGroup.selectAll('text.slice-label')
                .data(pie(data))
                .enter().append('text')
                .attr('class', 'slice-label')
                .attr('transform', d => `translate(${arc.centroid(d)})`)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-size', opts.tickLabelFontSize || '10px')
                .attr('fill', opts.labelColor || '#333')
                .text(d => d.data.label);
        }

        if (opts.showLegend && opts.legendPosition) {
            const legendData = data.map(d => ({ name: d.label, color: color(d.label) }));
            _addLegend(svg, legendData, color, width, { ...opts, height });
        }
    }

    function renderAgeDistributionChart(containerId, ageData, kollektiv, options = {}) {
        const prep = _prepareChartArea(containerId, ageData, options);
        if (!prep) return;
        const { svg, width, height, options: opts } = prep;

        if (!ageData || !Array.isArray(ageData) || ageData.length === 0) {
            svg.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine Daten für Altersverteilung.");
            return;
        }
        const validAgeData = ageData.filter(d => d && d.ageGroup && Number.isFinite(d.count) && d.count >= 0);
        if (validAgeData.length === 0) {
            svg.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine validen Daten für Altersverteilung.");
            return;
        }

        const xScale = d3.scaleBand().range([0, width]).padding(0.2).domain(validAgeData.map(d => d.ageGroup));
        const yScale = d3.scaleLinear().range([height, 0]).domain([0, d3.max(validAgeData, d => d.count) || 1]);
        const tooltip = _createTooltip(containerId);
        const appConfig = _getAppConfig();

        _addAxes(svg, xScale, yScale, width, height, { ...opts, xAxisLabel: opts.xAxisLabel || 'Altersgruppe', yAxisLabel: opts.yAxisLabel || 'Anzahl Patienten'});
        _addTitle(svg, width, opts);

        svg.selectAll(".bar")
            .data(validAgeData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.ageGroup) ?? 0)
            .attr("width", xScale.bandwidth())
            .attr("y", d => Number.isFinite(yScale(d.count)) ? yScale(d.count) : height)
            .attr("height", d => Math.max(0, height - (Number.isFinite(yScale(d.count)) ? yScale(d.count) : height)))
            .attr("fill", appConfig.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE || "#69b3a2")
            .on("mouseover", (event, d) => _showTooltip(event, tooltip, opts.tooltipContent(d)))
            .on("mousemove", (event) => _moveTooltip(event, tooltip))
            .on("mouseout", () => _hideTooltip(tooltip));
    }

    function renderASPerformanceChart(containerId, performanceData, kollektiv, options = {}) {
        const prep = _prepareChartArea(containerId, performanceData, options);
        if (!prep) return;
        const { svg, width, height, options: opts } = prep;
        const appConfig = _getAppConfig();
        const uiTexts = _getUiTexts();

        if (!performanceData || typeof performanceData !== 'object') {
             svg.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine AS Performancedaten.");
             return;
        }

        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];
        const chartData = metrics.map(key => ({
            name: uiTexts.statMetrics[key]?.name || key.toUpperCase(),
            value: performanceData[key]?.value,
            ci: performanceData[key]?.ci
        })).filter(d => d.value !== null && d.value !== undefined && Number.isFinite(d.value));

        if (chartData.length === 0) {
            svg.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine validen AS Performancedaten zum Anzeigen.");
            return;
        }
        
        const xScale = d3.scaleBand().range([0, width]).padding(0.3).domain(chartData.map(d => d.name));
        const yScale = d3.scaleLinear().range([height, 0]).domain(opts.yDomain || [0, 1]);
        const tooltip = _createTooltip(containerId);

        _addAxes(svg, xScale, yScale, width, height, { ...opts, yAxisLabel: opts.yAxisLabel || 'Wert'});
        _addTitle(svg, width, opts);
        
        const barWidth = xScale.bandwidth();

        svg.selectAll(".bar")
            .data(chartData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.name) ?? 0)
            .attr("width", barWidth)
            .attr("y", d => Number.isFinite(d.value) && Number.isFinite(yScale(d.value)) ? yScale(d.value) : height)
            .attr("height", d => Number.isFinite(d.value) && Number.isFinite(yScale(d.value)) ? Math.max(0, height - yScale(d.value)) : 0)
            .attr("fill", appConfig.CHART_SETTINGS.AS_COLOR || "darkseagreen")
            .on("mouseover", (event, d) => {
                 const htmlContent = typeof ui_helpers !== 'undefined' ? ui_helpers.getMetricInterpretationHTML(d.name.toLowerCase(), d, "Avocado Sign", kollektiv) : `<strong>${d.name}</strong><br>Wert: ${formatNumber(d.value,3)}<br>95% CI: ${d.ci && Number.isFinite(d.ci.lower) && Number.isFinite(d.ci.upper) ? `${formatNumber(d.ci.lower,3)} - ${formatNumber(d.ci.upper,3)}` : 'N/A'}`;
                _showTooltip(event, tooltip, htmlContent);
            })
            .on("mousemove", (event) => _moveTooltip(event, tooltip))
            .on("mouseout", () => _hideTooltip(tooltip));

        if (opts.includeCI) {
            svg.selectAll(".error-bar")
                .data(chartData.filter(d => d.ci && Number.isFinite(d.ci.lower) && Number.isFinite(d.ci.upper) && d.ci.lower <= d.ci.upper))
                .enter().append("line")
                .attr("class", "error-bar")
                .attr("x1", d => (xScale(d.name) ?? 0) + barWidth / 2)
                .attr("x2", d => (xScale(d.name) ?? 0) + barWidth / 2)
                .attr("y1", d => yScale(d.ci.lower) ?? height)
                .attr("y2", d => yScale(d.ci.upper) ?? height)
                .attr("stroke", appConfig.CHART_SETTINGS.ERROR_BAR_COLOR || "gray")
                .attr("stroke-width", appConfig.CHART_SETTINGS.ERROR_BAR_WIDTH || 1.5);

            const capWidth = Math.min(10, barWidth * 0.4);
            svg.selectAll(".error-cap-top")
                .data(chartData.filter(d => d.ci && Number.isFinite(d.ci.upper)))
                .enter().append("line")
                .attr("class", "error-cap-top")
                .attr("x1", d => ((xScale(d.name) ?? 0) + barWidth / 2) - capWidth / 2)
                .attr("x2", d => ((xScale(d.name) ?? 0) + barWidth / 2) + capWidth / 2)
                .attr("y1", d => yScale(d.ci.upper) ?? height)
                .attr("y2", d => yScale(d.ci.upper) ?? height)
                .attr("stroke", appConfig.CHART_SETTINGS.ERROR_BAR_COLOR || "gray")
                .attr("stroke-width", appConfig.CHART_SETTINGS.ERROR_BAR_WIDTH || 1.5);

            svg.selectAll(".error-cap-bottom")
                .data(chartData.filter(d => d.ci && Number.isFinite(d.ci.lower)))
                .enter().append("line")
                .attr("class", "error-cap-bottom")
                .attr("x1", d => ((xScale(d.name) ?? 0) + barWidth / 2) - capWidth / 2)
                .attr("x2", d => ((xScale(d.name) ?? 0) + barWidth / 2) + capWidth / 2)
                .attr("y1", d => yScale(d.ci.lower) ?? height)
                .attr("y2", d => yScale(d.ci.lower) ?? height)
                .attr("stroke", appConfig.CHART_SETTINGS.ERROR_BAR_COLOR || "gray")
                .attr("stroke-width", appConfig.CHART_SETTINGS.ERROR_BAR_WIDTH || 1.5);
        }
    }

    function renderComparisonBarChart(containerId, data, series, options = {}) {
        const prep = _prepareChartArea(containerId, data, options);
        if (!prep) return;
        const { svg, width, height, options: opts } = prep;

        if (!data || data.length === 0 || !series || series.length === 0) {
            svg.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine Daten für Vergleichs-Chart.");
            return;
        }
        
        const groupKey = opts.groupKey || 'group';
        const groups = data.map(d => d[groupKey]);
        const validSeries = series.filter(s => s && s.key && s.name);
        if (validSeries.length === 0) {
             svg.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine validen Serien für Vergleichs-Chart.");
            return;
        }

        const x0Scale = d3.scaleBand().domain(groups).rangeRound([0, width]).paddingInner(opts.barType === 'grouped' ? 0.2 : 0.1);
        const x1Scale = d3.scaleBand().domain(validSeries.map(s => s.key)).rangeRound([0, x0Scale.bandwidth()]).padding(0.05);
        const yScale = d3.scaleLinear().rangeRound([height, 0]).domain(opts.yDomain || [0, 1]);
        const colorScale = d3.scaleOrdinal().domain(validSeries.map(s => s.key)).range(validSeries.map(s => s.color || d3.schemeCategory10[validSeries.indexOf(s) % 10]));
        const tooltip = _createTooltip(containerId);
        const appConfig = _getAppConfig();

        _addAxes(svg, x0Scale, yScale, width, height, { ...opts, yAxisLabel: opts.yAxisLabel || 'Wert'});
        _addTitle(svg, width, opts);

        const group = svg.selectAll(".group")
            .data(data)
            .enter().append("g")
            .attr("class", "group")
            .attr("transform", d => `translate(${x0Scale(d[groupKey]) ?? 0},0)`);

        group.selectAll("rect")
            .data(d => validSeries.map(s => ({ key: s.key, name: s.name, seriesData: d[s.key], groupValue: d[groupKey], showCI: s.showCI })))
            .enter().append("rect")
            .attr("x", d => x1Scale(d.key) ?? 0)
            .attr("y", d => (d.seriesData && Number.isFinite(d.seriesData.value) && Number.isFinite(yScale(d.seriesData.value))) ? yScale(d.seriesData.value) : height)
            .attr("width", x1Scale.bandwidth())
            .attr("height", d => (d.seriesData && Number.isFinite(d.seriesData.value) && Number.isFinite(yScale(d.seriesData.value))) ? Math.max(0, height - yScale(d.seriesData.value)) : 0)
            .attr("fill", d => colorScale(d.key))
            .on("mouseover", (event, d) => {
                 const htmlContent = typeof ui_helpers !== 'undefined' ? ui_helpers.getMetricInterpretationHTML(d.groupValue.toLowerCase(), d.seriesData, d.name, opts.kollektivForTooltip || '') : `<strong>${d.name} (${d.groupValue})</strong><br>Wert: ${formatNumber(d.seriesData?.value,3)}<br>95% CI: ${d.seriesData?.ci && Number.isFinite(d.seriesData.ci.lower) && Number.isFinite(d.seriesData.ci.upper) ? `${formatNumber(d.seriesData.ci.lower,3)} - ${formatNumber(d.seriesData.ci.upper,3)}` : 'N/A'}`;
                _showTooltip(event, tooltip, htmlContent);
            })
            .on("mousemove", (event) => _moveTooltip(event, tooltip))
            .on("mouseout", () => _hideTooltip(tooltip));

        if (opts.includeCI) {
            group.selectAll(".error-bar-group")
                .data(d => validSeries.filter(s => s.showCI).map(s => ({ key: s.key, seriesData: d[s.key], groupValue: d[groupKey] })))
                .enter()
                .filter(d => d.seriesData && d.seriesData.ci && Number.isFinite(d.seriesData.ci.lower) && Number.isFinite(d.seriesData.ci.upper) && d.seriesData.ci.lower <= d.seriesData.ci.upper)
                .append("g")
                .attr("class", "error-bar-group")
                .each(function(d) {
                    const gParent = d3.select(this);
                    const xPos = (x1Scale(d.key) ?? 0) + x1Scale.bandwidth() / 2;
                    const y1Pos = yScale(d.seriesData.ci.lower) ?? height;
                    const y2Pos = yScale(d.seriesData.ci.upper) ?? height;
                    const capWidth = Math.min(8, x1Scale.bandwidth() * 0.3);

                    gParent.append("line") // Vertical bar
                        .attr("x1", xPos).attr("x2", xPos)
                        .attr("y1", y1Pos).attr("y2", y2Pos)
                        .attr("stroke", appConfig.CHART_SETTINGS.ERROR_BAR_COLOR || "dimgray")
                        .attr("stroke-width", appConfig.CHART_SETTINGS.ERROR_BAR_WIDTH || 1);
                    gParent.append("line") // Top cap
                        .attr("x1", xPos - capWidth / 2).attr("x2", xPos + capWidth / 2)
                        .attr("y1", y2Pos).attr("y2", y2Pos)
                        .attr("stroke", appConfig.CHART_SETTINGS.ERROR_BAR_COLOR || "dimgray")
                        .attr("stroke-width", appConfig.CHART_SETTINGS.ERROR_BAR_WIDTH || 1);
                    gParent.append("line") // Bottom cap
                        .attr("x1", xPos - capWidth / 2).attr("x2", xPos + capWidth / 2)
                        .attr("y1", y1Pos).attr("y2", y1Pos)
                        .attr("stroke", appConfig.CHART_SETTINGS.ERROR_BAR_COLOR || "dimgray")
                        .attr("stroke-width", appConfig.CHART_SETTINGS.ERROR_BAR_WIDTH || 1);
                });
        }
        
        if (opts.showLegend) {
             _addLegend(svg, validSeries, colorScale, width, { ...opts, height });
        }
    }
    
    function _addLegend(svg, seriesData, colorScale, chartWidth, options) {
        if (!seriesData || seriesData.length === 0) return;
        const legendFontSize = options.legendFontSize || '9pt';
        const itemHeight = parseInt(legendFontSize, 10) + 8; 
        const itemWidth = options.legendItemWidth || 100; 
        const symbolSize = parseInt(legendFontSize, 10) * 0.8;

        const legend = svg.append("g")
            .attr("class", "chart-legend")
            .attr("font-size", legendFontSize)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(seriesData)
            .join("g");

        if (options.legendPosition === 'bottom') {
            const legendWidth = seriesData.length * itemWidth;
            legend.attr("transform", (d, i) => `translate(${(chartWidth - legendWidth)/2 + i * itemWidth}, ${options.height + options.margin.bottom * 0.5})`);
        } else if (options.legendPosition === 'right') {
             legend.attr("transform", (d, i) => `translate(${chartWidth + 10}, ${i * itemHeight})`);
        } else if (options.legendPosition === 'left') {
            legend.attr("transform", (d, i) => `translate(${-options.margin.left + 10}, ${i * itemHeight})`);
        } else { // Default to top
             const legendWidth = seriesData.length * itemWidth;
             legend.attr("transform", (d, i) => `translate(${(chartWidth - legendWidth)/2 + i * itemWidth}, ${-options.margin.top * 0.5 + 5})`);
        }

        legend.append("rect")
            .attr("x", 0)
            .attr("width", symbolSize)
            .attr("height", symbolSize)
            .attr("fill", d => d.color || colorScale(d.name));

        legend.append("text")
            .attr("x", symbolSize + 5)
            .attr("y", symbolSize / 2)
            .attr("dy", "0.35em")
            .text(d => d.name)
            .attr("fill", options.labelColor);
    }


    return Object.freeze({
        renderPieChart,
        renderAgeDistributionChart,
        renderASPerformanceChart,
        renderComparisonBarChart
    });
})();
