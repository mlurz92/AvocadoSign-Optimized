const RADIOLOGY_FORMAT_CONFIG = Object.freeze({
    general: Object.freeze({
        primaryFontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        secondaryFontFamily: "'Times New Roman', Times, serif", // Eher für Fließtext, in der App weniger relevant
        lineHeight: 1.5,
    }),
    text: Object.freeze({
        manuscriptTitleFontSizePt: 18,
        sectionHeadingFontSizePt: 14,
        subSectionHeadingFontSizePt: 12,
        bodyTextFontSizePt: 10,
        figureLegendFontSizePt: 9,
        tableTitleFontSizePt: 10,
        tableHeaderFontSizePt: 9,
        tableBodyFontSizePt: 9,
        tableFootnoteFontSizePt: 8,
        p_value_rules: Object.freeze([
            Object.freeze({ threshold: 0.0001, display: "< .0001" }), // Für extrem kleine p-Werte
            Object.freeze({ threshold: 0.001, display: "< .001" }),
            Object.freeze({ threshold: 1.01, decimals: 3 }) // Standard bis 3 Dezimalstellen
        ]),
        ci_format: " (95% CI, {lower}–{upper})", // Template für Konfidenzintervalle
        decimal_separator: ".", // Für "Radiology" (international) eher Punkt
        thousands_separator: ",", // Für "Radiology" (international) eher Komma
    }),
    tables: Object.freeze({
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        baseFontSizePt: 9,
        headerFontSizePt: 9,
        headerFontWeight: "bold",
        cellPaddingPt: "4pt 6pt",
        borderStyle: "horizontal", // 'full', 'horizontal', 'minimal'
        headerAlignment: "left",
        textAlignment: "left",
        numberAlignment: "center", // Oft zentriert oder am Dezimalpunkt für Konsistenz in Spalten
        defaultNumericDecimals: 2,
        p_value_column_decimals: 3, // Spezifisch für Spalten mit p-Werten
        tableWidthPercent: 100, // In HTML-Reports
        captionAbove: true,
        footnoteFontSizePt: 8,
        footnoteMarkerStyle: "superscript_letters", // 'superscript_numbers', 'symbols'
    }),
    charts: Object.freeze({
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        titleFontSizePt: 11,
        axisLabelFontSizePt: 9,
        tickLabelFontSizePt: 8,
        legendFontSizePt: 8,
        plotBackgroundColor: "#FFFFFF",
        gridLineColor: "#D0D0D0",
        gridLineWidthPt: 0.5,
        gridLineStyle: "dotted", // 'solid', 'dashed', 'dotted'
        axisLineColor: "#333333",
        axisLineWidthPt: 0.75,
        dataLineWidthPt: 1.5,
        dataPointSizePt: 3, // Für Scatterplots oder Linienpunkte
        errorBarCapWidthPt: 3,
        errorBarLineWidthPt: 0.75,
        defaultDPI: 300, // Für PNG-Exporte
        colorSchemes: Object.freeze({
            radiology_grayscale: Object.freeze([
                "#000000", "#505050", "#808080", "#B0B0B0", "#D0D0D0"
            ]),
            radiology_minimal_color: Object.freeze([ // Basierend auf gängigen Schemata für gute Unterscheidbarkeit auch in Graustufen
                "#000000", // Schwarz
                "#0072B2", // Blau (gut für Primärdaten)
                "#D55E00", // Rotorange (gut für Vergleichsdaten)
                "#56B4E9", // Himmelblau
                "#E69F00", // Orange
                "#F0E442", // Gelb (vorsichtig einsetzen)
                "#009E73", // Grünblau
                "#CC79A7"  // Rötliches Pink
            ]),
            default: Object.freeze(["#0072B2", "#D55E00", "#009E73", "#E69F00", "#56B4E9", "#F0E442", "#CC79A7"]) // Ausgewählte gut unterscheidbare Farben
        }),
        preferredColorScheme: 'radiology_minimal_color', // Oder 'radiology_grayscale'
        barSpacingRatio: 0.2, // Verhältnis des Abstands zur Balkenbreite
        rocCurve: Object.freeze({
            lineWidthPt: 1.5,
            referenceLineWidthPt: 0.75,
            referenceLineStyle: "dashed", // "2,2" in SVG Dasharray
            showOperatingPoint: false,
            operatingPointRadiusPt: 2.5,
        }),
        forestPlot: Object.freeze({
            pointMarker: "square", // "circle", "square", "diamond"
            pointSizePt: 3,
            summaryMarker: "diamond",
            summaryMarkerSizePt: 4,
            zeroEffectLineWidthPt: 0.75,
            zeroEffectLineStyle: "solid",
        }),
        figureNumbering: "Fig. {n}", // "Figure {n}"
        imageExportWidthPx: 800, // Standardbreite für PNG Export von Charts
        imageExportScaleFactor: 2 // Skalierungsfaktor für PNGs, um höhere Auflösung zu erzielen
    }),
    citation: Object.freeze({
        style: "radiology", // "vancouver_brackets", "author_year"
        authorDisplayThreshold: 2, // Anzahl Autoren, ab der "et al." verwendet wird (exklusive dieses Werts)
        etAlString: " et al."
    })
});

if (typeof Object.freeze === 'function') {
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.general);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.text.p_value_rules[0]);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.text.p_value_rules[1]);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.text.p_value_rules[2]);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.text);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.tables);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.charts.colorSchemes);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.charts.rocCurve);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.charts.forestPlot);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.charts);
    Object.freeze(RADIOLOGY_FORMAT_CONFIG.citation);
}
