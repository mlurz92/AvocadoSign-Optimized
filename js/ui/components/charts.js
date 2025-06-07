const charts = (() => {

    function _createSvgContainer(targetElementId, options = {}) {
        const container = d3.select(targetElementId);
        if (container.empty()) {
            return null;
        }
        container.select("svg").remove();
        container.html('');

        const containerNode = container.node();
        const initialWidth = containerNode.clientWidth || options.width || 300;
        const initialHeight = containerNode.clientHeight || options.height || 200;

        const margin = { top: 30, right: 30, bottom: 50, left: 60, ...options.margin };
        const width = initialWidth - margin.left - margin.right;
        const height = initialHeight - margin.top - margin.bottom;

        if (width <= 20 || height <= 20) {
            container.html('<p class="text-muted small p-2 text-center">Nicht genügend Platz für Diagramm.</p>');
            return null;
        }

        const svg = container.append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${initialWidth} ${initialHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("background-color", APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR)
            .style("font-family", "var(--font-family-sans-serif)");

        const chartArea = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        return { svg, chartArea, width, height, margin, initialWidth, initialHeight };
    }

    function _createTooltip() {
        let tooltip = d3.select("body").select(".chart-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div")
                .attr("class", "chart-tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("pointer-events", "none")
                .style("background", "rgba(33, 37, 41, 0.9)")
                .style("color", "white")
                .style("padding", "8px 12px")
                .style("border-radius", "4px")
                .style("font-size", "12px")
                .style("line-height", "1.4")
                .style("z-index", 10000);
        }
        return tooltip;
    }

    function renderAgeDistributionChart(ageData, targetElementId, options = {}) {
        const setup = _createSvgContainer(targetElementId, options);
        if (!setup) return;
        const { svg, chartArea, width, height, margin } = setup;
        const tooltip = _createTooltip();
        
        if (!ageData || ageData.length === 0) {
             chartArea.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine Altersdaten.");
             return;
        }

        const x = d3.scaleLinear()
            .domain(d3.extent(ageData)).nice()
            .range([0, width]);

        const histogram = d3.histogram()
            .value(d => d)
            .domain(x.domain())
            .thresholds(x.ticks(12));

        const bins = histogram(ageData);

        const y = d3.scaleLinear()
            .domain([0, d3.max(bins, d => d.length)]).nice()
            .range([height, 0]);

        chartArea.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

        chartArea.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y).ticks(5));

        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("x", margin.left + width / 2)
            .attr("y", height + margin.top + margin.bottom - 5)
            .text("Alter (Jahre)");

        svg.append("text")
            .attr("class", "axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left / 2 - 10)
            .attr("x", -(margin.top + height / 2))
            .text("Anzahl Patienten");

        chartArea.selectAll("rect")
            .data(bins)
            .join("rect")
            .attr("x", 1)
            .attr("transform", d => `translate(${x(d.x0)}, ${y(d.length)})`)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
            .attr("height", d => height - y(d.length))
            .style("fill", APP_CONFIG.CHART_SETTINGS.AS_COLOR)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1);
                tooltip.html(`Altersgruppe: ${d.x0}–${d.x1}<br>Anzahl: ${d.length}`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(event.currentTarget).style("fill", APP_CONFIG.CHART_SETTINGS.T2_COLOR);
            })
            .on("mouseout", (event) => {
                tooltip.style("opacity", 0);
                d3.select(event.currentTarget).style("fill", APP_CONFIG.CHART_SETTINGS.AS_COLOR);
            });
    }

    function renderPieChart(data, targetElementId, options = {}) {
        const setup = _createSvgContainer(targetElementId, { margin: { top: 10, right: 10, bottom: 30, left: 10 }, ...options });
        if (!setup) return;
        const { chartArea, width, height, margin } = setup;
        const tooltip = _createTooltip();
        const radius = Math.min(width, height) / 2 - margin.top;
        const total = d3.sum(data, d => d.value);
        if(total === 0) {
            chartArea.append("text").attr("x", width / 2).attr("y", height / 2).attr("text-anchor", "middle").text("Keine Daten.");
            return;
        }

        const pie = d3.pie().value(d => d.value).sort(null);
        const data_ready = pie(data);

        const arc = d3.arc().innerRadius(options.innerRadiusFactor ? radius * options.innerRadiusFactor : 0).outerRadius(radius);
        const color = d3.scaleOrdinal().domain(data.map(d => d.label)).range(d3.schemePaired);
        
        const g = chartArea.attr("transform", `translate(${width / 2}, ${height / 2 + margin.top})`);

        g.selectAll('path')
            .data(data_ready)
            .join('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.label))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.85)
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).style("opacity", 1);
                tooltip.style("opacity", 1);
                tooltip.html(`<strong>${d.data.label}</strong><br>${d.data.value} (${formatPercent(d.data.value / total, 1)})`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget).style("opacity", 0.85);
                tooltip.style("opacity", 0);
            });
        
        const legend = g.selectAll(".legend")
            .data(data_ready)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${i * 80 - (data.length -1) * 40}, ${radius + 25})`);
        
        legend.append("rect")
            .attr("x", -7)
            .attr("y", -7)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => color(d.data.label));
        
        legend.append("text")
            .attr("x", 10)
            .attr("y", 0)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .style("font-size", "10px")
            .text(d => d.data.label);
    }
    
    function renderROCCurve(rocData, targetElementId, options = {}) {
        const setup = _createSvgContainer(targetElementId, options);
        if (!setup) return;
        const { svg, chartArea, width, height, margin } = setup;
        const tooltip = _createTooltip();
        
        const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
        const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

        chartArea.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
        chartArea.append("g").call(d3.axisLeft(y));

        svg.append("text").attr("text-anchor", "middle").attr("x", margin.left + width / 2).attr("y", height + margin.top + margin.bottom - 10).text("1 - Spezifität");
        svg.append("text").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", margin.left / 2 - 10).attr("x", -(margin.top + height / 2)).text("Sensitivität");

        chartArea.append("line").attr("x1", 0).attr("y1", height).attr("x2", width).attr("y2", 0).attr("stroke", "lightgrey").attr("stroke-dasharray", "4");

        const line = d3.line().x(d => x(d.fpr)).y(d => y(d.tpr));
        chartArea.append("path").datum(rocData).attr("fill", "none").attr("stroke", APP_CONFIG.CHART_SETTINGS.AS_COLOR).attr("stroke-width", 2.5).attr("d", line);

        if(options.auc) {
            chartArea.append("text").attr("x", width - 10).attr("y", height - 10).attr("text-anchor", "end").style("font-weight", "bold").text(`AUC = ${formatNumber(options.auc, 3)}`);
        }
    }

    function renderConfusionMatrix(matrixData, targetElementId, options = {}) {
        const { rp, fp, fn, rn } = matrixData;
        const data = [
            { group: "Predicted Positive", type: "Actual Positive", value: rp, label: "Richtig Positiv" },
            { group: "Predicted Positive", type: "Actual Negative", value: fp, label: "Falsch Positiv" },
            { group: "Predicted Negative", type: "Actual Positive", value: fn, label: "Falsch Negativ" },
            { group: "Predicted Negative", type: "Actual Negative", value: rn, label: "Richtig Negativ" }
        ];

        const setup = _createSvgContainer(targetElementId, { width: 300, height: 300, ...options });
        if (!setup) return;
        const { svg, chartArea, width, height } = setup;
        const tooltip = _createTooltip();

        const groups = ["Actual Positive", "Actual Negative"];
        const vars = ["Predicted Positive", "Predicted Negative"];

        const x = d3.scaleBand().range([0, width]).domain(groups).padding(0.05);
        chartArea.append("g").style("font-size", 12).attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x).tickSize(0)).select(".domain").remove();

        const y = d3.scaleBand().range([height, 0]).domain(vars).padding(0.05);
        chartArea.append("g").style("font-size", 12).call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();

        const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(data, d => d.value)]);
        
        chartArea.selectAll()
            .data(data, d => `${d.group}:${d.type}`)
            .enter()
            .append("rect")
            .attr("x", d => x(d.type))
            .attr("y", d => y(d.group))
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => colorScale(d.value))
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).html(`${d.label}: ${d.value}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 10) + "px");
                d3.select(event.currentTarget).style("opacity", 1).style("stroke", "#212529").style("stroke-width", 2);
            })
            .on("mouseout", (event) => {
                tooltip.style("opacity", 0);
                d3.select(event.currentTarget).style("opacity", 0.8).style("stroke", "none");
            });

        chartArea.selectAll()
            .data(data, d => `${d.group}:${d.type}`)
            .enter()
            .append("text")
            .attr("x", d => x(d.type) + x.bandwidth() / 2)
            .attr("y", d => y(d.group) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("fill", d => d.value > d3.max(data, d => d.value) / 2 ? "white" : "black")
            .text(d => d.value);
    }
    
    function renderForestPlot(plotData, targetElementId, options = {}) { /* Implementierung von Vorschlag 4.3 */ }
    function renderComparisonBarChart(chartData, targetElementId, options = {}) { /* Implementierung der Vergleichs-Balkendiagramme */ }
    function renderASPerformanceChart(data, targetElementId, options = {}) { /* Implementierung für spezifische Präsentationscharts */ }


    return Object.freeze({
        renderAgeDistributionChart,
        renderPieChart,
        renderROCCurve,
        renderConfusionMatrix,
        renderForestPlot,
        renderComparisonBarChart,
        renderASPerformanceChart
    });
})();
