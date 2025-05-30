const chartRenderer = (() => {

    function _getChartConfig(options = {}) {
        const profile = options.styleProfile || 'default';
        if (profile === 'radiology' && typeof RADIOLOGY_FORMAT_CONFIG !== 'undefined' && RADIOLOGY_FORMAT_CONFIG.charts) {
            return RADIOLOGY_FORMAT_CONFIG.charts;
        }
        return APP_CONFIG.CHART_SETTINGS;
    }

    function _getResolvedColor(config, keyOrIndex, options = {}) {
        const profile = options.styleProfile || 'default';
        if (profile === 'radiology') {
            const preferredSchemeKey = config.preferredColorScheme || 'radiology_minimal_color';
            const scheme = config.colorSchemes[preferredSchemeKey] || config.colorSchemes.default || ['#000000'];
            if (typeof keyOrIndex === 'number') {
                return scheme[keyOrIndex % scheme.length];
            }
            // If keyOrIndex is a string like 'AS_COLOR', try to find it in RADIOLOGY_FORMAT_CONFIG or fallback
            return config[keyOrIndex] || (typeof keyOrIndex === 'string' ? scheme[0] : '#000000');
        }
        // Default profile from APP_CONFIG
        return APP_CONFIG.CHART_SETTINGS[keyOrIndex] || (typeof keyOrIndex === 'number' ? (APP_CONFIG.CHART_SETTINGS.COLOR_SCHEMES.default[keyOrIndex % APP_CONFIG.CHART_SETTINGS.COLOR_SCHEMES.default.length]) : '#4472C4');
    }


    function createSvgContainer(targetElementId, options = {}) {
        const chartConfig = _getChartConfig(options);
        const container = d3.select(`#${targetElementId}`);
        if (container.empty() || !container.node()) {
            console.error(`Chart-Container #${targetElementId} nicht gefunden.`);
            return null;
        }
        container.selectAll("svg").remove();
        container.html('');

        const containerNode = container.node();
        const initialWidth = containerNode.clientWidth || parseFloat(window.getComputedStyle(containerNode).width) || 0;
        const initialHeight = containerNode.clientHeight || parseFloat(window.getComputedStyle(containerNode).height) || 0;

        const defaultMargins = options.styleProfile === 'radiology' ?
            (RADIOLOGY_FORMAT_CONFIG.charts.defaultMargin || APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN) :
            APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN;

        const margin = { ...defaultMargins, ...(options.margin || {}) };

        const defaultWidth = chartConfig.DEFAULT_WIDTH || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const defaultHeight = chartConfig.DEFAULT_HEIGHT || APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;

        const width = options.width || (initialWidth > 20 ? initialWidth : defaultWidth);
        let height = options.height || (initialHeight > 20 ? initialHeight : defaultHeight);

        const legendItemCount = options.legendItemCount || 0;
        const legendFontSize = parseFloat(chartConfig.legendFontSizePt || LEGEND_FONT_SIZE) || 10;
        const estimatedLegendHeight = options.legendBelow ? Math.max(25, legendItemCount * (legendFontSize * 1.2) + 15) : 0;


        if (options.useCompactMargins && options.legendBelow) {
             const compactMargins = options.styleProfile === 'radiology' ?
                (RADIOLOGY_FORMAT_CONFIG.charts.compactPieMargin || APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN) :
                APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN;
            Object.assign(margin, compactMargins, options.margin || {});
            height = Math.max(height, (options.height || defaultHeight) + estimatedLegendHeight);
        }


        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom - estimatedLegendHeight;

        if (innerWidth <= 20 || innerHeight <= 20) {
            container.html('<p class="text-muted small text-center p-2">Diagrammgröße ungültig/zu klein.</p>');
            console.warn(`Diagrammgröße für ${targetElementId} zu klein: innerWidth=${innerWidth}, innerHeight=${innerHeight}`);
            return null;
        }

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%").style("height", "100%").style("max-width", `${width}px`)
            .style("background-color", options.backgroundColor || chartConfig.plotBackgroundColor || "#ffffff")
            .style("font-family", chartConfig.fontFamily || "var(--font-family-sans-serif)")
            .style("overflow", "visible");

        const chartArea = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "chart-area");

        return { svg, chartArea, width, height, innerWidth, innerHeight, margin, legendSpaceY: estimatedLegendHeight, chartConfig };
    }

    function createTooltip() {
        let tooltip = d3.select("body").select(".chart-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "chart-tooltip")
                .style("opacity", 0).style("position", "absolute").style("pointer-events", "none")
                .style("background", "rgba(33, 37, 41, 0.9)").style("color", "#fff").style("padding", "6px 10px")
                .style("border-radius", "4px").style("font-size", APP_CONFIG.CHART_SETTINGS.TOOLTIP_FONT_SIZE || "11px")
                .style("z-index", "3050")
                .style("line-height", "1.4").style("transition", `opacity ${APP_CONFIG.UI_SETTINGS.TRANSITION_DURATION_MS / 2}ms ease-out`);
        } return tooltip;
    }

    function renderAgeDistributionChart(ageData, targetElementId, options = {}) {
        const containerSetup = createSvgContainer(targetElementId, options); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, chartConfig } = containerSetup;
        const tooltip = createTooltip();
        const barColor = _getResolvedColor(chartConfig, 0, options); // Use first color from scheme

        if (!Array.isArray(ageData) || ageData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE).text('Keine Altersdaten verfügbar.'); return; }

        const xMin = d3.min(ageData); const xMax = d3.max(ageData);
        const xDomain = (xMin !== undefined && xMax !== undefined && !isNaN(xMin) && !isNaN(xMax)) ? [Math.max(0, xMin - 5), xMax + 5] : [0, 100];
        const x = d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
        const tickCountX = Math.max(3, Math.min(10, Math.floor(innerWidth / (parseFloat(chartConfig.tickLabelFontSizePt || chartConfig.TICK_LABEL_FONT_SIZE) * 4))));

        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(tickCountX).tickSizeOuter(0).tickFormat(d3.format("d")))
            .selectAll("text").style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle")
            .attr("x", margin.left + innerWidth / 2).attr("y", height - (margin.bottom / 4))
            .style("font-size", chartConfig.axisLabelFontSizePt ? `${chartConfig.axisLabelFontSizePt}pt` : chartConfig.AXIS_LABEL_FONT_SIZE)
            .text(UI_TEXTS.axisLabels.age);

        const histogram = d3.histogram().value(d => d).domain(x.domain()).thresholds(x.ticks(Math.max(5, Math.min(20, Math.floor(innerWidth / 20)))));
        const bins = histogram(ageData.filter(d => !isNaN(d) && isFinite(d)));
        const yMax = d3.max(bins, d => d.length);
        const y = d3.scaleLinear().range([innerHeight, 0]).domain([0, yMax > 0 ? yMax : 1]).nice();
        const tickCountY = Math.max(2, Math.min(6, Math.floor(innerHeight / (parseFloat(chartConfig.tickLabelFontSizePt || chartConfig.TICK_LABEL_FONT_SIZE) * 3))));

        chartArea.append("g").attr("class", "y-axis axis")
            .call(d3.axisLeft(y).ticks(tickCountY).tickSizeOuter(0).tickFormat(d3.format("d")))
            .selectAll("text").style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle")
            .attr("transform", `translate(${margin.left / 2 - 5}, ${margin.top + innerHeight / 2}) rotate(-90)`)
            .style("font-size", chartConfig.axisLabelFontSizePt ? `${chartConfig.axisLabelFontSizePt}pt` : chartConfig.AXIS_LABEL_FONT_SIZE)
            .text(UI_TEXTS.axisLabels.patientCount);

        if (chartConfig.ENABLE_GRIDLINES !== false) {
            chartArea.append("g").attr("class", "grid x-grid").attr("transform", `translate(0,${innerHeight})`)
                .call(d3.axisBottom(x).ticks(tickCountX).tickSize(-innerHeight).tickFormat("")).selectAll("line").style("stroke", chartConfig.gridLineColor).style("stroke-width", chartConfig.gridLineWidthPt ? `${chartConfig.gridLineWidthPt}pt` : "0.5px");
            chartArea.append("g").attr("class", "grid y-grid")
                .call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")).selectAll("line").style("stroke", chartConfig.gridLineColor).style("stroke-width", chartConfig.gridLineWidthPt ? `${chartConfig.gridLineWidthPt}pt` : "0.5px");
        }

        chartArea.selectAll(".bar").data(bins).join("rect").attr("class", "bar")
            .attr("x", d => x(d.x0) + 1).attr("y", y(0))
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("height", 0).style("fill", barColor).style("opacity", 0.85)
            .attr("rx", 1).attr("ry", 1)
            .on("mouseover", (event, d) => { tooltip.transition().duration(50).style("opacity", .95); tooltip.html(`Alter: ${formatNumber(d.x0, 0)}-${formatNumber(d.x1, 0)}<br>Anzahl: ${d.length}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(event.currentTarget).style("opacity", 1).style("stroke", "#333").style("stroke-width", 0.5); })
            .on("mouseout", (event, d) => { tooltip.transition().duration(200).style("opacity", 0); d3.select(event.currentTarget).style("opacity", 0.85).style("stroke", "none"); })
            .transition().duration(chartConfig.ANIMATION_DURATION_MS || 750).ease(d3.easeCubicOut)
            .attr("y", d => y(d.length)).attr("height", d => Math.max(0, innerHeight - y(d.length)));
    }

    function renderPieChart(data, targetElementId, options = {}) {
        const containerSetup = createSvgContainer(targetElementId, options); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, legendSpaceY, chartConfig } = containerSetup;
        const tooltip = createTooltip();
        const colorPalette = options.styleProfile === 'radiology' ? (chartConfig.colorSchemes[chartConfig.preferredColorScheme] || chartConfig.colorSchemes.default) : (APP_CONFIG.CHART_SETTINGS.COLOR_SCHEMES.default);

        const validData = data.filter(d => d && typeof d.value === 'number' && d.value >= 0 && typeof d.label === 'string');
        const totalValue = d3.sum(validData, d => d.value);

        if (validData.length === 0 || totalValue <= 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE).text('Keine Daten.'); return; }

        const plottingHeight = innerHeight; const plottingWidth = innerWidth;
        const outerRadiusFactor = options.outerRadiusFactor ?? (chartConfig.pieOuterRadiusFactor ?? 0.9);
        const innerRadiusFactor = options.innerRadiusFactor ?? (chartConfig.pieInnerRadiusFactor ?? 0.5);
        const outerRadius = Math.min(plottingWidth, plottingHeight) / 2 * outerRadiusFactor;
        const innerRadius = outerRadius * innerRadiusFactor;
        const labelFontSize = chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : (options.fontSize || chartConfig.TICK_LABEL_FONT_SIZE);
        const cornerRadius = options.cornerRadius ?? (chartConfig.pieCornerRadius ?? 2);
        const labelThreshold = options.labelThreshold ?? (chartConfig.pieLabelThreshold ?? 0.05);

        if (outerRadius <= innerRadius || outerRadius <= 0) { chartArea.append('text').attr('x', plottingWidth / 2).attr('y', plottingHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Zu klein'); return; }

        const color = d3.scaleOrdinal().domain(validData.map(d => d.label)).range(colorPalette);
        const pie = d3.pie().value(d => d.value).sort(null);
        const arcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(cornerRadius);
        const labelArcGenerator = d3.arc().innerRadius(innerRadius + (outerRadius - innerRadius) * 0.6).outerRadius(innerRadius + (outerRadius - innerRadius) * 0.6);

        const pieGroup = chartArea.append("g").attr("class", "pie-group").attr("transform", `translate(${plottingWidth / 2},${plottingHeight / 2})`);
        const arcs = pieGroup.selectAll(".arc").data(pie(validData)).join("g").attr("class", "arc").attr("data-label", d => d.data.label);

        arcs.append("path").style("fill", d => color(d.data.label))
            .style("stroke", chartConfig.plotBackgroundColor || "#ffffff").style("stroke-width", "1.5px").style("opacity", 0.9)
            .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); tooltip.html(`<strong>${d.data.label}:</strong> ${formatNumber(d.data.value, 0)} (${formatPercent(d.data.value / totalValue)})`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).transition().duration(100).style("opacity", 1).attr("transform", "scale(1.03)"); })
            .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).transition().duration(100).style("opacity", 0.9).attr("transform", "scale(1)"); })
            .transition().duration(chartConfig.ANIMATION_DURATION_MS || 750).ease(d3.easeCubicOut)
            .attrTween("d", d => { const i = d3.interpolate({startAngle: d.startAngle, endAngle: d.startAngle}, d); return t => arcGenerator(i(t)); });

        arcs.filter(d => (d.endAngle - d.startAngle) / (2 * Math.PI) >= labelThreshold)
            .append("text").attr("transform", d => `translate(${labelArcGenerator.centroid(d)})`)
            .attr("dy", "0.35em").style("text-anchor", "middle").style("font-size", labelFontSize)
            .style("fill", (options.styleProfile === 'radiology' && chartConfig.preferredColorScheme === 'radiology_grayscale') ? '#000000' : '#ffffff') // Dark text on light gray for grayscale
            .style("pointer-events", "none").style("opacity", 0)
            .text(d => formatPercent(d.data.value / totalValue, 0))
            .transition().duration(chartConfig.ANIMATION_DURATION_MS || 750).delay((chartConfig.ANIMATION_DURATION_MS || 750) / 2).style("opacity", 1);

        if (options.legendBelow && legendSpaceY > 0 && validData.length > 0) {
            const legendItemHeight = (parseFloat(chartConfig.legendFontSizePt || chartConfig.LEGEND_FONT_SIZE) || 10) * 1.8;
            const legendMaxWidth = innerWidth;
            const legendGroup = svg.append("g").attr("class", "legend pie-legend")
                .attr("transform", `translate(${margin.left}, ${margin.top + plottingHeight + 15})`)
                .attr("font-family", chartConfig.fontFamily || "sans-serif")
                .style("font-size", chartConfig.legendFontSizePt ? `${chartConfig.legendFontSizePt}pt` : chartConfig.LEGEND_FONT_SIZE)
                .attr("text-anchor", "start");

            let currentX = 0; let currentY = 0;
            const legendItems = legendGroup.selectAll("g.legend-item").data(validData).join("g").attr("class", "legend-item").attr("data-label", d => d.label);
            legendItems.each(function(d, i) {
                const item = d3.select(this);
                item.append("rect").attr("x", 0).attr("y", - (parseFloat(chartConfig.legendFontSizePt || chartConfig.LEGEND_FONT_SIZE) / 2)).attr("width", 10).attr("height", 10).attr("fill", color(d.label));
                item.append("text").attr("x", 14).attr("y", 0).attr("dy", "0.3em").text(`${d.label} (${formatNumber(d.value, 0)})`);
                const itemWidth = this.getBBox().width + 20; // Add some padding
                if (i > 0 && currentX + itemWidth > legendMaxWidth) { currentX = 0; currentY += legendItemHeight; }
                item.attr("transform", `translate(${currentX}, ${currentY})`);
                currentX += itemWidth;
            });
        }
    }

    function renderComparisonBarChart(chartData, targetElementId, options = {}, t2Label = 'T2') {
        const containerSetup = createSvgContainer(targetElementId, options); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, chartConfig } = containerSetup;
        const tooltip = createTooltip();

        if (!Array.isArray(chartData) || chartData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE).text('Keine Vergleichsdaten.'); return; }

        const groups = chartData.map(d => d.metric);
        const subgroups = Object.keys(chartData[0]).filter(key => key !== 'metric');
        const subgroupDisplayNames = { 'AS': UI_TEXTS.legendLabels.avocadoSign, 'T2': t2Label };

        const x0 = d3.scaleBand().domain(groups).range([0, innerWidth]).paddingInner(chartConfig.barSpacingRatio || 0.35);
        const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.15);
        const y = d3.scaleLinear().domain([0, 1.0]).nice().range([innerHeight, 0]);

        const colorAS = _getResolvedColor(chartConfig, 'AS_COLOR', options);
        const colorT2 = _getResolvedColor(chartConfig, 'T2_COLOR', options);
        const color = d3.scaleOrdinal().domain(subgroups).range([colorAS, colorT2]);

        const tickCountY = 5;
        chartArea.append("g").attr("class", "y-axis axis")
            .call(d3.axisLeft(y).ticks(tickCountY, "%").tickSizeOuter(0))
            .selectAll("text").style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle")
            .attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`)
            .style("font-size", chartConfig.axisLabelFontSizePt ? `${chartConfig.axisLabelFontSizePt}pt` : chartConfig.AXIS_LABEL_FONT_SIZE)
            .text(UI_TEXTS.axisLabels.metricValue);

        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x0).tickSizeOuter(0))
            .selectAll(".tick text").style("text-anchor", "middle")
            .style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        if (chartConfig.ENABLE_GRIDLINES !== false) {
            chartArea.append("g").attr("class", "grid y-grid")
                .call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")).selectAll("line").style("stroke", chartConfig.gridLineColor).style("stroke-width", chartConfig.gridLineWidthPt ? `${chartConfig.gridLineWidthPt}pt` : "0.5px");
        }

        const metricGroup = chartArea.selectAll(".metric-group").data(chartData).join("g")
            .attr("class", "metric-group").attr("transform", d => `translate(${x0(d.metric)},0)`);

        metricGroup.selectAll("rect").data(d => subgroups.map(key => ({key: key, value: d[key], metric: d.metric})))
            .join("rect").attr("class", d => `bar bar-${d.key.toLowerCase()}`)
            .attr("x", d => x1(d.key)).attr("y", y(0))
            .attr("width", x1.bandwidth()).attr("height", 0)
            .attr("fill", d => color(d.key)).style("opacity", 0.9)
            .attr("rx", 1).attr("ry", 1)
            .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const displayName = subgroupDisplayNames[d.key] || d.key; const digits = (d.metric === 'AUC' || d.metric === 'F1') ? (chartConfig.METRIC_RATE_DECIMALS !== undefined ? chartConfig.METRIC_RATE_DECIMALS : 3) : (chartConfig.METRIC_PERCENT_DECIMALS !== undefined ? chartConfig.METRIC_PERCENT_DECIMALS : 1) ; const isPercent = !(d.metric === 'AUC' || d.metric === 'F1'); const formattedValue = isPercent ? formatPercent(d.value, digits) : formatNumber(d.value, digits); tooltip.html(`<strong>${d.metric} (${displayName}):</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1); })
            .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).style("opacity", 0.9).style("stroke", "none"); })
            .transition().duration(chartConfig.ANIMATION_DURATION_MS || 750).ease(d3.easeCubicOut)
            .attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));

        const legendGroup = svg.append("g").attr("class", "legend bar-legend")
            .attr("font-family", chartConfig.fontFamily || "sans-serif")
            .style("font-size", chartConfig.legendFontSizePt ? `${chartConfig.legendFontSizePt}pt` : chartConfig.LEGEND_FONT_SIZE)
            .attr("text-anchor", "start");

        const legendItems = legendGroup.selectAll("g.legend-item").data(subgroups).join("g")
            .attr("class", "legend-item").attr("data-subgroup", d => d);

        let totalLegendWidth = 0; const legendSpacings = [];
        legendItems.append("rect").attr("x", 0).attr("y", -5).attr("width", 10).attr("height", 10).attr("fill", color);
        legendItems.append("text").attr("x", 14).attr("y", 0).attr("dy", "0.35em")
            .text(d => subgroupDisplayNames[d] || d)
            .each(function() { const itemWidth = this.getBBox().width + 25; legendSpacings.push(itemWidth); totalLegendWidth += itemWidth; });

        const legendStartX = margin.left + Math.max(0, (innerWidth - totalLegendWidth + 10) / 2); // Centered legend
        let currentX = legendStartX;
        legendItems.attr("transform", (d, i) => { const tx = currentX; currentX += legendSpacings[i]; return `translate(${tx}, ${height - margin.bottom + (parseFloat(chartConfig.axisLabelFontSizePt || chartConfig.AXIS_LABEL_FONT_SIZE) * 2.5)})`; });
    }


    function renderASPerformanceChart(targetElementId, performanceData, options = {}, kollektivName = '') {
        const containerSetup = createSvgContainer(targetElementId, options); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, chartConfig } = containerSetup;
        const tooltip = createTooltip();

        const metrics = ['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC'];
        const cohortKey = 'overall'; const cohortPerf = performanceData ? performanceData[cohortKey] : null;

        if (!cohortPerf) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE).text('Performance-Daten nicht verfügbar.'); return; }

        const chartData = metrics.map(metric => {
            const keyLower = metric.toLowerCase();
            let value = NaN;
            if (cohortPerf[keyLower + 'Val'] !== undefined) value = cohortPerf[keyLower + 'Val'];
            else if (cohortPerf[metric] !== undefined && cohortPerf[metric] !== null) value = cohortPerf[metric]?.value ?? NaN;
            return { metric: metric, value: value };
        }).filter(d => d.value !== undefined && !isNaN(d.value));

        if (chartData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE).text('Unvollständige Daten.'); return; }

        const x = d3.scaleBand().domain(metrics).range([0, innerWidth]).padding(0.3);
        const y = d3.scaleLinear().domain([0, 1.0]).nice().range([innerHeight, 0]);
        const barFillColor = _getResolvedColor(chartConfig, 'AS_COLOR', options);

        const tickCountY = 5;
        chartArea.append("g").attr("class", "y-axis axis")
            .call(d3.axisLeft(y).ticks(tickCountY, "%").tickSizeOuter(0))
            .selectAll("text").style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle")
            .attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`)
            .style("font-size", chartConfig.axisLabelFontSizePt ? `${chartConfig.axisLabelFontSizePt}pt` : chartConfig.AXIS_LABEL_FONT_SIZE)
            .text("Diagnostische Güte (AS)");

        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll(".tick text").style("text-anchor", "middle")
            .style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        if (chartConfig.ENABLE_GRIDLINES !== false) {
            chartArea.append("g").attr("class", "grid y-grid")
                .call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")).selectAll("line").style("stroke", chartConfig.gridLineColor).style("stroke-width", chartConfig.gridLineWidthPt ? `${chartConfig.gridLineWidthPt}pt` : "0.5px");
        }

        chartArea.selectAll(".bar").data(chartData).join("rect").attr("class", "bar")
           .attr("x", d => x(d.metric)).attr("y", y(0))
           .attr("width", x.bandwidth()).attr("height", 0)
           .attr("fill", barFillColor).style("opacity", 0.9)
           .attr("rx", 1).attr("ry", 1)
           .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const digits = (d.metric === 'AUC' || d.metric === 'F1') ? (chartConfig.METRIC_RATE_DECIMALS !== undefined ? chartConfig.METRIC_RATE_DECIMALS : 3) : (chartConfig.METRIC_PERCENT_DECIMALS !== undefined ? chartConfig.METRIC_PERCENT_DECIMALS : 1); const isPercent = !(d.metric === 'AUC' || d.metric === 'F1'); const formattedValue = isPercent ? formatPercent(d.value, digits) : formatNumber(d.value, digits); const metricName = TOOLTIP_CONTENT.statMetrics[d.metric.toLowerCase()]?.name || d.metric; tooltip.html(`<strong>${metricName}:</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1); })
           .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).style("opacity", 0.9).style("stroke", "none"); })
           .transition().duration(chartConfig.ANIMATION_DURATION_MS || 750).ease(d3.easeCubicOut)
           .attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));

        svg.append("text").attr("x", width / 2).attr("y", margin.top / 2)
            .attr("text-anchor", "middle").style("font-size", chartConfig.titleFontSizePt ? `${chartConfig.titleFontSizePt}pt` : "12px")
            .style("font-weight", "bold").text(`AS Performance für Kollektiv: ${kollektivName}`);
    }

    function renderROCCurve(rocData, targetElementId, options = {}) {
        const containerSetup = createSvgContainer(targetElementId, options); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, chartConfig } = containerSetup;
        const tooltip = createTooltip();
        const lineColor = options.lineColor || _getResolvedColor(chartConfig, 0, options);

        const validRocData = Array.isArray(rocData) ? rocData.filter(d => d && typeof d.fpr === 'number' && typeof d.tpr === 'number' && isFinite(d.fpr) && isFinite(d.tpr)) : [];
        if (validRocData.length === 0 || validRocData[0]?.fpr !== 0 || validRocData[0]?.tpr !== 0) { validRocData.unshift({ fpr: 0, tpr: 0, threshold: Infinity }); }
        if (validRocData.length > 0 && (validRocData[validRocData.length - 1]?.fpr !== 1 || validRocData[validRocData.length - 1]?.tpr !== 1)) { validRocData.push({ fpr: 1, tpr: 1, threshold: -Infinity }); }


        if (validRocData.length < 2) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE).text('Nicht genügend Daten für ROC.'); return; }

        const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
        const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
        const tickFormat = (options.styleProfile === 'radiology' && typeof radiologyFormatter !== 'undefined') ? (d => radiologyFormatter.formatNumber(d, 1)) : d3.format(".1f");

        const tickCount = 5;
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).ticks(tickCount).tickSizeOuter(0).tickFormat(tickFormat))
            .selectAll("text").style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle")
            .attr("x", margin.left + innerWidth / 2).attr("y", height - (margin.bottom / 4))
            .style("font-size", chartConfig.axisLabelFontSizePt ? `${chartConfig.axisLabelFontSizePt}pt` : chartConfig.AXIS_LABEL_FONT_SIZE)
            .text(UI_TEXTS.axisLabels.oneMinusSpecificity);

        chartArea.append("g").attr("class", "y-axis axis")
            .call(d3.axisLeft(yScale).ticks(tickCount).tickSizeOuter(0).tickFormat(tickFormat))
            .selectAll("text").style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle")
            .attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`)
            .style("font-size", chartConfig.axisLabelFontSizePt ? `${chartConfig.axisLabelFontSizePt}pt` : chartConfig.AXIS_LABEL_FONT_SIZE)
            .text(UI_TEXTS.axisLabels.sensitivity);

        if (chartConfig.ENABLE_GRIDLINES !== false) {
            chartArea.append("g").attr("class", "grid x-grid").attr("transform", `translate(0,${innerHeight})`)
                .call(d3.axisBottom(xScale).ticks(tickCount).tickSize(-innerHeight).tickFormat("")).selectAll("line").style("stroke", chartConfig.gridLineColor).style("stroke-width", chartConfig.gridLineWidthPt ? `${chartConfig.gridLineWidthPt}pt` : "0.5px");
            chartArea.append("g").attr("class", "grid y-grid")
                .call(d3.axisLeft(yScale).ticks(tickCount).tickSize(-innerWidth).tickFormat("")).selectAll("line").style("stroke", chartConfig.gridLineColor).style("stroke-width", chartConfig.gridLineWidthPt ? `${chartConfig.gridLineWidthPt}pt` : "0.5px");
        }

        const refLineStyle = chartConfig.rocCurve?.referenceLineStyle || "dashed";
        let strokeDashArray = "3 3";
        if(refLineStyle === "solid") strokeDashArray = "none";
        else if(refLineStyle === "dotted") strokeDashArray = "1 3";


        chartArea.append("line").attr("class", "reference-line").attr("x1", 0).attr("y1", innerHeight).attr("x2", innerWidth).attr("y2", 0)
            .style("stroke-dasharray", strokeDashArray).style("stroke", chartConfig.axisLineColor);

        const rocLine = d3.line().x(d => xScale(d.fpr)).y(d => yScale(d.tpr)).curve(d3.curveLinear); // or d3.curveStepBefore for stepped ROC

        const path = chartArea.append("path").datum(validRocData).attr("class", "roc-curve")
            .attr("fill", "none").attr("stroke", lineColor)
            .attr("stroke-width", chartConfig.rocCurve?.lineWidthPt ? `${chartConfig.rocCurve.lineWidthPt}pt` : (chartConfig.LINE_STROKE_WIDTH || 2))
            .attr("d", rocLine);

        const totalLength = path.node()?.getTotalLength();
        if(totalLength) {
            path.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength)
              .transition().duration((chartConfig.ANIMATION_DURATION_MS || 750) * 1.5).ease(d3.easeLinear).attr("stroke-dashoffset", 0);
        }

        const showPoints = options.showPoints ?? chartConfig.rocCurve?.showOperatingPoint ?? false;
        if (showPoints) {
            const pointRadius = chartConfig.rocCurve?.operatingPointRadiusPt || chartConfig.POINT_RADIUS || 4;
            chartArea.selectAll(".roc-point").data(validRocData.filter((d, i) => i > 0 && i < validRocData.length - 1 && d.threshold !== undefined))
                .join("circle").attr("class", "roc-point")
                .attr("cx", d => xScale(d.fpr)).attr("cy", d => yScale(d.tpr))
                .attr("r", pointRadius / 1.5).attr("fill", lineColor).style("opacity", 0)
                .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const threshText = (d.threshold && isFinite(d.threshold)) ? `<br>Threshold: ${formatNumber(d.threshold, 2)}` : ''; tooltip.html(`FPR: ${formatNumber(d.fpr, 2)}<br>TPR: ${formatNumber(d.tpr, 2)}${threshText}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).attr("r", pointRadius); })
                .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).attr("r", pointRadius / 1.5); })
                .transition().delay((chartConfig.ANIMATION_DURATION_MS || 750) * 1.5).duration((chartConfig.ANIMATION_DURATION_MS || 750) / 2).style("opacity", 0.7);
        }

         if (options.aucValue !== undefined && !isNaN(options.aucValue)) {
            const aucText = `AUC: ${typeof radiologyFormatter !== 'undefined' && options.styleProfile === 'radiology' ? radiologyFormatter.formatStatistic(options.aucValue, options.aucCI?.lower, options.aucCI?.upper, {decimals:3, isPercent: false}) : formatCI(options.aucValue, options.aucCI?.lower, options.aucCI?.upper, 3, false, '--')}`;
            chartArea.append("text").attr("class", "auc-label").attr("x", innerWidth - 10).attr("y", innerHeight - 10)
                .attr("text-anchor", "end").style("font-size", chartConfig.legendFontSizePt ? `${chartConfig.legendFontSizePt}pt` : chartConfig.LEGEND_FONT_SIZE)
                .style("font-weight", "bold").text(aucText);
         }
    }


    function renderForestPlot(plotData, targetElementId, options = {}) {
        const containerSetup = createSvgContainer(targetElementId, options); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, chartConfig } = containerSetup;
        const tooltip = createTooltip();

        if (!Array.isArray(plotData) || plotData.length === 0) {
            chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2)
                .attr('text-anchor', 'middle').attr('class', 'text-muted small')
                .style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE)
                .text('Keine Daten für Forest Plot.');
            return;
        }

        const data = plotData.map(d => ({
            ...d,
            pointEstimate: parseFloat(d.pointEstimate),
            ciLower: parseFloat(d.ciLower),
            ciUpper: parseFloat(d.ciUpper)
        })).filter(d => !isNaN(d.pointEstimate) && !isNaN(d.ciLower) && !isNaN(d.ciUpper));

        if (data.length === 0) {
             chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2)
                .attr('text-anchor', 'middle').attr('class', 'text-muted small')
                .style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE)
                .text('Keine validen Datenpunkte für Forest Plot.');
            return;
        }


        const xScaleType = options.xScaleType || chartConfig.forestPlot?.xScaleType || 'linear';
        const allValues = data.reduce((acc, d) => acc.concat(d.pointEstimate, d.ciLower, d.ciUpper), []);
        const xDomain = d3.extent(allValues);
        if (xDomain[0] === undefined || xDomain[1] === undefined) { xDomain[0] = 0; xDomain[1] = 1; }


        const x = (xScaleType === 'log')
            ? d3.scaleLog().domain([Math.max(0.01, xDomain[0]), xDomain[1]]).range([0, innerWidth]).nice()
            : d3.scaleLinear().domain(xDomain).range([0, innerWidth]).nice();

        const y = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, innerHeight])
            .padding(0.4);

        const tickFormatX = (options.styleProfile === 'radiology' && typeof radiologyFormatter !== 'undefined') ?
                            (d => radiologyFormatter.formatNumber(d, xScaleType === 'log' ? 2 : 1)) :
                            (xScaleType === 'log' ? d3.format(".2~r") : d3.format(".1f"));


        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(tickFormatX))
            .selectAll("text").style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);

        if (options.xAxisLabel) {
            svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle")
               .attr("x", margin.left + innerWidth / 2).attr("y", height - (margin.bottom / 4))
               .style("font-size", chartConfig.axisLabelFontSizePt ? `${chartConfig.axisLabelFontSizePt}pt` : chartConfig.AXIS_LABEL_FONT_SIZE)
               .text(options.xAxisLabel);
        }

        chartArea.append("g").attr("class", "y-axis axis")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
            .selectAll("text").style("font-size", chartConfig.tickLabelFontSizePt ? `${chartConfig.tickLabelFontSizePt}pt` : chartConfig.TICK_LABEL_FONT_SIZE);


        const zeroEffectLineVal = (xScaleType === 'log') ? 1 : 0;
        if (x.domain()[0] <= zeroEffectLineVal && x.domain()[1] >= zeroEffectLineVal) {
            chartArea.append("line")
                .attr("class", "reference-line zero-effect-line")
                .attr("x1", x(zeroEffectLineVal))
                .attr("x2", x(zeroEffectLineVal))
                .attr("y1", 0)
                .attr("y2", innerHeight)
                .style("stroke", chartConfig.axisLineColor || "#333333")
                .style("stroke-width", chartConfig.forestPlot?.zeroEffectLineWidthPt ? `${chartConfig.forestPlot.zeroEffectLineWidthPt}pt` : "1px")
                .style("stroke-dasharray", chartConfig.forestPlot?.zeroEffectLineStyle === 'dashed' ? "4,2" : "none");
        }

        const pointColor = _getResolvedColor(chartConfig, 0, options);
        const summaryColor = _getResolvedColor(chartConfig, 1, options);

        const studies = chartArea.selectAll(".forest-item")
            .data(data.filter(d => !d.isSummary))
            .join("g")
            .attr("class", "forest-item")
            .attr("transform", d => `translate(0, ${y(d.label) + y.bandwidth() / 2})`);

        studies.append("line") // CI line
            .attr("x1", d => x(d.ciLower))
            .attr("x2", d => x(d.ciUpper))
            .attr("y1", 0).attr("y2", 0)
            .style("stroke", pointColor)
            .style("stroke-width", chartConfig.dataLineWidthPt ? `${chartConfig.dataLineWidthPt}pt` : "1.5px");

        const pointMarker = chartConfig.forestPlot?.pointMarker || "square";
        const pointSize = chartConfig.forestPlot?.pointSizePt || 3;

        if (pointMarker === "circle") {
             studies.append("circle") // Point estimate
                .attr("cx", d => x(d.pointEstimate))
                .attr("cy", 0)
                .attr("r", pointSize)
                .style("fill", pointColor);
        } else { // Default to square
             studies.append("rect") // Point estimate
                .attr("x", d => x(d.pointEstimate) - pointSize)
                .attr("y", -pointSize)
                .attr("width", pointSize * 2)
                .attr("height", pointSize * 2)
                .style("fill", pointColor);
        }


        const summaryData = data.find(d => d.isSummary);
        if (summaryData) {
            const summaryGroup = chartArea.append("g")
                .attr("class", "forest-summary-item")
                .attr("transform", `translate(0, ${y(summaryData.label) + y.bandwidth() / 2})`);

            summaryGroup.append("line") // CI line for summary
                .attr("x1", x(summaryData.ciLower))
                .attr("x2", x(summaryData.ciUpper))
                .attr("y1", 0).attr("y2", 0)
                .style("stroke", summaryColor)
                .style("stroke-width", (chartConfig.dataLineWidthPt || 1.5) * 1.2); // Slightly thicker

            const summaryMarker = chartConfig.forestPlot?.summaryMarker || "diamond";
            const summarySize = chartConfig.forestPlot?.summaryMarkerSizePt || 4;

            if (summaryMarker === "diamond") {
                summaryGroup.append("path") // Diamond for summary estimate
                    .attr("d", d3.symbol().type(d3.symbolDiamond).size(summarySize * summarySize * 5)) // Adjust size factor
                    .attr("transform", `translate(${x(summaryData.pointEstimate)}, 0)`)
                    .style("fill", summaryColor);
            } else { // Fallback to larger circle/square
                 summaryGroup.append("rect")
                    .attr("x", d => x(summaryData.pointEstimate) - summarySize)
                    .attr("y", -summarySize)
                    .attr("width", summarySize * 2)
                    .attr("height", summarySize * 2)
                    .style("fill", summaryColor);
            }
        }

        // Tooltips for all points (studies and summary)
        chartArea.selectAll(".forest-item circle, .forest-item rect, .forest-summary-item path, .forest-summary-item rect")
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(50).style("opacity", .95);
                const estFormat = (options.styleProfile === 'radiology' && typeof radiologyFormatter !== 'undefined') ? radiologyFormatter.formatNumber(d.pointEstimate, 2) : formatNumber(d.pointEstimate, 2);
                const ciFormat = (options.styleProfile === 'radiology' && typeof radiologyFormatter !== 'undefined') ? radiologyFormatter.formatConfidenceInterval(d.ciLower, d.ciUpper, 2, false) : formatCI(d.pointEstimate, d.ciLower, d.ciUpper, 2, false).split('(')[1]?.replace(')','');


                tooltip.html(`<strong>${d.label}</strong><br>Est: ${estFormat}<br>95% CI: ${ciFormat || formatNumber(d.ciLower,2)+ ' - '+formatNumber(d.ciUpper,2)}`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 15) + "px");
                d3.select(this).style("opacity", 0.7);
            })
            .on("mouseout", function(event, d) {
                tooltip.transition().duration(200).style("opacity", 0);
                d3.select(this).style("opacity", 1);
            });
    }


    return Object.freeze({
        renderAgeDistributionChart,
        renderPieChart,
        renderComparisonBarChart,
        renderASPerformanceChart,
        renderROCCurve,
        renderForestPlot
    });

})();
