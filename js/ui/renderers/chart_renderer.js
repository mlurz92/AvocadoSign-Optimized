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
            margin: options.margin || C.DEFAULT_MARGIN,
            xAxisLabel: options.xAxisLabel || '',
            yAxisLabel: options.yAxisLabel || ''
        };
        const svg = _createBaseSvg(containerId, config);
        const tooltip = _createTooltip(containerId);

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

        const yMax = d3.max(data, d => d.value);
        const y = d3.scaleLinear()
            .domain([0, yMax > 0 ? yMax * 1.1 : 10])
            .range([config.height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .selectAll("text")
            .style("font-size", C.TICK_LABEL_FONT_SIZE);
            
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.label))
            .attr("width", x.bandwidth())
            .attr("y", d => y(0))
            .attr("height", 0)
            .attr("fill", C.AS_COLOR)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                       .html(`<strong>${d.label}</strong><br>${options.yAxisLabel || 'Wert'}: ${formatNumber(d.value, 0)}`)
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
                       .html(`<strong>${d.name} - ${d.key}</strong><br>${config.yAxisLabel}: ${formatCI(d.value, d.ci_lower, d.ci_upper, 1, true)}`)
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
            .attr("y1", d => y(d.ci_lower))
            .attr("y2", d => y(d.ci_upper))
            .attr("stroke", "black")
            .attr("stroke-width", 1.5);
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
                    const bbox = svgElement.getBBox();
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
