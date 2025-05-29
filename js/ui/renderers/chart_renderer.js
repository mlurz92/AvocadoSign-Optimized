const chartRenderer = (() => {

    function _getChartConfig(options = {}) {
        const baseConfig = cloneDeep(APP_CONFIG.CHART_SETTINGS || {});
        const mergedConfig = deepMerge(baseConfig, options);

        if (options.colorSchemeKey && baseConfig.COLOR_SCHEMES && baseConfig.COLOR_SCHEMES[options.colorSchemeKey]) {
            mergedConfig.activeColorScheme = baseConfig.COLOR_SCHEMES[options.colorSchemeKey];
        } else {
            mergedConfig.activeColorScheme = baseConfig.COLOR_SCHEMES?.default || ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6c757d'];
        }
        mergedConfig.margin = deepMerge(cloneDeep(APP_CONFIG.CHART_SETTINGS.STANDARD_MARGIN || { top: 20, right: 20, bottom: 30, left: 40 }), options.margin || {});
        return mergedConfig;
    }

    function _createSvgContainer(containerId, config, clearExisting = true) {
        const container = d3.select(`#${containerId}`);
        if (container.empty()) {
            console.error(`Chart-Container #${containerId} nicht gefunden.`);
            return null;
        }
        if (clearExisting) {
            container.selectAll("svg").remove();
        }

        const svg = container.append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${config.width} ${config.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("background-color", config.PLOT_BACKGROUND_COLOR || 'transparent')
            .append("g")
            .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

        return svg;
    }

    function _addAxes(svg, xScale, yScale, config, xAxisLabel = '', yAxisLabel = '') {
        const effectiveWidth = config.width - config.margin.left - config.margin.right;
        const effectiveHeight = config.height - config.margin.top - config.margin.bottom;

        const xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${effectiveHeight})`)
            .call(d3.axisBottom(xScale).tickSizeOuter(0))
            .style("font-size", config.TICK_LABEL_FONT_SIZE || "10px")
            .style("color", config.AXIS_COLOR || "currentColor");

        const yAxis = svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale).tickSizeOuter(0))
            .style("font-size", config.TICK_LABEL_FONT_SIZE || "10px")
            .style("color", config.AXIS_COLOR || "currentColor");

        if (xAxisLabel) {
            svg.append("text")
                .attr("class", "x-axis-label")
                .attr("text-anchor", "middle")
                .attr("x", effectiveWidth / 2)
                .attr("y", effectiveHeight + config.margin.bottom * 0.8)
                .style("font-size", config.AXIS_LABEL_FONT_SIZE || "11px")
                .style("fill", config.AXIS_LABEL_COLOR || "currentColor")
                .text(xAxisLabel);
        }

        if (yAxisLabel) {
            svg.append("text")
                .attr("class", "y-axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -effectiveHeight / 2)
                .attr("y", -config.margin.left * 0.7)
                .style("font-size", config.AXIS_LABEL_FONT_SIZE || "11px")
                .style("fill", config.AXIS_LABEL_COLOR || "currentColor")
                .text(yAxisLabel);
        }
        return { xAxis, yAxis };
    }

    function _addGridlines(svg, xScale, yScale, config) {
        if (!config.ENABLE_GRIDLINES) return;
        const effectiveHeight = config.height - config.margin.top - config.margin.bottom;
        const effectiveWidth = config.width - config.margin.left - config.margin.right;

        svg.append("g")
            .attr("class", "grid x-grid")
            .attr("transform", `translate(0,${effectiveHeight})`)
            .call(d3.axisBottom(xScale)
                .tickSize(-effectiveHeight)
                .tickFormat("")
            )
            .selectAll(".tick line")
            .style("stroke", config.GRIDLINE_COLOR || "#e0e0e0")
            .style("stroke-opacity", "0.7")
            .style("shape-rendering", "crispEdges");

        svg.append("g")
            .attr("class", "grid y-grid")
            .call(d3.axisLeft(yScale)
                .tickSize(-effectiveWidth)
                .tickFormat("")
            )
            .selectAll(".tick line")
            .style("stroke", config.GRIDLINE_COLOR || "#e0e0e0")
            .style("stroke-opacity", "0.7")
            .style("shape-rendering", "crispEdges");

        svg.selectAll("path.domain").style("stroke", config.AXIS_COLOR || "currentColor");
    }


    function renderBarChart(data, containerId, options = {}, yAxisLabel = '', groupKey = 'label', valueKey = 'value') {
        if (!data || data.length === 0) { ui_helpers.updateElementHTML(containerId, `<p class="text-muted small text-center p-3">Keine Daten für Balkendiagramm verfügbar.</p>`); return;}
        const config = _getChartConfig(options);
        const svg = _createSvgContainer(containerId, config);
        if (!svg) return;

        const effectiveWidth = config.width - config.margin.left - config.margin.right;
        const effectiveHeight = config.height - config.margin.top - config.margin.bottom;

        const xScale = d3.scaleBand()
            .domain(data.map(d => d[groupKey]))
            .range([0, effectiveWidth])
            .padding(0.2);

        const yMax = d3.max(data, d => parseFloat(d[valueKey]));
        const yScale = d3.scaleLinear()
            .domain([0, yMax > 0 ? yMax * 1.1 : 10])
            .range([effectiveHeight, 0])
            .nice();

        _addGridlines(svg, xScale, yScale, config);
        _addAxes(svg, xScale, yScale, config, '', yAxisLabel);

        const bars = svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d[groupKey]))
            .attr("y", d => yScale(parseFloat(d[valueKey])))
            .attr("width", xScale.bandwidth())
            .attr("height", d => Math.max(0, effectiveHeight - yScale(parseFloat(d[valueKey]))))
            .attr("fill", (d,i) => config.activeColorScheme[i % config.activeColorScheme.length])
            .attr("rx", "2")
            .attr("ry", "2");

        if (config.TOOLTIP_FONT_SIZE) {
            bars.each(function(d) {
                tippy(this, {
                    content: `<strong>${d[groupKey]}</strong>: ${formatNumber(d[valueKey], 0)}`,
                    allowHTML: true, theme: 'glass', placement: 'top',
                    animation: 'fade', interactive: false, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
                    appendTo: () => document.body, zIndex: 3050
                });
            });
        }
    }

    function renderPieChart(data, containerId, options = {}, valueKey = 'value', labelKey = 'label') {
        if (!data || data.length === 0 || data.every(d => (d[valueKey] === 0 || isNaN(parseFloat(d[valueKey])))) ) { ui_helpers.updateElementHTML(containerId, `<p class="text-muted small text-center p-3">Keine Daten für Tortendiagramm verfügbar.</p>`); return;}
        const config = _getChartConfig(options);
        const svgContainer = _createSvgContainer(containerId, config);
        if (!svgContainer) return;

        const effectiveWidth = config.width - config.margin.left - config.margin.right;
        const effectiveHeight = config.height - config.margin.top - config.margin.bottom - (config.legendBelow ? 30 : 0);
        const radius = Math.min(effectiveWidth, effectiveHeight) / 2 * 0.9;
        const innerRadiusFactor = config.innerRadiusFactor !== undefined ? config.innerRadiusFactor : 0.6;
        const innerRadius = radius * innerRadiusFactor;


        const pie = d3.pie().value(d => parseFloat(d[valueKey])).sort(null);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
        const labelArc = d3.arc().innerRadius(radius * 0.7).outerRadius(radius * 0.7);

        const g = svgContainer.append("g")
            .attr("transform", `translate(${effectiveWidth / 2},${effectiveHeight / 2})`);

        const arcs = g.selectAll(".arc")
            .data(pie(data.filter(d => parseFloat(d[valueKey]) > 0)))
            .enter().append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .style("fill", (d, i) => config.activeColorScheme[i % config.activeColorScheme.length])
            .style("stroke", config.PLOT_BACKGROUND_COLOR || "#fff")
            .style("stroke-width", "1px");

        const totalSum = d3.sum(data, d => parseFloat(d[valueKey]));

        arcs.append("text")
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("font-size", radius < 50 ? "8px" : config.TICK_LABEL_FONT_SIZE || "10px")
            .style("fill", "#fff")
            .style("pointer-events", "none")
            .text(d => {
                const percentage = (parseFloat(d.data[valueKey]) / totalSum);
                return percentage > 0.05 ? formatPercent(percentage, 0).replace(/\s?%/g, '') : '';
            });

        if (config.legendBelow && data.length <= (config.legendItemCount || 4) ) {
            const legendGroup = svgContainer.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${(effectiveWidth - (data.length * (radius < 50 ? 60 : 90))) / 2}, ${effectiveHeight + 20})`);

            const legend = legendGroup.selectAll(".legend-item")
                .data(data.filter(d => parseFloat(d[valueKey]) > 0))
                .enter().append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(${i * (radius < 50 ? 65 : 100)}, 0)`);

            legend.append("rect")
                .attr("x", 0)
                .attr("width", 12)
                .attr("height", 12)
                .style("fill", (d, i) => config.activeColorScheme[i % config.activeColorScheme.length])
                .attr("rx", "2").attr("ry", "2");

            legend.append("text")
                .attr("x", 18)
                .attr("y", 6)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .style("font-size", config.LEGEND_FONT_SIZE || "10px")
                .text(d => `${d[labelKey] || 'N/A'}`);
        }

        if (config.TOOLTIP_FONT_SIZE) {
            arcs.each(function(d) {
                tippy(this, {
                    content: `<strong>${d.data[labelKey] || 'N/A'}</strong>: ${formatNumber(d.data[valueKey], 0)} (${formatPercent(parseFloat(d.data[valueKey]) / totalSum, 1)})`,
                    allowHTML: true, theme: 'glass', placement: 'top',
                    animation: 'fade', interactive: false, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
                    appendTo: () => document.body, zIndex: 3050
                });
            });
        }
    }

    function renderGroupedBarChart(data, containerId, options = {}, groupKey = 'group', subGroupKey = 'subGroup', valueKey = 'value', yAxisLabel = 'Wert') {
        if (!data || data.length === 0) { ui_helpers.updateElementHTML(containerId, `<p class="text-muted small text-center p-3">Keine Daten für gruppiertes Balkendiagramm verfügbar.</p>`); return; }
        const config = _getChartConfig(options);
        const svg = _createSvgContainer(containerId, config);
        if (!svg) return;

        const effectiveWidth = config.width - config.margin.left - config.margin.right;
        const effectiveHeight = config.height - config.margin.top - config.margin.bottom;

        const groups = [...new Set(data.map(d => d[groupKey]))];
        const subGroups = [...new Set(data.map(d => d[subGroupKey]))];

        const xScale0 = d3.scaleBand().domain(groups).rangeRound([0, effectiveWidth]).paddingInner(0.2);
        const xScale1 = d3.scaleBand().domain(subGroups).rangeRound([0, xScale0.bandwidth()]).padding(0.05);
        const yMax = d3.max(data, d => parseFloat(d[valueKey]));
        const yScale = d3.scaleLinear().domain([0, yMax > 0 ? yMax * 1.1 : 10]).rangeRound([effectiveHeight, 0]).nice();

        _addGridlines(svg, xScale0, yScale, config);
        _addAxes(svg, xScale0, yScale, config, '', yAxisLabel);

        const groupG = svg.append("g").selectAll("g")
            .data(groups)
            .enter().append("g")
            .attr("transform", d => `translate(${xScale0(d)},0)`);

        const bars = groupG.selectAll("rect")
            .data(d_group => data.filter(item => item[groupKey] === d_group))
            .enter().append("rect")
            .attr("x", d => xScale1(d[subGroupKey]))
            .attr("y", d => yScale(parseFloat(d[valueKey])))
            .attr("width", xScale1.bandwidth())
            .attr("height", d => Math.max(0, effectiveHeight - yScale(parseFloat(d[valueKey]))))
            .attr("fill", (d, i) => config.activeColorScheme[subGroups.indexOf(d[subGroupKey]) % config.activeColorScheme.length])
            .attr("rx", "1").attr("ry", "1");

        if (config.TOOLTIP_FONT_SIZE) {
            bars.each(function(d) {
                tippy(this, {
                    content: `<strong>${d[groupKey]} - ${d[subGroupKey]}</strong>: ${formatNumber(d[valueKey], 2)}`,
                    allowHTML: true, theme: 'glass', placement: 'top',
                    animation: 'fade', interactive: false, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
                    appendTo: () => document.body, zIndex: 3050
                });
            });
        }

        const legend = svg.append("g")
            .attr("font-family", fontFamily)
            .attr("font-size", config.LEGEND_FONT_SIZE || 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(subGroups.slice().reverse())
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0,${i * 15})`);

        legend.append("rect")
            .attr("x", effectiveWidth - 12)
            .attr("width", 12).attr("height", 12)
            .attr("fill", (d, i) => config.activeColorScheme[subGroups.indexOf(d) % config.activeColorScheme.length])
            .attr("rx", "2").attr("ry", "2");

        legend.append("text")
            .attr("x", effectiveWidth - 18)
            .attr("y", 6).attr("dy", "0.32em")
            .text(d => d);
    }

    function renderROCCurve(rocData, containerId, options = {}) {
        if (!rocData || rocData.length < 2) { ui_helpers.updateElementHTML(containerId, `<p class="text-muted small text-center p-3">Unzureichende Daten für ROC-Kurve.</p>`); return;}
        const config = _getChartConfig(options);
        const svg = _createSvgContainer(containerId, config);
        if (!svg) return;

        const effectiveWidth = config.width - config.margin.left - config.margin.right;
        const effectiveHeight = config.height - config.margin.top - config.margin.bottom;

        const xScale = d3.scaleLinear().domain([0, 1]).range([0, effectiveWidth]);
        const yScale = d3.scaleLinear().domain([0, 1]).range([effectiveHeight, 0]);

        _addGridlines(svg, xScale, yScale, config);
        _addAxes(svg, xScale, yScale, config, UI_TEXTS.axisLabels.oneMinusSpecificity, UI_TEXTS.axisLabels.sensitivity);

        svg.append("line")
            .attr("class", "roc-diagonal")
            .attr("x1", 0).attr("y1", effectiveHeight)
            .attr("x2", effectiveWidth).attr("y2", 0)
            .attr("stroke", config.GRIDLINE_COLOR || "#ccc")
            .attr("stroke-width", 1).attr("stroke-dasharray", "4 2");

        const line = d3.line()
            .x(d => xScale(d.fpr))
            .y(d => yScale(d.tpr));

        if(options.ciData && Array.isArray(options.ciData) && options.ciData.length === rocData.length && options.ciData.every(d => typeof d.lowerTPR === 'number' && typeof d.upperTPR === 'number')) {
             const area = d3.area()
                .x(d => xScale(d.fpr))
                .y0(d => yScale(d.lowerTPR))
                .y1(d => yScale(d.upperTPR));

             svg.append("path")
                .datum(options.ciData)
                .attr("class", "roc-ci-area")
                .attr("fill", options.lineColor || config.activeColorScheme[0])
                .attr("fill-opacity", 0.2)
                .attr("d", area);
        }

        svg.append("path")
            .datum(rocData)
            .attr("class", "roc-curve")
            .attr("fill", "none")
            .attr("stroke", options.lineColor || config.activeColorScheme[0])
            .attr("stroke-width", config.LINE_STROKE_WIDTH || 2)
            .attr("d", line);

        if (options.showPoints) {
            svg.selectAll(".roc-point")
                .data(rocData.filter((d,i) => i > 0 && i < rocData.length -1)) // Exclude (0,0) and (1,1) for typical points
                .enter().append("circle")
                .attr("class", "roc-point")
                .attr("cx", d => xScale(d.fpr))
                .attr("cy", d => yScale(d.tpr))
                .attr("r", config.POINT_RADIUS || 3)
                .attr("fill", options.lineColor || config.activeColorScheme[0]);
        }

        if (options.aucValue !== undefined && !isNaN(options.aucValue)) {
            svg.append("text")
                .attr("x", effectiveWidth * 0.98)
                .attr("y", effectiveHeight * 0.95)
                .attr("text-anchor", "end")
                .style("font-size", config.LEGEND_FONT_SIZE || "10px")
                .style("fill", config.AXIS_LABEL_COLOR || "currentColor")
                .text(`AUC = ${formatNumber(options.aucValue, 3, 'N/A', true)}`);
        }
    }

    function renderAgeDistributionChart(ageData, containerId, options = {}) {
        if (!ageData || ageData.length === 0) { ui_helpers.updateElementHTML(containerId, `<p class="text-muted small text-center p-3">Keine Daten für Altersverteilung.</p>`); return; }
        const config = _getChartConfig(options);
        const svg = _createSvgContainer(containerId, config);
        if (!svg) return;

        const effectiveWidth = config.width - config.margin.left - config.margin.right;
        const effectiveHeight = config.height - config.margin.top - config.margin.bottom;

        const minAge = d3.min(ageData); const maxAge = d3.max(ageData);
        const numBins = Math.max(5, Math.min(20, Math.ceil(Math.sqrt(ageData.length))));
        const binWidth = (maxAge - minAge) / numBins > 0 ? (maxAge - minAge) / numBins : 1;

        const xScale = d3.scaleLinear()
            .domain([minAge - binWidth/2, maxAge + binWidth/2])
            .range([0, effectiveWidth]);

        const histogram = d3.histogram()
            .value(d => d)
            .domain(xScale.domain())
            .thresholds(xScale.ticks(numBins));

        const bins = histogram(ageData);

        const yMax = d3.max(bins, d => d.length);
        const yScale = d3.scaleLinear()
            .domain([0, yMax > 0 ? yMax * 1.1 : 10])
            .range([effectiveHeight, 0])
            .nice();

        _addGridlines(svg, xScale, yScale, config);
        _addAxes(svg, xScale, yScale, config, UI_TEXTS.axisLabels.age, UI_TEXTS.axisLabels.patientCount);

        const bars = svg.selectAll("rect")
            .data(bins)
            .enter().append("rect")
            .attr("x", d => xScale(d.x0) + 1)
            .attr("transform", d => `translate(0, ${yScale(d.length)})`)
            .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
            .attr("height", d => Math.max(0, effectiveHeight - yScale(d.length)))
            .style("fill", config.activeColorScheme[0])
            .attr("rx", "1").attr("ry", "1");

        if (config.TOOLTIP_FONT_SIZE) {
             bars.each(function(d) {
                 tippy(this, {
                     content: `<strong>${formatNumber(d.x0,0)}-${formatNumber(d.x1,0)} ${UI_TEXTS.axisLabels.age.split('(')[1].replace(')','')}</strong>: ${d.length} ${UI_TEXTS.axisLabels.patientCount.split(' ')[0]}`,
                     allowHTML: true, theme: 'glass', placement: 'top',
                     animation: 'fade', interactive: false, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
                     appendTo: () => document.body, zIndex: 3050
                 });
             });
        }
    }

    function renderComparisonBarChart(data, containerId, options = {}, yAxisLabel = 'Wert', series1Key = 'AS', series2Key = 'T2') {
         if (!data || data.length === 0) { ui_helpers.updateElementHTML(containerId, `<p class="text-muted small text-center p-3">Keine Daten für Vergleichs-Balkendiagramm verfügbar.</p>`); return; }
         const config = _getChartConfig(options);
         const svg = _createSvgContainer(containerId, config);
         if (!svg) return;

         const effectiveWidth = config.width - config.margin.left - config.margin.right;
         const effectiveHeight = config.height - config.margin.top - config.margin.bottom;
         const groups = data.map(d => d.metric);
         const subGroups = [series1Key, series2Key];

         const xScale0 = d3.scaleBand().domain(groups).rangeRound([0, effectiveWidth]).paddingInner(0.3);
         const xScale1 = d3.scaleBand().domain(subGroups).rangeRound([0, xScale0.bandwidth()]).padding(0.1);
         const yMax = d3.max(data, d => Math.max(parseFloat(d[series1Key]) || 0, parseFloat(d[series2Key]) || 0));
         const yScale = d3.scaleLinear().domain([0, yMax > 0 ? Math.min(1, yMax * 1.1) : 0.1]).rangeRound([effectiveHeight, 0]).nice();

         _addGridlines(svg, xScale0, yScale, config);
         _addAxes(svg, xScale0, yScale, config, '', yAxisLabel);

         const groupG = svg.append("g").selectAll("g")
             .data(data)
             .enter().append("g")
             .attr("transform", d => `translate(${xScale0(d.metric)},0)`);

        const series1Color = config.AS_COLOR || config.activeColorScheme[0];
        const series2Color = config.T2_COLOR || config.activeColorScheme[1];


         groupG.selectAll(`.bar-${series1Key}`)
             .data(d => [d])
             .enter().append("rect")
             .attr("class", `bar-${series1Key}`)
             .attr("x", () => xScale1(series1Key))
             .attr("y", d => yScale(parseFloat(d[series1Key]) || 0))
             .attr("width", xScale1.bandwidth())
             .attr("height", d => Math.max(0, effectiveHeight - yScale(parseFloat(d[series1Key]) || 0)))
             .attr("fill", series1Color)
             .attr("rx", "1").attr("ry", "1");

         groupG.selectAll(`.bar-${series2Key}`)
             .data(d => [d])
             .enter().append("rect")
             .attr("class", `bar-${series2Key}`)
             .attr("x", () => xScale1(series2Key))
             .attr("y", d => yScale(parseFloat(d[series2Key]) || 0))
             .attr("width", xScale1.bandwidth())
             .attr("height", d => Math.max(0, effectiveHeight - yScale(parseFloat(d[series2Key]) || 0)))
             .attr("fill", series2Color)
             .attr("rx", "1").attr("ry", "1");


        if (config.TOOLTIP_FONT_SIZE) {
             groupG.selectAll("rect")
                 .each(function(d_group, i_group, nodes) {
                     const rectElement = this;
                     const isSeries1 = rectElement.classList.contains(`bar-${series1Key}`);
                     const seriesKey = isSeries1 ? series1Key : series2Key;
                     const value = d_group[seriesKey];
                     const metricName = d_group.metric;
                     tippy(rectElement, {
                         content: `<strong>${metricName} (${seriesKey})</strong>: ${formatPercent(value, 1)}`,
                         allowHTML: true, theme: 'glass', placement: 'top',
                         animation: 'fade', interactive: false, delay: APP_CONFIG.UI_SETTINGS.TOOLTIP_DELAY,
                         appendTo: () => document.body, zIndex: 3050
                     });
                 });
        }

         const legendData = [
             { label: series1Key, color: series1Color },
             { label: options.series2LegendLabel || series2Key, color: series2Color }
         ];
         const legend = svg.append("g")
             .attr("font-family", fontFamily)
             .attr("font-size", config.LEGEND_FONT_SIZE || 10)
             .attr("text-anchor", "start")
             .attr("transform", `translate(${0}, ${-config.margin.top * 0.5})`)
             .selectAll("g")
             .data(legendData)
             .enter().append("g")
             .attr("transform", (d, i) => `translate(${i * 120}, 0)`);

         legend.append("rect")
             .attr("x", 0).attr("y", - (config.LEGEND_FONT_SIZE || 10) / 2)
             .attr("width", 12).attr("height", 12)
             .attr("fill", d => d.color)
             .attr("rx", "2").attr("ry", "2");

         legend.append("text")
             .attr("x", 18).attr("y", 0).attr("dy", "0.1em")
             .text(d => d.label);
    }

    return Object.freeze({
        renderBarChart,
        renderPieChart,
        renderGroupedBarChart,
        renderROCCurve,
        renderAgeDistributionChart,
        renderComparisonBarChart
    });

})();
