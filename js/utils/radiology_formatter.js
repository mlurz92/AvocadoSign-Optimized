const radiologyFormatter = (() => {
    const NA_PLACEHOLDER = "N/A";

    function _isValidNumber(num) {
        return num !== null && num !== undefined && !isNaN(parseFloat(num)) && isFinite(num);
    }

    function _formatNumberInternal(value, decimals, useRadiologySeparators = true) {
        if (!_isValidNumber(value)) {
            return NA_PLACEHOLDER;
        }
        const num = parseFloat(value);
        const fixedNum = num.toFixed(decimals);

        if (useRadiologySeparators) {
            const parts = fixedNum.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, RADIOLOGY_FORMAT_CONFIG.text.thousands_separator || ",");
            return parts.join(RADIOLOGY_FORMAT_CONFIG.text.decimal_separator || ".");
        }
        return fixedNum; // Fallback to default JS toFixed if no radiology separators needed
    }

    function formatNumber(value, decimals = null, options = {}) {
        const {
            placeholder = NA_PLACEHOLDER,
            useRadiologySeparators = true,
            defaultDecimals = RADIOLOGY_FORMAT_CONFIG.tables.defaultNumericDecimals
        } = options;

        if (!_isValidNumber(value)) {
            return placeholder;
        }
        const effDecimals = decimals !== null ? decimals : defaultDecimals;
        return _formatNumberInternal(value, effDecimals, useRadiologySeparators);
    }

    function formatPercent(value, decimals = null, options = {}) {
        const {
            placeholder = NA_PLACEHOLDER,
            includeSymbol = true,
            multiplyBy100 = true,
            useRadiologySeparators = true,
            defaultDecimals = APP_CONFIG.STATISTICAL_CONSTANTS.METRIC_PERCENT_DECIMALS
        } = options;

        if (!_isValidNumber(value)) {
            return placeholder;
        }
        const num = parseFloat(value);
        const valToFormat = multiplyBy100 ? num * 100 : num;
        const effDecimals = decimals !== null ? decimals : defaultDecimals;
        const formattedNum = _formatNumberInternal(valToFormat, effDecimals, useRadiologySeparators);

        if (formattedNum === placeholder) {
            return placeholder;
        }
        return includeSymbol ? `${formattedNum}%` : formattedNum;
    }

    function formatPValue(pValue, options = {}) {
        const {
            placeholder = NA_PLACEHOLDER,
            prefix = "P ", // Radiology often omits "P = " for exact values, using just the number
            significantDigitsForExact = RADIOLOGY_FORMAT_CONFIG.text.p_value_rules.find(r => r.default_decimals !== undefined)?.default_decimals || APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION,
            rules = RADIOLOGY_FORMAT_CONFIG.text.p_value_rules
        } = options;

        if (!_isValidNumber(pValue)) {
            return placeholder;
        }
        const numPValue = parseFloat(pValue);

        for (const rule of rules) {
            if (rule.threshold !== undefined && numPValue < rule.threshold) {
                return rule.display.startsWith("<") ? `${prefix.trim()}${rule.display}` : `${prefix}${rule.display}`;
            }
        }
        // Default formatting for exact p-value if no rule matched
        const pValueStr = _formatNumberInternal(numPValue, significantDigitsForExact, true);
        return `${prefix.trim() === 'P' ? 'P = ' : prefix}${pValueStr}`;
    }

    function formatConfidenceInterval(lower, upper, decimals, isPercent, options = {}) {
         const {
            placeholder = NA_PLACEHOLDER,
            ciPrefix = "95% CI, ",
            ciSeparator = "–", // En-dash
            defaultDecimalsPercent = APP_CONFIG.STATISTICAL_CONSTANTS.METRIC_PERCENT_DECIMALS,
            defaultDecimalsRate = APP_CONFIG.STATISTICAL_CONSTANTS.METRIC_RATE_DECIMALS
        } = options;

        if (!_isValidNumber(lower) || !_isValidNumber(upper)) {
            return placeholder;
        }

        const effDecimals = decimals !== null ? decimals : (isPercent ? defaultDecimalsPercent : defaultDecimalsRate);
        const formatFn = isPercent ? formatPercent : formatNumber;

        const lowerStr = formatFn(lower, effDecimals, { placeholder: NA_PLACEHOLDER, includeSymbol: false });
        const upperStr = formatFn(upper, effDecimals, { placeholder: NA_PLACEHOLDER, includeSymbol: false });

        if (lowerStr === NA_PLACEHOLDER || upperStr === NA_PLACEHOLDER) {
            return placeholder;
        }

        let formattedCI = RADIOLOGY_FORMAT_CONFIG.text.ci_format
            .replace("{lower}", lowerStr)
            .replace("{upper}", upperStr)
            .replace("–", ciSeparator); // Ensure en-dash

        if (ciPrefix && !formattedCI.includes("CI")) { // Add prefix if not part of template
            formattedCI = ciPrefix + formattedCI.replace(/^\s*\(|\)\s*$/g, ''); // remove outer parens if ciPrefix used
        }
        
        // Add % symbol outside parentheses if it's a percentage and CI is not just placeholder
        if (isPercent && formattedCI !== placeholder) {
             if(formattedCI.startsWith("(") && formattedCI.endsWith(")")) {
                return formattedCI + "%";
             } else if (formattedCI.includes(ciSeparator)){ // e.g. 95% CI, X%–Y%
                 // This case needs careful handling depending on full template.
                 // Assuming template results in something like "95% CI, val_low–val_high"
                 // and we want "95% CI, val_low%–val_high%" or "95% CI, val_low–val_high %"
                 // For simplicity, if it's percent, the _formatNumberInternal should have handled it.
                 // If formatFn was formatPercent with includeSymbol=false, we add it here.
                 // This logic might need refinement based on exact templates.
                 // A simpler approach for now: if it's percent, ensure % is at the very end.
                 return formattedCI.replace(/%/g, '') + "%";
             }
        }
        return formattedCI;
    }


    function formatStatistic(value, ciLower, ciUpper, options = {}) {
        const {
            decimals = null, // Will be derived from isPercent if null
            isPercent = false,
            placeholder = NA_PLACEHOLDER,
            ciPlaceholder = " (CI not calculable)",
            defaultDecimalsPercent = APP_CONFIG.STATISTICAL_CONSTANTS.METRIC_PERCENT_DECIMALS,
            defaultDecimalsRate = APP_CONFIG.STATISTICAL_CONSTANTS.METRIC_RATE_DECIMALS
        } = options;

        const effDecimals = decimals !== null ? decimals : (isPercent ? defaultDecimalsPercent : defaultDecimalsRate);
        const formatFn = isPercent ? formatPercent : formatNumber;
        const valueStr = formatFn(value, effDecimals, { placeholder: placeholder, includeSymbol: isPercent });

        if (valueStr === placeholder) {
            return placeholder;
        }

        if (_isValidNumber(ciLower) && _isValidNumber(ciUpper)) {
            const ciStr = formatConfidenceInterval(ciLower, ciUpper, effDecimals, isPercent, options);
            if (ciStr !== NA_PLACEHOLDER && ciStr !== ciPlaceholder.trim()) {
                 // If formatPercent already added '%', remove it from valueStr before appending CI
                 const baseValueStr = isPercent ? valueStr.replace('%', '') : valueStr;
                 return `${baseValueStr}${ciStr}`;
            }
        }
        return valueStr + (ciPlaceholder && !(_isValidNumber(ciLower) && _isValidNumber(ciUpper)) ? ciPlaceholder : "");
    }

    function formatRange(min, max, decimals, unit = '', options = {}) {
        const { placeholder = NA_PLACEHOLDER, rangeSeparator = "–" } = options;
        const minStr = formatNumber(min, decimals, { placeholder });
        const maxStr = formatNumber(max, decimals, { placeholder });

        if (minStr === placeholder && maxStr === placeholder) return placeholder;
        if (minStr === placeholder) return `${maxStr}${unit ? " " + unit : ""}`;
        if (maxStr === placeholder) return `${minStr}${unit ? " " + unit : ""}`;

        return `${minStr}${rangeSeparator}${maxStr}${unit ? " " + unit : ""}`;
    }

    function formatMeanSD(mean, sd, meanDecimals, sdDecimals, options = {}) {
        const { placeholder = NA_PLACEHOLDER, sdPrefix = " ± " } = options;
        const meanStr = formatNumber(mean, meanDecimals, { placeholder });
        const sdStr = formatNumber(sd, sdDecimals, { placeholder });

        if (meanStr === placeholder && sdStr === placeholder) return placeholder;
        if (sdStr === placeholder || sdStr === "0" || sdStr === "0.0" || sdStr === "0.00") return meanStr; // Do not show SD if it's zero or N/A
        if (meanStr === placeholder) return `${sdPrefix}${sdStr}`;

        return `${meanStr}${sdPrefix}${sdStr}`;
    }

    function formatN(n, options = {}) {
        const { prefix = "N = ", placeholder = NA_PLACEHOLDER } = options;
        if (!_isValidNumber(n) || n < 0) {
            return placeholder;
        }
        return `${prefix}${_formatNumberInternal(n, 0, true)}`;
    }

    return Object.freeze({
        formatNumber,
        formatPercent,
        formatPValue,
        formatConfidenceInterval,
        formatStatistic,
        formatRange,
        formatMeanSD,
        formatN
    });
})();
