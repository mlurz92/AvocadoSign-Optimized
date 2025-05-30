const state = (() => {
    let _currentState = {}; // Wird durch _loadState initialisiert

    let _unsavedCriteriaChanges = false;

    const _saveState = () => {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, _currentState.currentKollektiv);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, _currentState.currentStatistikLayout);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, _currentState.currentStatistikKollektiv1);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, _currentState.currentStatistikKollektiv2);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, _currentState.currentPresentationView);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, _currentState.currentPresentationStudyId);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, _currentState.currentPublikationLang);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, _currentState.currentPublikationSection);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, _currentState.currentPublikationBruteForceMetric);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS, _currentState.criteriaComparisonSets);
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CHART_COLOR_SCHEME, _currentState.chartColorScheme);
        // ActiveTabId wird nicht im LocalStorage gespeichert, Default ist besser.
        // Sortier- und Paging-Zustände werden direkt von ihren Settern gespeichert.
    };

    const _loadState = () => {
        _currentState.currentKollektiv = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        _currentState.currentDatenTableSort = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT) || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT);
        _currentState.currentDatenTablePage = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_PAGE) || 1;
        _currentState.currentAuswertungTableSort = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT) || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
        _currentState.currentAuswertungTablePage = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_PAGE) || 1;
        _currentState.currentStatistikLayout = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) || APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT;
        _currentState.currentStatistikKollektiv1 = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1;
        _currentState.currentStatistikKollektiv2 = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2;
        _currentState.currentPresentationView = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) || APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW;
        _currentState.currentPresentationStudyId = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) || APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID;
        _currentState.currentPublikationLang = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG) || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
        _currentState.currentPublikationSection = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION) || PUBLICATION_CONFIG.defaultSubSection || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION;
        _currentState.currentPublikationBruteForceMetric = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC) || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;
        _currentState.activeTabId = APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || 'daten-tab-pane'; // Default Tab, nicht aus Storage
        _currentState.criteriaComparisonSets = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS) || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS);
        _currentState.chartColorScheme = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CHART_COLOR_SCHEME) || APP_CONFIG.DEFAULT_SETTINGS.CHART_COLOR_SCHEME;
    };

    const init = () => {
        _loadState();
        const firstStartFlag = APP_CONFIG.STORAGE_KEYS.FIRST_APP_START;
        if (loadFromLocalStorage(firstStartFlag) === null && typeof ui_helpers !== 'undefined') {
            setTimeout(() => {
                ui_helpers.showKurzanleitung();
                saveToLocalStorage(firstStartFlag, 'false');
            }, 1000);
        }
    };

    const getCurrentKollektiv = () => _currentState.currentKollektiv;
    const setCurrentKollektiv = (kollektiv) => {
        if (_currentState.currentKollektiv !== kollektiv) {
            _currentState.currentKollektiv = kollektiv;
            _saveState();
        }
    };

    const getAppliedT2Criteria = () => {
        const loaded = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA);
        return loaded ? cloneDeep(loaded) : getDefaultT2Criteria();
    };
    const setAppliedT2Criteria = (criteria) => {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, criteria);
        setUnsavedCriteriaChanges(false);
    };

    const getAppliedT2Logic = () => {
        return loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC) || APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;
    };
    const setAppliedT2Logic = (logic) => {
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, logic);
        setUnsavedCriteriaChanges(false);
    };

    const getCurrentDatenTableSort = () => _currentState.currentDatenTableSort;
    const setCurrentDatenTableSort = (sortState) => {
        _currentState.currentDatenTableSort = sortState;
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT, sortState);
    };
    const getCurrentDatenTablePage = () => _currentState.currentDatenTablePage;
    const setCurrentDatenTablePage = (page) => {
        _currentState.currentDatenTablePage = page;
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_PAGE, page);
    };

    const getCurrentAuswertungTableSort = () => _currentState.currentAuswertungTableSort;
    const setCurrentAuswertungTableSort = (sortState) => {
        _currentState.currentAuswertungTableSort = sortState;
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT, sortState);
    };
    const getCurrentAuswertungTablePage = () => _currentState.currentAuswertungTablePage;
    const setCurrentAuswertungTablePage = (page) => {
        _currentState.currentAuswertungTablePage = page;
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_PAGE, page);
    };


    const getCurrentStatistikLayout = () => _currentState.currentStatistikLayout;
    const setCurrentStatistikLayout = (layout) => {
        if (_currentState.currentStatistikLayout !== layout) {
            _currentState.currentStatistikLayout = layout;
            _saveState();
        }
    };
    const getCurrentStatistikKollektiv1 = () => _currentState.currentStatistikKollektiv1;
    const setCurrentStatistikKollektiv1 = (kollektiv) => {
        if (_currentState.currentStatistikKollektiv1 !== kollektiv) {
            _currentState.currentStatistikKollektiv1 = kollektiv;
            _saveState();
        }
    };
    const getCurrentStatistikKollektiv2 = () => _currentState.currentStatistikKollektiv2;
    const setCurrentStatistikKollektiv2 = (kollektiv) => {
        if (_currentState.currentStatistikKollektiv2 !== kollektiv) {
            _currentState.currentStatistikKollektiv2 = kollektiv;
            _saveState();
        }
    };

    const getCurrentPresentationView = () => _currentState.currentPresentationView;
    const setCurrentPresentationView = (view) => {
        if (_currentState.currentPresentationView !== view) {
            _currentState.currentPresentationView = view;
            _saveState();
        }
    };
    const getCurrentPresentationStudyId = () => _currentState.currentPresentationStudyId;
    const setCurrentPresentationStudyId = (studyId) => {
        if (_currentState.currentPresentationStudyId !== studyId) {
            _currentState.currentPresentationStudyId = studyId;
            _saveState();
        }
    };

    const getCurrentPublikationLang = () => _currentState.currentPublikationLang;
    const setCurrentPublikationLang = (lang) => {
        if (_currentState.currentPublikationLang !== lang) {
            _currentState.currentPublikationLang = lang;
            _saveState();
        }
    };
    const getCurrentPublikationSection = () => _currentState.currentPublikationSection;
    const setCurrentPublikationSection = (sectionId) => {
        if (_currentState.currentPublikationSection !== sectionId) {
            _currentState.currentPublikationSection = sectionId;
            _saveState();
        }
    };
    const getCurrentPublikationBruteForceMetric = () => _currentState.currentPublikationBruteForceMetric;
    const setCurrentPublikationBruteForceMetric = (metric) => {
        if (_currentState.currentPublikationBruteForceMetric !== metric) {
            _currentState.currentPublikationBruteForceMetric = metric;
            _saveState();
        }
    };

    const getUnsavedCriteriaChanges = () => _unsavedCriteriaChanges;
    const setUnsavedCriteriaChanges = (hasChanges) => {
        _unsavedCriteriaChanges = !!hasChanges;
    };

    const getActiveTabId = () => _currentState.activeTabId;
    const setActiveTabId = (tabId) => {
        if (_currentState.activeTabId !== tabId) {
            _currentState.activeTabId = tabId;
            // Nicht im LocalStorage speichern, da der Start-Tab oft der erste ist.
        }
    };

    const getCriteriaComparisonSets = () => cloneDeep(_currentState.criteriaComparisonSets);
    const setCriteriaComparisonSets = (sets) => {
        if (!arraysAreEqual(_currentState.criteriaComparisonSets, sets)) {
            _currentState.criteriaComparisonSets = cloneDeep(sets);
            _saveState();
        }
    };

    const getChartColorScheme = () => _currentState.chartColorScheme;
    const setChartColorScheme = (schemeName) => {
         if (_currentState.chartColorScheme !== schemeName) {
            _currentState.chartColorScheme = schemeName;
            _saveState();
        }
    };


    return Object.freeze({
        init,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getAppliedT2Criteria,
        setAppliedT2Criteria,
        getAppliedT2Logic,
        setAppliedT2Logic,
        getCurrentDatenTableSort,
        setCurrentDatenTableSort,
        getCurrentDatenTablePage,
        setCurrentDatenTablePage,
        getCurrentAuswertungTableSort,
        setCurrentAuswertungTableSort,
        getCurrentAuswertungTablePage,
        setCurrentAuswertungTablePage,
        getCurrentStatistikLayout,
        setCurrentStatistikLayout,
        getCurrentStatistikKollektiv1,
        setCurrentStatistikKollektiv1,
        getCurrentStatistikKollektiv2,
        setCurrentStatistikKollektiv2,
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
        getUnsavedCriteriaChanges,
        setUnsavedCriteriaChanges,
        getActiveTabId,
        setActiveTabId,
        getCriteriaComparisonSets,
        setCriteriaComparisonSets,
        getChartColorScheme,
        setChartColorScheme
    });
})();
