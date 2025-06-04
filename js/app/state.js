const stateManager = (() => {
    let state = {};

    const defaultState = Object.freeze({
        currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        appliedT2Criteria: getDefaultT2Criteria(),
        appliedT2Logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
        datenTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
        auswertungTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
        activeTabId: 'daten-tab-pane',
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
        isFirstAppStart: true
    });

    function initialize() {
        const loadedState = {};
        let needsSave = false;
        for (const key in defaultState) {
            const storageKey = APP_CONFIG.STORAGE_KEYS[key];
            
            if (storageKey) {
                const item = loadFromLocalStorage(storageKey);
                if (item !== null) {
                    loadedState[key] = item;
                } else {
                    loadedState[key] = cloneDeep(defaultState[key]);
                    if (key !== 'isFirstAppStart') { 
                        needsSave = true; 
                    }
                }
            } else {
                loadedState[key] = cloneDeep(defaultState[key]);
                if (key !== 'isFirstAppStart') {
                    console.warn(`Kein Storage Key für State-Eigenschaft '${key}' definiert. Wird nicht persistent gespeichert.`);
                }
            }
        }
        
        if (loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.isFirstAppStart) === null) {
            loadedState.isFirstAppStart = true;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.isFirstAppStart, false); 
        } else {
            loadedState.isFirstAppStart = false;
        }

        state = loadedState;
        if (needsSave) {
            _saveAllToLocalStorage();
        }
        _dispatchStateChangedEvent(Object.keys(defaultState));
    }
    
    function _saveAllToLocalStorage() {
        for (const key in state) {
            if (key === 'isFirstAppStart') continue; 
            const storageKey = APP_CONFIG.STORAGE_KEYS[key];
            if (storageKey && defaultState.hasOwnProperty(key)) {
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
            console.warn(`Versuch, unbekannten State-Key zu setzen: ${key}`);
            return;
        }
        if (JSON.stringify(state[key]) !== JSON.stringify(value)) {
            state[key] = cloneDeep(value);
            const storageKey = APP_CONFIG.STORAGE_KEYS[key];
            if (storageKey) {
                saveToLocalStorage(storageKey, state[key]);
            }
            _dispatchStateChangedEvent([key]);
        }
    }

    function getCurrentKollektiv() { return state.currentKollektiv || defaultState.currentKollektiv; }
    function setCurrentKollektiv(kollektiv) { _updateState('currentKollektiv', kollektiv); }

    function getAppliedT2Criteria() { return cloneDeep(state.appliedT2Criteria || defaultState.appliedT2Criteria); }
    function setAppliedT2Criteria(criteria) { _updateState('appliedT2Criteria', criteria); }

    function getAppliedT2Logic() { return state.appliedT2Logic || defaultState.appliedT2Logic; }
    function setAppliedT2Logic(logic) { _updateState('appliedT2Logic', logic); }

    function getDatenTableSort() { return cloneDeep(state.datenTableSort || defaultState.datenTableSort); }
    function setDatenTableSort(sortConfig) { _updateState('datenTableSort', sortConfig); }

    function getAuswertungTableSort() { return cloneDeep(state.auswertungTableSort || defaultState.auswertungTableSort); }
    function setAuswertungTableSort(sortConfig) { _updateState('auswertungTableSort', sortConfig); }
    
    function getActiveTabId() { return state.activeTabId || defaultState.activeTabId; }
    function setActiveTabId(tabId) { _updateState('activeTabId', tabId); }

    function getCurrentStatsLayout() { return state.statistikLayout || defaultState.statistikLayout; }
    function setCurrentStatsLayout(layout) { _updateState('statistikLayout', layout); }
    
    function getStatsKollektiv1() { return state.statistikKollektiv1 || defaultState.statistikKollektiv1; }
    function setStatsKollektiv1(kollektiv) { _updateState('statistikKollektiv1', kollektiv); }

    function getStatsKollektiv2() { return state.statistikKollektiv2 || defaultState.statistikKollektiv2; }
    function setStatsKollektiv2(kollektiv) { _updateState('statistikKollektiv2', kollektiv); }

    function getCurrentPresentationView() { return state.presentationView || defaultState.presentationView; }
    function setCurrentPresentationView(view) { _updateState('presentationView', view); }

    function getCurrentPresentationStudyId() { return state.presentationStudyId || defaultState.presentationStudyId; }
    function setCurrentPresentationStudyId(studyId) { _updateState('presentationStudyId', studyId); }

    function getCurrentPublikationLang() { return state.publikationLang || defaultState.publikationLang; }
    function setCurrentPublikationLang(lang) { _updateState('publikationLang', lang); }

    function getCurrentPublikationSection() { return state.publikationSection || defaultState.publikationSection; }
    function setCurrentPublikationSection(section) { _updateState('publikationSection', section); }
    
    function getCurrentPublikationBruteForceMetric() { return state.publikationBruteForceMetric || defaultState.publikationBruteForceMetric; }
    function setCurrentPublikationBruteForceMetric(metric) { _updateState('publikationBruteForceMetric', metric); }

    function getBruteForceMetric() { return state.bruteForceMetric || defaultState.bruteForceMetric; }
    function setBruteForceMetric(metric) { _updateState('bruteForceMetric', metric); }
    
    function getCriteriaComparisonSets() { return cloneDeep(state.criteriaComparisonSets || defaultState.criteriaComparisonSets); }
    function setCriteriaComparisonSets(sets) { _updateState('criteriaComparisonSets', sets); }

    function getChartColorScheme() { return state.chartColorScheme || defaultState.chartColorScheme; }
    function setChartColorScheme(scheme) { _updateState('chartColorScheme', scheme); }

    function isFirstAppStart() { return state.isFirstAppStart === true; } 
    function setFirstAppStart(value) { 
        state.isFirstAppStart = !!value; 
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.isFirstAppStart, state.isFirstAppStart);
        _dispatchStateChangedEvent(['isFirstAppStart']);
    }
    
    function resetStateToDefaults() {
        const keysToReset = Object.keys(defaultState).filter(k => k !== 'isFirstAppStart');
        keysToReset.forEach(key => {
            state[key] = cloneDeep(defaultState[key]);
            const storageKey = APP_CONFIG.STORAGE_KEYS[key];
            if (storageKey) {
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
