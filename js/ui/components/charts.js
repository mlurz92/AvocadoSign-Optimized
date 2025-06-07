const charts = (() => {

    function _createSvgContainer(targetElementId, options = {}) {
        const container = d3.select(targetElementId);
        if (container.empty() || !container.node()) {
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
        const setup = _createSvgContainer(targetElementId, { margin: { top: 10, right: 10, bottom: 40, left: 10 }, ...options });
        if (!setup) return;
        const { svg, chartArea, width, height, margin } = setup;
        const tooltip = _createTooltip();
        const radius = Math.min(width, height) / 2;
        const total = d3.sum(data, d => d.value);
        if(total === 0) {
            chartArea.attr("transform", `translate(${width/2},${height/2})`).append("text").attr("text-anchor", "middle").text("Keine Daten.");
            return;
        }

        const pie = d3.pie().value(d => d.value).sort(null);
        const data_ready = pie(data);

        const arc = d3.arc().innerRadius(options.innerRadiusFactor ? radius * options.innerRadiusFactor : 0).outerRadius(radius * 0.8);
        const outerArc = d3.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);
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
            .attr("transform", (d, i) => `translate(${(i % 2 === 0 ? -1 : 0.5) * (width/3)}, ${i > 1 ? radius + 25 : radius + 10})`);
        
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
            .text(d => `${d.data.label} (${d.data.value})`);
    }

    function renderROCCurve(rocData, targetElementId, options = {}) {
        const setup = _createSvgContainer(targetElementId, options);
        if (!setup) return;
        const { svg, chartArea, width, height, margin } = setup;
        const tooltip = _createTooltip();
        
        const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
        const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

        chartArea.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(5));
        chartArea.append("g").attr("class", "y-axis").call(d3.axisLeft(y).ticks(5));

        svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("x", margin.left + width / 2).attr("y", height + margin.top + margin.bottom - 5).text("1 - Spezifität");
        svg.append("text").attr("class", "axis-label").attr("text-anchor", "middle").attr("transform", "rotate(-90)").attr("y", margin.left / 2 - 15).attr("x", -(margin.top + height / 2)).text("Sensitivität");

        chartArea.append("line").attr("x1", 0).attr("y1", height).attr("x2", width).attr("y2", 0).attr("stroke", "lightgrey").attr("stroke-dasharray", "4");

        const line = d3.line().x(d => x(d.fpr)).y(d => y(d.tpr));
        const path = chartArea.append("path")
            .datum(rocData)
            .attr("fill", "none")
            .attr("stroke", options.color || APP_CONFIG.CHART_SETTINGS.AS_COLOR)
            .attr("stroke-width", 2.5)
            .attr("d", line);
            
        const totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition().duration(1500).ease(d3.easeLinear).attr("stroke-dashoffset", 0);

        chartArea.selectAll("dot")
            .data(rocData)
            .enter().append("circle")
            .attr("cx", d => x(d.fpr))
            .attr("cy", d => y(d.tpr))
            .attr("r", 3)
            .attr("fill", options.color || APP_CONFIG.CHART_SETTINGS.AS_COLOR)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1);
                tooltip.html(`Threshold: ${formatNumber(d.threshold,2)}<br>Sens: ${formatPercent(d.tpr,1)}<br>1-Spez: ${formatPercent(d.fpr,1)}`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        if(options.auc) {
            chartArea.append("text").attr("x", width - 10).attr("y", height - 10).attr("text-anchor", "end").style("font-weight", "bold").text(`AUC = ${formatNumber(options.auc, 3)}`);
        }
    }

    function renderConfusionMatrix(matrixData, targetElementId, options = {}) {
        const { rp, fp, fn, rn } = matrixData;
        const data = [
            { group: "Prädiktion Positiv", type: "Tatsächlich Positiv", value: rp, label: "Richtig Positiv" },
            { group: "Prädiktion Positiv", type: "Tatsächlich Negativ", value: fp, label: "Falsch Positiv" },
            { group: "Prädiktion Negativ", type: "Tatsächlich Positiv", value: fn, label: "Falsch Negativ" },
            { group: "Prädiktion Negativ", type: "Tatsächlich Negativ", value: rn, label: "Richtig Negativ" }
        ];

        const setup = _createSvgContainer(targetElementId, { width: 350, height: 250, ...options });
        if (!setup) return;
        const { chartArea, width, height } = setup;
        const tooltip = _createTooltip();

        const groups = ["Tatsächlich Positiv", "Tatsächlich Negativ"];
        const vars = ["Prädiktion Positiv", "Prädiktion Negativ"];

        const x = d3.scaleBand().range([0, width]).domain(groups).padding(0.05);
        chartArea.append("g").style("font-size", 11).attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x).tickSize(0)).select(".domain").remove();

        const y = d3.scaleBand().range([0, height]).domain(vars).padding(0.05);
        chartArea.append("g").style("font-size", 11).call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();

        const colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, d3.max(data, d => d.value)]);
        
        chartArea.selectAll()
            .data(data, d => `${d.group}:${d.type}`)
            .join("rect")
            .attr("x", d => x(d.type))
            .attr("y", d => y(d.group))
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => colorScale(d.value))
            .style("stroke-width", 2)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1).html(`${d.label}: ${d.value}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 10) + "px");
                d3.select(event.currentTarget).style("opacity", 1).style("stroke", "#212529");
            })
            .on("mouseout", (event) => {
                tooltip.style("opacity", 0);
                d3.select(event.currentTarget).style("opacity", 0.8).style("stroke", "none");
            });

        chartArea.selectAll()
            .data(data, d => `${d.group}:${d.type}`)
            .join("text")
            .attr("x", d => x(d.type) + x.bandwidth() / 2)
            .attr("y", d => y(d.group) + y.bandwidth() / 2)
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("fill", d => d.value > d3.max(data, d => d.value) / 1.5 ? "white" : "black")
            .text(d => d.value);
    }
    
    function renderForestPlot(plotData, targetElementId, options = {}) {
        const setup = _createSvgContainer(targetElementId, options);
        if (!setup) return;
        const { svg, chartArea, width, height, margin } = setup;
        const tooltip = _createTooltip();
        
        const y = d3.scaleBand()
            .range([0, height])
            .domain(plotData.map(d => d.name))
            .padding(0.4);
            
        chartArea.append("g").call(d3.axisLeft(y));

        const x = d3.scaleLinear()
            .domain([0, d3.max(plotData, d => d.ci_upper) * 1.1])
            .range([0, width]);

        chartArea.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));
            
        chartArea.append("line")
            .attr("x1", x(1))
            .attr("x2", x(1))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "red")
            .attr("stroke-dasharray", "4");

        chartArea.selectAll("lines")
            .data(plotData)
            .enter()
            .append("line")
            .attr("x1", d => x(d.ci_lower))
            .attr("x2", d => x(d.ci_upper))
            .attr("y1", d => y(d.name) + y.bandwidth() / 2)
            .attr("y2", d => y(d.name) + y.bandwidth() / 2)
            .attr("stroke", "black")
            .attr("stroke-width", "1px");

        chartArea.selectAll("dots")
            .data(plotData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.value) - 4)
            .attr("y", d => y(d.name) + y.bandwidth() / 2 - 4)
            .attr("width", 8)
            .attr("height", 8)
            .style("fill", APP_CONFIG.CHART_SETTINGS.T2_COLOR)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1);
                tooltip.html(`${d.name}<br>Wert: ${formatNumber(d.value,2)}<br>95% CI: [${formatNumber(d.ci_lower,2)}, ${formatNumber(d.ci_upper,2)}]`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    }

    function renderComparisonBarChart(chartData, targetElementId, options = {}) {
        const setup = _createSvgContainer(targetElementId, options);
        if (!setup) return;
        const { svg, chartArea, width, height, margin } = setup;
        const tooltip = _createTooltip();
        const subgroups = ["AS", "T2"];
        const groups = chartData.map(d => d.metric);
        
        const x0 = d3.scaleBand().domain(groups).range([0, width]).padding(0.2);
        const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.05);
        const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        const color = d3.scaleOrdinal().domain(subgroups).range([APP_CONFIG.CHART_SETTINGS.AS_COLOR, APP_CONFIG.CHART_SETTINGS.T2_COLOR]);

        chartArea.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x0).tickSize(0));
        chartArea.append("g").call(d3.axisLeft(y).ticks(5, "%"));

        const slice = chartArea.selectAll(".slice")
            .data(chartData)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", d => `translate(${x0(d.metric)},0)`);

        slice.selectAll("rect")
            .data(d => subgroups.map(key => ({ key, value: d[key], metric: d.metric })))
            .enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.key))
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1);
                tooltip.html(`${d.key} - ${d.metric}: ${formatPercent(d.value,1)}`)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    }

    function renderASPerformanceChart(data, targetElementId, options = {}) {
        const setup = _createSvgContainer(targetElementId, options);
        if(!setup) return;
        const { chartArea, width, height } = setup;
        const tooltip = _createTooltip();

        const metrics = Object.keys(data.overall);
        const values = Object.values(data.overall);

        const x = d3.scaleBand().range([0, width]).domain(metrics).padding(0.2);
        chartArea.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));

        const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        chartArea.append("g").call(d3.axisLeft(y).ticks(5, "%"));

        chartArea.selectAll("mybar")
            .data(data.overall)
            .enter()
            .append("rect")
            .attr("x", (d,i) => x(metrics[i]))
            .attr("y", d => y(d))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d))
            .attr("fill", APP_CONFIG.CHART_SETTINGS.AS_COLOR);
    }


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
