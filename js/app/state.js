const stateManager = (() => {
    let state = {};

    const defaultState = Object.freeze({
        currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        appliedT2Criteria: getDefaultT2Criteria(),
        appliedT2Logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        datenTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
        auswertungTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
        activeTabId: APP_CONFIG.DEFAULT_SETTINGS.activeTabId,
        statistikLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
        statistikKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
        statistikKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
        presentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
        presentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
        publikationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
        publikationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
        publikationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
        bruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC,
        criteriaComparisonSets: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS),
        chartColorScheme: APP_CONFIG.DEFAULT_SETTINGS.CHART_COLOR_SCHEME,
        isFirstAppStart: true // Dieser Wert wird speziell behandelt und nicht direkt aus LocalStorage geladen
    });

    function initialize() {
        const loadedState = {};
        let needsSave = false;

        // Lade alle persistenten Einstellungen aus dem Local Storage
        for (const key in APP_CONFIG.STORAGE_KEYS) {
            const storageKey = APP_CONFIG.STORAGE_KEYS[key];
            if (typeof storageKey === 'string' && storageKey.length > 0) { // Sicherstellen, dass der Schlüssel gültig ist
                const item = loadFromLocalStorage(storageKey);
                if (item !== null) {
                    loadedState[key] = item;
                }
            } else {
                console.warn(`StateManager: Ungültiger STORAGE_KEY für Eigenschaft '${key}' in APP_CONFIG.STORAGE_KEYS.`);
            }
        }

        // Setze Standardwerte für nicht geladene oder nicht-persistente Einstellungen
        for (const key in defaultState) {
            if (!loadedState.hasOwnProperty(key)) {
                loadedState[key] = cloneDeep(defaultState[key]);
                // Markiere, dass ein Speichern notwendig ist, wenn es sich nicht um isFirstAppStart handelt
                if (key !== 'isFirstAppStart') {
                    needsSave = true;
                }
            }
        }
        
        // Spezielle Behandlung für isFirstAppStart
        const firstStartFlag = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.isFirstAppStart);
        if (firstStartFlag === null) { // Wenn der Flag noch nie gesetzt wurde
            loadedState.isFirstAppStart = true;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.isFirstAppStart, false); // Setze ihn für zukünftige Starts auf false
        } else {
            loadedState.isFirstAppStart = firstStartFlag; // Lade den gespeicherten Wert
        }

        state = loadedState;

        // Speichere alle Standardwerte, die beim ersten Start gesetzt wurden
        if (needsSave) {
            _saveAllToLocalStorage();
        }
        _dispatchStateChangedEvent(Object.keys(defaultState));
    }
    
    function _saveAllToLocalStorage() {
        for (const key in state) {
            // isFirstAppStart wird separat behandelt, da es einen initialen Wert hat, der nur einmal gesetzt werden soll
            if (key === 'isFirstAppStart') continue; 
            const storageKey = APP_CONFIG.STORAGE_KEYS[key];
            // Stelle sicher, dass der Schlüssel existiert und nicht leer ist, bevor gespeichert wird
            if (typeof storageKey === 'string' && storageKey.length > 0 && defaultState.hasOwnProperty(key)) {
                saveToLocalStorage(storageKey, state[key]);
            }
        }
    }

    function _dispatchStateChangedEvent(changedKeys = []) {
        const event = new CustomEvent('stateChanged', { detail: { newState: cloneDeep(state), changedKeys: changedKeys } });
        document.dispatchEvent(event);
    }

    function _updateState(key, value) {
        if (state[key] === undefined && !defaultState.hasOwnProperty(key)) {
            console.warn(`StateManager: Versuch, unbekannten State-Key zu setzen: ${key}`);
            return;
        }
        // Nur aktualisieren und speichern, wenn der Wert sich tatsächlich geändert hat
        if (JSON.stringify(state[key]) !== JSON.stringify(value)) {
            state[key] = cloneDeep(value);
            const storageKey = APP_CONFIG.STORAGE_KEYS[key];
            // Stelle sicher, dass der Schlüssel existiert und nicht leer ist, bevor gespeichert wird
            if (typeof storageKey === 'string' && storageKey.length > 0) {
                saveToLocalStorage(storageKey, state[key]);
            }
            _dispatchStateChangedEvent([key]);
        }
    }

    function getCurrentKollektiv() { return state.currentKollektiv; }
    function setCurrentKollektiv(kollektiv) { _updateState('currentKollektiv', kollektiv); }

    function getAppliedT2Criteria() { return cloneDeep(state.appliedT2Criteria); }
    function setAppliedT2Criteria(criteria) { _updateState('appliedT2Criteria', criteria); }

    function getAppliedT2Logic() { return state.appliedT2Logic; }
    function setAppliedT2Logic(logic) { _updateState('appliedT2Logic', logic); }

    function getDatenTableSort() { return cloneDeep(state.datenTableSort); }
    function setDatenTableSort(sortConfig) { _updateState('datenTableSort', sortConfig); }

    function getAuswertungTableSort() { return cloneDeep(state.auswertungTableSort); }
    function setAuswertungTableSort(sortConfig) { _updateState('auswertungTableSort', sortConfig); }
    
    function getActiveTabId() { return state.activeTabId; }
    function setActiveTabId(tabId) { _updateState('activeTabId', tabId); }

    function getCurrentStatsLayout() { return state.statistikLayout; }
    function setCurrentStatsLayout(layout) { _updateState('statistikLayout', layout); }
    
    function getStatsKollektiv1() { return state.statistikKollektiv1; }
    function setStatsKollektiv1(kollektiv) { _updateState('statistikKollektiv1', kollektiv); }

    function getStatsKollektiv2() { return state.statistikKollektiv2; }
    function setStatsKollektiv2(kollektiv) { _updateState('statistikKollektiv2', kollektiv); }

    function getCurrentPresentationView() { return state.presentationView; }
    function setCurrentPresentationView(view) { _updateState('presentationView', view); }

    function getCurrentPresentationStudyId() { return state.presentationStudyId; }
    function setCurrentPresentationStudyId(studyId) { _updateState('presentationStudyId', studyId); }

    function getCurrentPublikationLang() { return state.publikationLang; }
    function setCurrentPublikationLang(lang) { _updateState('publikationLang', lang); }

    function getCurrentPublikationSection() { return state.publikationSection; }
    function setCurrentPublikationSection(section) { _updateState('publikationSection', section); }
    
    function getCurrentPublikationBruteForceMetric() { return state.publikationBruteForceMetric; }
    function setCurrentPublikationBruteForceMetric(metric) { _updateState('publikationBruteForceMetric', metric); }

    function getBruteForceMetric() { return state.bruteForceMetric; }
    function setBruteForceMetric(metric) { _updateState('bruteForceMetric', metric); }
    
    function getCriteriaComparisonSets() { return cloneDeep(state.criteriaComparisonSets); }
    function setCriteriaComparisonSets(sets) { _updateState('criteriaComparisonSets', sets); }

    function getChartColorScheme() { return state.chartColorScheme; }
    function setChartColorScheme(scheme) { _updateState('chartColorScheme', scheme); }

    function isFirstAppStart() { return state.isFirstAppStart; } 
    function setFirstAppStart(value) { 
        // Der Wert wird direkt im Local Storage gespeichert, da er ein einmaliger Flag ist.
        state.isFirstAppStart = !!value; 
        const storageKey = APP_CONFIG.STORAGE_KEYS.isFirstAppStart;
        if (typeof storageKey === 'string' && storageKey.length > 0) {
            saveToLocalStorage(storageKey, state.isFirstAppStart);
        }
        _dispatchStateChangedEvent(['isFirstAppStart']);
    }
    
    function resetStateToDefaults() {
        const keysToReset = Object.keys(defaultState).filter(k => k !== 'isFirstAppStart');
        keysToReset.forEach(key => {
            state[key] = cloneDeep(defaultState[key]);
            const storageKey = APP_CONFIG.STORAGE_KEYS[key];
            if (typeof storageKey === 'string' && storageKey.length > 0) {
                saveToLocalStorage(storageKey, state[key]);
            }
        });
        _dispatchStateChangedEvent(keysToReset);
        ui_helpers.showToast("Alle Einstellungen auf Standardwerte zurückgesetzt.", "info");
    }


    return Object.freeze({
        initialize,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getAppliedT2Criteria,
        setAppliedT2Criteria,
        getAppliedT2Logic,
        setAppliedT2Logic,
        getDatenTableSort,
        setDatenTableSort,
        getAuswertungTableSort,
        setAuswertungTableSort,
        getActiveTabId,
        setActiveTabId,
        getCurrentStatsLayout,
        setCurrentStatsLayout,
        getStatsKollektiv1,
        setStatsKollektiv1,
        getStatsKollektiv2,
        setStatsKollektiv2,
        getCurrentPresentationView,
        setCurrentPresentationView,
        getCurrentPresentationStudyId,
        setCurrentPresentationStudyId,
        getCurrentPublikationLang,
        setCurrentPublikationLang,
        getCurrentPublikationSection,
        setCurrentPublikationSection,
        getCurrentPublikationBruteForceMetric,
        setCurrentPublikationBruteForceMetric,
        getBruteForceMetric,
        setBruteForceMetric,
        getCriteriaComparisonSets,
        setCriteriaComparisonSets,
        getChartColorScheme,
        setChartColorScheme,
        isFirstAppStart,
        setFirstAppStart,
        resetStateToDefaults
    });
})();

window.stateManager = stateManager;

