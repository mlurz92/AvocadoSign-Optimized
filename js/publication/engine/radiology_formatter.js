const radiologyFormatter = (() => {

    function formatRadiologyNumber(value, digits, removeLeadingZero = false, forceTrailingZeros = false) {
        if (value === null || value === undefined || isNaN(parseFloat(value)) || !isFinite(parseFloat(value))) {
            return '--';
        }
        const num = parseFloat(value);
        let formattedNum = num.toFixed(digits);

        if (!forceTrailingZeros) {
           if (digits > 0 && parseFloat(formattedNum) === parseFloat(num.toFixed(0))) {
                // Avoids .00 if it's a whole number and not forced
           }
        }

        if (removeLeadingZero && formattedNum.startsWith('0.')) {
            formattedNum = formattedNum.substring(1);
        } else if (removeLeadingZero && formattedNum.startsWith('-0.')) {
            formattedNum = '-' + formattedNum.substring(2);
        }
        return formattedNum;
    }

    function formatRadiologyPValue(pValue) {
        if (pValue === null || pValue === undefined || isNaN(parseFloat(pValue)) || !isFinite(parseFloat(pValue))) {
            return 'P = --';
        }
        const p = parseFloat(pValue);
        const rules = APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.P_VALUE_FORMAT_RULES;

        if (p < rules.REPORT_EXACT_THRESHOLD) {
            return `${rules.NO_LEADING_ZERO ? '' : 'P '}${rules.MIN_P_VALUE_DISPLAY_PREFIX}${formatRadiologyNumber(rules.REPORT_EXACT_THRESHOLD, rules.SMALL_P_DIGITS, rules.NO_LEADING_ZERO, true)}`;
        }
        if (p > rules.MAX_P_VALUE_DISPLAY) {
             return `${rules.NO_LEADING_ZERO ? '' : 'P '}>${formatRadiologyNumber(rules.MAX_P_VALUE_DISPLAY, rules.DEFAULT_DIGITS, rules.NO_LEADING_ZERO, true)}`;
        }

        let digits = rules.DEFAULT_DIGITS;
        if (p < rules.SMALL_P_THRESHOLD) {
            digits = rules.SMALL_P_DIGITS;
        } else if (Math.abs(p - APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) < 0.01 && p.toString().split('.')[1]?.length > rules.DEFAULT_DIGITS) {
            digits = rules.SMALL_P_DIGITS; // Use 3 digits if close to .05 and more precision is available
        }
        
        let formattedP = formatRadiologyNumber(p, digits, rules.NO_LEADING_ZERO, true);
        // Ensure that if rounding makes it look non-significant (e.g. 0.046 to .05), keep 3 digits
        if (digits === rules.DEFAULT_DIGITS && parseFloat("0"+formattedP) >= APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL && p < APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
             if (p.toString().split('.')[1]?.length > rules.DEFAULT_DIGITS) {
                formattedP = formatRadiologyNumber(p, rules.SMALL_P_DIGITS, rules.NO_LEADING_ZERO, true);
             }
        }


        return `P = ${formattedP}`;
    }

    function formatRadiologyCI(value, lower, upper, digits = 2, isPercent = false, valueAlreadyFormatted = false) {
        const na = '--';
        let valStr = valueAlreadyFormatted ? value : (isPercent ? formatPercent(value, digits, na, 'en') : formatRadiologyNumber(value, digits));
        const lowerStr = isPercent ? formatPercent(lower, digits, na, 'en') : formatRadiologyNumber(lower, digits);
        const upperStr = isPercent ? formatPercent(upper, digits, na, 'en') : formatRadiologyNumber(upper, digits);

        if (valStr === na) return na;
        if (lowerStr === na || upperStr === na) return valStr;

        const valueMainPart = String(valStr).replace('%', '');
        const lowerMainPart = String(lowerStr).replace('%', '');
        const upperMainPart = String(upperStr).replace('%', '');

        return `${valueMainPart}${isPercent ? '%' : ''} (95% CI: ${lowerMainPart}, ${upperMainPart})`;
    }

    function formatRadiologyRatio(value, lower, upper, digits = 2, ratioType = 'OR') {
        const numRules = APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.NUMBER_FORMAT_RULES;
        const ratioDigits = numRules.ODDS_RATIO.digits || digits;

        const valStr = formatRadiologyNumber(value, ratioDigits, false, true);
        const lowerStr = formatRadiologyNumber(lower, ratioDigits, false, true);
        const upperStr = formatRadiologyNumber(upper, ratioDigits, false, true);

        if (valStr === '--') return `${ratioType}, --`;
        if (lowerStr === '--' || upperStr === '--') return `${ratioType}, ${valStr}`;

        return `${ratioType}, ${valStr} (95% CI: ${lowerStr}, ${upperStr})`;
    }

    function formatPercentageForRadiology(numerator, denominator, digits = 0) {
        if (denominator === 0 || numerator === null || denominator === null || isNaN(numerator) || isNaN(denominator)) {
            return `${formatRadiologyNumber(NaN, 0)} of ${formatRadiologyNumber(NaN, 0)} (0%)`;
        }
        const num = parseFloat(numerator);
        const den = parseFloat(denominator);
        const percentage = (den === 0) ? 0 : (num / den);
        
        let percentDigits = APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.NUMBER_FORMAT_RULES.PERCENTAGES.general_digits;
        
        const formattedPercent = formatPercent(percentage, digits, '--%', 'en'); // Use 'en' for dot decimal
        return `${formatRadiologyNumber(num, 0)} of ${formatRadiologyNumber(den, 0)} (${String(formattedPercent).replace('.0%','%').replace('%','') }%)`;
    }

    function formatMeanSD(mean, sd, meanDigits = 1, sdDigits = 1) {
        const meanStr = formatRadiologyNumber(mean, meanDigits, false, true);
        const sdStr = formatRadiologyNumber(sd, sdDigits, false, true);
        if (meanStr === '--') return '--';
        if (sdStr === '--') return meanStr;
        return `${meanStr} ± ${sdStr}`;
    }

    function formatMedianIQR(median, q1, q3, medianDigits = 0, iqrDigits = 0) {
        const medianStr = formatRadiologyNumber(median, medianDigits, false, true);
        const q1Str = formatRadiologyNumber(q1, iqrDigits, false, true);
        const q3Str = formatRadiologyNumber(q3, iqrDigits, false, true);

        if (medianStr === '--') return '--';
        if (q1Str === '--' || q3Str === '--') return medianStr;
        return `${medianStr} (IQR: ${q1Str}–${q3Str})`;
    }

    function formatRadiologyTableCaption(tableConfig, currentLang = 'en') {
        if (!tableConfig || !tableConfig.radiologyLabel || !tableConfig.titleEn) return '';
        const title = currentLang === 'de' ? (tableConfig.titleDe || tableConfig.titleEn) : tableConfig.titleEn;
        let caption = `${tableConfig.radiologyLabel}: ${title}.`;
        const footnote = currentLang === 'de' ? (tableConfig.footnoteDe || tableConfig.footnoteEn) : tableConfig.footnoteEn;
        if (footnote) {
            caption += ` ${footnote}`;
        }
        return caption;
    }

    function formatRadiologyFigureLegend(figureConfig, currentLang = 'en') {
        if (!figureConfig || !figureConfig.radiologyLabel || !figureConfig.titleEn) return '';
        const title = currentLang === 'de' ? (figureConfig.titleDe || figureConfig.titleEn) : figureConfig.titleEn;
        let legend = `${figureConfig.radiologyLabel}: ${title}. `;
        const legendDetails = currentLang === 'de' ? (figureConfig.legendDe || figureConfig.legendEn) : figureConfig.legendEn;
        if (legendDetails) {
            legend += `${legendDetails} `;
        }
        if (!legendDetails || !legendDetails.toLowerCase().includes('abbreviations')) {
            legend += (currentLang === 'de' ? '(Alle Abkürzungen sind in der Legende zu definieren.)' : '(All abbreviations should be defined in the legend.)');
        }
        return legend;
    }
    
    function manageAbbreviations(text, abbreviationConfig, context = 'mainText') {
        let processedText = text;
        if (abbreviationConfig && typeof abbreviationConfig === 'object') {
            Object.keys(abbreviationConfig).forEach(abbr => {
                const config = abbreviationConfig[abbr];
                const regex = new RegExp(`\\b${abbr}\\b`, 'g');
                let firstOccurrenceInBlock = true;
                
                processedText = processedText.replace(regex, (match) => {
                    let definedInContext = false;
                    if (context === 'abstract') definedInContext = config.abstractDefined;
                    else if (context === 'mainText') definedInContext = config.mainTextDefined;

                    if (firstOccurrenceInBlock && !definedInContext) {
                        firstOccurrenceInBlock = false;
                        return `${config.fullText} (${abbr})`;
                    }
                    return abbr;
                });
            });
        }
        return processedText;
    }


    return Object.freeze({
        formatRadiologyNumber,
        formatRadiologyPValue,
        formatRadiologyCI,
        formatRadiologyRatio,
        formatPercentageForRadiology,
        formatMeanSD,
        formatMedianIQR,
        formatRadiologyTableCaption,
        formatRadiologyFigureLegend,
        manageAbbreviations
    });
})();
