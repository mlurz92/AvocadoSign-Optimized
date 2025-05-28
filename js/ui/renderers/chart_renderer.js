const chartRenderer = (() => {
    const defaultMargin = APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN;

    function clearContainer(containerId) {
        const container = d3.select(`#${containerId}`);
        if (container.select("svg").node()) {
            container.select("svg").remove();
        } else {
            container.html("");
        }
        return container;
    }

    function createSvg(container, width, height, margin = defaultMargin) {
        return container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    }

    function createTooltip(svgContainer) {
        let tooltip = d3.select(`#${svgContainer.attr("id")}-tooltip`);
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div")
                .attr("id", `${svgContainer.attr("id")}-tooltip`)
                .attr("class", "chart-tooltip")
                .style("opacity", 0);
        }
        return tooltip;
    }

    function renderBarChart(containerId, data, options = {}) {
        if (!data || data.length === 0) return false;
        const container = clearContainer(containerId);
        const parentWidth = container.node()?.parentElement?.clientWidth || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const aspectRatio = options.aspectRatio || (parentWidth < 400 ? 1.2 : 1.6);
        const width = parentWidth - defaultMargin.left - defaultMargin.right;
        const height = Math.max(200, width / aspectRatio - defaultMargin.top - defaultMargin.bottom);

        const svg = createSvg(container, width, height);
        const tooltip = createTooltip(container);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.label))
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) || 1])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", data.length > 6 ? "end" : "middle")
            .attr("dx", data.length > 6 ? "-.8em" : null)
            .attr("dy", data.length > 6 ? ".15em" : "1em")
            .attr("transform", data.length > 6 ? "rotate(-35)" : null);

        svg.append("g")
            .attr("class", "y-axis axis")
            .call(d3.axisLeft(y).ticks(Math.min(10, d3.max(data, d => d.value) || 1)).tickFormat(d3.format(data.some(d => d.value > 0 && d.value < 1) ? ".2f" : (data.every(d=> Number.isInteger(d.value)) && (d3.max(data, d => d.value) || 0) <=10 ? "d" : "~s"))));

        if(APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES) {
            svg.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(y)
                    .ticks(Math.min(10, d3.max(data, d => d.value) || 1))
                    .tickSize(-width)
                    .tickFormat("")
                );
        }

        svg.selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label))
            .attr("y", d => y(0))
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", (d, i) => d.color || (options.colorScale ? options.colorScale(d.label) : APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(ui_helpers.getTooltipContent(options.tooltipKey || 'tooltip.chart.barValue', {LABEL: d.label, VALUE: formatNumber(d.value, d.value > 0 && d.value < 1 ? 2 : 0, '--', true) }))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
            .transition()
            .duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS)
            .attr("y", d => y(d.value))
            .attr("height", d => height - y(d.value));

         if(options.yAxisLabel) {
            svg.append("text")
                .attr("class", "axis-label y-axis-label")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - defaultMargin.left + 20)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(options.yAxisLabel);
        }
        if(options.xAxisLabel) {
             svg.append("text")
                .attr("class", "axis-label x-axis-label")
                .attr("transform", `translate(${width/2}, ${height + defaultMargin.bottom - 10})`)
                .style("text-anchor", "middle")
                .text(options.xAxisLabel);
        }
        return true;
    }

    function renderPieChart(containerId, data, options = {}) {
        if (!data || data.length === 0) return false;
        const container = clearContainer(containerId);
        const parentWidth = container.node()?.parentElement?.clientWidth || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const margin = options.margin || APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN || defaultMargin;
        const width = parentWidth - margin.left - margin.right;
        const height = Math.max(150, parentWidth * (options.aspectRatio || 0.6) - margin.top - margin.bottom);
        const radius = Math.min(width, height) / 2;

        const svg = createSvg(container, width, height, margin)
            .attr("transform", `translate(${(width / 2) + margin.left}, ${(height / 2) + margin.top})`);
        const tooltip = createTooltip(container);

        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(options.innerRadiusFactor ? radius * options.innerRadiusFactor : 0).outerRadius(radius);

        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(options.colors || [APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE, APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN, APP_CONFIG.CHART_SETTINGS.TERTIARY_COLOR_GREEN, '#6c757d', '#ffc107', '#17a2b8']);

        const arcs = svg.selectAll(".arc")
            .data(pie(data))
            .join("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => colorScale(d.data.label))
            .style("opacity", 0)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(ui_helpers.getTooltipContent(options.tooltipKey || 'tooltip.chart.pieSlice', {LABEL: d.data.label, VALUE: formatNumber(d.data.value,0,'--',true), PERCENT: formatPercent(d.data.value / d3.sum(data, item => item.value), 1)}))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
            .transition()
            .duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS)
            .style("opacity", 1)
            .attrTween("d", function(d) {
                const i = d3.interpolate(d.startAngle, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return arc(d);
                }
            });

        if (options.showLabels !== false) {
            arcs.append("text")
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .attr("dy", "0.35em")
                .style("text-anchor", "middle")
                .style("font-size", "10px")
                .style("fill", "white")
                .text(d => {
                    const percentage = (d.data.value / d3.sum(data, item => item.value)) * 100;
                    return percentage > 7 ? `${formatPercent(percentage / 100, 0)}` : '';
                })
                .style("opacity", 0)
                .transition()
                .duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS + 300)
                .style("opacity", 1);
        }
        return true;
    }

    function renderHistogram(containerId, data, options = {}) {
        if (!data || data.length === 0) return false;
        const container = clearContainer(containerId);
        const parentWidth = container.node()?.parentElement?.clientWidth || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const aspectRatio = options.aspectRatio || 1.8;
        const width = parentWidth - defaultMargin.left - defaultMargin.right;
        const height = Math.max(220, width / aspectRatio - defaultMargin.top - defaultMargin.bottom);

        const svg = createSvg(container, width, height);
        const tooltip = createTooltip(container);

        const xMin = options.xMin !== undefined ? options.xMin : d3.min(data);
        const xMax = options.xMax !== undefined ? options.xMax : d3.max(data);
        if (xMin === undefined || xMax === undefined || xMin >= xMax) return false;

        const numTicks = options.numTicks || Math.min(10, Math.max(3, Math.floor(width / 50)));
        const x = d3.scaleLinear()
            .domain([xMin, xMax]).nice(numTicks)
            .range([0, width]);

        const histogram = d3.histogram()
            .value(d => d)
            .domain(x.domain())
            .thresholds(x.ticks(numTicks));

        const bins = histogram(data);

        const y = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length) || 1]).nice()
            .range([height, 0]);

        svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(numTicks));

        svg.append("g")
            .attr("class", "y-axis axis")
            .call(d3.axisLeft(y).ticks(Math.min(5, d3.max(bins, d => d.length) || 1)).tickFormat(d3.format(data.every(d=> Number.isInteger(d)) && (d3.max(bins, d => d.length) || 0) <=10 ? "d" : "~s")));

        svg.selectAll("rect")
            .data(bins)
            .join("rect")
            .attr("x", 1)
            .attr("transform", d => `translate(${x(d.x0)}, ${y(0)})`)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("height", 0)
            .attr("fill", options.color || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE)
            .style("opacity", 0.8)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(ui_helpers.getTooltipContent(options.tooltipKey || 'tooltip.chart.histogramBin', {RANGE_START: formatNumber(d.x0,1), RANGE_END: formatNumber(d.x1,1), COUNT: d.length}))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
            .transition()
            .duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS)
            .attr("transform", d => `translate(${x(d.x0)}, ${y(d.length)})`)
            .attr("height", d => height - y(d.length));

        if(options.xAxisLabel) {
             svg.append("text")
                .attr("class", "axis-label x-axis-label")
                .attr("transform", `translate(${width/2}, ${height + defaultMargin.top + 10})`)
                .style("text-anchor", "middle")
                .text(options.xAxisLabel);
        }
        if(options.yAxisLabel) {
             svg.append("text")
                .attr("class", "axis-label y-axis-label")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - defaultMargin.left + 15)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(options.yAxisLabel);
        }
        return true;
    }

    function renderROCCurve(containerId, rocData, options = {}) {
        if (!rocData || !Array.isArray(rocData.points) || rocData.points.length === 0) return false;
        const container = clearContainer(containerId);
        const parentWidth = container.node()?.parentElement?.clientWidth || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const aspectRatio = options.aspectRatio || 1.1;
        const width = Math.max(250, parentWidth - defaultMargin.left - defaultMargin.right);
        const height = Math.max(250, width / aspectRatio - defaultMargin.top - defaultMargin.bottom);

        const svg = createSvg(container, width, height);
        const tooltip = createTooltip(container);

        const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
        const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

        svg.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".1f")));
        svg.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".1f")));

        svg.append("text").attr("class", "axis-label x-axis-label").attr("transform", `translate(${width/2}, ${height + defaultMargin.top + 15})`).style("text-anchor", "middle").text(options.xAxisLabel || UI_TEXTS.axisLabels.oneMinusSpecificity);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("transform", "rotate(-90)").attr("y", 0 - defaultMargin.left + 15).attr("x", 0 - (height / 2)).attr("dy", "1em").style("text-anchor", "middle").text(options.yAxisLabel || UI_TEXTS.axisLabels.sensitivity);

        svg.append("line").attr("class", "reference-line").attr("x1", 0).attr("y1", height).attr("x2", width).attr("y2", 0);

        const line = d3.line().x(d => x(d.fpr)).y(d => y(d.tpr)).curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(rocData.points)
            .attr("class", "roc-curve")
            .attr("stroke", options.color || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE)
            .attr("d", line)
            .style("stroke-dasharray", function() { const l = this.getTotalLength(); return `${l} ${l}`; })
            .transition()
            .duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS)
            .style("stroke-dasharray", "0 0");

        if (options.showPoints !== false) {
            svg.selectAll(".roc-point")
                .data(rocData.points.filter(p => p.threshold !== undefined))
                .join("circle")
                .attr("class", "roc-point")
                .attr("cx", d => x(d.fpr))
                .attr("cy", d => y(d.tpr))
                .attr("r", d => d.isOptimal || d.isCurrent ? (APP_CONFIG.CHART_SETTINGS.POINT_RADIUS * 1.5) : APP_CONFIG.CHART_SETTINGS.POINT_RADIUS)
                .attr("fill", d => d.isOptimal ? (options.optimalColor || APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN) : (d.isCurrent ? (options.currentColor || '#ff6347') : (options.color || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE)))
                .attr("stroke", d => d.isOptimal || d.isCurrent ? '#333' : 'none')
                .attr("stroke-width", d => d.isOptimal || d.isCurrent ? 1.5 : 0)
                .style("opacity", 0)
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", .9);
                    let content = `Sens: ${formatPercent(d.tpr, 1)}, Spez: ${formatPercent(1 - d.fpr, 1)}`;
                    if (d.threshold !== undefined) content += `<br>Schwelle: ${formatNumber(d.threshold, d.threshold > 10 ? 0 : 1)}`;
                    if (d.isOptimal) content += '<br><strong>(Optimaler Cut-Off)</strong>';
                    if (d.isCurrent) content += '<br><strong>(Aktueller Wert)</strong>';
                    tooltip.html(content).style("left", (event.pageX + 5) + "px").style("top", (event.pageY - 28) + "px");
                    d3.select(event.currentTarget).transition().duration(100).attr("r", (APP_CONFIG.CHART_SETTINGS.POINT_RADIUS * 1.8));
                })
                .on("mouseout", (event) => {
                    tooltip.transition().duration(500).style("opacity", 0);
                     d3.select(event.currentTarget).transition().duration(100).attr("r", d => d.isOptimal || d.isCurrent ? (APP_CONFIG.CHART_SETTINGS.POINT_RADIUS * 1.5) : APP_CONFIG.CHART_SETTINGS.POINT_RADIUS);
                })
                .transition()
                .duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS)
                .delay((d, i) => i * (APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS / rocData.points.length) / 2)
                .style("opacity", 0.8);
        }

        if (rocData.auc !== undefined) {
            let aucText = `AUC: ${formatNumber(rocData.auc, 3)}`;
            if (rocData.auc_ci_lower !== undefined && rocData.auc_ci_upper !== undefined) {
                aucText += ` (95% CI: ${formatNumber(rocData.auc_ci_lower, 3)} - ${formatNumber(rocData.auc_ci_upper, 3)})`;
            }
            svg.append("text")
                .attr("class", "auc-label")
                .attr("x", width - 10)
                .attr("y", height - 10)
                .style("text-anchor", "end")
                .text(aucText);
        }
        return true;
    }

    function renderForestPlot(containerId, data, options = {}) {
        if (!data || data.length === 0) return false;
        const container = clearContainer(containerId);

        const itemHeight = options.itemHeight || 25;
        const defaultChartWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const parentWidth = container.node()?.parentElement?.clientWidth || defaultChartWidth;

        const margin = {
            top: options.title ? 40 : 20,
            right: options.showValues !== false ? 80 : 20,
            bottom: 50,
            left: Math.max(80, parentWidth * 0.25)
        };

        const height = data.length * itemHeight;
        const width = parentWidth - margin.left - margin.right;
        if (width <= 0) return false;

        const svg = createSvg(container, width, height, margin);
        const tooltip = createTooltip(container);

        const isLogScale = options.logScale !== false;
        const allValues = data.flatMap(d => [d.value, d.lower, d.upper]).filter(v => v !== null && !isNaN(v) && isFinite(v));
        let xMin = d3.min(allValues);
        let xMax = d3.max(allValues);

        if (isLogScale) {
            if (xMin <= 0) xMin = Math.min(0.01, d3.min(allValues.filter(v => v > 0)) || 0.01);
            if (xMax <= 0) xMax = Math.max(10, d3.max(allValues.filter(v => v > 0)) || 10);
        } else {
            const range = xMax - xMin;
            xMin -= range * 0.1;
            xMax += range * 0.1;
        }
         if (xMin === undefined || xMax === undefined || xMin >= xMax) {
             xMin = isLogScale ? 0.1 : -1;
             xMax = isLogScale ? 10 : 1;
         }


        const x = isLogScale ? d3.scaleLog().domain([xMin, xMax]).range([0, width])
                              : d3.scaleLinear().domain([xMin, xMax]).range([0, width]);

        const y = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, height])
            .padding(0.3);

        const numTicks = Math.min(6, Math.floor(width / 80));
        svg.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(x).ticks(numTicks, isLogScale ? (xMax / xMin < 100 ? ".2~r" : ".1~e") : ".2~r"));

        svg.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y));

        const effectLineValue = isLogScale ? 1 : 0;
        svg.append("line")
            .attr("class", "reference-line")
            .attr("x1", x(effectLineValue))
            .attr("x2", x(effectLineValue))
            .attr("y1", 0)
            .attr("y2", height);

        const groups = svg.selectAll(".forest-group")
            .data(data)
            .join("g")
            .attr("class", "forest-group")
            .attr("transform", d => `translate(0, ${y(d.name) + y.bandwidth() / 2})`);

        groups.append("line")
            .attr("class", "ci-line")
            .attr("x1", d => (d.lower !== null && !isNaN(d.lower) && isFinite(d.lower)) ? x(Math.max(xMin, d.lower)) : x(d.value))
            .attr("x2", d => (d.upper !== null && !isNaN(d.upper) && isFinite(d.upper)) ? x(Math.min(xMax, d.upper)) : x(d.value))
            .attr("y1", 0).attr("y2", 0)
            .attr("stroke", options.lineColor || APP_CONFIG.CHART_SETTINGS.TERTIARY_COLOR_GREEN)
            .attr("stroke-width", 2)
            .style("opacity", 0)
            .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS).style("opacity", 0.7);

        groups.append("rect")
            .attr("class", "value-point")
            .attr("x", d => x(d.value) - 4)
            .attr("y", -4)
            .attr("width", 8).attr("height", 8)
            .attr("fill", options.pointColor || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE)
            .style("opacity", 0)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                let content = `${ui_helpers.escapeHTML(d.name)}<br><strong>${options.effectMeasureName || 'Wert'}:</strong> ${formatNumber(d.value, 2, '--', true)}`;
                if (d.lower !== null && !isNaN(d.lower) && d.upper !== null && !isNaN(d.upper)) {
                    content += ` (95% CI: ${formatNumber(d.lower, 2, '--', true)} - ${formatNumber(d.upper, 2, '--', true)})`;
                }
                if (d.pValue !== undefined && d.pValue !== null && !isNaN(d.pValue)) {
                    content += `<br>p-Wert: ${getPValueText(d.pValue)}`;
                }
                tooltip.html(content)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
            .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS).style("opacity", 1);


        if (options.showValues !== false) {
            groups.append("text")
                .attr("class", "value-text")
                .attr("x", d => (d.upper !== null && !isNaN(d.upper) && isFinite(d.upper)) ? x(Math.min(xMax, d.upper)) + 8 : x(d.value) + 8)
                .attr("y", 0)
                .attr("dy", "0.35em")
                .style("font-size", "9px")
                .style("text-anchor", "start")
                .text(d => {
                    let text = formatNumber(d.value, 2, '', true);
                     if (d.lower !== null && !isNaN(d.lower) && d.upper !== null && !isNaN(d.upper)) {
                         text += ` [${formatNumber(d.lower, 2, '', true)}, ${formatNumber(d.upper, 2, '', true)}]`;
                     }
                     return text;
                })
                .style("opacity", 0)
                .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS).style("opacity", 1);
        }

        if(options.xAxisLabel) {
             svg.append("text")
                .attr("class", "axis-label x-axis-label")
                .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
                .style("text-anchor", "middle")
                .text(options.xAxisLabel);
        }
        if(options.title) {
             svg.append("text")
                .attr("x", width / 2)
                .attr("y", 0 - (margin.top / 2) - 5)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .text(options.title);
        }
        return true;
    }


    return Object.freeze({
        renderBarChart,
        renderPieChart,
        renderHistogram,
        renderROCCurve,
        renderForestPlot
    });

})();
