const stateManager = (() => {
    const state = {
        currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        appliedT2Criteria: getDefaultT2Criteria(), // Uses function from app_config.js
        appliedT2Logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        bruteForceResults: {}, // Format: { kollektivId: { result, report, config, timestamp, metricName, metricValue } }
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
            currentKollektivForBruteForce: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV, // Kollektiv for which BF was last run/viewed
            bruteForceActiveMetric: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC // Target metric for running BF
        }
    };

    function updateState(newState) {
        let hasChanged = false;
        Object.keys(newState).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(state, key)) {
                const oldValue = JSON.stringify(state[key]);
                if (isObject(state[key]) && isObject(newState[key]) && key !== 'bruteForceResults' && !Array.isArray(state[key])) {
                    state[key] = deepMerge(state[key], newState[key]);
                } else {
                    state[key] = cloneDeep(newState[key]);
                }
                if (JSON.stringify(state[key]) !== oldValue) {
                    hasChanged = true;
                }
            }
        });
        if (hasChanged) {
            document.dispatchEvent(new CustomEvent('appStateChanged', { detail: { updatedKeys: Object.keys(newState), newState: cloneDeep(state) } }));
        }
    }

    function updateUserSettings(newSettings, persist = true) {
        const oldSettings = cloneDeep(state.userSettings);
        let changed = false;
        const changedKeysList = [];

        Object.keys(newSettings).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(state.userSettings, key)) {
                if (JSON.stringify(state.userSettings[key]) !== JSON.stringify(newSettings[key])) {
                    state.userSettings[key] = cloneDeep(newSettings[key]);
                    if (persist) {
                        const storageKey = APP_CONFIG.STORAGE_KEYS[key.toUpperCase()] || 
                                         Object.keys(APP_CONFIG.STORAGE_KEYS).find(k => k.toLowerCase() === key.toLowerCase()) || 
                                         `userSetting_${key}`;
                        saveToLocalStorage(storageKey, state.userSettings[key]);
                    }
                    changed = true;
                    changedKeysList.push(key);
                }
            }
        });

        if (changed) {
            document.dispatchEvent(new CustomEvent('userSettingsChanged', { 
                detail: { 
                    newSettings: cloneDeep(state.userSettings),
                    oldSettings: oldSettings,
                    changedKeys: changedKeysList
                } 
            }));
        }
    }

    function loadAppliedT2Criteria() {
        const loadedCriteria = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        if (loadedCriteria && typeof loadedCriteria === 'object') {
            let isValid = true;
            const defaultKeys = Object.keys(getDefaultT2Criteria());
            for (const key of defaultKeys) {
                if (!Object.prototype.hasOwnProperty.call(loadedCriteria, key)) {
                    isValid = false;
                    break;
                }
                if (typeof loadedCriteria[key] === 'object' && loadedCriteria[key] !== null) {
                     if (typeof loadedCriteria[key].active !== 'boolean') isValid = false;
                } else if (key === 'logic' && typeof loadedCriteria[key] !== 'string') {
                    isValid = false;
                }
            }
            if (isValid) {
                updateState({ appliedT2Criteria: loadedCriteria });
            } else {
                 console.warn("Geladene T2-Kriterien aus LocalStorage sind ungültig, verwende Standard.");
                 updateState({ appliedT2Criteria: getDefaultT2Criteria() });
            }
        } else {
            updateState({ appliedT2Criteria: getDefaultT2Criteria() });
        }
    }

    function saveAppliedT2Criteria() {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, state.appliedT2Criteria);
    }

    function loadAppliedT2Logic() {
        const loadedLogic = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC);
        if (loadedLogic && (loadedLogic === 'UND' || loadedLogic === 'ODER' || loadedLogic === 'KOMBINIERT')) {
            updateState({ appliedT2Logic: loadedLogic });
        } else {
             updateState({ appliedT2Logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC });
        }
    }

    function saveAppliedT2Logic() {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, state.appliedT2Logic);
    }

    function loadCurrentKollektiv() {
        const loadedKollektiv = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV);
        const validKollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        if (loadedKollektiv && validKollektive.includes(loadedKollektiv)) {
            updateState({ currentKollektiv: loadedKollektiv });
        } else {
            updateState({ currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV });
        }
    }

    function saveCurrentKollektiv() {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, state.currentKollektiv);
    }
    
    function setBruteForceResultForKollektiv(kollektivId, resultData) {
        const newBruteForceResults = cloneDeep(state.bruteForceResults);
        newBruteForceResults[kollektivId] = resultData; // resultData = { result (best), report, config, timestamp, metricName, metricValue }
        updateState({ bruteForceResults: newBruteForceResults });
        if(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX){
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX + kollektivId, resultData);
        }
    }

    function getBruteForceResultForKollektiv(kollektivId) {
        return state.bruteForceResults[kollektivId] || null;
    }

    function loadCurrentBruteForceResult() { 
        const kollektivForBf = state.userSettings.currentKollektivForBruteForce || state.currentKollektiv;
        if(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX){
            const loadedResult = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX + kollektivForBf);
            if (loadedResult) {
                const newBruteForceResults = cloneDeep(state.bruteForceResults);
                newBruteForceResults[kollektivForBf] = loadedResult;
                updateState({ bruteForceResults: newBruteForceResults });
            }
        }
    }
    
    function getAllBruteForceResultsFromStorage() {
        const results = {};
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT']; 
        if(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX){
            kollektive.forEach(kolId => {
                const stored = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_RESULTS_PREFIX + kolId);
                if (stored) {
                    results[kolId] = stored;
                }
            });
        }
        updateState({ bruteForceResults: results });
        return results;
    }

    function setActiveTabId(tabId) {
        const validTabs = ['daten', 'auswertung', 'statistik', 'praesentation', 'publikation', 'export'];
        if (validTabs.includes(tabId) && state.activeTabId !== tabId) {
            updateState({ activeTabId: tabId });
            saveToLocalStorage('activeTabId_v2', tabId); 
        }
    }
    
    function getActiveTabId() {
        const storedTabId = loadFromLocalStorage('activeTabId_v2');
        const validTabs = ['daten', 'auswertung', 'statistik', 'praesentation', 'publikation', 'export'];
        return (storedTabId && validTabs.includes(storedTabId)) ? storedTabId : (state.activeTabId || 'daten');
    }

    function getCurrentHeaderStats() {
        if (typeof dataProcessor === 'undefined' || typeof mainAppInterface === 'undefined' || typeof mainAppInterface.getProcessedData === 'undefined') {
            return { kollektiv: state.currentKollektiv, anzahlPatienten: 0, nPathoPlus: 0, nPathoMinus: 0, nAsPlus: 0, nAsMinus: 0, nT2Plus: 0, nT2Minus: 0 };
        }
        // Ensure to use the current processed data, which is already evaluated for T2 criteria
        const currentData = dataProcessor.filterDataByKollektiv(mainAppInterface.getProcessedData(), state.currentKollektiv);
        let nPathoPlus = 0;
        let nPathoMinus = 0;
        let nAsPlus = 0;
        let nAsMinus = 0;
        let nT2Plus = 0;
        let nT2Minus = 0;

        if (Array.isArray(currentData)) {
            currentData.forEach(p => {
                if (p.n === '+') nPathoPlus++;
                else if (p.n === '-') nPathoMinus++;

                if (p.as === '+') nAsPlus++;
                else if (p.as === '-') nAsMinus++;
                
                if (p.t2 === '+') nT2Plus++;
                else if (p.t2 === '-') nT2Minus++;
            });
        }
        
        return {
            kollektiv: state.currentKollektiv,
            anzahlPatienten: Array.isArray(currentData) ? currentData.length : 0,
            nPathoPlus: nPathoPlus,
            nPathoMinus: nPathoMinus,
            nAsPlus: nAsPlus,
            nAsMinus: nAsMinus,
            nT2Plus: nT2Plus,
            nT2Minus: nT2Minus
        };
    }
    
    if (typeof window.राज्य === 'undefined') {
        Object.defineProperty(window, 'राज्य', {
            get: () => cloneDeep(state), 
            enumerable: true,
            configurable: false 
        });
    }

    return Object.freeze({
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
        // Direkter Zugriff auf State-Variablen über Getter, die Klone zurückgeben
        getCurrentKollektiv: () => state.currentKollektiv,
        getAppliedT2Criteria: () => cloneDeep(state.appliedT2Criteria),
        getAppliedT2Logic: () => state.appliedT2Logic,
        getUserSettings: () => cloneDeep(state.userSettings),
        getAllBruteForceResults: () => cloneDeep(state.bruteForceResults),
        getCurrentPublikationLang: () => state.userSettings.publikationLang,
        getCurrentPublikationSection: () => state.userSettings.publikationSection,
        getCurrentPublikationBruteForceMetric: () => state.userSettings.publikationBruteForceMetric,
        getCurrentStatsLayout: () => state.userSettings.statsLayout,
        getCurrentStatsKollektiv1: () => state.userSettings.statsKollektiv1,
        getCurrentStatsKollektiv2: () => state.userSettings.statsKollektiv2,
        getCurrentPresentationView: () => state.userSettings.praesentationView,
        getCurrentPresentationStudyId: () => state.userSettings.praesentationStudyId
    });
})();
