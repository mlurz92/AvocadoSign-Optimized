const stateManager = (() => {
    const state = {
        currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        appliedT2Criteria: getDefaultT2Criteria(),
        appliedT2Logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        bruteForceResults: {}, // { kollektivId: { result, report, config } }
        activeTabId: 'daten',
        userSettings: {
            datenTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
            auswertungTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
            statsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
            statsKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
            statsKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
            praesentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
            praesentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
            praesentationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
            publikationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
            publikationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
            publikationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
            currentKollektivForBruteForce: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
            bruteForceActiveMetric: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC
        }
    };

    function updateState(newState) {
        Object.keys(newState).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                if (isObject(state[key]) && isObject(newState[key]) && key !== 'bruteForceResults') {
                    state[key] = deepMerge(state[key], newState[key]);
                } else {
                    state[key] = cloneDeep(newState[key]);
                }
            }
        });
        document.dispatchEvent(new CustomEvent('appStateChanged', { detail: { updatedKeys: Object.keys(newState) } }));
    }

    function updateUserSettings(newSettings, persist = true) {
        const oldSettings = cloneDeep(state.userSettings);
        let changed = false;
        Object.keys(newSettings).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(state.userSettings, key)) {
                if (JSON.stringify(state.userSettings[key]) !== JSON.stringify(newSettings[key])) {
                    state.userSettings[key] = cloneDeep(newSettings[key]);
                    if (persist) {
                        const storageKey = APP_CONFIG.STORAGE_KEYS[key.toUpperCase()] || APP_CONFIG.STORAGE_KEYS[key] || `userSetting_${key}`;
                        saveToLocalStorage(storageKey, state.userSettings[key]);
                    }
                    changed = true;
                }
            }
        });
        if (changed) {
            document.dispatchEvent(new CustomEvent('userSettingsChanged', { 
                detail: { 
                    newSettings: cloneDeep(state.userSettings),
                    oldSettings: oldSettings,
                    changedKeys: Object.keys(newSettings).filter(key => JSON.stringify(oldSettings[key]) !== JSON.stringify(state.userSettings[key]))
                } 
            }));
        }
    }

    function loadAppliedT2Criteria() {
        const loadedCriteria = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        if (loadedCriteria) {
            updateState({ appliedT2Criteria: loadedCriteria });
        }
    }

    function saveAppliedT2Criteria() {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, state.appliedT2Criteria);
    }

    function loadAppliedT2Logic() {
        const loadedLogic = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);
        if (loadedLogic) {
            updateState({ appliedT2Logic: loadedLogic });
        }
    }

    function saveAppliedT2Logic() {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, state.appliedT2Logic);
    }

    function loadCurrentKollektiv() {
        const loadedKollektiv = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV);
        if (loadedKollektiv) {
            updateState({ currentKollektiv: loadedKollektiv });
        }
    }

    function saveCurrentKollektiv() {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, state.currentKollektiv);
    }
    
    function setBruteForceResultForKollektiv(kollektivId, resultData) {
        const newBruteForceResults = cloneDeep(state.bruteForceResults);
        newBruteForceResults[kollektivId] = resultData;
        updateState({ bruteForceResults: newBruteForceResults });
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX + kollektivId, resultData);
    }

    function getBruteForceResultForKollektiv(kollektivId) {
        return state.bruteForceResults[kollektivId] || null;
    }

    function loadCurrentBruteForceResult() { // For the globally selected brute force kollektiv
        const kollektivForBf = state.userSettings.currentKollektivForBruteForce || state.currentKollektiv;
        const loadedResult = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX + kollektivForBf);
        if (loadedResult) {
            const newBruteForceResults = cloneDeep(state.bruteForceResults);
            newBruteForceResults[kollektivForBf] = loadedResult;
            updateState({ bruteForceResults: newBruteForceResults });
        }
    }
    
    function getAllBruteForceResultsFromStorage() {
        const results = {};
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT']; // Oder dynamisch aus APP_CONFIG
        kollektive.forEach(kolId => {
            const stored = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX + kolId);
            if (stored) {
                results[kolId] = stored;
            }
        });
        updateState({ bruteForceResults: results });
        return results;
    }


    function setActiveTabId(tabId) {
        if (state.activeTabId !== tabId) {
            updateState({ activeTabId: tabId });
            saveToLocalStorage('activeTabId', tabId); 
        }
    }
    
    function getActiveTabId() {
        const storedTabId = loadFromLocalStorage('activeTabId');
        return storedTabId || state.activeTabId || 'daten';
    }

    function getCurrentHeaderStats() {
        const currentData = dataProcessor.getProcessedDataForSelectedKollektiv(window.PATIENT_RAW_DATA, state.currentKollektiv, state.appliedT2Criteria, state.appliedT2Logic);
        let nPathoPlus = 0;
        let nPathoMinus = 0;
        let nAsPlus = 0;
        let nAsMinus = 0;
        let nT2Plus = 0;
        let nT2Minus = 0;

        currentData.forEach(p => {
            if (p.n_patho_status === '+') nPathoPlus++;
            else if (p.n_patho_status === '-') nPathoMinus++;

            if (p.n_as_status === '+') nAsPlus++;
            else if (p.n_as_status === '-') nAsMinus++;
            
            if (p.n_t2_status === '+') nT2Plus++;
            else if (p.n_t2_status === '-') nT2Minus++;
        });
        
        return {
            kollektiv: state.currentKollektiv,
            anzahlPatienten: currentData.length,
            nPathoPlus: nPathoPlus,
            nPathoMinus: nPathoMinus,
            nAsPlus: nAsPlus,
            nAsMinus: nAsMinus,
            nT2Plus: nT2Plus,
            nT2Minus: nT2Minus
        };
    }
    
    // Expose state for read-only access via a global variable (e.g., राज्य or APP_STATE)
    // This is a common pattern but should be used judiciously.
    // Direct modification of state should only happen via stateManager methods.
    if (typeof window.राज्य === 'undefined') {
        Object.defineProperty(window, 'राज्य', {
            get: () => cloneDeep(state), // Return a deep clone to prevent direct modification
            enumerable: true,
            configurable: false 
        });
    }


    return Object.freeze({
        updateState,
        loadAppliedT2Criteria,
        saveAppliedT2Criteria,
        loadAppliedT2Logic,
        saveAppliedT2Logic,
        loadCurrentKollektiv,
        saveCurrentKollektiv,
        setBruteForceResultForKollektiv,
        getBruteForceResultForKollektiv,
        loadCurrentBruteForceResult,
        getAllBruteForceResultsFromStorage,
        updateUserSettings,
        setActiveTabId,
        getActiveTabId,
        getCurrentHeaderStats,
        // Exposing a getter for the cloned state for read-only purposes might be useful
        // but often, specific getters for parts of the state are preferred.
        // For now, access via window.राज्य (if needed) or specific getters if added.
        // Example of a specific getter:
        // getUserSettings: () => cloneDeep(state.userSettings),
        // getCurrentKollektiv: () => state.currentKollektiv 
        // No direct state exposure here, use window.राज्य if direct read is truly needed.
    });
})();
