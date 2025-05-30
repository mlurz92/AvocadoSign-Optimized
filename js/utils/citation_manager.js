const citationManager = (() => {
    let _allReferences = {};
    let _citedOrder = [];
    let _refDetails = {};

    function init() {
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.PUBLICATION_DEFAULTS && APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES) {
            _allReferences = cloneDeep(APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES);
        } else {
            console.error("citationManager.init: APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES is not defined.");
            _allReferences = {};
        }
        reset();
    }

    function reset() {
        _citedOrder = [];
        _refDetails = {};
    }

    function _getRefData(refKey) {
        if (_allReferences.hasOwnProperty(refKey)) {
            return _allReferences[refKey];
        }
        console.warn(`citationManager: Reference key "${refKey}" not found in APP_CONFIG.`);
        return null;
    }

    function _formatRanges(numbers) {
        if (!numbers || numbers.length === 0) {
            return "";
        }
        const sortedUniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
        if (sortedUniqueNumbers.length === 0) {
            return "";
        }

        let result = "";
        let rangeStart = -1;

        for (let i = 0; i < sortedUniqueNumbers.length; i++) {
            const current = sortedUniqueNumbers[i];
            const next = sortedUniqueNumbers[i + 1];

            if (rangeStart === -1) {
                rangeStart = current;
            }

            if (next === undefined || next !== current + 1) {
                if (result.length > 0) {
                    result += ", ";
                }
                if (current === rangeStart) {
                    result += `${current}`;
                } else if (current === rangeStart + 1) {
                    result += `${rangeStart}, ${current}`;
                }
                else {
                    result += `${rangeStart}–${current}`;
                }
                rangeStart = -1;
            }
        }
        return result;
    }

    function cite(refKeysInput) {
        if (!_allReferences || Object.keys(_allReferences).length === 0) {
            console.warn("citationManager.cite: No references initialized. Call init() first if APP_CONFIG is available after load.");
            return "[REFERENCES_NOT_READY]";
        }

        const refKeys = Array.isArray(refKeysInput) ? refKeysInput : [refKeysInput];
        const citationNumbers = [];

        refKeys.forEach(key => {
            if (!key || typeof key !== 'string') {
                console.warn(`citationManager.cite: Invalid reference key provided: ${key}`);
                citationNumbers.push("?");
                return;
            }
            const refData = _getRefData(key);
            if (!refData) {
                citationNumbers.push(`?${key}`);
                return;
            }

            if (!_refDetails.hasOwnProperty(key)) {
                _citedOrder.push(key);
                const number = _citedOrder.length;
                _refDetails[key] = {
                    number: number,
                    data: refData
                };
            }
            citationNumbers.push(_refDetails[key].number);
        });

        if (citationNumbers.some(n => typeof n === 'string')) {
             return `[${citationNumbers.join(", ")}]`;
        }

        const formattedRanges = _formatRanges(citationNumbers);
        return `[${formattedRanges}]`;
    }

    function getShortCitation(refKey, options = {}) {
        const {
            includeYear = false,
            style = (typeof RADIOLOGY_FORMAT_CONFIG !== 'undefined' && RADIOLOGY_FORMAT_CONFIG.citation?.style) || "radiology",
            authorThreshold = (typeof RADIOLOGY_FORMAT_CONFIG !== 'undefined' && RADIOLOGY_FORMAT_CONFIG.citation?.authorDisplayThreshold) || 2,
            etAl = (typeof RADIOLOGY_FORMAT_CONFIG !== 'undefined' && RADIOLOGY_FORMAT_CONFIG.citation?.etAlString) || " et al."
        } = options;

        if (!_refDetails.hasOwnProperty(refKey) && !_allReferences.hasOwnProperty(refKey)) {
            console.warn(`citationManager.getShortCitation: Reference key "${refKey}" not cited yet or not found.`);
            return `[${refKey}_NOT_FOUND]`;
        }

        if (!_refDetails.hasOwnProperty(refKey) && _allReferences.hasOwnProperty(refKey)) {
            cite(refKey);
        }

        const details = _refDetails[refKey];
        if (!details || !details.data) return `[${refKey}_ERROR]`;

        const refNumber = details.number;
        const refData = details.data;

        if (style === "radiology") {
            return `[${refNumber}]`;
        }

        let authorStr = refData.authors_short || "Unknown Author";
        if (refData.authors_list && refData.authors_list.length > authorThreshold) {
            authorStr = refData.authors_list[0].lastName ? `${refData.authors_list[0].lastName}${etAl}` : `${authorStr}${etAl}`;
        } else if (refData.authors_list && refData.authors_list.length > 0) {
            authorStr = refData.authors_list.map(a => a.lastName || a.name).join(" & ");
        }


        let citation = authorStr;
        if (includeYear && refData.year) {
            citation += ` (${refData.year})`;
        }
        citation += ` [${refNumber}]`;
        return citation;
    }

    function getFormattedReferenceList(options = {}) {
        const {
            format = "html",
            startNumber = 1
        } = options;

        if (_citedOrder.length === 0) {
            return format === 'html' ? "<p>No references cited.</p>" : "No references cited.";
        }

        let listItems = "";
        _citedOrder.forEach((refKey) => {
            const details = _refDetails[refKey];
            if (details && details.data) {
                const number = details.number;
                const fullCitation = details.data.full_citation_radiology || `${details.data.authors_short || 'N.A.'} (${details.data.year || 'N.D.'}). Title N/A. Journal N/A. DOI: ${details.data.doi || 'N/A'}`;

                if (format === 'html') {
                    listItems += `<li><span class="ref-number">${number}.</span> <span class="ref-text">${fullCitation}</span></li>\n`;
                } else if (format === 'markdown') {
                    listItems += `${number}. ${fullCitation}\n`;
                }
            }
        });

        if (format === 'html') {
            return `<ol class="publication-references" start="${startNumber}">${listItems}</ol>`;
        } else if (format === 'markdown') {
            return listItems;
        }
        return "Unsupported format for reference list.";
    }

    function getCitedReferences() {
        return _citedOrder.map(key => ({
            key: key,
            number: _refDetails[key]?.number,
            data: cloneDeep(_refDetails[key]?.data)
        }));
    }

    if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.PUBLICATION_DEFAULTS && APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES) {
         _allReferences = (typeof cloneDeep === 'function' ? cloneDeep(APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES) : JSON.parse(JSON.stringify(APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES)));
    } else {
        console.error("citationManager: APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES is not defined at load time.");
    }


    return Object.freeze({
        init,
        reset,
        cite,
        getShortCitation,
        getFormattedReferenceList,
        getCitedReferences
    });
})();
