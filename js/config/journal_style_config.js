
const JOURNAL_STYLE_CONFIG = Object.freeze({
    VERSION: "1.0.0",
    TARGET_JOURNAL: "Radiology (general medical)",

    FONTS: Object.freeze({
        FAMILY_SANS_SERIF: "Arial, Helvetica, sans-serif",
        TITLE_SIZE_PPT: "14pt",
        AXIS_LABEL_SIZE_PPT: "11pt",
        TICK_LABEL_SIZE_PPT: "9pt",
        LEGEND_SIZE_PPT: "9pt",
        TOOLTIP_SIZE_PPT: "10pt",
        ANNOTATION_SIZE_PPT: "9pt",

        TITLE_SIZE_SVG: "16px",
        AXIS_LABEL_SIZE_SVG: "13px",
        TICK_LABEL_SIZE_SVG: "11px",
        LEGEND_SIZE_SVG: "11px",
        ANNOTATION_SIZE_SVG: "11px"
    }),

    COLORS: Object.freeze({
        PRIMARY_1: "#0072B2", // Darker Blue (Drosophila colorblind-safe)
        PRIMARY_2: "#D55E00", // Vermillion / Orange-Red (Drosophila colorblind-safe)
        ACCENT_1: "#009E73",  // Bluish Green (Drosophila colorblind-safe)
        ACCENT_2: "#CC79A7",  // Reddish Purple (Drosophila colorblind-safe)
        ACCENT_3: "#56B4E9",  // Sky Blue (Drosophila colorblind-safe)
        ACCENT_4: "#E69F00",  // Orange (Drosophila colorblind-safe)
        ACCENT_5: "#F0E442",  // Yellow (Drosophila colorblind-safe)

        NEUTRAL_DARK: "#333333",
        NEUTRAL_MEDIUM: "#777777",
        NEUTRAL_LIGHT: "#BBBBBB",
        NEUTRAL_VERY_LIGHT: "#f0f0f0",

        REFERENCE_LINE: "#888888",
        GRID_LINE: "#DDDDDD",
        AXIS_LINE: "#333333",
        TEXT_PRIMARY: "#000000",
        TEXT_SECONDARY: "#333333",
        BACKGROUND: "#FFFFFF",

        GRAYSCALE_PALETTE: Object.freeze([
            "#000000", // Black
            "#555555", // Dark Gray
            "#888888", // Medium Gray
            "#BBBBBB", // Light Gray
            "#D9D9D9", // Very Light Gray
            "#444444", // Alternative Dark Grays for more series
            "#777777",
            "#AAAAAA"
        ]),
        // Color palette based on Paul Tol's vibrant scheme, good for categorical data & colorblindness
        COLOR_PALETTE_PUBLICATION: Object.freeze([
            "#0077BB", // Blue
            "#EE7733", // Orange
            "#009988", // Teal
            "#EE3377", // Magenta
            "#CCBB44", // Yellow
            "#BBBBBB"  // Grey
        ]),
         // Specific colors from APP_CONFIG for AS and T2 if direct mapping is preferred for consistency
        AS_COLOR_JOURNAL: APP_CONFIG.CHART_SETTINGS.AS_COLOR || "#0072B2",         // Default to Darker Blue
        T2_COLOR_JOURNAL: "#D55E00", // Default to Vermillion/Orange-Red, distinct from AS_COLOR
    }),

    STROKES: Object.freeze({
        AXIS_WIDTH_PX: 1,
        GRID_WIDTH_PX: 0.5,
        PLOT_LINE_WIDTH_PX: 1.5,
        BAR_OUTLINE_WIDTH_PX: 0.75,
        REFERENCE_LINE_WIDTH_PX: 0.75
    }),

    SIZES: Object.freeze({
        POINT_RADIUS_PX: 3,
        PNG_EXPORT_TARGET_WIDTH_SINGLE_COL_PX: 1004, // Approx 85mm @ 300 DPI
        PNG_EXPORT_TARGET_WIDTH_DOUBLE_COL_PX: 2067, // Approx 175mm @ 300 DPI
        PNG_EXPORT_DPI: 300,
        SVG_STROKE_SCALING_FACTOR: 0.75 // For finer lines in SVG outputs if needed
    }),

    MARGINS: Object.freeze({
        // Consistent margins for publication-quality charts
        DEFAULT_PUBLICATION: Object.freeze({
            top: 30,     // Enough space for a main title
            right: 25,   // Space for potential annotations or if y-axis is on the right
            bottom: 50,  // Space for x-axis label and tick labels
            left: 60     // Space for y-axis label and tick labels
        }),
        COMPACT_PUBLICATION: Object.freeze({ // For smaller/simpler charts or when legend is external
            top: 20,
            right: 20,
            bottom: 40,
            left: 50
        }),
        PIE_CHART_PUBLICATION: Object.freeze({
            top: 20,
            right: 20,
            bottom: 40,  // If legend is below
            left: 20
        })
    }),

    SVG_EXPORT: Object.freeze({
        EMBED_FONTS: false, // Typically, journals prefer fonts not embedded or converted to paths.
                           // Conversion to paths often done by journal or pre-press software.
        STROKE_TO_FILL_TEXT: false, // Alternative if font embedding is problematic, but can increase file size.
        USE_CSS_FOR_STYLING: true // Prefer CSS for SVG styling for easier modification if needed.
    }),

    LANGUAGE: "en" // Default language for chart exports (titles, labels)
});

if (typeof Object.freeze === 'function') {
    Object.freeze(JOURNAL_STYLE_CONFIG.FONTS);
    Object.freeze(JOURNAL_STYLE_CONFIG.COLORS);
    Object.freeze(JOURNAL_STYLE_CONFIG.STROKES);
    Object.freeze(JOURNAL_STYLE_CONFIG.SIZES);
    Object.freeze(JOURNAL_STYLE_CONFIG.MARGINS.DEFAULT_PUBLICATION);
    Object.freeze(JOURNAL_STYLE_CONFIG.MARGINS.COMPACT_PUBLICATION);
    Object.freeze(JOURNAL_STYLE_CONFIG.MARGINS.PIE_CHART_PUBLICATION);
    Object.freeze(JOURNAL_STYLE_CONFIG.MARGINS);
    Object.freeze(JOURNAL_STYLE_CONFIG.SVG_EXPORT);
    Object.freeze(JOURNAL_STYLE_CONFIG);
}
