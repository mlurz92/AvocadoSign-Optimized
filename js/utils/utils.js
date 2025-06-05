function getKollektivDisplayName(kollektivId) {
    const displayName = (typeof UI_TEXTS !== 'undefined' && UI_TEXTS?.kollektivDisplayNames?.[kollektivId]) || kollektivId || 'Unbekannt';
    return displayName;
}

function formatNumber(num, digits = 1, placeholder = '--', useStandardFormatOrLang = false) {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    if (useStandardFormatOrLang === true || useStandardFormatOrLang === 'en') {
        return number.toFixed(digits);
    }
    if (useStandardFormatOrLang === 'de') {
        try {
            return number.toLocaleString('de-DE', {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits
            });
        } catch (e) {
            return number.toFixed(digits).replace('.', ',');
        }
    }
    // Default to 'de-DE' if useStandardFormatOrLang is false or not specified
    try {
        return number.toLocaleString('de-DE', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    } catch (e) {
        return number.toFixed(digits).replace('.', ',');
    }
}

function formatPercent(num, digits = 1, placeholder = '--%', lang = 'de') {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    const locale = lang === 'de' ? 'de-DE' : 'en-US';
    try {
        return new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }).format(number);
    } catch (e) {
        const numStr = (number * 100).toFixed(digits);
        return lang === 'de' ? numStr.replace('.', ',') + '%' : numStr + '%';
    }
}

function formatCI(value, ciLower, ciUpper, digits = 1, isPercent = false, placeholder = '--', lang = 'de') {
    const formatFn = isPercent ? (val, dig, ph) => formatPercent(val, dig, ph, lang) : (val, dig, ph) => formatNumber(val, dig, ph, lang);
    const formattedValue = formatFn(value, digits, placeholder);

    if (formattedValue === placeholder && !(value === 0 && placeholder === '--')) {
        return placeholder;
    }

    let valueToDisplay = formattedValue;
    if (isPercent && formattedValue !== placeholder) {
         valueToDisplay = String(valueToDisplay).replace('%','');
    }

    const formattedLower = formatFn(ciLower, digits, null);
    const formattedUpper = formatFn(ciUpper, digits, null);

    if (formattedLower !== null && formattedUpper !== null && formattedLower !== placeholder && formattedUpper !== placeholder) {
        let lowerStr = isPercent ? String(formattedLower).replace('%','') : String(formattedLower);
        let upperStr = isPercent ? String(formattedUpper).replace('%','') : String(formattedUpper);
        const ciStr = `(${lowerStr}\u00A0–\u00A0${upperStr})`;
        return `${valueToDisplay} ${ciStr}${isPercent ? '%' : ''}`;
    } else {
        return formattedValue;
    }
}

function getCurrentDateString(format = 'YYYY-MM-DD') {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    if (format === 'YYYYMMDD') {
        return `${year}${month}${day}`;
    }
    if (format === 'DD.MM.YYYY') {
        return `${day}.${month}.${year}`;
    }
    return `${year}-${month}-${day}`;
}

function saveToLocalStorage(key, value) {
    if (typeof key !== 'string' || key.length === 0) {
        return;
    }
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.showToast === 'function') {
            ui_helpers.showToast(`Speichern der Einstellung '${key}' fehlgeschlagen.`, 'warning');
        }
    }
}

function loadFromLocalStorage(key) {
    if (typeof key !== 'string' || key.length === 0) {
        return null;
    }
    try {
        const item = localStorage.getItem(key);
        return (item !== null && item !== undefined) ? JSON.parse(item) : null;
    } catch (e) {
        try {
            localStorage.removeItem(key);
        } catch (removeError) {
            // Log or handle removal error if necessary
        }
        return null;
    }
}

function debounce(func, wait) {
  let timeoutId = null;
  return function executedFunction(...args) {
    const context = this;
    const later = () => {
      timeoutId = null;
      func.apply(context, args);
    };
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
  };
}

function isObject(item) {
    return (item !== null && typeof item === 'object' && !Array.isArray(item));
}

function cloneDeep(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    try {
         if (typeof self !== 'undefined' && self.structuredClone) {
             return self.structuredClone(obj);
         } else {
            return JSON.parse(JSON.stringify(obj));
         }
    } catch (e) {
        if (Array.isArray(obj)) {
             const arrCopy = [];
             for(let i = 0; i < obj.length; i++){
                 arrCopy[i] = cloneDeep(obj[i]);
             }
             return arrCopy;
         };
        if (typeof obj === 'object') {
             const objCopy = {};
             for(const key in obj) {
                 if(Object.prototype.hasOwnProperty.call(obj, key)) {
                     objCopy[key] = cloneDeep(obj[key]);
                 }
             }
             return objCopy;
         };
        return obj;
    }
}

