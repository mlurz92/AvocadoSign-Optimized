const chartRenderer = (() => {

    const C = APP_CONFIG.CHART_SETTINGS;

    function _createBaseSvg(containerId, config) {
        d3.select(`#${containerId}`).html('');
        const svg = d3.select(`#${containerId}`)
            .append("svg")
            .attr("width", config.width + config.margin.left + config.margin.right)
            .attr("height", config.height + config.margin.top + config.margin.bottom)
            .append("g")
            .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
        return svg;
    }

    function _createTooltip(containerId) {
        let tooltip = d3.select(`#${containerId}-tooltip`);
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div")
                .attr("id", `${containerId}-tooltip`)
                .attr("class", "chart-tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("pointer-events", "none");
        }
        return tooltip;
    }

    function renderBarChart(containerId, data, options = {}) {
        const config = {
            width: options.width || C.DEFAULT_WIDTH,
            height: options.height || C.DEFAULT_HEIGHT,
            margin: options.margin || C.COMPACT_PIE_MARGIN,
            xAxisLabel: options.xAxisLabel || '',
            yAxisLabel: options.yAxisLabel || '',
            barColor: options.barColor || C.AS_COLOR
        };
        const svg = _createBaseSvg(containerId, config);
        const tooltip = _createTooltip(containerId);

        if (!data || data.length === 0) {
            svg.append("text")
                .attr("x", config.width / 2)
                .attr("y", config.height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", C.ICON_COLOR_INACTIVE)
                .text("Keine Daten");
            return;
        }

        const x = d3.scaleBand()
            .range([0, config.width])
            .domain(data.map(d => d.label))
            .padding(0.3);

        svg.append("g")
            .attr("transform", `translate(0,${config.height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-5,0)rotate(-30)")
            .style("text-anchor", "end")
            .style("font-size", C.TICK_LABEL_FONT_SIZE);
        
        if (config.xAxisLabel) {
            svg.append("text")
                .attr("x", config.width / 2)
                .attr("y", config.height + config.margin.bottom - 10)
                .style("text-anchor", "middle")
                .style("font-size", C.AXIS_LABEL_FONT_SIZE)
                .text(config.xAxisLabel);
        }

        const yMax = d3.max(data, d => d.value);
        const y = d3.scaleLinear()
            .domain([0, yMax > 0 ? yMax * 1.1 : 10])
            .range([config.height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0f")))
            .selectAll("text")
            .style("font-size", C.TICK_LABEL_FONT_SIZE);

        if (config.yAxisLabel) {
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - config.margin.left + 10)
                .attr("x", 0 - (config.height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", C.AXIS_LABEL_FONT_SIZE)
                .text(config.yAxisLabel);
        }
            
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label))
            .attr("width", x.bandwidth())
            .attr("y", d => y(0))
            .attr("height", 0)
            .attr("fill", (d, i) => C.COLOR_SCHEMES.default[i % C.COLOR_SCHEMES.default.length])
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                       .html(`<strong>${d.label}</strong><br>${options.yAxisLabel || 'Wert'}: ${utils.formatNumber(d.value, 0)}`)
                       .style("left", (event.pageX + 15) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0))
            .transition()
            .duration(C.ANIMATION_DURATION_MS)
            .attr("y", d => y(d.value))
            .attr("height", d => config.height - y(d.value));
    }

    function renderPerformanceComparisonChart(containerId, data, labels, options = {}) {
        const config = {
            width: options.width || C.DEFAULT_WIDTH * 1.2,
            height: options.height || C.DEFAULT_HEIGHT,
            margin: options.margin || { top: 30, right: 30, bottom: 50, left: 120 },
            yAxisLabel: options.yAxisLabel || 'Wert'
        };
        const svg = _createBaseSvg(containerId, config);
        const tooltip = _createTooltip(containerId);

        if (!data || data.length === 0) {
            svg.append("text")
                .attr("x", config.width / 2)
                .attr("y", config.height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", C.ICON_COLOR_INACTIVE)
                .text("Keine Daten für Vergleich");
            return;
        }

        const groups = data.map(d => d.metric);
        const subgroups = [labels.method1, labels.method2];

        const x = d3.scaleBand()
            .domain(groups)
            .range([0, config.width])
            .padding(0.2);

        svg.append("g")
            .attr("transform", `translate(0, ${config.height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .style("font-size", C.TICK_LABEL_FONT_SIZE);

        const y = d3.scaleLinear()
            .domain([0, 1])
            .range([config.height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")))
            .selectAll("text")
            .style("font-size", C.TICK_LABEL_FONT_SIZE);
        
        if (config.yAxisLabel) {
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - config.margin.left + 10)
                .attr("x", 0 - (config.height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", C.AXIS_LABEL_FONT_SIZE)
                .text(config.yAxisLabel);
        }

        const xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding(0.05);

        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range([C.AS_COLOR, C.T2_COLOR]);

        svg.append("g")
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("transform", d => `translate(${x(d.metric)}, 0)`)
            .selectAll("rect")
            .data(d => d.values.map(v => ({...v, key: d.metric})))
            .join("rect")
            .attr("x", d => xSubgroup(d.name))
            .attr("width", xSubgroup.bandwidth())
            .attr("fill", d => color(d.name))
            .attr("y", d => y(0))
            .attr("height", 0)
            .on("mouseover", (event, d) => {
                 tooltip.style("opacity", 1)
                       .html(`<strong>${d.name} - ${d.key}</strong><br>${config.yAxisLabel}: ${utils.formatCI(d.value, d.ci?.lower, d.ci?.upper, d.key === 'AUC' ? 3 : 1, d.key !== 'AUC')}`)
                       .style("left", (event.pageX + 15) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.style("opacity", 0))
            .transition()
            .duration(C.ANIMATION_DURATION_MS)
            .attr("y", d => y(d.value))
            .attr("height", d => config.height - y(d.value));
            
        const errorBars = svg.append("g")
            .selectAll("g")
            .data(data)
            .join("g")
            .attr("transform", d => `translate(${x(d.metric)}, 0)`)
            .selectAll(".error-bar")
            .data(d => d.values)
            .join("g")
            .attr("class", "error-bar");
            
        errorBars.append("line")
            .attr("x1", d => xSubgroup(d.name) + xSubgroup.bandwidth() / 2)
            .attr("x2", d => xSubgroup(d.name) + xSubgroup.bandwidth() / 2)
            .attr("y1", d => y(d.ci?.lower !== undefined ? d.ci.lower : d.value))
            .attr("y2", d => y(d.ci?.upper !== undefined ? d.ci.upper : d.value))
            .attr("stroke", "black")
            .attr("stroke-width", 1.5);

        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", C.LEGEND_FONT_SIZE)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(subgroups.slice().reverse())
            .join("g")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", config.width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", color);

        legend.append("text")
            .attr("x", config.width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);
    }
    
    async function getSvgBlob(svgElement) {
        return new Promise((resolve, reject) => {
            if (!svgElement) return reject(new Error("SVG-Element nicht gefunden."));
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElement);
            if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
            resolve(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
        });
    }

    async function convertSvgToPngBlob(svgElement, scale = 2) {
        return new Promise((resolve, reject) => {
            getSvgBlob(svgElement).then(blob => {
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const bbox = svgElement.getBoundingClientRect();
                    canvas.width = bbox.width * scale;
                    canvas.height = bbox.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    URL.revokeObjectURL(url);
                    canvas.toBlob(resolve, 'image/png');
                };
                img.onerror = (err) => {
                    URL.revokeObjectURL(url);
                    reject(err);
                };
                img.src = url;
            }).catch(reject);
        });
    }

    return Object.freeze({
        renderBarChart,
        renderPerformanceComparisonChart,
        convertSvgToPngBlob,
        getSvgBlob
    });

})();
