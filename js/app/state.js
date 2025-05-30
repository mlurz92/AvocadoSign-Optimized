const state = (() => {
    let _currentState = {};
    let _unsavedCriteriaChanges = false;

    const _getDefaultSortState = (key) => {
        if (key === APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT) {
            return cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
        } else if (key === APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT) {
            return cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
        }
        return null;
    };

    function initializeState(defaultTabId) {
        _currentState.activeTabId = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.ACTIVE_TAB_ID) || defaultTabId || 'daten-tab-pane';
        _currentState.currentKollektiv = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;

        _currentState.appliedT2Criteria = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA) || getDefaultT2Criteria();
        _currentState.appliedT2Logic = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC) || APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;

        _currentState.currentDatenTableSort = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT) || _getDefaultSortState(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT);
        _currentState.currentAuswertungTableSort = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT) || _getDefaultSortState(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT);
        _currentState.currentDatenTablePage = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_PAGE) || 1;
        _currentState.currentAuswertungTablePage = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_PAGE) || 1;

        _currentState.currentStatistikLayout = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) || APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT;
        _currentState.currentStatistikKollektiv1 = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1;
        _currentState.currentStatistikKollektiv2 = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2;

        _currentState.currentPresentationView = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) || APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW;
        _currentState.currentPresentationStudyId = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) || APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID;

        _currentState.currentPublikationLang = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG) || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
        _currentState.currentPublikationSection = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION) || PUBLICATION_CONFIG.defaultSubSection || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION;
        _currentState.currentPublikationBruteForceMetric = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC) || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;

        _currentState.criteriaComparisonSets = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS) || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS);
        _currentState.chartColorScheme = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CHART_COLOR_SCHEME) || APP_CONFIG.DEFAULT_SETTINGS.CHART_COLOR_SCHEME;
        _currentState.bruteForceMetric = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_METRIC) || APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC;

        if (loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START) === null) {
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, 'false');
            _currentState.showKurzanleitungOnLoad = true;
        } else {
            _currentState.showKurzanleitungOnLoad = false;
        }
    }

    function hasStateChanged(key, newValue) {
        const oldValue = _currentState[key];
        if (typeof oldValue === 'object' && oldValue !== null && typeof newValue === 'object' && newValue !== null) {
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }
        return oldValue !== newValue;
    }

    function getActiveTabId() { return _currentState.activeTabId; }
    function setActiveTabId(tabId) { if(hasStateChanged('activeTabId', tabId)) { _currentState.activeTabId = tabId; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.ACTIVE_TAB_ID, tabId); }}

    function getCurrentKollektiv() { return _currentState.currentKollektiv; }
    function setCurrentKollektiv(kollektiv) { if(hasStateChanged('currentKollektiv', kollektiv)) { _currentState.currentKollektiv = kollektiv; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, kollektiv); }}

    function getAppliedT2Criteria() { return cloneDeep(_currentState.appliedT2Criteria); } // Return a copy
    function setAppliedT2Criteria(criteria) { if(hasStateChanged('appliedT2Criteria', criteria)) { _currentState.appliedT2Criteria = cloneDeep(criteria); saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, criteria); }}

    function getAppliedT2Logic() { return _currentState.appliedT2Logic; }
    function setAppliedT2Logic(logic) { if(hasStateChanged('appliedT2Logic', logic)) { _currentState.appliedT2Logic = logic; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, logic); }}

    function getCurrentDatenTableSort() { return cloneDeep(_currentState.currentDatenTableSort); }
    function setCurrentDatenTableSort(sortState) { if(hasStateChanged('currentDatenTableSort', sortState)) { _currentState.currentDatenTableSort = cloneDeep(sortState); saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT, sortState); }}

    function getCurrentAuswertungTableSort() { return cloneDeep(_currentState.currentAuswertungTableSort); }
    function setCurrentAuswertungTableSort(sortState) { if(hasStateChanged('currentAuswertungTableSort', sortState)) { _currentState.currentAuswertungTableSort = cloneDeep(sortState); saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT, sortState); }}

    function getCurrentDatenTablePage() { return _currentState.currentDatenTablePage; }
    function setCurrentDatenTablePage(page) { const numPage = parseInt(page, 10); if (!isNaN(numPage) && hasStateChanged('currentDatenTablePage', numPage)) { _currentState.currentDatenTablePage = numPage; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_PAGE, numPage); }}

    function getCurrentAuswertungTablePage() { return _currentState.currentAuswertungTablePage; }
    function setCurrentAuswertungTablePage(page) { const numPage = parseInt(page, 10); if (!isNaN(numPage) && hasStateChanged('currentAuswertungTablePage', numPage)) { _currentState.currentAuswertungTablePage = numPage; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_PAGE, numPage); }}

    function getCurrentStatistikLayout() { return _currentState.currentStatistikLayout; }
    function setCurrentStatistikLayout(layout) { if(hasStateChanged('currentStatistikLayout', layout)) { _currentState.currentStatistikLayout = layout; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, layout); }}

    function getCurrentStatistikKollektiv1() { return _currentState.currentStatistikKollektiv1; }
    function setCurrentStatistikKollektiv1(kollektiv) { if(hasStateChanged('currentStatistikKollektiv1', kollektiv)) { _currentState.currentStatistikKollektiv1 = kollektiv; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, kollektiv); }}

    function getCurrentStatistikKollektiv2() { return _currentState.currentStatistikKollektiv2; }
    function setCurrentStatistikKollektiv2(kollektiv) { if(hasStateChanged('currentStatistikKollektiv2', kollektiv)) { _currentState.currentStatistikKollektiv2 = kollektiv; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, kollektiv); }}

    function getCurrentPresentationView() { return _currentState.currentPresentationView; }
    function setCurrentPresentationView(view) { if(hasStateChanged('currentPresentationView', view)) { _currentState.currentPresentationView = view; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, view); }}

    function getCurrentPresentationStudyId() { return _currentState.currentPresentationStudyId; }
    function setCurrentPresentationStudyId(studyId) { if(hasStateChanged('currentPresentationStudyId', studyId)) { _currentState.currentPresentationStudyId = studyId; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, studyId); }}

    function getCurrentPublikationLang() { return _currentState.currentPublikationLang; }
    function setCurrentPublikationLang(lang) { if(hasStateChanged('currentPublikationLang', lang)) { _currentState.currentPublikationLang = lang; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, lang); }}

    function getCurrentPublikationSection() { return _currentState.currentPublikationSection; }
    function setCurrentPublikationSection(sectionId) { if(hasStateChanged('currentPublikationSection', sectionId)) { _currentState.currentPublikationSection = sectionId; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, sectionId); }}

    function getCurrentPublikationBruteForceMetric() { return _currentState.currentPublikationBruteForceMetric; }
    function setCurrentPublikationBruteForceMetric(metric) { if(hasStateChanged('currentPublikationBruteForceMetric', metric)) { _currentState.currentPublikationBruteForceMetric = metric; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, metric); }}

    function getUnsavedCriteriaChanges() { return _unsavedCriteriaChanges; }
    function setUnsavedCriteriaChanges(hasChanges) { _unsavedCriteriaChanges = !!hasChanges; }

    function getCriteriaComparisonSets() { return cloneDeep(_currentState.criteriaComparisonSets); }
    function setCriteriaComparisonSets(sets) { if (Array.isArray(sets) && hasStateChanged('criteriaComparisonSets', sets)) { _currentState.criteriaComparisonSets = cloneDeep(sets); saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS, sets); }}

    function getChartColorScheme() { return _currentState.chartColorScheme; }
    function setChartColorScheme(scheme) { if(hasStateChanged('chartColorScheme', scheme)) { _currentState.chartColorScheme = scheme; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CHART_COLOR_SCHEME, scheme); }}

    function getBruteForceMetric() { return _currentState.bruteForceMetric; }
    function setBruteForceMetric(metric) { if (hasStateChanged('bruteForceMetric', metric)) { _currentState.bruteForceMetric = metric; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_METRIC, metric); }}

    function shouldShowKurzanleitungOnLoad() { return _currentState.showKurzanleitungOnLoad; }
    function setKurzanleitungShown() { _currentState.showKurzanleitungOnLoad = false; }


    return Object.freeze({
        initializeState,
        getActiveTabId, setActiveTabId,
        getCurrentKollektiv, setCurrentKollektiv,
        getAppliedT2Criteria, setAppliedT2Criteria,
        getAppliedT2Logic, setAppliedT2Logic,
        getCurrentDatenTableSort, setCurrentDatenTableSort,
        getCurrentAuswertungTableSort, setCurrentAuswertungTableSort,
        getCurrentDatenTablePage, setCurrentDatenTablePage,
        getCurrentAuswertungTablePage, setCurrentAuswertungTablePage,
        getCurrentStatistikLayout, setCurrentStatistikLayout,
        getCurrentStatistikKollektiv1, setCurrentStatistikKollektiv1,
        getCurrentStatistikKollektiv2, setCurrentStatistikKollektiv2,
        getCurrentPresentationView, setCurrentPresentationView,
        getCurrentPresentationStudyId, setCurrentPresentationStudyId,
        getCurrentPublikationLang, setCurrentPublikationLang,
        getCurrentPublikationSection, setCurrentPublikationSection,
        getCurrentPublikationBruteForceMetric, setCurrentPublikationBruteForceMetric,
        getUnsavedCriteriaChanges, setUnsavedCriteriaChanges,
        getCriteriaComparisonSets, setCriteriaComparisonSets,
        getChartColorScheme, setChartColorScheme,
        getBruteForceMetric, setBruteForceMetric,
        shouldShowKurzanleitungOnLoad, setKurzanleitungShown
    });
})();
