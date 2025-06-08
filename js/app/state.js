const state = (() => {
    let currentState = {};

    const defaultState = Object.freeze({
        currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        datenTableSort: utils.cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
        auswertungTableSort: utils.cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
        currentPublikationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
        currentPublikationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
        currentPublikationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
        currentStatsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
        currentStatsKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
        currentStatsKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
        currentPresentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
        currentPresentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
        activeTabId: 'publikation-tab'
    });

    function init() {
        currentState = {
            currentKollektiv: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) ?? defaultState.currentKollektiv,
            currentPublikationLang: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG) ?? defaultState.currentPublikationLang,
            currentPublikationSection: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION) ?? defaultState.currentPublikationSection,
            currentPublikationBruteForceMetric: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC) ?? defaultState.currentPublikationBruteForceMetric,
            currentStatsLayout: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) ?? defaultState.currentStatsLayout,
            currentStatsKollektiv1: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) ?? defaultState.currentStatsKollektiv1,
            currentStatsKollektiv2: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) ?? defaultState.currentStatsKollektiv2,
            currentPresentationView: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) ?? defaultState.currentPresentationView,
            currentPresentationStudyId: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) ?? defaultState.currentPresentationStudyId,
            datenTableSort: utils.cloneDeep(defaultState.datenTableSort),
            auswertungTableSort: utils.cloneDeep(defaultState.auswertungTableSort),
            activeTabId: defaultState.activeTabId
        };
    }

    function _setter(key, storageKey, newValue) {
        if (currentState[key] !== newValue) {
            currentState[key] = newValue;
            utils.saveToLocalStorage(storageKey, newValue);
            return true;
        }
        return false;
    }

    function getCurrentKollektiv() { return currentState.currentKollektiv; }
    function setCurrentKollektiv(newKollektiv) { return _setter('currentKollektiv', APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, newKollektiv); }

    function getDatenTableSort() { return utils.cloneDeep(currentState.datenTableSort); }
    function updateDatenTableSortDirection(key, subKey = null) {
        const sort = currentState.datenTableSort;
        if (sort.key === key && sort.subKey === subKey) {
            sort.direction = sort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sort.key = key;
            sort.direction = 'asc';
            sort.subKey = subKey;
        }
        return true;
    }

    function getAuswertungTableSort() { return utils.cloneDeep(currentState.auswertungTableSort); }
    function updateAuswertungTableSortDirection(key, subKey = null) {
        const sort = currentState.auswertungTableSort;
        if (sort.key === key && sort.subKey === subKey) {
            sort.direction = sort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            sort.key = key;
            sort.direction = 'asc';
            sort.subKey = subKey;
        }
        return true;
    }

    function getCurrentPublikationLang() { return currentState.currentPublikationLang; }
    function setCurrentPublikationLang(newLang) { return _setter('currentPublikationLang', APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, newLang); }

    function getCurrentPublikationSection() { return currentState.currentPublikationSection; }
    function setCurrentPublikationSection(newSectionId) { return _setter('currentPublikationSection', APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, newSectionId); }

    function getCurrentPublikationBruteForceMetric() { return currentState.currentPublikationBruteForceMetric; }
    function setCurrentPublikationBruteForceMetric(newMetric) { return _setter('currentPublikationBruteForceMetric', APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, newMetric); }

    function getCurrentStatsLayout() { return currentState.currentStatsLayout; }
    function setCurrentStatsLayout(newLayout) { return _setter('currentStatsLayout', APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, newLayout); }

    function getCurrentStatsKollektiv1() { return currentState.currentStatsKollektiv1; }
    function setCurrentStatsKollektiv1(newKollektiv) { return _setter('currentStatsKollektiv1', APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, newKollektiv); }

    function getCurrentStatsKollektiv2() { return currentState.currentStatsKollektiv2; }
    function setCurrentStatsKollektiv2(newKollektiv) { return _setter('currentStatsKollektiv2', APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, newKollektiv); }

    function getCurrentPresentationView() { return currentState.currentPresentationView; }
    function setCurrentPresentationView(newView) {
        if (_setter('currentPresentationView', APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, newView)) {
            if (newView === 'as-pur') {
                setCurrentPresentationStudyId(null);
            } else if (!currentState.currentPresentationStudyId) {
                setCurrentPresentationStudyId(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);
            }
            return true;
        }
        return false;
    }
    
    function getCurrentPresentationStudyId() { return currentState.currentPresentationStudyId; }
    function setCurrentPresentationStudyId(newStudyId) { return _setter('currentPresentationStudyId', APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, newStudyId); }

    function getActiveTabId() { return currentState.activeTabId; }
    function setActiveTabId(newTabId) {
        if (typeof newTabId === 'string' && currentState.activeTabId !== newTabId) {
            currentState.activeTabId = newTabId;
            return true;
        }
        return false;
    }

    return Object.freeze({
        init,
        getCurrentKollektiv, setCurrentKollektiv,
        getDatenTableSort, updateDatenTableSortDirection,
        getAuswertungTableSort, updateAuswertungTableSortDirection,
        getCurrentPublikationLang, setCurrentPublikationLang,
        getCurrentPublikationSection, setCurrentPublikationSection,
        getCurrentPublikationBruteForceMetric, setCurrentPublikationBruteForceMetric,
        getCurrentStatsLayout, setCurrentStatsLayout,
        getCurrentStatsKollektiv1, setCurrentStatsKollektiv1,
        getCurrentStatsKollektiv2, setCurrentStatsKollektiv2,
        getCurrentPresentationView, setCurrentPresentationView,
        getCurrentPresentationStudyId, setCurrentPresentationStudyId,
        getActiveTabId, setActiveTabId
    });

})();