function deepMerge(target, ...sources) {
    let output = cloneDeep(target);
    sources.forEach(source => {
        const sourceCopy = cloneDeep(source);
        if (isObject(output) && isObject(sourceCopy)) {
            Object.keys(sourceCopy).forEach(key => {
                const targetValue = output[key];
                const sourceValue = sourceCopy[key];
                if (isObject(sourceValue) && sourceValue !== null) {
                    if (isObject(targetValue) && targetValue !== null) {
                        output[key] = deepMerge(targetValue, sourceValue);
                    } else {
                        output[key] = sourceValue;
                    }
                } else if (sourceValue !== undefined) {
                    output[key] = sourceValue;
                }
            });
        } else if(isObject(sourceCopy)) {
            output = sourceCopy;
        }
    });
    return output;
}

function getObjectValueByPath(obj, path) {
    if (!obj || typeof path !== 'string') {
        return undefined;
    }
    try {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    } catch (e) {
        return undefined;
    }
}

function getSortFunction(key, direction = 'asc', subKey = null) {
    const dirModifier = direction === 'asc' ? 1 : -1;
    return (a, b) => {
        if (!a || !b) return 0;
        let valA, valB;
        try {
            if (key === 'status' && subKey) {
                const getSubStatusValue = (p, sk) => {
                    const statusVal = getObjectValueByPath(p, sk);
                    return statusVal === '+' ? 1 : (statusVal === '-' ? 0 : -1);
                };
                valA = getSubStatusValue(a, subKey);
                valB = getSubStatusValue(b, subKey);
            }
            else if (key === 'status') {
                const getCombinedStatusValue = (p) => {
                    if (!p) return -Infinity;
                    let value = 0;
                    if (p.n === '+') value += 4; else if (p.n === '-') value -= 4;
                    if (p.as === '+') value += 2; else if (p.as === '-') value -= 2;
                    if (p.t2 === '+') value += 1; else if (p.t2 === '-') value -= 1;
                    return value;
                };
                valA = getCombinedStatusValue(a);
                valB = getCombinedStatusValue(b);
            }
            else if (key === 'anzahl_patho_lk' || key === 'anzahl_as_lk' || key === 'anzahl_t2_lk') {
                 const getCounts = (p, k) => {
                     if (!p) return { plus: NaN, total: NaN };
                     let plusKey, totalKey;
                     if (k === 'anzahl_patho_lk') { plusKey = 'anzahl_patho_n_plus_lk'; totalKey = 'anzahl_patho_lk'; }
                     else if (k === 'anzahl_as_lk') { plusKey = 'anzahl_as_plus_lk'; totalKey = 'anzahl_as_lk'; }
                     else if (k === 'anzahl_t2_lk') { plusKey = 'anzahl_t2_plus_lk'; totalKey = 'anzahl_t2_lk'; }
                     else { return { plus: NaN, total: NaN }; }
                     const plus = getObjectValueByPath(p, plusKey);
                     const total = getObjectValueByPath(p, totalKey);
                     return { plus: (plus ?? NaN), total: (total ?? NaN) };
                 };
                 const countsA = getCounts(a, key);
                 const countsB = getCounts(b, key);
                 valA = countsA.plus;
                 valB = countsB.plus;
                 if (valA === valB || (isNaN(valA) && isNaN(valB))) {
                     valA = countsA.total;
                     valB = countsB.total;
                 }
            }
             else {
                 valA = getObjectValueByPath(a, key);
                 valB = getObjectValueByPath(b, key);
             }
             const isInvalidA = valA === null || valA === undefined || (typeof valA === 'number' && isNaN(valA));
             const isInvalidB = valB === null || valB === undefined || (typeof valB === 'number' && isNaN(valB));
             if (isInvalidA && isInvalidB) return 0;
             if (isInvalidA) return 1 * dirModifier;
             if (isInvalidB) return -1 * dirModifier;
             if (typeof valA === 'string' && typeof valB === 'string') {
                 return valA.localeCompare(valB, 'de-DE', { sensitivity: 'base', numeric: true }) * dirModifier;
             }
             if (typeof valA === 'number' && typeof valB === 'number') {
                 return (valA - valB) * dirModifier;
             }
             if (typeof valA === 'boolean' && typeof valB === 'boolean') {
                 return (valA === valB ? 0 : (valA ? 1 : -1)) * dirModifier;
             }
             try {
                 return String(valA).localeCompare(String(valB), 'de-DE', { sensitivity: 'base', numeric: true }) * dirModifier;
             } catch (e) {
                  if (valA < valB) return -1 * dirModifier;
                  if (valA > valB) return 1 * dirModifier;
                  return 0;
             }
        } catch (error) {
             return 0;
        }
    };
}

function getStatisticalSignificanceSymbol(pValue) {
    if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return '';
    const significanceLevels = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_SYMBOLS;
    const overallSignificanceLevel = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
    for (const level of significanceLevels) {
        if (pValue < level.threshold) {
            return level.symbol;
        }
    }
    if (pValue < overallSignificanceLevel) {
        return significanceLevels[significanceLevels.length - 1]?.symbol || '*';
    }
    return 'ns';
}

