const chartRenderer = (() => {

    const NEW_PRIMARY_COLOR_BLUE = APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE || '#4472C4';
    const NEW_SECONDARY_COLOR_YELLOW_GREEN = APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN || '#E0DC2C';
    const DEFAULT_COLOR_SCHEME = APP_CONFIG.CHART_SETTINGS.COLOR_SCHEMES?.default || ['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
    const PLOT_BACKGROUND_COLOR = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || '#ffffff';
    const ANIMATION_DURATION_MS = APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750;
    const TICK_LABEL_FONT_SIZE = APP_CONFIG.CHART_SETTINGS.TICK_LABEL_FONT_SIZE || '10px';
    const AXIS_LABEL_FONT_SIZE = APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE || '11px';
    const LEGEND_FONT_SIZE = APP_CONFIG.CHART_SETTINGS.LEGEND_FONT_SIZE || '10px';
    const TOOLTIP_FONT_SIZE = APP_CONFIG.CHART_SETTINGS.TOOLTIP_FONT_SIZE || '11px';
    const ENABLE_GRIDLINES = APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES !== false;
    const LINE_STROKE_WIDTH = APP_CONFIG.CHART_SETTINGS.LINE_STROKE_WIDTH || 2;
    const POINT_RADIUS = APP_CONFIG.CHART_SETTINGS.POINT_RADIUS || 4;
    const TRANSITION_DURATION_MS = APP_CONFIG.UI_SETTINGS.TRANSITION_DURATION_MS || 350;

    function createSvgContainer(targetElementId, options = {}) {
        const container = d3.select(`#${targetElementId}`);
        if (container.empty() || !container.node()) { console.error(`Chart-Container #${targetElementId} nicht gefunden.`); return null; }
        container.selectAll("svg").remove(); container.html('');

        const containerNode = container.node();
        const initialWidth = containerNode.clientWidth || parseFloat(window.getComputedStyle(containerNode).width) || 0;
        const initialHeight = containerNode.clientHeight || parseFloat(window.getComputedStyle(containerNode).height) || 0;

        const margin = { ...APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...(options.margin || {}) };
        const defaultWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const defaultHeight = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;

        const width = options.width || (initialWidth > 20 ? initialWidth : defaultWidth);
        let height = options.height || (initialHeight > 20 ? initialHeight : defaultHeight);

        const legendItemCount = options.legendItemCount || 0;
        const estimatedLegendHeight = options.legendBelow ? Math.max(25, legendItemCount * 12 + 15) : 0;

        if (options.useCompactMargins && options.legendBelow) {
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
            .style("background-color", options.backgroundColor || PLOT_BACKGROUND_COLOR)
            .style("font-family", "var(--font-family-sans-serif)").style("overflow", "visible");

        const chartArea = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "chart-area");

        return { svg, chartArea, width, height, innerWidth, innerHeight, margin, legendSpaceY: estimatedLegendHeight };
    }

    function createTooltip() {
        let tooltip = d3.select("body").select(".chart-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "chart-tooltip")
                .style("opacity", 0).style("position", "absolute").style("pointer-events", "none")
                .style("background", "rgba(33, 37, 41, 0.9)").style("color", "#fff").style("padding", "6px 10px")
                .style("border-radius", "4px").style("font-size", TOOLTIP_FONT_SIZE).style("z-index", "3050")
                .style("line-height", "1.4").style("transition", `opacity ${TRANSITION_DURATION_MS / 2}ms ease-out`);
        } return tooltip;
    }

    function renderAgeDistributionChart(ageData, targetElementId, options = {}) {
        const setupOptions = { ...options, margin: { ...APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options.margin } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip(); const barColor = NEW_PRIMARY_COLOR_BLUE;

        if (!Array.isArray(ageData) || ageData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Keine Altersdaten verfügbar.'); return; }
        const xMin = d3.min(ageData); const xMax = d3.max(ageData); const xDomain = (xMin !== undefined && xMax !== undefined && !isNaN(xMin) && !isNaN(xMax)) ? [Math.max(0, xMin - 5), xMax + 5] : [0, 100];
        const x = d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
        const tickCountX = Math.max(3, Math.min(10, Math.floor(innerWidth / 50)));
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(tickCountX).tickSizeOuter(0).tickFormat(d3.format("d"))).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - 5).style("font-size", AXIS_LABEL_FONT_SIZE).text(UI_TEXTS.axisLabels.age);
        const histogram = d3.histogram().value(d => d).domain(x.domain()).thresholds(x.ticks(Math.max(5, Math.min(20, Math.floor(innerWidth / 25)))));
        const bins = histogram(ageData.filter(d => !isNaN(d) && isFinite(d))); const yMax = d3.max(bins, d => d.length);
        const y = d3.scaleLinear().range([innerHeight, 0]).domain([0, yMax > 0 ? yMax : 1]).nice();
        const tickCountY = Math.max(2, Math.min(6, Math.floor(innerHeight / 35)));
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY).tickSizeOuter(0).tickFormat(d3.format("d"))).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 5}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", AXIS_LABEL_FONT_SIZE).text(UI_TEXTS.axisLabels.patientCount);
        if (ENABLE_GRIDLINES) { chartArea.append("g").attr("class", "grid x-grid").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(tickCountX).tickSize(-innerHeight).tickFormat("")); chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")); }
        chartArea.selectAll(".bar").data(bins).join("rect").attr("class", "bar").attr("x", d => x(d.x0) + 1).attr("y", y(0)).attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1)).attr("height", 0).style("fill", barColor).style("opacity", 0.8).attr("rx", 1).attr("ry", 1)
            .on("mouseover", (event, d) => { tooltip.transition().duration(50).style("opacity", .95); tooltip.html(`Alter: ${formatNumber(d.x0, 0)}-${formatNumber(d.x1, 0)}<br>Anzahl: ${d.length}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(event.currentTarget).style("opacity", 1).style("stroke", "#333").style("stroke-width", 0.5); })
            .on("mouseout", (event, d) => { tooltip.transition().duration(200).style("opacity", 0); d3.select(event.currentTarget).style("opacity", 0.8).style("stroke", "none"); })
            .transition().duration(ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attr("y", d => y(d.length)).attr("height", d => Math.max(0, innerHeight - y(d.length)));
    }

    function renderPieChart(data, targetElementId, options = {}) {
        const setupOptions = { ...options, margin: options.useCompactMargins ? { ...APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN, ...options.margin } : { ...APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options.margin }, legendBelow: options.legendBelow ?? options.useCompactMargins, legendItemCount: data?.length || 0 };
        const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, legendSpaceY } = containerSetup; const tooltip = createTooltip(); const colorScheme = options.colorScheme || DEFAULT_COLOR_SCHEME;
        const validData = data.filter(d => d && typeof d.value === 'number' && d.value >= 0 && typeof d.label === 'string'); const totalValue = d3.sum(validData, d => d.value);
        if (validData.length === 0 || totalValue <= 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Keine Daten.'); return; }
        const plottingHeight = innerHeight; const plottingWidth = innerWidth;
        const outerRadius = Math.min(plottingWidth, plottingHeight) / 2 * (options.outerRadiusFactor ?? 0.9); const innerRadius = outerRadius * (options.innerRadiusFactor ?? 0.5); const labelFontSize = options.fontSize || TICK_LABEL_FONT_SIZE; const cornerRadius = options.cornerRadius ?? 2; const labelThreshold = options.labelThreshold ?? 0.05;
        if (outerRadius <= innerRadius || outerRadius <= 0) { chartArea.append('text').attr('x', plottingWidth / 2).attr('y', plottingHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Zu klein'); return; }
        const color = d3.scaleOrdinal().domain(validData.map(d => d.label)).range(colorScheme); const pie = d3.pie().value(d => d.value).sort(null); const arcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(cornerRadius); const labelArcGenerator = d3.arc().innerRadius(innerRadius + (outerRadius - innerRadius) * 0.6).outerRadius(innerRadius + (outerRadius - innerRadius) * 0.6);
        const pieGroup = chartArea.append("g").attr("class", "pie-group").attr("transform", `translate(${plottingWidth / 2},${plottingHeight / 2})`); const arcs = pieGroup.selectAll(".arc").data(pie(validData)).join("g").attr("class", "arc").attr("data-label", d => d.data.label);
        arcs.append("path").style("fill", d => color(d.data.label)).style("stroke", PLOT_BACKGROUND_COLOR).style("stroke-width", "1.5px").style("opacity", 0.85)
            .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); tooltip.html(`<strong>${d.data.label}:</strong> ${formatNumber(d.data.value, 0)} (${formatPercent(d.data.value / totalValue)})`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).transition().duration(100).style("opacity", 1).attr("transform", "scale(1.03)"); })
            .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).transition().duration(100).style("opacity", 0.85).attr("transform", "scale(1)"); })
            .transition().duration(ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attrTween("d", d => { const i = d3.interpolate({startAngle: d.startAngle, endAngle: d.startAngle}, d); return t => arcGenerator(i(t)); });
        arcs.filter(d => (d.endAngle - d.startAngle) / (2 * Math.PI) >= labelThreshold).append("text").attr("transform", d => `translate(${labelArcGenerator.centroid(d)})`).attr("dy", "0.35em").style("text-anchor", "middle").style("font-size", labelFontSize).style("fill", "#ffffff").style("pointer-events", "none").style("opacity", 0).text(d => formatPercent(d.data.value / totalValue, 0)).transition().duration(ANIMATION_DURATION_MS).delay(ANIMATION_DURATION_MS / 2).style("opacity", 1);
        if (setupOptions.legendBelow && legendSpaceY > 0 && validData.length > 0) {
            const legendItemHeight = 18; const legendMaxWidth = innerWidth;
            const legendGroup = svg.append("g").attr("class", "legend pie-legend").attr("transform", `translate(${margin.left}, ${margin.top + plottingHeight + 15})`).attr("font-family", "sans-serif").attr("font-size", LEGEND_FONT_SIZE).attr("text-anchor", "start");
            let currentX = 0; let currentY = 0;
            const legendItems = legendGroup.selectAll("g.legend-item").data(validData).join("g").attr("class", "legend-item").attr("data-label", d => d.label);
            legendItems.each(function(d, i) {
                const item = d3.select(this);
                item.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", color(d.label));
                item.append("text").attr("x", 14).attr("y", 5).attr("dy", "0.35em").text(`${d.label} (${formatNumber(d.value, 0)})`);
                const itemWidth = this.getBBox().width + 15;
                if (i > 0 && currentX + itemWidth > legendMaxWidth) { currentX = 0; currentY += legendItemHeight; }
                item.attr("transform", `translate(${currentX}, ${currentY})`);
                currentX += itemWidth;
            });
        }
    }

    function renderComparisonBarChart(chartData, targetElementId, options = {}, t2Label = 'T2') {
         const setupOptions = { ...options, margin: { top: 20, right: 20, bottom: 60, left: 50, ...options.margin } };
         const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
         const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip();
         if (!Array.isArray(chartData) || chartData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Keine Vergleichsdaten.'); return; }
         const groups = chartData.map(d => d.metric); const subgroups = Object.keys(chartData[0]).filter(key => key !== 'metric');
         const subgroupDisplayNames = { 'AS': UI_TEXTS.legendLabels.avocadoSign, 'T2': t2Label };
         const x0 = d3.scaleBand().domain(groups).range([0, innerWidth]).paddingInner(0.35); const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.15); const y = d3.scaleLinear().domain([0, 1.0]).nice().range([innerHeight, 0]); const color = d3.scaleOrdinal().domain(subgroups).range([APP_CONFIG.CHART_SETTINGS.AS_COLOR, APP_CONFIG.CHART_SETTINGS.T2_COLOR]);
         const tickCountY = 5; chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY, "%").tickSizeOuter(0)).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
         svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", AXIS_LABEL_FONT_SIZE).text(UI_TEXTS.axisLabels.metricValue);
         chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x0).tickSizeOuter(0)).selectAll(".tick text").style("text-anchor", "middle").style("font-size", TICK_LABEL_FONT_SIZE);
         if (ENABLE_GRIDLINES) { chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")); }
         const metricGroup = chartArea.selectAll(".metric-group").data(chartData).join("g").attr("class", "metric-group").attr("transform", d => `translate(${x0(d.metric)},0)`);
         metricGroup.selectAll("rect").data(d => subgroups.map(key => ({key: key, value: d[key], metric: d.metric}))).join("rect").attr("class", d => `bar bar-${d.key.toLowerCase()}`).attr("x", d => x1(d.key)).attr("y", y(0)).attr("width", x1.bandwidth()).attr("height", 0).attr("fill", d => color(d.key)).style("opacity", 0.9).attr("rx", 1).attr("ry", 1)
            .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const displayName = subgroupDisplayNames[d.key] || d.key; const digits = (d.metric === 'AUC' || d.metric === 'F1') ? 3 : 1; const isPercent = !(d.metric === 'AUC' || d.metric === 'F1'); const formattedValue = isPercent ? formatPercent(d.value, digits) : formatNumber(d.value, digits); tooltip.html(`<strong>${d.metric} (${displayName}):</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1); })
            .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).style("opacity", 0.9).style("stroke", "none"); })
            .transition().duration(ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));
         const legendGroup = svg.append("g").attr("class", "legend bar-legend").attr("font-family", "sans-serif").attr("font-size", LEGEND_FONT_SIZE).attr("text-anchor", "start"); const legendItems = legendGroup.selectAll("g.legend-item").data(subgroups).join("g").attr("class", "legend-item").attr("data-subgroup", d => d);
         let totalLegendWidth = 0; const legendSpacings = []; legendItems.append("rect").attr("x", 0).attr("y", -5).attr("width", 10).attr("height", 10).attr("fill", color); legendItems.append("text").attr("x", 14).attr("y", 0).attr("dy", "0.35em").text(d => subgroupDisplayNames[d] || d).each(function() { const itemWidth = this.getBBox().width + 25; legendSpacings.push(itemWidth); totalLegendWidth += itemWidth; });
         const legendStartX = margin.left + Math.max(0, (innerWidth - totalLegendWidth + 10) / 2); let currentX = legendStartX; legendItems.attr("transform", (d, i) => { const tx = currentX; currentX += legendSpacings[i]; return `translate(${tx}, ${height - margin.bottom + 30})`; });
    }

    function renderASPerformanceChart(targetElementId, performanceData, options = {}, kollektivName = '') {
        const setupOptions = { ...options, margin: { top: 30, right: 20, bottom: 60, left: 60, ...options.margin } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip();
        const metrics = ['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC']; const cohortKey = 'overall'; const cohortPerf = performanceData ? performanceData[cohortKey] : null;
        if (!cohortPerf) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Performance-Daten nicht verfügbar.'); return; }
        const chartData = metrics.map(metric => { const keyLower = metric.toLowerCase(); let value = NaN; if (cohortPerf[keyLower + 'Val'] !== undefined) value = cohortPerf[keyLower + 'Val']; else if (cohortPerf[metric] !== undefined && cohortPerf[metric] !== null) value = cohortPerf[metric]?.value ?? NaN; return { metric: metric, value: value }; }).filter(d => d.value !== undefined && !isNaN(d.value));
        if (chartData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Unvollständige Daten.'); return; }
        const x = d3.scaleBand().domain(metrics).range([0, innerWidth]).padding(0.3); const y = d3.scaleLinear().domain([0, 1.0]).nice().range([innerHeight, 0]);
        const tickCountY = 5; chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY, "%").tickSizeOuter(0)).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", AXIS_LABEL_FONT_SIZE).text("Diagnostische Güte (AS)");
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickSizeOuter(0)).selectAll(".tick text").style("text-anchor", "middle").style("font-size", TICK_LABEL_FONT_SIZE);
        if (ENABLE_GRIDLINES) { chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")); }
        chartArea.selectAll(".bar").data(chartData).join("rect").attr("class", "bar").attr("x", d => x(d.metric)).attr("y", y(0)).attr("width", x.bandwidth()).attr("height", 0).attr("fill", APP_CONFIG.CHART_SETTINGS.AS_COLOR || NEW_PRIMARY_COLOR_BLUE).style("opacity", 0.9).attr("rx", 1).attr("ry", 1)
           .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const digits = (d.metric === 'AUC' || d.metric === 'F1') ? 3 : 1; const isPercent = !(d.metric === 'AUC' || d.metric === 'F1'); const formattedValue = isPercent ? formatPercent(d.value, digits) : formatNumber(d.value, digits); const metricName = TOOLTIP_CONTENT.statMetrics[d.metric.toLowerCase()]?.name || d.metric; tooltip.html(`<strong>${metricName}:</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1); })
           .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).style("opacity", 0.9).style("stroke", "none"); })
           .transition().duration(ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));
        svg.append("text").attr("x", width / 2).attr("y", margin.top - 10).attr("text-anchor", "middle").style("font-size", "12px").style("font-weight", "bold").text(`AS Performance für Kollektiv: ${kollektivName}`);
    }

    function renderROCCurve(rocData, targetElementId, options = {}) {
        const setupOptions = { ...options, margin: { ...APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options.margin } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip(); const lineColor = options.lineColor || NEW_PRIMARY_COLOR_BLUE;

        const validRocData = Array.isArray(rocData) ? rocData.filter(d => d && typeof d.fpr === 'number' && typeof d.tpr === 'number' && isFinite(d.fpr) && isFinite(d.tpr)) : [];
        if (validRocData.length === 0 || validRocData[0]?.fpr !== 0 || validRocData[0]?.tpr !== 0) { validRocData.unshift({ fpr: 0, tpr: 0, threshold: Infinity }); }
        if (validRocData.length === 0 || validRocData[validRocData.length - 1]?.fpr !== 1 || validRocData[validRocData.length - 1]?.tpr !== 1) { validRocData.push({ fpr: 1, tpr: 1, threshold: -Infinity }); }

        if (validRocData.length < 2) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Nicht genügend Daten für ROC.'); return; }
        const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]); const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
        const tickCount = 5; chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(tickCount).tickSizeOuter(0).tickFormat(d3.format(".1f"))).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - 5).style("font-size", AXIS_LABEL_FONT_SIZE).text(UI_TEXTS.axisLabels.oneMinusSpecificity);
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(yScale).ticks(tickCount).tickSizeOuter(0).tickFormat(d3.format(".1f"))).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", AXIS_LABEL_FONT_SIZE).text(UI_TEXTS.axisLabels.sensitivity);
        if (ENABLE_GRIDLINES) { chartArea.append("g").attr("class", "grid x-grid").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(tickCount).tickSize(-innerHeight).tickFormat("")); chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(yScale).ticks(tickCount).tickSize(-innerWidth).tickFormat("")); }
        chartArea.append("line").attr("class", "reference-line").attr("x1", 0).attr("y1", innerHeight).attr("x2", innerWidth).attr("y2", 0).style("stroke-dasharray", "3 3");
        const rocLine = d3.line().x(d => xScale(d.fpr)).y(d => yScale(d.tpr)).curve(d3.curveLinear);
        const path = chartArea.append("path").datum(validRocData).attr("class", "roc-curve").attr("fill", "none").attr("stroke", lineColor).attr("stroke-width", LINE_STROKE_WIDTH).attr("d", rocLine);
        const totalLength = path.node()?.getTotalLength(); if(totalLength) { path.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().duration(ANIMATION_DURATION_MS * 1.5).ease(d3.easeLinear).attr("stroke-dashoffset", 0); }
        if (options.showPoints) { chartArea.selectAll(".roc-point").data(validRocData.filter((d, i) => i > 0 && i < validRocData.length - 1)).join("circle").attr("class", "roc-point").attr("cx", d => xScale(d.fpr)).attr("cy", d => yScale(d.tpr)).attr("r", POINT_RADIUS / 1.5).attr("fill", lineColor).style("opacity", 0)
            .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const threshText = (d.threshold && isFinite(d.threshold)) ? `<br>Threshold: ${formatNumber(d.threshold, 2)}` : ''; tooltip.html(`FPR: ${formatNumber(d.fpr, 2)}<br>TPR: ${formatNumber(d.tpr, 2)}${threshText}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).attr("r", POINT_RADIUS); })
            .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).attr("r", POINT_RADIUS / 1.5); })
            .transition().delay(ANIMATION_DURATION_MS * 1.5).duration(ANIMATION_DURATION_MS / 2).style("opacity", 0.7); }
         if (options.aucValue !== undefined && !isNaN(options.aucValue)) { const aucText = `AUC: ${formatCI(options.aucValue, options.aucCI?.lower, options.aucCI?.upper, 3, false, '--')}`; chartArea.append("text").attr("class", "auc-label").attr("x", innerWidth - 10).attr("y", innerHeight - 10).attr("text-anchor", "end").style("font-size", AXIS_LABEL_FONT_SIZE).style("font-weight", "bold").text(aucText); }
    }

    return Object.freeze({
        renderAgeDistributionChart,
        renderPieChart,
        renderComparisonBarChart,
        renderASPerformanceChart,
        renderROCCurve
    });

})(); 
