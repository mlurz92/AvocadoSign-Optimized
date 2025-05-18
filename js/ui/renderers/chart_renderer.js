const chartRenderer = (() => {

    const AS_COLOR = APP_CONFIG.CHART_SETTINGS.AS_COLOR || '#4472C4';
    const T2_COLOR = APP_CONFIG.CHART_SETTINGS.T2_COLOR || '#E0DC2C';
    const DEFAULT_COLOR_SCHEME = APP_CONFIG.CHART_SETTINGS.COLOR_SCHEMES?.default || ['#4472C4', '#E0DC2C', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#ff7f0e', '#1f77b4'];
    const PLOT_BACKGROUND_COLOR = APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR || 'var(--bg-white)';
    const ANIMATION_DURATION_MS = APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750;
    const TICK_LABEL_FONT_SIZE = APP_CONFIG.CHART_SETTINGS.TICK_LABEL_FONT_SIZE || '10px';
    const AXIS_LABEL_FONT_SIZE = APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE || '11px';
    const LEGEND_FONT_SIZE = APP_CONFIG.CHART_SETTINGS.LEGEND_FONT_SIZE || '10px';
    const CHART_TOOLTIP_FONT_SIZE = APP_CONFIG.CHART_SETTINGS.TOOLTIP_FONT_SIZE || '11px';
    const ENABLE_GRIDLINES = APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES !== false;
    const LINE_STROKE_WIDTH = APP_CONFIG.CHART_SETTINGS.LINE_STROKE_WIDTH || 2;
    const POINT_RADIUS = APP_CONFIG.CHART_SETTINGS.POINT_RADIUS || 4;
    const TRANSITION_DURATION_SHORT_MS = APP_CONFIG.UI_SETTINGS.TRANSITION_DURATION_MS || 250;

    function createSvgContainer(targetElementId, options = {}) {
        const container = d3.select(`#${targetElementId}`);
        if (container.empty() || !container.node()) {
            console.error(`Chart-Container #${targetElementId} nicht gefunden.`);
            const placeholder = document.getElementById(targetElementId);
            if(placeholder) placeholder.innerHTML = '<p class="text-danger small text-center p-2">Chart Container Fehler.</p>';
            return null;
        }
        container.selectAll("svg").remove();
        container.html('');

        const containerNode = container.node();
        const initialWidth = containerNode.clientWidth || parseFloat(window.getComputedStyle(containerNode).width) || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const initialHeight = options.height || containerNode.clientHeight || parseFloat(window.getComputedStyle(containerNode).height) || APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;


        const margin = { ...APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...(options.margin || {}) };
        const defaultWidth = APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const defaultHeight = APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;

        const width = options.width && options.width > margin.left + margin.right ? options.width : (initialWidth > margin.left + margin.right + 20 ? initialWidth : defaultWidth);
        let height = options.height && options.height > margin.top + margin.bottom ? options.height : (initialHeight > margin.top + margin.bottom + 20 ? initialHeight : defaultHeight);

        const legendItemCount = options.legendItemCount || 0;
        const legendLineHeight = (parseInt(LEGEND_FONT_SIZE, 10) || 10) + 8;
        let estimatedLegendHeight = 0;
        if (options.legendBelow && legendItemCount > 0) {
            const itemsPerRow = Math.max(1, Math.floor((width - margin.left - margin.right) / (options.legendItemAvgWidth || 100)));
            const numRows = Math.ceil(legendItemCount / itemsPerRow);
            estimatedLegendHeight = numRows * legendLineHeight + (margin.bottom / 2);
        }


        if (options.legendBelow && estimatedLegendHeight > 0) {
             height = Math.max(height, (options.heightOriginal || defaultHeight) + estimatedLegendHeight - margin.bottom + 10 );
        }


        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom - (options.legendBelow ? estimatedLegendHeight : 0) ;


        if (innerWidth <= 20 || innerHeight <= 20) {
            container.html('<p class="text-muted small text-center p-2">Diagrammgröße ungültig/zu klein zum Rendern.</p>');
            return null;
        }

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%").style("height", "100%").style("max-width", `${width}px`)
            .style("background-color", options.backgroundColor || PLOT_BACKGROUND_COLOR)
            .style("font-family", "var(--font-family-sans-serif, sans-serif)").style("overflow", "visible");

        const chartArea = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        return { svg, chartArea, width, height, innerWidth, innerHeight, margin, legendSpaceY: estimatedLegendHeight };
    }

    function createTooltip() {
        let tooltip = d3.select("body").select(".chart-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "chart-tooltip tippy-box")
                .style("opacity", 0).style("position", "absolute").style("pointer-events", "none")
                .style("font-size", CHART_TOOLTIP_FONT_SIZE).style("z-index", "3050")
                .style("line-height", "1.4").style("transition", `opacity ${TRANSITION_DURATION_SHORT_MS / 2}ms ease-out`)
                .attr("data-theme", "glass");
        } return tooltip;
    }

    function renderAgeDistributionChart(ageData, targetElementId, options = {}) {
        const setupOptions = { ...options, margin: { top:20, right:20, bottom: (options.xLabel ? 50 : 30), left:50, ...options.margin }, heightOriginal: options.height };
        const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip(); const barColor = options.barColor || AS_COLOR;

        if (!Array.isArray(ageData) || ageData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Keine Altersdaten verfügbar.'); return; }
        const xMin = d3.min(ageData); const xMax = d3.max(ageData); const xDomain = (xMin !== undefined && xMax !== undefined && !isNaN(xMin) && !isNaN(xMax) && isFinite(xMin) && isFinite(xMax)) ? [Math.max(0, xMin - 5), xMax + 5] : [0, 100];
        const x = d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
        const tickCountX = Math.max(3, Math.min(10, Math.floor(innerWidth / 50)));
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(tickCountX).tickSizeOuter(0).tickFormat(d3.format("d"))).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        if(options.xLabel) { svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - margin.bottom + 35).style("font-size", AXIS_LABEL_FONT_SIZE).text(options.xLabel); }
        const histogram = d3.histogram().value(d => d).domain(x.domain()).thresholds(x.ticks(Math.max(5, Math.min(20, Math.floor(innerWidth / 25)))));
        const bins = histogram(ageData.filter(d => d !== null && d !== undefined && !isNaN(d) && isFinite(d))); const yMax = d3.max(bins, d => d.length);
        const y = d3.scaleLinear().range([innerHeight, 0]).domain([0, yMax > 0 ? yMax : 1]).nice();
        const tickCountY = Math.max(2, Math.min(8, Math.floor(innerHeight / 30)));
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY).tickSizeOuter(0).tickFormat(d3.format("d"))).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        if(options.yLabel) { svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", AXIS_LABEL_FONT_SIZE).text(options.yLabel); }
        if (ENABLE_GRIDLINES) { chartArea.append("g").attr("class", "grid").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(tickCountX).tickSize(-innerHeight).tickFormat("")); chartArea.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")); }
        chartArea.selectAll(".bar").data(bins).join("rect").attr("class", "bar").attr("x", d => x(d.x0) + 1).attr("y", y(0)).attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1)).attr("height", 0).style("fill", barColor).style("opacity", 0.8).attr("rx", 1).attr("ry", 1)
            .on("mouseover", (event, d) => { tooltip.transition().duration(50).style("opacity", 1); tooltip.html(`Alter: ${formatNumber(d.x0, 0)}-${formatNumber(d.x1, 0)}<br>Anzahl: ${d.length}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(event.currentTarget).style("opacity", 1).style("stroke", "#333").style("stroke-width", 0.5); })
            .on("mouseout", (event, d) => { tooltip.transition().duration(TRANSITION_DURATION_SHORT_MS).style("opacity", 0); d3.select(event.currentTarget).style("opacity", 0.8).style("stroke", "none"); })
            .transition().duration(ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attr("y", d => y(d.length)).attr("height", d => Math.max(0, innerHeight - y(d.length)));
        if(options.title) { svg.append("text").attr("class","chart-title").attr("x", width / 2).attr("y", margin.top / 2 + 5).attr("text-anchor", "middle").style("font-size", "13px").style("font-weight", "600").text(options.title); }
    }

    function renderPieChart(data, targetElementId, options = {}) {
        const setupOptions = { ...options, margin: options.useCompactMargins ? { ...APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN, ...options.margin } : { ...APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options.margin }, legendBelow: options.legendBelow ?? options.useCompactMargins, legendItemCount: data?.length || 0, heightOriginal: options.height };
        const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, legendSpaceY } = containerSetup; const tooltip = createTooltip(); const colorScheme = options.colorScheme || DEFAULT_COLOR_SCHEME;
        const validData = data.filter(d => d && typeof d.value === 'number' && d.value >= 0 && typeof d.label === 'string'); const totalValue = d3.sum(validData, d => d.value);
        if (validData.length === 0 || totalValue <= 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Keine Daten.'); return; }
        const plottingHeight = innerHeight; const plottingWidth = innerWidth;
        const outerRadius = Math.min(plottingWidth, plottingHeight) / 2 * (options.outerRadiusFactor ?? 0.9); const innerRadius = outerRadius * (options.innerRadiusFactor ?? 0.45); const labelFontSize = options.fontSize || TICK_LABEL_FONT_SIZE; const cornerRadius = options.cornerRadius ?? 2; const labelThreshold = options.labelThreshold ?? 0.05;
        if (outerRadius <= innerRadius || outerRadius <= 0) { chartArea.append('text').attr('x', plottingWidth / 2).attr('y', plottingHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Zu klein'); return; }
        const color = d3.scaleOrdinal().domain(validData.map(d => d.label)).range(colorScheme.slice(0, validData.length)); const pie = d3.pie().value(d => d.value).sort(null); const arcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(cornerRadius); const labelArcGenerator = d3.arc().innerRadius(innerRadius + (outerRadius - innerRadius) * 0.6).outerRadius(innerRadius + (outerRadius - innerRadius) * 0.6);
        const pieGroup = chartArea.append("g").attr("transform", `translate(${plottingWidth / 2},${plottingHeight / 2})`); const arcs = pieGroup.selectAll(".arc").data(pie(validData)).join("g").attr("class", "arc");
        arcs.append("path").style("fill", d => color(d.data.label)).style("stroke", PLOT_BACKGROUND_COLOR).style("stroke-width", "1.5px").style("opacity", 0.85)
            .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", 1); tooltip.html(`<strong>${d.data.label}:</strong> ${formatNumber(d.data.value, 0)} (${formatPercent(d.data.value / totalValue)})`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).transition().duration(100).style("opacity", 1).attr("transform", "scale(1.03)"); })
            .on("mouseout", function(event, d) { tooltip.transition().duration(TRANSITION_DURATION_SHORT_MS).style("opacity", 0); d3.select(this).transition().duration(100).style("opacity", 0.85).attr("transform", "scale(1)"); })
            .transition().duration(ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attrTween("d", d_tween => { const i = d3.interpolate({startAngle: d_tween.startAngle, endAngle: d_tween.startAngle}, d_tween); return t => arcGenerator(i(t)); });
        arcs.filter(d => (d.endAngle - d.startAngle) / (2 * Math.PI) >= labelThreshold).append("text").attr("transform", d => `translate(${labelArcGenerator.centroid(d)})`).attr("dy", "0.35em").style("text-anchor", "middle").style("font-size", labelFontSize).style("fill", "#ffffff").style("pointer-events", "none").style("opacity", 0).text(d => formatPercent(d.data.value / totalValue, 0)).transition().duration(ANIMATION_DURATION_MS).delay(ANIMATION_DURATION_MS / 2).style("opacity", 1);
        if (setupOptions.legendBelow && legendSpaceY > 0 && validData.length > 1) { const legendItemHeight = (parseInt(LEGEND_FONT_SIZE,10) || 10) + 6; const legendMaxWidth = innerWidth; const legendGroup = svg.append("g").attr("class", "legend pie-legend").attr("transform", `translate(${margin.left}, ${margin.top + plottingHeight + 15})`).attr("font-family", "sans-serif").attr("font-size", LEGEND_FONT_SIZE).attr("text-anchor", "start"); let currentX = 0; let currentY = 0; const legendItems = legendGroup.selectAll("g").data(validData).join("g").attr("class", "legend-item"); legendItems.each(function(d, i_idx) { const item = d3.select(this); item.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", color(d.label)); item.append("text").attr("x", 14).attr("y", 5).attr("dy", "0.35em").text(`${d.label} (${formatNumber(d.value, 0)})`); const itemWidth = this.getBBox().width + 15; if (i_idx > 0 && currentX + itemWidth > legendMaxWidth && legendMaxWidth > 0) { currentX = 0; currentY += legendItemHeight; } item.attr("transform", `translate(${currentX}, ${currentY})`); currentX += itemWidth; }); }
        if(options.title) { svg.append("text").attr("class","chart-title").attr("x", width / 2).attr("y", margin.top / 2 + 5).attr("text-anchor", "middle").style("font-size", "13px").style("font-weight", "600").text(options.title); }
    }

    function renderComparisonBarChart(chartData, targetElementId, options = {}, t2LabelGeneric = 'T2') {
         const setupOptions = { ...options, margin: { top: (options.title ? 40 : 25), right: 20, bottom: (options.xLabel ? 60 : 40) + ((options.legendBelow !== false && (options.subgroups?.length || 0) > 0) ? (Math.ceil((options.subgroups?.length || 0) / Math.max(1, Math.floor((options.width || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH)/(options.legendItemAvgWidth || 120)))) * 20) : 0) , left: 50, ...options.margin }, heightOriginal: options.height };
         const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
         const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip();
         if (!Array.isArray(chartData) || chartData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Keine Vergleichsdaten.'); return; }

         const groups = chartData.map(d => d.metric);
         const subgroups = options.subgroups || Object.keys(chartData[0]).filter(key => key !== 'metric');
         const subgroupDisplayNames = { 'AS': UI_TEXTS.legendLabels.avocadoSign, 'T2': t2LabelGeneric, ...(options.subgroupDisplayNames || {}) };
         subgroups.forEach(sg => { if(!subgroupDisplayNames[sg]) subgroupDisplayNames[sg] = sg; });

         const x0 = d3.scaleBand().domain(groups).range([0, innerWidth]).paddingInner(options.x0PaddingInner ?? 0.35);
         const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(options.x1Padding ?? 0.1);
         const yMaxData = d3.max(chartData, d => d3.max(subgroups, key => typeof d[key] === 'number' && isFinite(d[key]) ? d[key] : 0));
         const yDomainMax = options.yAxisMax ?? (yMaxData > 0.8 ? 1.0 : (yMaxData > 0.4 ? Math.ceil(yMaxData*10)/10 : 0.5));
         const y = d3.scaleLinear().domain([0, yDomainMax]).nice().range([innerHeight, 0]);
         const color = d3.scaleOrdinal().domain(subgroups).range(options.barColors || [AS_COLOR, T2_COLOR, ...DEFAULT_COLOR_SCHEME.slice(2)]);

         const tickCountY = options.yAxisTickCount || Math.max(2, Math.min(5, Math.floor(innerHeight / 40)));
         const yAxisTickFormat = options.yAxisTickFormat || (yDomainMax <=1 ? ".0%" : "d");
         chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY, yAxisTickFormat).tickSizeOuter(0)).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
         if(options.yLabel) { svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 5}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", AXIS_LABEL_FONT_SIZE).text(options.yLabel); }
         chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x0).tickSizeOuter(0)).selectAll(".tick text").style("text-anchor", "middle").style("font-size", TICK_LABEL_FONT_SIZE);
         if(options.xLabel) svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - margin.bottom + 35 + (options.legendBelow !== false && subgroups.length > 0 ? Math.ceil(subgroups.length / Math.max(1,Math.floor(innerWidth/100))) * 10 : 0)).style("font-size", AXIS_LABEL_FONT_SIZE).text(options.xLabel);
         if (ENABLE_GRIDLINES) { chartArea.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")); }

         const metricGroup = chartArea.selectAll(".metric-group").data(chartData).join("g").attr("class", "metric-group").attr("transform", d => `translate(${x0(d.metric)},0)`);
         metricGroup.selectAll("rect").data(d => subgroups.map(key => ({key: key, value: d[key], metric: d.metric}))).join("rect").attr("class", d => `bar bar-${String(d.key).toLowerCase().replace(/\s+/g, '-')}`).attr("x", d => x1(d.key)).attr("y", y(0)).attr("width", x1.bandwidth()).attr("height", 0).attr("fill", d => color(d.key)).style("opacity", 0.9).attr("rx", 1).attr("ry", 1)
            .on("mouseover", function(event, d_mouseover) { tooltip.transition().duration(50).style("opacity", 1); const displayName = subgroupDisplayNames[d_mouseover.key] || d_mouseover.key; const digits = (d_mouseover.metric === 'AUC' || d_mouseover.metric === 'F1-Score' || d_mouseover.metric === 'BalAcc') ? 3 : 1; const isPercent = !(d_mouseover.metric === 'AUC' || d_mouseover.metric === 'F1-Score' || d_mouseover.metric === 'BalAcc'); const formattedValue = isPercent ? formatPercent(d_mouseover.value, digits) : formatNumber(d_mouseover.value, digits); tooltip.html(`<strong>${d_mouseover.metric} (${displayName}):</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1); })
            .on("mouseout", function(event, d_mouseout) { tooltip.transition().duration(TRANSITION_DURATION_SHORT_MS).style("opacity", 0); d3.select(this).style("opacity", 0.9).style("stroke", "none"); })
            .transition().duration(ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));

         if (options.legendBelow !== false && subgroups.length > 0) {
            const legendGroup = svg.append("g").attr("class", "legend bar-legend").attr("font-family", "sans-serif").attr("font-size", LEGEND_FONT_SIZE).attr("text-anchor", "start"); const legendItems = legendGroup.selectAll("g").data(subgroups).join("g").attr("class", "legend-item");
            let totalLegendWidth = 0; const legendSpacings = []; const legendItemHeight = (parseInt(LEGEND_FONT_SIZE,10) || 10) + 8; let numLegendRows = 1;
            legendItems.append("rect").attr("x", 0).attr("y", -5).attr("width", 10).attr("height", 10).attr("fill", d => color(d)); legendItems.append("text").attr("x", 14).attr("y", 0).attr("dy", "0.35em").text(d => subgroupDisplayNames[d] || d).each(function() { const itemWidth = this.getBBox().width + 25; legendSpacings.push(itemWidth); totalLegendWidth += itemWidth; });
            let legendStartX = margin.left + Math.max(0, (innerWidth - totalLegendWidth) / 2); if (totalLegendWidth > innerWidth && innerWidth > 0) { legendStartX = margin.left; numLegendRows = Math.ceil(totalLegendWidth / innerWidth); } let currentX = legendStartX; let currentYOffset = 0;
            legendItems.attr("transform", (d, i_idx) => { if (totalLegendWidth > innerWidth && currentX + legendSpacings[i_idx] > width - margin.right && i_idx > 0 && innerWidth > 0) { currentX = legendStartX; currentYOffset += legendItemHeight; } const tx = currentX; currentX += legendSpacings[i_idx]; return `translate(${tx}, ${height - margin.bottom + (options.xLabel ? 20 : 5) + currentYOffset})`; });
         }
         if(options.title) { svg.append("text").attr("class","chart-title").attr("x", width / 2).attr("y", margin.top / 2 + 5).attr("text-anchor", "middle").style("font-size", "13px").style("font-weight", "600").text(options.title); }
    }

    function renderASPerformanceChart(targetElementId, performanceData, options = {}, kollektivName = '') {
        const setupOptions = { ...options, margin: { top: (options.title || kollektivName ? 40 : 20), right: 20, bottom: (options.xLabel?50:30), left: 60, ...options.margin }, heightOriginal: options.height };
        const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip();
        const metrics = ['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC']; const cohortKey = 'overall'; const cohortPerf = performanceData ? performanceData[cohortKey] : null;
        if (!cohortPerf) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Performance-Daten nicht verfügbar.'); return; }
        const chartData = metrics.map(metric => { const keyLower = metric.toLowerCase(); let value = NaN; if (cohortPerf[keyLower + 'Val'] !== undefined && !isNaN(parseFloat(cohortPerf[keyLower + 'Val']))) value = parseFloat(cohortPerf[keyLower + 'Val']); else if (cohortPerf[metric] !== undefined && cohortPerf[metric]?.value !== undefined && !isNaN(parseFloat(cohortPerf[metric].value))) value = parseFloat(cohortPerf[metric].value); return { metric: metric, value: value }; });
        if (chartData.length === 0 || chartData.some(d => isNaN(d.value))) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Unvollständige Daten für Chart.'); return; }
        const x = d3.scaleBand().domain(metrics).range([0, innerWidth]).padding(0.3); const y = d3.scaleLinear().domain([0, 1.0]).nice().range([innerHeight, 0]);
        const tickCountY = Math.max(2,Math.min(5, Math.floor(innerHeight/40))); chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY, ".0%").tickSizeOuter(0)).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", AXIS_LABEL_FONT_SIZE).text(options.yLabel || "Diagnostische Güte (AS)");
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickSizeOuter(0)).selectAll(".tick text").style("text-anchor", "middle").style("font-size", TICK_LABEL_FONT_SIZE);
        if (ENABLE_GRIDLINES) { chartArea.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")); }
        chartArea.selectAll(".bar").data(chartData).join("rect").attr("class", "bar").attr("x", d => x(d.metric)).attr("y", y(0)).attr("width", x.bandwidth()).attr("height", 0).attr("fill", AS_COLOR).style("opacity", 0.9).attr("rx", 1).attr("ry", 1)
           .on("mouseover", function(event, d_mouseover) { tooltip.transition().duration(50).style("opacity", 1); const digits = (d_mouseover.metric === 'AUC' || d_mouseover.metric === 'F1') ? 3 : 1; const isPercent = !(d_mouseover.metric === 'AUC' || d_mouseover.metric === 'F1'); const formattedValue = isPercent ? formatPercent(d_mouseover.value, digits) : formatNumber(d_mouseover.value, digits); const metricName = TOOLTIP_CONTENT.statMetrics[d_mouseover.metric.toLowerCase()]?.name || d_mouseover.metric; tooltip.html(`<strong>${metricName}:</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1); })
           .on("mouseout", function(event, d_mouseout) { tooltip.transition().duration(TRANSITION_DURATION_SHORT_MS).style("opacity", 0); d3.select(this).style("opacity", 0.9).style("stroke", "none"); })
           .transition().duration(ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));
        const chartTitleText = options.title || `${UI_TEXTS.chartTitles.asPerformance}${kollektivName ? ' - ' + kollektivName : ''}`;
        if(chartTitleText) svg.append("text").attr("class","chart-title").attr("x", width / 2).attr("y", margin.top / 2 + 5).attr("text-anchor", "middle").style("font-size", "13px").style("font-weight", "600").text(chartTitleText);
    }

    function renderROCCurve(rocDataSets, targetElementId, options = {}) {
        const setupOptions = { ...options, margin: { top: (options.title ? 40 : 25), right: 20, bottom: (options.xLabel ? 50 : 30) + ((options.legendBelow !== false && (rocDataSets?.length || 0) > 0) ? (Math.ceil((rocDataSets?.length || 0) / Math.max(1, Math.floor((options.width || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH)/(options.legendItemAvgWidth || 150)))) * 20) : 0), left: 60, ...options.margin }, heightOriginal: options.height };
        const containerSetup = createSvgContainer(targetElementId, setupOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, legendSpaceY } = containerSetup; const tooltip = createTooltip();
        if (!Array.isArray(rocDataSets) || rocDataSets.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Keine ROC-Daten verfügbar.'); return; }

        const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]); const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
        const tickCount = Math.max(2,Math.min(5, Math.floor(Math.min(innerWidth, innerHeight)/50)));
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(tickCount).tickSizeOuter(0).tickFormat(d3.format(".1f"))).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        if (options.xLabel) { svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - margin.bottom + 35 - (options.legendBelow !== false ? 0 : legendSpaceY)).style("font-size", AXIS_LABEL_FONT_SIZE).text(options.xLabel); }
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(yScale).ticks(tickCount).tickSizeOuter(0).tickFormat(d3.format(".1f"))).selectAll("text").style("font-size", TICK_LABEL_FONT_SIZE);
        if (options.yLabel) { svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", AXIS_LABEL_FONT_SIZE).text(options.yLabel); }
        if (ENABLE_GRIDLINES) { chartArea.append("g").attr("class", "grid").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(tickCount).tickSize(-innerHeight).tickFormat("")); chartArea.append("g").attr("class", "grid").call(d3.axisLeft(yScale).ticks(tickCount).tickSize(-innerWidth).tickFormat("")); }
        chartArea.append("line").attr("class", "reference-line").attr("x1", 0).attr("y1", innerHeight).attr("x2", innerWidth).attr("y2", 0).style("stroke-dasharray", "3 3");

        const rocLine = d3.line().x(d => xScale(d.fpr)).y(d => yScale(d.tpr)).curve(d3.curveLinear);

        rocDataSets.forEach((dataSet, index) => {
            let validRocData = Array.isArray(dataSet.data) ? dataSet.data.filter(d => d && typeof d.fpr === 'number' && typeof d.tpr === 'number' && isFinite(d.fpr) && isFinite(d.tpr)) : [];
            if (validRocData.length === 0) validRocData = [{fpr:0, tpr:0}, {fpr:1, tpr:1}]; // Ensure a line can be drawn
            if (validRocData[0]?.fpr !== 0 || validRocData[0]?.tpr !== 0) { validRocData.unshift({ fpr: 0, tpr: 0, threshold: Infinity }); } if (validRocData[validRocData.length - 1]?.fpr !== 1 || validRocData[validRocData.length - 1]?.tpr !== 1) { validRocData.push({ fpr: 1, tpr: 1, threshold: -Infinity }); }
            if (validRocData.length < 2) return;

            const lineColor = dataSet.color || DEFAULT_COLOR_SCHEME[index % DEFAULT_COLOR_SCHEME.length];
            const path = chartArea.append("path").datum(validRocData).attr("class", "roc-curve").attr("fill", "none").attr("stroke", lineColor).attr("stroke-width", LINE_STROKE_WIDTH).attr("d", rocLine);
            const totalLength = path.node()?.getTotalLength(); if(totalLength) { path.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().duration(ANIMATION_DURATION_MS * 1.5).ease(d3.easeLinear).attr("stroke-dashoffset", 0); }
            if (options.showPoints !== false) { chartArea.selectAll(`.roc-point.series-${index}`).data(validRocData.filter((d, i_idx) => i_idx > 0 && i_idx < validRocData.length - 1 && d.threshold !== undefined)).join("circle").attr("class", `roc-point series-${index}`).attr("cx", d => xScale(d.fpr)).attr("cy", d => yScale(d.tpr)).attr("r", POINT_RADIUS / 1.5).attr("fill", lineColor).style("opacity", 0)
                .on("mouseover", function(event, d_mouseover) { tooltip.transition().duration(50).style("opacity", 1); const threshText = (d_mouseover.threshold && isFinite(d_mouseover.threshold)) ? `<br>Threshold: ${formatNumber(d_mouseover.threshold, 2)}` : ''; tooltip.html(`FPR: ${formatNumber(d_mouseover.fpr, 2)}<br>TPR: ${formatNumber(d_mouseover.tpr, 2)}${threshText}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).attr("r", POINT_RADIUS); })
                .on("mouseout", function(event, d_mouseout) { tooltip.transition().duration(TRANSITION_DURATION_SHORT_MS).style("opacity", 0); d3.select(this).attr("r", POINT_RADIUS / 1.5); })
                .transition().delay(ANIMATION_DURATION_MS * 1.5).duration(ANIMATION_DURATION_MS / 2).style("opacity", 0.7); }
        });
        if (options.legendBelow !== false && rocDataSets.length > 0 && legendSpaceY > 0) {
            const legendGroup = svg.append("g").attr("class", "legend roc-legend").attr("font-family", "sans-serif").attr("font-size", LEGEND_FONT_SIZE).attr("text-anchor", "start");
            let currentX = margin.left; let currentY = margin.top + innerHeight + 25; const legendItemHeight = (parseInt(LEGEND_FONT_SIZE,10) || 10) + 8; const legendMaxWidth = width - margin.left - margin.right;

            rocDataSets.forEach((dataSet, index) => {
                if(!dataSet.name) return;
                const legendItem = legendGroup.append("g").attr("class", "legend-item");
                const lineColor = dataSet.color || DEFAULT_COLOR_SCHEME[index % DEFAULT_COLOR_SCHEME.length];
                legendItem.append("line").attr("x1", 0).attr("x2", 15).attr("y1", 5).attr("y2", 5).attr("stroke", lineColor).attr("stroke-width", LINE_STROKE_WIDTH + 1);
                const aucText = (dataSet.auc && dataSet.auc.value !== undefined && !isNaN(dataSet.auc.value)) ? ` (AUC: ${formatCI(dataSet.auc.value, dataSet.auc.ci?.lower, dataSet.auc.ci?.upper, 3, false, '--')})` : '';
                const textElement = legendItem.append("text").attr("x", 20).attr("y", 5).attr("dy", "0.35em").text(`${dataSet.name}${aucText}`);
                const itemWidth = legendItem.node()?.getBBox()?.width + 10 || 0;
                if (index > 0 && currentX + itemWidth > legendMaxWidth && legendMaxWidth > 0 ) { currentX = margin.left; currentY += legendItemHeight; }
                legendItem.attr("transform", `translate(${currentX}, ${currentY})`);
                currentX += itemWidth;
            });
        }
        if(options.title) { svg.append("text").attr("class","chart-title").attr("x", width / 2).attr("y", margin.top / 2 + 5).attr("text-anchor", "middle").style("font-size", "13px").style("font-weight", "600").text(options.title); }
    }

    return Object.freeze({
        renderAgeDistributionChart,
        renderPieChart,
        renderComparisonBarChart,
        renderASPerformanceChart,
        renderROCCurve
    });

})();