const chartRenderer = (() => {

    function getResolvedStyle(styleOptions, appConfigPath, journalConfigPath, defaultValue) {
        const profile = styleOptions?.styleProfile || 'appInternal';
        const appValue = getObjectValueByPath(APP_CONFIG, appConfigPath);
        const journalValue = getObjectValueByPath(JOURNAL_STYLE_CONFIG, journalConfigPath);

        if (profile === 'journal' && journalValue !== undefined) {
            return journalValue;
        }
        if (appValue !== undefined) {
            return appValue;
        }
        return defaultValue;
    }

    function getFontFamily(styleOptions) {
        return getResolvedStyle(styleOptions, 'CHART_SETTINGS.FONT_FAMILY_SANS_SERIF', 'FONTS.FAMILY_SANS_SERIF', 'system-ui, sans-serif');
    }

    function getFontSize(styleOptions, elementType) { // elementType: 'TITLE', 'AXIS_LABEL', 'TICK_LABEL', 'LEGEND', 'TOOLTIP', 'ANNOTATION'
        const suffix = styleOptions?.renderingContext === 'svg' ? '_SVG' : '_PPT'; // Assume PPT if not SVG, for general use
        return getResolvedStyle(styleOptions, `CHART_SETTINGS.${elementType.toUpperCase()}_FONT_SIZE`, `FONTS.${elementType.toUpperCase()}_SIZE${suffix}`, '10px');
    }

    function getColor(styleOptions, colorPurpose, index = 0) {
        const profile = styleOptions?.styleProfile || 'appInternal';
        const grayscale = styleOptions?.grayscale || false;

        if (grayscale) {
            const grayPalette = getResolvedStyle(styleOptions, 'CHART_SETTINGS.GRAYSCALE_PALETTE', 'COLORS.GRAYSCALE_PALETTE', ['#000000', '#555555', '#888888', '#BBBBBB']);
            return grayPalette[index % grayPalette.length];
        }

        if (profile === 'journal') {
            switch (colorPurpose) {
                case 'PRIMARY_1': return JOURNAL_STYLE_CONFIG.COLORS.AS_COLOR_JOURNAL || JOURNAL_STYLE_CONFIG.COLORS.PRIMARY_1;
                case 'PRIMARY_2': return JOURNAL_STYLE_CONFIG.COLORS.T2_COLOR_JOURNAL || JOURNAL_STYLE_CONFIG.COLORS.PRIMARY_2;
                case 'SERIES': return (JOURNAL_STYLE_CONFIG.COLORS.COLOR_PALETTE_PUBLICATION || [JOURNAL_STYLE_CONFIG.COLORS.PRIMARY_1, JOURNAL_STYLE_CONFIG.COLORS.PRIMARY_2])[index % (JOURNAL_STYLE_CONFIG.COLORS.COLOR_PALETTE_PUBLICATION?.length || 2)];
                case 'BACKGROUND': return JOURNAL_STYLE_CONFIG.COLORS.BACKGROUND;
                case 'GRID_LINE': return JOURNAL_STYLE_CONFIG.COLORS.GRID_LINE;
                case 'AXIS_LINE': return JOURNAL_STYLE_CONFIG.COLORS.AXIS_LINE;
                case 'TEXT_PRIMARY': return JOURNAL_STYLE_CONFIG.COLORS.TEXT_PRIMARY;
                default: return JOURNAL_STYLE_CONFIG.COLORS.NEUTRAL_DARK;
            }
        } else { // appInternal
            switch (colorPurpose) {
                case 'PRIMARY_1': return APP_CONFIG.CHART_SETTINGS.AS_COLOR || APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE;
                case 'PRIMARY_2': return APP_CONFIG.CHART_SETTINGS.T2_COLOR || APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN;
                case 'SERIES': return (APP_CONFIG.CHART_SETTINGS.DEFAULT_COLOR_SCHEME || [APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE, APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN])[index % (APP_CONFIG.CHART_SETTINGS.DEFAULT_COLOR_SCHEME?.length || 2)];
                case 'BACKGROUND': return APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR;
                case 'GRID_LINE': return APP_CONFIG.CHART_SETTINGS.GRIDLINE_COLOR;
                case 'AXIS_LINE': return APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_COLOR || '#333333'; // Assuming AXIS_LABEL_COLOR is similar to what's needed for lines
                case 'TEXT_PRIMARY': return APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_COLOR || '#212529';
                default: return APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE;
            }
        }
    }
    
    function getStrokeWidth(styleOptions, strokePurpose) {
         const profile = styleOptions?.styleProfile || 'appInternal';
         if (profile === 'journal') {
            switch(strokePurpose) {
                case 'AXIS': return JOURNAL_STYLE_CONFIG.STROKES.AXIS_WIDTH_PX;
                case 'GRID': return JOURNAL_STYLE_CONFIG.STROKES.GRID_WIDTH_PX;
                case 'PLOT_LINE': return JOURNAL_STYLE_CONFIG.STROKES.PLOT_LINE_WIDTH_PX;
                case 'BAR_OUTLINE': return JOURNAL_STYLE_CONFIG.STROKES.BAR_OUTLINE_WIDTH_PX;
                default: return 1;
            }
         } else {
             switch(strokePurpose) {
                case 'PLOT_LINE': return APP_CONFIG.CHART_SETTINGS.LINE_STROKE_WIDTH || 2;
                default: return 1;
             }
         }
    }


    function createSvgContainer(targetElementId, options = {}, styleOptions = {}) {
        const container = d3.select(`#${targetElementId}`);
        if (container.empty() || !container.node()) { console.error(`Chart-Container #${targetElementId} nicht gefunden.`); return null; }
        container.selectAll("svg").remove(); container.html('');

        const containerNode = container.node();
        const initialWidth = containerNode.clientWidth || parseFloat(window.getComputedStyle(containerNode).width) || 0;
        const initialHeight = containerNode.clientHeight || parseFloat(window.getComputedStyle(containerNode).height) || 0;

        const profile = styleOptions.styleProfile || 'appInternal';
        const baseMarginConfig = profile === 'journal' ? JOURNAL_STYLE_CONFIG.MARGINS.DEFAULT_PUBLICATION : APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN;
        const margin = { ...baseMarginConfig, ...(options.margin || {}) };
        
        const defaultWidth = profile === 'journal' ? JOURNAL_STYLE_CONFIG.SIZES.PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX : APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH;
        const defaultHeight = profile === 'journal' ? (JOURNAL_STYLE_CONFIG.SIZES.PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX * 0.75) : APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT;

        const width = options.width || (initialWidth > 20 ? initialWidth : defaultWidth);
        let height = options.height || (initialHeight > 20 ? initialHeight : defaultHeight);

        const legendItemCount = options.legendItemCount || 0;
        const estimatedLegendHeight = options.legendBelow ? Math.max(25, legendItemCount * (parseInt(getFontSize(styleOptions, 'LEGEND')) || 12) + 15) : 0;


        if (options.useCompactMargins && options.legendBelow) {
             const pieMarginConfig = profile === 'journal' ? JOURNAL_STYLE_CONFIG.MARGINS.PIE_CHART_PUBLICATION : APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN;
             Object.assign(margin, pieMarginConfig, options.margin); // Allow override
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
            .style("background-color", getColor(styleOptions, 'BACKGROUND'))
            .style("font-family", getFontFamily(styleOptions))
            .style("overflow", "visible")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", "1.1");

        const chartArea = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "chart-area");

        return { svg, chartArea, width, height, innerWidth, innerHeight, margin, legendSpaceY: estimatedLegendHeight };
    }

    function createTooltip(styleOptions = {}) {
        let tooltip = d3.select("body").select(".chart-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "chart-tooltip")
                .style("opacity", 0).style("position", "absolute").style("pointer-events", "none")
                .style("background", "rgba(33, 37, 41, 0.9)").style("color", "#fff").style("padding", "6px 10px")
                .style("border-radius", "4px").style("font-size", getFontSize(styleOptions, 'TOOLTIP'))
                .style("z-index", "3050").style("line-height", "1.4")
                .style("transition", `opacity ${APP_CONFIG.UI_SETTINGS.TRANSITION_DURATION_MS / 2}ms ease-out`);
        } else {
            tooltip.style("font-size", getFontSize(styleOptions, 'TOOLTIP'));
        }
        return tooltip;
    }

    function renderAgeDistributionChart(ageData, targetElementId, options = {}, styleOptions = {}) {
        const lang = styleOptions.lang || (typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de');
        const uiTexts = getUITexts();
        const resolvedStyleOptions = {...{renderingContext: 'svg'}, ...styleOptions};

        const setupOptions = { ...options, margin: { ...(resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.MARGINS.DEFAULT_PUBLICATION : APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN), ...options.margin } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions, resolvedStyleOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip(resolvedStyleOptions);
        const barColor = getColor(resolvedStyleOptions, 'PRIMARY_1');
        const axisColor = getColor(resolvedStyleOptions, 'AXIS_LINE');
        const textColor = getColor(resolvedStyleOptions, 'TEXT_PRIMARY');
        const gridColor = getColor(resolvedStyleOptions, 'GRID_LINE');
        const tickLabelFontSize = getFontSize(resolvedStyleOptions, 'TICK_LABEL');
        const axisLabelFontSize = getFontSize(resolvedStyleOptions, 'AXIS_LABEL');
        const axisStrokeWidth = getStrokeWidth(resolvedStyleOptions, 'AXIS');
        const gridStrokeWidth = getStrokeWidth(resolvedStyleOptions, 'GRID');

        if (!Array.isArray(ageData) || ageData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').style('fill', textColor).attr('class', 'text-muted small').text(lang === 'en' ? 'No age data available.' : 'Keine Altersdaten verfügbar.'); return; }
        const xMin = d3.min(ageData); const xMax = d3.max(ageData); const xDomain = (xMin !== undefined && xMax !== undefined && !isNaN(xMin) && !isNaN(xMax)) ? [Math.max(0, xMin - 5), xMax + 5] : [0, 100];
        const x = d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
        const tickCountX = Math.max(3, Math.min(10, Math.floor(innerWidth / 50)));
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(tickCountX).tickSizeOuter(0).tickFormat(d3.format("d"))).selectAll("text").style("font-size", tickLabelFontSize).style("fill", textColor);
        chartArea.selectAll(".x-axis path, .x-axis line").style("stroke", axisColor).style("stroke-width", axisStrokeWidth);
        svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - 5).style("font-size", axisLabelFontSize).style("fill", textColor).text(uiTexts.axisLabels.age[lang] || uiTexts.axisLabels.age['de']);
        
        const histogram = d3.histogram().value(d => d).domain(x.domain()).thresholds(x.ticks(Math.max(5, Math.min(20, Math.floor(innerWidth / 25)))));
        const bins = histogram(ageData.filter(d => !isNaN(d) && isFinite(d))); const yMax = d3.max(bins, d => d.length);
        const y = d3.scaleLinear().range([innerHeight, 0]).domain([0, yMax > 0 ? yMax : 1]).nice();
        const tickCountY = Math.max(2, Math.min(6, Math.floor(innerHeight / 35)));
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY).tickSizeOuter(0).tickFormat(d3.format("d"))).selectAll("text").style("font-size", tickLabelFontSize).style("fill", textColor);
        chartArea.selectAll(".y-axis path, .y-axis line").style("stroke", axisColor).style("stroke-width", axisStrokeWidth);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 5}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", axisLabelFontSize).style("fill", textColor).text(uiTexts.axisLabels.patientCount[lang] || uiTexts.axisLabels.patientCount['de']);
        
        const enableGrid = resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.ENABLE_GRIDLINES !== false : APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES !== false;
        if (enableGrid) { 
            chartArea.append("g").attr("class", "grid x-grid").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(tickCountX).tickSize(-innerHeight).tickFormat("")).selectAll("line").style("stroke", gridColor).style("stroke-width", gridStrokeWidth);
            chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")).selectAll("line").style("stroke", gridColor).style("stroke-width", gridStrokeWidth);
        }
        
        chartArea.selectAll(".bar").data(bins).join("rect").attr("class", "bar").attr("x", d => x(d.x0) + 1).attr("y", y(0)).attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1)).attr("height", 0).style("fill", barColor).style("opacity", 0.8).attr("rx", 1).attr("ry", 1)
            .on("mouseover", (event, d) => { tooltip.transition().duration(50).style("opacity", .95); tooltip.html(`${uiTexts.axisLabels.age[lang] || 'Alter'}: ${formatNumber(d.x0, 0)}-${formatNumber(d.x1, 0)}<br>${uiTexts.axisLabels.patientCount[lang] || 'Anzahl'}: ${d.length}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(event.currentTarget).style("opacity", 1).style("stroke", "#333").style("stroke-width", 0.5); })
            .on("mouseout", (event, d) => { tooltip.transition().duration(200).style("opacity", 0); d3.select(event.currentTarget).style("opacity", 0.8).style("stroke", "none"); })
            .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750).ease(d3.easeCubicOut).attr("y", d => y(d.length)).attr("height", d => Math.max(0, innerHeight - y(d.length)));
    }

    function renderPieChart(data, targetElementId, options = {}, styleOptions = {}) {
        const lang = styleOptions.lang || (typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de');
        const uiTexts = getUITexts();
        const resolvedStyleOptions = {...{renderingContext: 'svg'}, ...styleOptions};

        const setupOptions = { ...options, margin: options.useCompactMargins ? { ...(resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.MARGINS.PIE_CHART_PUBLICATION :APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN), ...options.margin } : { ...(resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.MARGINS.DEFAULT_PUBLICATION : APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN), ...options.margin }, legendBelow: options.legendBelow ?? options.useCompactMargins, legendItemCount: data?.length || 0 };
        const containerSetup = createSvgContainer(targetElementId, setupOptions, resolvedStyleOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin, legendSpaceY } = containerSetup; const tooltip = createTooltip(resolvedStyleOptions);
        
        const validData = data.filter(d => d && typeof d.value === 'number' && d.value >= 0 && typeof d.label === 'string'); const totalValue = d3.sum(validData, d => d.value);
        if (validData.length === 0 || totalValue <= 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').style('fill', getColor(resolvedStyleOptions, 'TEXT_PRIMARY')).attr('class', 'text-muted small').text(lang === 'en' ? 'No data.' : 'Keine Daten.'); return; }
        
        const plottingHeight = innerHeight; const plottingWidth = innerWidth;
        const outerRadius = Math.min(plottingWidth, plottingHeight) / 2 * (options.outerRadiusFactor ?? 0.9);
        const innerRadius = outerRadius * (options.innerRadiusFactor ?? (resolvedStyleOptions.styleProfile === 'journal' ? 0.45 : 0.5) );
        const labelFontSizeToUse = options.fontSize || getFontSize(resolvedStyleOptions, 'TICK_LABEL');
        const legendFontSizeToUse = getFontSize(resolvedStyleOptions, 'LEGEND');
        const cornerRadius = options.cornerRadius ?? 2; const labelThreshold = options.labelThreshold ?? 0.05;

        if (outerRadius <= innerRadius || outerRadius <= 0) { chartArea.append('text').attr('x', plottingWidth / 2).attr('y', plottingHeight / 2).attr('text-anchor', 'middle').style('fill', getColor(resolvedStyleOptions, 'TEXT_PRIMARY')).attr('class', 'text-muted small').text(lang === 'en' ? 'Too small.' : 'Zu klein.'); return; }
        
        const colorScale = d3.scaleOrdinal().domain(validData.map(d => d.label))
            .range(validData.map((d, i) => getColor(resolvedStyleOptions, 'SERIES', i)));

        const pie = d3.pie().value(d => d.value).sort(null); const arcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(cornerRadius); const labelArcGenerator = d3.arc().innerRadius(innerRadius + (outerRadius - innerRadius) * 0.6).outerRadius(innerRadius + (outerRadius - innerRadius) * 0.6);
        const pieGroup = chartArea.append("g").attr("class", "pie-group").attr("transform", `translate(${plottingWidth / 2},${plottingHeight / 2})`); const arcs = pieGroup.selectAll(".arc").data(pie(validData)).join("g").attr("class", "arc").attr("data-label", d => d.data.label);
        
        arcs.append("path").style("fill", d => colorScale(d.data.label)).style("stroke", getColor(resolvedStyleOptions, 'BACKGROUND')).style("stroke-width", "1.5px").style("opacity", 0.85)
            .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); tooltip.html(`<strong>${d.data.label}:</strong> ${formatNumber(d.data.value, 0)} (${formatPercent(d.data.value / totalValue)})`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).transition().duration(100).style("opacity", 1).attr("transform", "scale(1.03)"); })
            .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).transition().duration(100).style("opacity", 0.85).attr("transform", "scale(1)"); })
            .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750).ease(d3.easeCubicOut).attrTween("d", d_tween => { const i = d3.interpolate({startAngle: d_tween.startAngle, endAngle: d_tween.startAngle}, d_tween); return t => arcGenerator(i(t)); });
        
        arcs.filter(d => (d.endAngle - d.startAngle) / (2 * Math.PI) >= labelThreshold).append("text").attr("transform", d => `translate(${labelArcGenerator.centroid(d)})`).attr("dy", "0.35em").style("text-anchor", "middle").style("font-size", labelFontSizeToUse).style("fill", "#ffffff").style("pointer-events", "none").style("opacity", 0).text(d => formatPercent(d.data.value / totalValue, 0)).transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750).delay((APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750) / 2).style("opacity", 1);
        
        if (setupOptions.legendBelow && legendSpaceY > 0 && validData.length > 0) {
            const legendItemHeight = parseInt(legendFontSizeToUse) + 8 || 18;
            const legendMaxWidth = innerWidth;
            const legendGroup = svg.append("g").attr("class", "legend pie-legend").attr("transform", `translate(${margin.left}, ${margin.top + plottingHeight + 15})`).style("font-family", getFontFamily(resolvedStyleOptions)).style("font-size", legendFontSizeToUse).attr("text-anchor", "start").style("fill", getColor(resolvedStyleOptions, 'TEXT_PRIMARY'));
            let currentX = 0; let currentY = 0;
            const legendItems = legendGroup.selectAll("g.legend-item").data(validData).join("g").attr("class", "legend-item").attr("data-label", d => d.label);
            legendItems.each(function(d, i) {
                const item = d3.select(this);
                item.append("rect").attr("x", 0).attr("y", -5).attr("width", 10).attr("height", 10).style("fill", colorScale(d.label));
                item.append("text").attr("x", 14).attr("y", 0).attr("dy", "0.35em").text(`${d.label} (${formatNumber(d.value, 0)})`);
                const itemWidth = this.getBBox().width + 15; // Add some padding
                if (i > 0 && currentX + itemWidth > legendMaxWidth) { currentX = 0; currentY += legendItemHeight; }
                item.attr("transform", `translate(${currentX}, ${currentY})`);
                currentX += itemWidth;
            });
        }
    }

    function renderComparisonBarChart(chartData, targetElementId, options = {}, t2Label = 'T2', styleOptions = {}) {
         const lang = styleOptions.lang || (typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de');
         const uiTexts = getUITexts();
         const resolvedStyleOptions = {...{renderingContext: 'svg'}, ...styleOptions};

         const setupOptions = { ...options, margin: { ...(resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.MARGINS.DEFAULT_PUBLICATION : APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN), top:20, right: 20, bottom: 60, left: 50, ...options.margin } };
         const containerSetup = createSvgContainer(targetElementId, setupOptions, resolvedStyleOptions); if (!containerSetup) return;
         const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip(resolvedStyleOptions);

         if (!Array.isArray(chartData) || chartData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').style('fill', getColor(resolvedStyleOptions, 'TEXT_PRIMARY')).attr('class', 'text-muted small').text(lang === 'en' ? 'No comparison data.' : 'Keine Vergleichsdaten.'); return; }
         const groups = chartData.map(d => d.metric); const subgroups = Object.keys(chartData[0]).filter(key => key !== 'metric');
         const subgroupDisplayNames = { 'AS': (uiTexts.legendLabels.avocadoSign[lang] || uiTexts.legendLabels.avocadoSign['de']), 'T2': t2Label };
         
         const x0 = d3.scaleBand().domain(groups).range([0, innerWidth]).paddingInner(0.35); 
         const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.15); 
         const y = d3.scaleLinear().domain([0, 1.0]).nice().range([innerHeight, 0]); 
         
         const colorAS = getColor(resolvedStyleOptions, 'PRIMARY_1');
         const colorT2 = getColor(resolvedStyleOptions, 'PRIMARY_2');
         const color = d3.scaleOrdinal().domain(subgroups).range([colorAS, colorT2]);

         const tickLabelFontSizeToUse = getFontSize(resolvedStyleOptions, 'TICK_LABEL');
         const axisLabelFontSizeToUse = getFontSize(resolvedStyleOptions, 'AXIS_LABEL');
         const legendFontSizeToUse = getFontSize(resolvedStyleOptions, 'LEGEND');
         const axisColor = getColor(resolvedStyleOptions, 'AXIS_LINE');
         const textColor = getColor(resolvedStyleOptions, 'TEXT_PRIMARY');
         const gridColor = getColor(resolvedStyleOptions, 'GRID_LINE');
         const axisStrokeWidthToUse = getStrokeWidth(resolvedStyleOptions, 'AXIS');
         const gridStrokeWidthToUse = getStrokeWidth(resolvedStyleOptions, 'GRID');


         const tickCountY = 5; 
         chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY, "%").tickSizeOuter(0)).selectAll("text").style("font-size", tickLabelFontSizeToUse).style("fill", textColor);
         chartArea.selectAll(".y-axis path, .y-axis line").style("stroke", axisColor).style("stroke-width", axisStrokeWidthToUse);
         svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", axisLabelFontSizeToUse).style("fill", textColor).text(uiTexts.axisLabels.metricValue[lang] || uiTexts.axisLabels.metricValue['de']);
         chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x0).tickSizeOuter(0)).selectAll(".tick text").style("text-anchor", "middle").style("font-size", tickLabelFontSizeToUse).style("fill", textColor);
         chartArea.selectAll(".x-axis path, .x-axis line").style("stroke", axisColor).style("stroke-width", axisStrokeWidthToUse);
         
         const enableGrid = resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.ENABLE_GRIDLINES !== false : APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES !== false;
         if (enableGrid) { chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")).selectAll("line").style("stroke", gridColor).style("stroke-width", gridStrokeWidthToUse); }
         
         const metricGroup = chartArea.selectAll(".metric-group").data(chartData).join("g").attr("class", "metric-group").attr("transform", d => `translate(${x0(d.metric)},0)`);
         metricGroup.selectAll("rect").data(d => subgroups.map(key => ({key: key, value: d[key], metric: d.metric}))).join("rect").attr("class", d => `bar bar-${d.key.toLowerCase()}`).attr("x", d => x1(d.key)).attr("y", y(0)).attr("width", x1.bandwidth()).attr("height", 0).attr("fill", d => color(d.key)).style("opacity", 0.9).attr("rx", 1).attr("ry", 1)
            .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const displayName = subgroupDisplayNames[d.key] || d.key; const digits = (d.metric === 'AUC' || d.metric === 'F1') ? 3 : 1; const isPercent = !(d.metric === 'AUC' || d.metric === 'F1'); const formattedValue = isPercent ? formatPercent(d.value, digits) : formatNumber(d.value, digits); tooltip.html(`<strong>${d.metric} (${displayName}):</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1); })
            .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).style("opacity", 0.9).style("stroke", "none"); })
            .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750).ease(d3.easeCubicOut).attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));
         
         const legendGroup = svg.append("g").attr("class", "legend bar-legend").style("font-family", getFontFamily(resolvedStyleOptions)).style("font-size", legendFontSizeToUse).attr("text-anchor", "start").style("fill", textColor); 
         const legendItems = legendGroup.selectAll("g.legend-item").data(subgroups).join("g").attr("class", "legend-item").attr("data-subgroup", d => d);
         let totalLegendWidth = 0; const legendSpacings = []; 
         legendItems.append("rect").attr("x", 0).attr("y", -5).attr("width", 10).attr("height", 10).style("fill", d => color(d)); 
         legendItems.append("text").attr("x", 14).attr("y", 0).attr("dy", "0.35em").text(d => subgroupDisplayNames[d] || d).each(function() { const itemWidth = this.getBBox().width + 25; legendSpacings.push(itemWidth); totalLegendWidth += itemWidth; });
         const legendStartX = margin.left + Math.max(0, (innerWidth - totalLegendWidth + 10) / 2); let currentX = legendStartX; 
         legendItems.attr("transform", (d, i) => { const tx = currentX; currentX += legendSpacings[i]; return `translate(${tx}, ${height - margin.bottom + 30})`; });
    }

    function renderASPerformanceChart(targetElementId, performanceData, options = {}, kollektivName = '', styleOptions = {}) {
        const lang = styleOptions.lang || (typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de');
        const uiTexts = getUITexts();
        const resolvedStyleOptions = {...{renderingContext: 'svg'}, ...styleOptions};

        const setupOptions = { ...options, margin: { ...(resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.MARGINS.DEFAULT_PUBLICATION : APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN), top: 30, right: 20, bottom: 60, left: 60, ...options.margin } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions, resolvedStyleOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip(resolvedStyleOptions);
        
        const metrics = ['Sens', 'Spez', 'PPV', 'NPV', 'Acc', 'AUC']; const cohortKey = 'overall'; const cohortPerf = performanceData ? performanceData[cohortKey] : null;
        const textColor = getColor(resolvedStyleOptions, 'TEXT_PRIMARY');
        const axisColor = getColor(resolvedStyleOptions, 'AXIS_LINE');
        const gridColor = getColor(resolvedStyleOptions, 'GRID_LINE');
        const barColor = getColor(resolvedStyleOptions, 'PRIMARY_1');
        const tickLabelFontSizeToUse = getFontSize(resolvedStyleOptions, 'TICK_LABEL');
        const axisLabelFontSizeToUse = getFontSize(resolvedStyleOptions, 'AXIS_LABEL');
        const titleFontSizeToUse = getFontSize(resolvedStyleOptions, 'TITLE');
        const axisStrokeWidthToUse = getStrokeWidth(resolvedStyleOptions, 'AXIS');
        const gridStrokeWidthToUse = getStrokeWidth(resolvedStyleOptions, 'GRID');


        if (!cohortPerf) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').style('fill', textColor).attr('class', 'text-muted small').text(lang === 'en' ? 'Performance data not available.' : 'Performance-Daten nicht verfügbar.'); return; }
        const chartData = metrics.map(metric => { const keyLower = metric.toLowerCase(); let value = NaN; if (cohortPerf[keyLower + 'Val'] !== undefined) value = cohortPerf[keyLower + 'Val']; else if (cohortPerf[metric] !== undefined && cohortPerf[metric] !== null) value = cohortPerf[metric]?.value ?? NaN; return { metric: metric, value: value }; }).filter(d => d.value !== undefined && !isNaN(d.value));
        if (chartData.length === 0) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').style('fill', textColor).attr('class', 'text-muted small').text(lang === 'en' ? 'Incomplete data.' : 'Unvollständige Daten.'); return; }
        
        const x = d3.scaleBand().domain(metrics).range([0, innerWidth]).padding(0.3); 
        const y = d3.scaleLinear().domain([0, 1.0]).nice().range([innerHeight, 0]);
        
        const tickCountY = 5; 
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY, "%").tickSizeOuter(0)).selectAll("text").style("font-size", tickLabelFontSizeToUse).style("fill", textColor);
        chartArea.selectAll(".y-axis path, .y-axis line").style("stroke", axisColor).style("stroke-width", axisStrokeWidthToUse);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", axisLabelFontSizeToUse).style("fill", textColor).text(lang === 'en' ? 'Diagnostic Performance (AS)' : 'Diagnostische Güte (AS)');
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickSizeOuter(0)).selectAll(".tick text").style("text-anchor", "middle").style("font-size", tickLabelFontSizeToUse).style("fill", textColor);
        chartArea.selectAll(".x-axis path, .x-axis line").style("stroke", axisColor).style("stroke-width", axisStrokeWidthToUse);

        const enableGrid = resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.ENABLE_GRIDLINES !== false : APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES !== false;
        if (enableGrid) { chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat("")).selectAll("line").style("stroke", gridColor).style("stroke-width", gridStrokeWidthToUse); }
        
        chartArea.selectAll(".bar").data(chartData).join("rect").attr("class", "bar").attr("x", d => x(d.metric)).attr("y", y(0)).attr("width", x.bandwidth()).attr("height", 0).attr("fill", barColor).style("opacity", 0.9).attr("rx", 1).attr("ry", 1)
           .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const digits = (d.metric === 'AUC' || d.metric === 'F1') ? 3 : 1; const isPercent = !(d.metric === 'AUC' || d.metric === 'F1'); const formattedValue = isPercent ? formatPercent(d.value, digits) : formatNumber(d.value, digits); const metricName = (uiTexts.TOOLTIP_CONTENT?.statMetrics?.[d.metric.toLowerCase()]?.name?.[lang] || uiTexts.TOOLTIP_CONTENT?.statMetrics?.[d.metric.toLowerCase()]?.name?.['de'] || d.metric); tooltip.html(`<strong>${metricName}:</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1); })
           .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).style("opacity", 0.9).style("stroke", "none"); })
           .transition().duration(APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750).ease(d3.easeCubicOut).attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));
        
        const titleText = (uiTexts.chartTitles.asPerformance[lang] || uiTexts.chartTitles.asPerformance['de']).replace('Akt. Kollektiv', kollektivName);
        svg.append("text").attr("x", width / 2).attr("y", margin.top / 2 + 5).attr("text-anchor", "middle").style("font-size", titleFontSizeToUse).style("font-weight", "bold").style("fill", textColor).text(titleText);
    }

    function renderROCCurve(rocData, targetElementId, options = {}, styleOptions = {}) {
        const lang = styleOptions.lang || (typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de');
        const uiTexts = getUITexts();
        const resolvedStyleOptions = {...{renderingContext: 'svg'}, ...styleOptions};

        const setupOptions = { ...options, margin: { ...(resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.MARGINS.DEFAULT_PUBLICATION : APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN), ...options.margin } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions, resolvedStyleOptions); if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup; const tooltip = createTooltip(resolvedStyleOptions);
        
        const lineColor = options.lineColor || getColor(resolvedStyleOptions, 'PRIMARY_1');
        const axisColor = getColor(resolvedStyleOptions, 'AXIS_LINE');
        const textColor = getColor(resolvedStyleOptions, 'TEXT_PRIMARY');
        const gridColor = getColor(resolvedStyleOptions, 'GRID_LINE');
        const refLineColor = getColor(resolvedStyleOptions, 'REFERENCE_LINE');
        const tickLabelFontSizeToUse = getFontSize(resolvedStyleOptions, 'TICK_LABEL');
        const axisLabelFontSizeToUse = getFontSize(resolvedStyleOptions, 'AXIS_LABEL');
        const axisStrokeWidthToUse = getStrokeWidth(resolvedStyleOptions, 'AXIS');
        const gridStrokeWidthToUse = getStrokeWidth(resolvedStyleOptions, 'GRID');
        const plotLineWidthToUse = getStrokeWidth(resolvedStyleOptions, 'PLOT_LINE');
        const pointRadiusToUse = resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.SIZES.POINT_RADIUS_PX : APP_CONFIG.CHART_SETTINGS.POINT_RADIUS;


        const validRocData = Array.isArray(rocData) ? rocData.filter(d => d && typeof d.fpr === 'number' && typeof d.tpr === 'number' && isFinite(d.fpr) && isFinite(d.tpr)) : [];
        if (validRocData.length === 0 || validRocData[0]?.fpr !== 0 || validRocData[0]?.tpr !== 0) { validRocData.unshift({ fpr: 0, tpr: 0, threshold: Infinity }); }
        if (validRocData.length === 0 || validRocData[validRocData.length - 1]?.fpr !== 1 || validRocData[validRocData.length - 1]?.tpr !== 1) { validRocData.push({ fpr: 1, tpr: 1, threshold: -Infinity }); }

        if (validRocData.length < 2) { chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').style('fill', textColor).attr('class', 'text-muted small').text(lang === 'en' ? 'Not enough data for ROC.' : 'Nicht genügend Daten für ROC.'); return; }
        
        const xScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]); 
        const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
        const tickCount = 5; 
        
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(tickCount).tickSizeOuter(0).tickFormat(d3.format(".1f"))).selectAll("text").style("font-size", tickLabelFontSizeToUse).style("fill", textColor);
        chartArea.selectAll(".x-axis path, .x-axis line").style("stroke", axisColor).style("stroke-width", axisStrokeWidthToUse);
        svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - 5).style("font-size", axisLabelFontSizeToUse).style("fill", textColor).text(uiTexts.axisLabels.oneMinusSpecificity[lang] || uiTexts.axisLabels.oneMinusSpecificity['de']);
        
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(yScale).ticks(tickCount).tickSizeOuter(0).tickFormat(d3.format(".1f"))).selectAll("text").style("font-size", tickLabelFontSizeToUse).style("fill", textColor);
        chartArea.selectAll(".y-axis path, .y-axis line").style("stroke", axisColor).style("stroke-width", axisStrokeWidthToUse);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", axisLabelFontSizeToUse).style("fill", textColor).text(uiTexts.axisLabels.sensitivity[lang] || uiTexts.axisLabels.sensitivity['de']);
        
        const enableGrid = resolvedStyleOptions.styleProfile === 'journal' ? JOURNAL_STYLE_CONFIG.ENABLE_GRIDLINES !== false : APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES !== false;
        if (enableGrid) { 
            chartArea.append("g").attr("class", "grid x-grid").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(tickCount).tickSize(-innerHeight).tickFormat("")).selectAll("line").style("stroke", gridColor).style("stroke-width", gridStrokeWidthToUse);
            chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(yScale).ticks(tickCount).tickSize(-innerWidth).tickFormat("")).selectAll("line").style("stroke", gridColor).style("stroke-width", gridStrokeWidthToUse);
        }
        
        chartArea.append("line").attr("class", "reference-line").attr("x1", 0).attr("y1", innerHeight).attr("x2", innerWidth).attr("y2", 0).style("stroke", refLineColor).style("stroke-width", getStrokeWidth(resolvedStyleOptions, 'REFERENCE_LINE')).style("stroke-dasharray", "3 3");
        
        const rocLine = d3.line().x(d => xScale(d.fpr)).y(d => yScale(d.tpr)).curve(d3.curveLinear);
        const path = chartArea.append("path").datum(validRocData).attr("class", "roc-curve").attr("fill", "none").attr("stroke", lineColor).attr("stroke-width", plotLineWidthToUse).attr("d", rocLine);
        
        const totalLength = path.node()?.getTotalLength(); 
        if(totalLength) { path.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).transition().duration((APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750) * 1.5).ease(d3.easeLinear).attr("stroke-dashoffset", 0); }
        
        if (options.showPoints) { 
            chartArea.selectAll(".roc-point").data(validRocData.filter((d, i) => i > 0 && i < validRocData.length - 1)).join("circle").attr("class", "roc-point").attr("cx", d => xScale(d.fpr)).attr("cy", d => yScale(d.tpr)).attr("r", pointRadiusToUse / 1.5).attr("fill", lineColor).style("opacity", 0)
                .on("mouseover", function(event, d) { tooltip.transition().duration(50).style("opacity", .95); const threshText = (d.threshold && isFinite(d.threshold)) ? `<br>Threshold: ${formatNumber(d.threshold, 2)}` : ''; tooltip.html(`FPR: ${formatNumber(d.fpr, 2)}<br>TPR: ${formatNumber(d.tpr, 2)}${threshText}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px"); d3.select(this).attr("r", pointRadiusToUse); })
                .on("mouseout", function(event, d) { tooltip.transition().duration(200).style("opacity", 0); d3.select(this).attr("r", pointRadiusToUse / 1.5); })
                .transition().delay((APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750) * 1.5).duration((APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS || 750) / 2).style("opacity", 0.7); 
        }
        if (options.aucValue !== undefined && !isNaN(options.aucValue)) { 
            const aucText = `AUC: ${formatCI(options.aucValue, options.aucCI?.lower, options.aucCI?.upper, 3, false, '--')}`; 
            chartArea.append("text").attr("class", "auc-label").attr("x", innerWidth - 10).attr("y", innerHeight - 10).attr("text-anchor", "end").style("font-size", getFontSize(resolvedStyleOptions, 'ANNOTATION')).style("font-weight", "bold").style("fill", textColor).text(aucText); 
        }
    }

    return Object.freeze({
        renderAgeDistributionChart,
        renderPieChart,
        renderComparisonBarChart,
        renderASPerformanceChart,
        renderROCCurve
    });

})();
