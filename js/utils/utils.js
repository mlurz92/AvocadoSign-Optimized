function getKollektivDisplayName(kollektivId, lang = 'de') {
    const langKey = lang === 'en' ? 'en' : 'de';
    if (UI_TEXTS && UI_TEXTS.kollektivDisplayNames && UI_TEXTS.kollektivDisplayNames[kollektivId] && UI_TEXTS.kollektivDisplayNames[kollektivId][langKey]) {
        return UI_TEXTS.kollektivDisplayNames[kollektivId][langKey];
    }
    return kollektivId || (langKey === 'de' ? 'Unbekannt' : 'Unknown');
}

function formatNumber(num, digits = 1, placeholder = '--', useStandardFormat = false, lang = 'de') {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    if (useStandardFormat) {
        return number.toFixed(digits);
    }
    try {
        const currentLocale = lang === 'de' ? 'de-DE' : 'en-US';
        return number.toLocaleString(currentLocale, {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    } catch (e) {
        return number.toFixed(digits);
    }
}

function formatPercent(num, digits = 1, placeholder = '--%', lang = 'de') {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    try {
        const currentLocale = lang === 'de' ? 'de-DE' : 'en-US';
        return new Intl.NumberFormat(currentLocale, {
            style: 'percent',
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }).format(number);
    } catch (e) {
        return (number * 100).toFixed(digits) + '%';
    }
}

function formatCI(value, ciLower, ciUpper, digits = 1, isPercent = false, placeholder = '--', lang = 'de') {
    const formatFn = isPercent ? formatPercent : formatNumber;
    const formattedValue = formatFn(value, digits, placeholder, false, lang);

    if (formattedValue === placeholder) {
        return placeholder;
    }

    const formattedLower = formatFn(ciLower, digits, null, false, lang);
    const formattedUpper = formatFn(ciUpper, digits, null, false, lang);

    if (formattedLower !== null && formattedUpper !== null && formattedLower !== placeholder && formattedUpper !== placeholder) {
        const valueWithoutUnit = isPercent ? formattedValue.slice(0, -1) : formattedValue;
        const lowerStr = isPercent ? formattedLower.slice(0, -1) : formattedLower;
        const upperStr = isPercent ? formattedUpper.slice(0, -1) : formattedUpper;
        const ciLabelKey = lang === 'de' ? 'KI_LABEL' : 'CI_LABEL';
        const ciLabelText = UI_TEXTS?.statMetrics?.ci95?.name?.[lang] || (lang === 'de' ? '95% KI' : '95% CI');

        const ciStr = `(${ciLabelText}: ${lowerStr}\u00A0–\u00A0${upperStr})`;
        return `${valueWithoutUnit} ${ciStr}${isPercent ? '%' : ''}`;
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
            const langKey = typeof state !== 'undefined' ? state.getCurrentPublikationLang() : 'de';
            const message = langKey === 'de' ? `Speichern der Einstellung '${key}' fehlgeschlagen.` : `Failed to save setting '${key}'.`;
            ui_helpers.showToast(message, 'warning');
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
            // Log if necessary
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
         }
        if (typeof obj === 'object') {
             const objCopy = {};
             for(const key in obj) {
                 if(Object.prototype.hasOwnProperty.call(obj, key)) {
                     objCopy[key] = cloneDeep(obj[key]);
                 }
             }
             return objCopy;
         }
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

function getStatisticalSignificanceSymbol(pValue, significanceLevel = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
    if (pValue === null || pValue === undefined || isNaN(pValue)) return '';
    const level = significanceLevel;
    if (pValue < 0.001) return '***';
    if (pValue < 0.01) return '**';
    if (pValue < level) return '*';
    return 'ns';
}

function getStatisticalSignificanceText(pValue, significanceLevel = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL, lang = 'de') {
     if (pValue === null || pValue === undefined || isNaN(pValue)) return '';
     const langKey = lang === 'en' ? 'en' : 'de';
     const level = significanceLevel;
     const texts = UI_TEXTS.statMetrics.signifikanzTexte || {
         SIGNIFIKANT: { de: 'statistisch signifikant', en: 'statistically significant'},
         NICHT_SIGNIFIKANT: { de: 'statistisch nicht signifikant', en: 'statistically not significant'}
     };
     return pValue < level
         ? (texts.SIGNIFIKANT[langKey] || texts.SIGNIFIKANT.de)
         : (texts.NICHT_SIGNIFIKANT[langKey] || texts.NICHT_SIGNIFIKANT.de);
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
    }
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
    const langKey = lang === 'en' ? 'en' : 'de';
    const bewertungen = {
        exzellent: { de: 'exzellent', en: 'excellent' },
        gut: { de: 'gut', en: 'good' },
        moderat: { de: 'moderat', en: 'fair' },
        schwach: { de: 'schwach', en: 'poor' },
        nicht_informativ: { de: 'nicht informativ', en: 'not informative' }
    };

    if (isNaN(value) || value < 0 || value > 1) return UI_TEXTS.statMetrics.assoziationStaerkeTexte?.nicht_bestimmbar?.[langKey] || (langKey === 'de' ? 'N/V' : 'N/A');
    if (value >= 0.9) return bewertungen.exzellent[langKey];
    if (value >= 0.8) return bewertungen.gut[langKey];
    if (value >= 0.7) return bewertungen.moderat[langKey];
    if (value > 0.5) return bewertungen.schwach[langKey];
    return bewertungen.nicht_informativ[langKey];
}

function getPhiBewertung(phiValue, lang = 'de') {
    const value = parseFloat(phiValue);
    const langKey = lang === 'en' ? 'en' : 'de';
    const texts = UI_TEXTS.statMetrics.assoziationStaerkeTexte || {
        stark: { de: 'stark', en: 'strong'},
        moderat: { de: 'moderat', en: 'moderate'},
        schwach: { de: 'schwach', en: 'weak'},
        sehr_schwach: { de: 'sehr schwach', en: 'very weak'},
        nicht_bestimmbar: { de: 'nicht bestimmbar', en: 'not determinable'}
    };

    if (isNaN(value)) return texts.nicht_bestimmbar[langKey] || (langKey === 'de' ? 'N/V' : 'N/A');
    const absPhi = Math.abs(value);

    if (absPhi >= 0.5) return texts.stark[langKey] || texts.stark.de;
    if (absPhi >= 0.3) return texts.moderat[langKey] || texts.moderat.de;
    if (absPhi >= 0.1) return texts.schwach[langKey] || texts.schwach.de;
    return texts.sehr_schwach[langKey] || texts.sehr_schwach.de;
}
