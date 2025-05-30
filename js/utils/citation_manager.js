const citationManager = (() => {
    let _allReferences = {};
    let _citedOrder = []; // Stores refKeys in order of first citation
    let _refDetails = {}; // Stores { number: X, data: originalRefData } for each cited refKey

    function init() {
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.PUBLICATION_DEFAULTS && APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES) {
            _allReferences = cloneDeep(APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES);
        } else {
            console.error("citationManager: APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES is not defined.");
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
                } else if (current === rangeStart + 1) { // Avoid 1-2, prefer 1, 2
                    result += `${rangeStart}, ${current}`;
                }
                else {
                    result += `${rangeStart}–${current}`; // En-dash
                }
                rangeStart = -1;
            }
        }
        return result;
    }

    function cite(refKeysInput) {
        if (!_allReferences || Object.keys(_allReferences).length === 0) {
            console.warn("citationManager.cite: No references initialized.");
            return "[REFERENCES_NOT_INITIALIZED]";
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
                citationNumbers.push(`?${key}`); // Mark missing ref
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

        if (citationNumbers.some(n => typeof n === 'string')) { // Contains '?' or '?KEY'
             return `[${citationNumbers.join(", ")}]`;
        }

        const formattedRanges = _formatRanges(citationNumbers);
        return `[${formattedRanges}]`;
    }

    function getShortCitation(refKey, options = {}) {
        const {
            includeYear = false,
            style = RADIOLOGY_FORMAT_CONFIG.citation.style || "radiology", // 'radiology' implies numeric only for in-text
            authorThreshold = RADIOLOGY_FORMAT_CONFIG.citation.authorDisplayThreshold || 2,
            etAl = RADIOLOGY_FORMAT_CONFIG.citation.etAlString || " et al."
        } = options;

        if (!_refDetails.hasOwnProperty(refKey) && !_allReferences.hasOwnProperty(refKey)) {
            console.warn(`citationManager.getShortCitation: Reference key "${refKey}" not cited yet or not found.`);
            return `[${refKey}_NOT_FOUND]`;
        }
        
        // Ensure the ref is in _refDetails if it's valid, to get its number
        if (!_refDetails.hasOwnProperty(refKey) && _allReferences.hasOwnProperty(refKey)) {
            cite(refKey); // This will add it and assign a number
        }

        const details = _refDetails[refKey];
        if (!details || !details.data) return `[${refKey}_ERROR]`;

        const refNumber = details.number;
        const refData = details.data;

        if (style === "radiology") { // Standard Radiology numeric citation
            return `[${refNumber}]`;
        }

        // Fallback for other styles (e.g., author_year_number)
        let authorStr = refData.authors_short || "Unknown Author";
        if (refData.authors_list && refData.authors_list.length > authorThreshold) {
            authorStr = refData.authors_list[0].lastName ? `${refData.authors_list[0].lastName}${etAl}` : `${authorStr}${etAl}`;
        } else if (refData.authors_list) {
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
            format = "html", // 'html', 'markdown'
            startNumber = 1
        } = options;

        if (_citedOrder.length === 0) {
            return format === 'html' ? "<p>No references cited.</p>" : "No references cited.";
        }

        let listItems = "";
        _citedOrder.forEach((refKey, index) => {
            const details = _refDetails[refKey];
            if (details && details.data) {
                const number = details.number; // This is already the correct order
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
            // For markdown, if startNumber is not 1, it's harder to represent directly in standard MD list.
            // The generator will need to handle this if a specific start number is required for MD.
            // For now, assume MD list always starts implicitly at 1.
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

    // Initialize with references from APP_CONFIG
    if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.PUBLICATION_DEFAULTS && APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES) {
         _allReferences = cloneDeep(APP_CONFIG.PUBLICATION_DEFAULTS.REFERENCES);
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
