const chartRenderer = (() => {

    function _createSvgContainer(targetElementId, options = {}) {
        const container = d3.select(`#${targetElementId}`);
        if (container.empty() || !container.node()) return null;
        container.selectAll("svg").remove();
        container.html('');

        const containerNode = container.node();
        const initialWidth = containerNode.clientWidth;
        const margin = { ...APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options.margin };
        const width = options.width || initialWidth || APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const height = options.height || APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        if (innerWidth <= 0 || innerHeight <= 0) {
            container.html('<p class="text-muted small text-center p-2">Diagrammgröße ungültig.</p>');
            return null;
        }

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")
            .style("height", "100%")
            .style("max-width", `${width}px`)
            .style("background-color", APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR)
            .style("font-family", "inherit");

        const chartArea = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
        return { svg, chartArea, width, height, innerWidth, innerHeight, margin };
    }

    function _createTooltip() {
        let tooltip = d3.select("body").select(".chart-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div")
                .attr("class", "chart-tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("pointer-events", "none")
                .style("background", "rgba(33, 37, 41, 0.95)")
                .style("color", "#fff")
                .style("padding", "6px 10px")
                .style("border-radius", "4px")
                .style("font-size", APP_CONFIG.CHART_SETTINGS.TOOLTIP_FONT_SIZE)
                .style("z-index", "3050")
                .style("line-height", "1.4")
                .style("transition", `opacity 150ms ease-out`);
        }
        return tooltip;
    }

    function renderAgeDistributionChart(ageData, targetElementId, options = {}) {
        const containerSetup = _createSvgContainer(targetElementId, options);
        if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup;
        const tooltip = _createTooltip();
        const barColor = APP_CONFIG.CHART_SETTINGS.AS_COLOR;

        if (!Array.isArray(ageData) || ageData.length === 0) {
            chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Keine Altersdaten verfügbar.');
            return;
        }
        const x = d3.scaleLinear().domain(d3.extent(ageData)).nice().range([0, innerWidth]);
        const histogram = d3.histogram().value(d => d).domain(x.domain()).thresholds(x.ticks(Math.max(5, Math.floor(innerWidth / 30))));
        const bins = histogram(ageData.filter(d => !isNaN(d)));
        const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).nice().range([innerHeight, 0]);

        chartArea.append("g").attr("class", "x-axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickSizeOuter(0));
        chartArea.append("g").attr("class", "y-axis").call(d3.axisLeft(y).ticks(5).tickSizeOuter(0));
        svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - margin.bottom / 2 + 15).text(UI_TEXTS.axisLabels.age);
        svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).text(UI_TEXTS.axisLabels.patientCount);

        chartArea.selectAll(".bar").data(bins).enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.x0) + 1)
            .attr("y", innerHeight)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("height", 0)
            .attr("fill", barColor)
            .on("mouseover", (event, d) => {
                tooltip.transition().style("opacity", .95);
                tooltip.html(`Alter: ${d.x0}-${d.x1}<br>Anzahl: ${d.length}`)
                    .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
                d3.select(event.currentTarget).attr("fill", APP_CONFIG.CHART_SETTINGS.T2_COLOR);
            })
            .on("mouseout", (event) => {
                tooltip.transition().style("opacity", 0);
                d3.select(event.currentTarget).attr("fill", barColor);
            })
            .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS).ease(d3.easeCubicOut)
            .attr("y", d => y(d.length))
            .attr("height", d => innerHeight - y(d.length));
    }
    
    function renderPieChart(data, targetElementId, options = {}) {
        const containerSetup = _createSvgContainer(targetElementId, options);
        if (!containerSetup) return;
        const { chartArea, innerWidth, innerHeight } = containerSetup;
        const tooltip = _createTooltip();
        const validData = (data || []).filter(d => d && typeof d.value === 'number' && d.value >= 0);
        if (validData.length === 0) {
            chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').text('Keine Daten.');
            return;
        }

        const radius = Math.min(innerWidth, innerHeight) / 2;
        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const color = d3.scaleOrdinal(APP_CONFIG.CHART_SETTINGS.AS_COLOR, APP_CONFIG.CHART_SETTINGS.T2_COLOR, d3.schemeSet3);

        const g = chartArea.append("g").attr("transform", `translate(${innerWidth / 2}, ${innerHeight / 2})`);
        g.selectAll("path").data(pie(validData)).enter().append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i))
            .on("mouseover", (event, d) => {
                tooltip.transition().style("opacity", .95);
                tooltip.html(`${d.data.label}: ${d.data.value}`)
                    .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
                d3.select(event.currentTarget).style("opacity", 0.8);
            })
            .on("mouseout", (event) => {
                tooltip.transition().style("opacity", 0);
                d3.select(event.currentTarget).style("opacity", 1);
            })
            .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS)
            .attrTween("d", d => {
                const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return t => arc(i(t));
            });
    }

    function renderComparisonBarChart(chartData, targetElementId, options = {}, t2Label = 'T2') {
        const containerSetup = _createSvgContainer(targetElementId, options);
        if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, margin } = containerSetup;
        const tooltip = _createTooltip();

        if (!Array.isArray(chartData) || chartData.length === 0) {
             chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').text('Keine Vergleichsdaten.');
             return;
        }

        const groups = chartData.map(d => d.metric);
        const subgroups = ['AS', 'T2'];
        const x0 = d3.scaleBand().domain(groups).range([0, innerWidth]).padding(0.2);
        const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.05);
        const y = d3.scaleLinear().domain([0, 1]).nice().range([innerHeight, 0]);
        const color = d3.scaleOrdinal().domain(subgroups).range([APP_CONFIG.CHART_SETTINGS.AS_COLOR, APP_CONFIG.CHART_SETTINGS.T2_COLOR]);

        chartArea.append("g").attr("class", "x-axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x0).tickSizeOuter(0));
        chartArea.append("g").attr("class", "y-axis").call(d3.axisLeft(y).ticks(5, "%"));

        const slice = chartArea.selectAll(".slice").data(chartData).enter().append("g")
            .attr("transform", d => `translate(${x0(d.metric)},0)`);

        slice.selectAll("rect").data(d => subgroups.map(key => ({key: key, value: d[key]}))).enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", innerHeight)
            .attr("width", x1.bandwidth())
            .attr("height", 0)
            .attr("fill", d => color(d.key))
            .on("mouseover", (event, d) => {
                tooltip.transition().style("opacity", .95);
                tooltip.html(`${d.key === 'AS' ? UI_TEXTS.legendLabels.avocadoSign : t2Label}: ${utils.formatPercent(d.value)}`)
                    .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
                d3.select(event.currentTarget).style("opacity", 0.8);
            })
            .on("mouseout", (event) => {
                tooltip.transition().style("opacity", 0);
                d3.select(event.currentTarget).style("opacity", 1);
            })
            .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS).ease(d3.easeCubicOut)
            .attr("y", d => y(d.value))
            .attr("height", d => innerHeight - y(d.value));
    }
    
    function renderROCCurve(rocData, targetElementId, options = {}) {
        const containerSetup = _createSvgContainer(targetElementId, options);
        if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, margin } = containerSetup;
        if (!Array.isArray(rocData) || rocData.length < 2) {
             chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').text('Nicht genügend Daten für ROC.');
             return;
        }

        const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
        const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

        chartArea.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale));
        chartArea.append("g").call(d3.axisLeft(yScale));
        svg.append("text").attr("class", "axis-label").attr("x", margin.left + innerWidth / 2).attr("y", innerHeight + margin.top + 40).text(UI_TEXTS.axisLabels.oneMinusSpecificity);
        svg.append("text").attr("class", "axis-label").attr("transform", "rotate(-90)").attr("y", margin.left / 2 - 20).attr("x", -(margin.top + innerHeight / 2)).text(UI_TEXTS.axisLabels.sensitivity);

        chartArea.append("path").datum(rocData).attr("fill", "none")
            .attr("stroke", APP_CONFIG.CHART_SETTINGS.AS_COLOR)
            .attr("stroke-width", APP_CONFIG.CHART_SETTINGS.LINE_STROKE_WIDTH)
            .attr("d", d3.line().x(d => xScale(d.fpr)).y(d => yScale(d.tpr)));
            
        chartArea.append("line").attr("x1", 0).attr("y1", innerHeight).attr("x2", innerWidth).attr("y2", 0).attr("stroke", "grey").attr("stroke-dasharray", "4");
    }

    return Object.freeze({
        renderAgeDistributionChart,
        renderPieChart,
        renderComparisonBarChart,
        renderROCCurve
    });

})();