function getStatisticalSignificanceText(pValue, lang = 'de', significanceLevel = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
     if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return '';
     const level = significanceLevel;
     const isSignificant = pValue < level;
     if (lang === 'de') {
         return isSignificant
             ? (UI_TEXTS.statMetrics.signifikanzTexte.SIGNIFIKANT.de || 'statistisch signifikant')
             : (UI_TEXTS.statMetrics.signifikanzTexte.NICHT_SIGNIFIKANT.de || 'statistisch nicht signifikant');
     } else {
         return isSignificant
             ? (UI_TEXTS.statMetrics.signifikanzTexte.SIGNIFIKANT.en || 'statistically significant')
             : (UI_TEXTS.statMetrics.signifikanzTexte.NICHT_SIGNIFIKANT.en || 'not statistically significant');
     }
}

function getPValueText(pValue, lang = 'de', forRadiology = false) {
    if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';

    const pLessThanThreshold = forRadiology ? 0.001 : (APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_SYMBOLS[0]?.threshold || 0.001);
    const pPrefix = forRadiology ? 'P' : 'p';
    const pMaxThreshold = forRadiology ? 0.99 : 1.0;

    if (pValue < pLessThanThreshold) {
        const thresholdStr = formatNumber(pLessThanThreshold, pLessThanThreshold.toString().split('.')[1]?.length || 3, 'N/A', lang === 'en' || forRadiology);
        return `${pPrefix} < ${thresholdStr}`;
    }
    if (forRadiology && pValue > pMaxThreshold) {
        const thresholdStr = formatNumber(pMaxThreshold, 2, 'N/A', true);
        return `${pPrefix} > ${thresholdStr}`;
    }

    let digits = 3;
    if (forRadiology) {
        if (pValue < 0.01) digits = 3;
        else if (Math.abs(pValue - 0.05) < 0.01 && pValue.toString().split('.')[1]?.length > 2) digits = 3; // Near .05, use 3 if available
        else digits = 2;
    }

    let pFormatted = formatNumber(pValue, digits, 'N/A', lang === 'en' || forRadiology);
    if (forRadiology && pFormatted !== 'N/A' && pFormatted.startsWith('0.')) {
        pFormatted = pFormatted.substring(1); // Remove leading zero "0." -> "."
    }

    return `${pPrefix} = ${pFormatted}`;
}

function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    } else {
        let d = new Date().getTime();
        let d2 = (typeof performance !== 'undefined' && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16;
            if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}

function clampNumber(num, min, max) {
    const number = parseFloat(num);
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    if(isNaN(number) || isNaN(minVal) || isNaN(maxVal)) {
        return NaN;
    };
    return Math.min(Math.max(number, minVal), maxVal);
}

function arraysAreEqual(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function getAUCBewertung(aucValue, lang = 'de') {
    const value = parseFloat(aucValue);
    const uiTextStaerke = UI_TEXTS.statMetrics.assoziationStaerkeTexte;
    const defaultBewertung = lang === 'de' ? (uiTextStaerke.nicht_bestimmbar?.de || 'N/A') : (uiTextStaerke.nicht_bestimmbar?.en || 'N/A');

    if (isNaN(value) || value < 0 || value > 1) return defaultBewertung;

    if (value >= 0.9) return lang === 'de' ? 'exzellent' : 'excellent';
    if (value >= 0.8) return lang === 'de' ? 'gut' : 'good';
    if (value >= 0.7) return lang === 'de' ? 'moderat' : 'fair'; // Radiology uses 'fair'
    if (value > 0.5) return lang === 'de' ? 'schwach' : 'poor'; // Radiology uses 'poor'
    return lang === 'de' ? 'nicht informativ' : 'non-informative'; // Or 'fail' as per some scales
}

function getPhiBewertung(phiValue, lang = 'de') {
    const value = parseFloat(phiValue);
    const uiTextStaerke = UI_TEXTS.statMetrics.assoziationStaerkeTexte;
    const defaultBewertung = lang === 'de' ? (uiTextStaerke.nicht_bestimmbar?.de || 'N/A') : (uiTextStaerke.nicht_bestimmbar?.en || 'N/A');

    if (isNaN(value)) return defaultBewertung;
    const absPhi = Math.abs(value);

    if (absPhi >= 0.5) return lang === 'de' ? (uiTextStaerke.stark?.de || 'stark') : (uiTextStaerke.stark?.en || 'strong');
    if (absPhi >= 0.3) return lang === 'de' ? (uiTextStaerke.moderat?.de || 'moderat') : (uiTextStaerke.moderat?.en || 'moderate');
    if (absPhi >= 0.1) return lang === 'de' ? (uiTextStaerke.schwach?.de || 'schwach') : (uiTextStaerke.schwach?.en || 'weak');
    return lang === 'de' ? (uiTextStaerke.sehr_schwach?.de || 'sehr schwach') : (uiTextStaerke.sehr_schwach?.en || 'very weak');
}
