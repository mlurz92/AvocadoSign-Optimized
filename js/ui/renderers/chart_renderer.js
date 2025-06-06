const chartRenderer = (() => {

    const C = APP_CONFIG.CHART_SETTINGS;

    function _applyRadiologyStyle(selection, type) {
        switch (type) {
            case 'axis-label':
                selection.style('font-size', C.AXIS_LABEL_FONT_SIZE).style('font-family', 'sans-serif').attr('fill', C.UI_SETTINGS.ICON_COLOR);
                break;
            case 'axis-tick':
                selection.style('font-size', C.TICK_LABEL_FONT_SIZE).style('font-family', 'sans-serif').attr('fill', C.UI_SETTINGS.ICON_COLOR);
                break;
            case 'legend':
                selection.style('font-size', C.LEGEND_FONT_SIZE).style('font-family', 'sans-serif').attr('fill', C.UI_SETTINGS.ICON_COLOR);
                break;
            case 'tooltip':
                selection.style('font-size', C.TOOLTIP_FONT_SIZE).style('font-family', 'sans-serif').style('background-color', 'rgba(255,255,255,0.9)').style('border', '1px solid #ddd').style('padding', '8px').style('border-radius', '4px').style('pointer-events', 'none').style('position', 'absolute').style('z-index', '10').style('opacity', '0').style('transition', 'opacity 0.2s');
                break;
        }
    }

    function _createBaseSvg(containerId, config) {
        d3.select(containerId).html('');
        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", config.width + config.margin.left + config.margin.right)
            .attr("height", config.height + config.margin.top + config.margin.bottom)
            .append("g")
            .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
        return svg;
    }

    function _createTooltip(containerId) {
        return d3.select(containerId)
            .append("div")
            .attr("class", "chart-tooltip")
            .call(_applyRadiologyStyle, 'tooltip');
    }

    function renderAgeDistribution(containerId, data) {
        const config = { width: C.DEFAULT_WIDTH, height: C.DEFAULT_HEIGHT, margin: C.DEFAULT_MARGIN };
        const svg = _createBaseSvg(containerId, config);
        const tooltip = _createTooltip(containerId);

        const x = d3.scaleBand()
            .range([0, config.width])
            .domain(data.map(d => d.group))
            .padding(0.2);
        svg.append("g")
            .attr("transform", `translate(0,${config.height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .call(_applyRadiologyStyle, 'axis-tick')
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([config.height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .call(sel => sel.selectAll('.domain, .tick line').attr('stroke', C.GRIDLINE_COLOR))
            .call(sel => sel.selectAll('.tick text').call(_applyRadiologyStyle, 'axis-tick'));

        svg.selectAll("mybar")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.group))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => config.height - y(d.value))
            .attr("fill", C.NEW_PRIMARY_COLOR_BLUE);
    }
    
    function renderPieChart(containerId, data, isCompact = false) {
        const config = {
            width: C.DEFAULT_WIDTH,
            height: isCompact ? C.DEFAULT_WIDTH : C.DEFAULT_HEIGHT,
            margin: isCompact ? C.COMPACT_PIE_MARGIN : C.DEFAULT_MARGIN,
        };
        const radius = Math.min(config.width, config.height) / 2 - Math.min(config.margin.top, config.margin.left);
        d3.select(containerId).html('');
        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", config.width)
            .attr("height", config.height)
            .append("g")
            .attr("transform", `translate(${config.width / 2},${config.height / 2})`);

        const color = d3.scaleOrdinal().domain(data.map(d => d.label)).range(C.COLOR_SCHEMES.default);
        const pie = d3.pie().value(d => d.value);
        const data_ready = pie(data);

        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        svg.selectAll('slices')
            .data(data_ready)
            .join('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.label))
            .attr("stroke", "white")
            .style("stroke-width", "2px");

        const legend = svg.selectAll(".legend")
            .data(data_ready)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${(i % 2 === 0 ? -1 : 0.5) * (config.width / 2 - 40)}, ${Math.floor(i/2) * 20 + radius + 20})`);
        
        legend.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => color(d.data.label));

        legend.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .text(d => `${d.data.label} (${d.data.value})`)
            .call(_applyRadiologyStyle, 'legend');
    }

    function renderPerformanceComparisonChart(containerId, data, studyName) {
        const config = { width: C.DEFAULT_WIDTH, height: C.DEFAULT_HEIGHT, margin: { top: 30, right: 20, bottom: 50, left: 100 } };
        const svg = _createBaseSvg(containerId, config);
        const tooltip = _createTooltip(containerId);

        const y = d3.scaleBand()
            .range([0, config.height])
            .domain(data.map(d => d.metric))
            .padding(0.4);

        svg.append("g")
            .call(d3.axisLeft(y))
            .call(sel => sel.selectAll('.domain').remove())
            .call(sel => sel.selectAll('.tick line').attr('stroke', 'none'))
            .call(sel => sel.selectAll('.tick text').call(_applyRadiologyStyle, 'axis-tick').style('font-weight', 'bold'));

        const x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, config.width]);

        svg.append("g")
            .attr("transform", `translate(0, ${config.height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")))
            .call(sel => sel.selectAll('.domain').attr('stroke', C.GRIDLINE_COLOR))
            .call(sel => sel.selectAll('.tick line').attr('stroke', C.GRIDLINE_COLOR).style('stroke-dasharray', ('2,2')))
            .call(sel => sel.selectAll('.tick text').call(_applyRadiologyStyle, 'axis-tick'));
        
        svg.selectAll(".grid-line")
           .data(x.ticks(5))
           .enter().append("line")
           .attr("class", "grid-line")
           .attr("x1", d => x(d))
           .attr("x2", d => x(d))
           .attr("y1", 0)
           .attr("y2", config.height)
           .attr("stroke", C.GRIDLINE_COLOR)
           .style('stroke-dasharray', ('2,2'));

        const color = d3.scaleOrdinal()
            .domain(['Avocado Sign', studyName])
            .range([C.AS_COLOR, C.T2_COLOR]);

        const ySubgroup = d3.scaleBand()
            .domain(['Avocado Sign', studyName])
            .range([0, y.bandwidth()])
            .padding(0.1);

        const groups = svg.selectAll(".metric-group")
            .data(data)
            .join("g")
            .attr("class", "metric-group")
            .attr("transform", d => `translate(0, ${y(d.metric)})`);

        groups.selectAll(".ci-line")
            .data(d => d.values)
            .join("line")
            .attr("class", "ci-line")
            .attr("x1", d => x(d.ci_lower))
            .attr("x2", d => x(d.ci_upper))
            .attr("y", d => ySubgroup(d.name) + ySubgroup.bandwidth() / 2)
            .attr("stroke", d => color(d.name))
            .attr("stroke-width", 1);
            
        groups.selectAll(".value-point")
            .data(d => d.values)
            .join("circle")
            .attr("class", "value-point")
            .attr("cx", d => x(d.value))
            .attr("cy", d => ySubgroup(d.name) + ySubgroup.bandwidth() / 2)
            .attr("r", C.POINT_RADIUS)
            .attr("fill", d => color(d.name));
    }

    async function convertSvgToPngBlob(svgElement, scale = 2) {
        return new Promise((resolve, reject) => {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement("canvas");
            const svgSize = svgElement.getBoundingClientRect();
            canvas.width = svgSize.width * scale;
            canvas.height = svgSize.height * scale;
            const ctx = canvas.getContext("2d");
            ctx.scale(scale, scale);

            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Canvas to Blob conversion failed."));
                    }
                }, "image/png");
            };
            img.onerror = (e) => {
                reject(new Error(`Image loading failed: ${e}`));
            };
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        });
    }


    return Object.freeze({
        renderAgeDistribution,
        renderPieChart,
        renderPerformanceComparisonChart,
        convertSvgToPngBlob
    });

})();
