const state = (() => {
    let _initialized = false;
    let _previousTabId = null;

    let _activeTabId = null;
    let _currentKollektiv = null;
    let _appliedT2Criteria = null;
    let _appliedT2Logic = null;
    let _datenSortState = null;
    let _auswertungSortState = null;
    let _bruteForceState = 'idle';
    let _currentStatsLayout = null;
    let _currentStatsKollektiv1 = null;
    let _currentStatsKollektiv2 = null;
    let _currentPresentationView = null;
    let _currentPresentationStudyId = null;
    let _currentPublikationLang = null;
    let _currentPublikationSection = null;
    let _currentPublikationBruteForceMetric = null;
    let _currentCriteriaComparisonSets = null;
    let _currentChartColorScheme = null;
    let _forceTabRefresh = false;


    function initialize(initialSettings = {}) {
        if (_initialized) {
            console.warn("State Modul wurde bereits initialisiert.");
            return;
        }

        // Stelle sicher, dass Abhängigkeiten wie APP_CONFIG und utils-Funktionen (loadFromLocalStorage) hier verfügbar sind.
        // Dies wird durch die Ladereihenfolge in index.html sichergestellt.
        if (typeof APP_CONFIG === 'undefined' || typeof getDefaultT2Criteria === 'undefined' || typeof loadFromLocalStorage === 'undefined') {
            console.error("State-Initialisierung fehlgeschlagen: Kritische Abhängigkeiten (APP_CONFIG, getDefaultT2Criteria, loadFromLocalStorage) nicht verfügbar.");
            // Hier könnte eine robustere Fehlerbehandlung erfolgen, z.B. das Werfen eines Fehlers,
            // um die weitere Ausführung der Anwendung zu stoppen, da der State essentiell ist.
            // Fürs Erste belassen wir es bei der Konsolenausgabe und dem Versuch, mit Defaults weiterzumachen.
        }

        const defaults = APP_CONFIG?.DEFAULT_SETTINGS || {}; // Fallback für defaults
        const storageKeys = APP_CONFIG?.STORAGE_KEYS || {}; // Fallback für storageKeys

        _activeTabId = loadFromLocalStorage(storageKeys.ACTIVE_TAB_ID) || initialSettings.activeTabId || defaults.ACTIVE_TAB_ID || 'daten-tab';
        _previousTabId = _activeTabId;
        _currentKollektiv = loadFromLocalStorage(storageKeys.CURRENT_KOLLEKTIV) || initialSettings.currentKollektiv || defaults.KOLLEKTIV || 'Gesamt';
        
        // getDefaultT2Criteria ist in app_config.js definiert und sollte hier verfügbar sein.
        const defaultCriteria = typeof getDefaultT2Criteria === 'function' ? getDefaultT2Criteria() : {};
        _appliedT2Criteria = loadFromLocalStorage(storageKeys.APPLIED_CRITERIA) || initialSettings.appliedT2Criteria || defaultCriteria;
        _appliedT2Logic = loadFromLocalStorage(storageKeys.APPLIED_LOGIC) || initialSettings.appliedT2Logic || defaults.T2_LOGIC || 'UND';
        
        _datenSortState = loadFromLocalStorage(storageKeys.DATEN_TABLE_SORT) || cloneDeep(defaults.DATEN_TABLE_SORT) || { key: 'nr', direction: 'asc', subKey: null };
        _auswertungSortState = loadFromLocalStorage(storageKeys.AUSWERTUNG_TABLE_SORT) || cloneDeep(defaults.AUSWERTUNG_TABLE_SORT) || { key: 'nr', direction: 'asc', subKey: null };

        _bruteForceState = initialSettings.bruteForceState || 'idle';

        _currentStatsLayout = loadFromLocalStorage(storageKeys.STATS_LAYOUT) || initialSettings.statsLayout || defaults.STATS_LAYOUT || 'einzel';
        _currentStatsKollektiv1 = loadFromLocalStorage(storageKeys.STATS_KOLLEKTIV1) || initialSettings.statsKollektiv1 || defaults.STATS_KOLLEKTIV1 || 'Gesamt';
        _currentStatsKollektiv2 = loadFromLocalStorage(storageKeys.STATS_KOLLEKTIV2) || initialSettings.statsKollektiv2 || defaults.STATS_KOLLEKTIV2 || 'nRCT';
        
        _currentPresentationView = loadFromLocalStorage(storageKeys.PRESENTATION_VIEW) || initialSettings.presentationView || defaults.PRESENTATION_VIEW || 'as-pur';
        _currentPresentationStudyId = loadFromLocalStorage(storageKeys.PRESENTATION_STUDY_ID); // Default ist null, keine explizite Fallback-String-Zuweisung hier
        if (_currentPresentationStudyId === undefined && initialSettings.presentationStudyId !== undefined) _currentPresentationStudyId = initialSettings.presentationStudyId;
        else if (_currentPresentationStudyId === undefined && defaults.PRESENTATION_STUDY_ID !== undefined) _currentPresentationStudyId = defaults.PRESENTATION_STUDY_ID;


        _currentPublikationLang = loadFromLocalStorage(storageKeys.PUBLIKATION_LANG) || initialSettings.publikationLang || defaults.PUBLIKATION_LANG || 'de';
        _currentPublikationSection = loadFromLocalStorage(storageKeys.PUBLIKATION_SECTION) || initialSettings.publikationSection || defaults.PUBLIKATION_SECTION || 'methoden';
        _currentPublikationBruteForceMetric = loadFromLocalStorage(storageKeys.PUBLIKATION_BRUTE_FORCE_METRIC) || initialSettings.publikationBruteForceMetric || defaults.PUBLIKATION_BRUTE_FORCE_METRIC || 'Balanced Accuracy';
        
        _currentCriteriaComparisonSets = loadFromLocalStorage(storageKeys.CRITERIA_COMPARISON_SETS) || cloneDeep(defaults.CRITERIA_COMPARISON_SETS) || [];
        _currentChartColorScheme = loadFromLocalStorage(storageKeys.CHART_COLOR_SCHEME) || initialSettings.chartColorScheme || defaults.CHART_COLOR_SCHEME || 'default';

        _forceTabRefresh = false;
        _initialized = true;
        console.log("State Modul initialisiert.");
    }

    function setActiveTabId(tabId) {
        if (tabId && typeof tabId === 'string') {
            if (_activeTabId !== tabId) _previousTabId = _activeTabId;
            _activeTabId = tabId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.ACTIVE_TAB_ID, _activeTabId);
        }
    }
    function getActiveTabId() { return _activeTabId; }
    function getPreviousTabId() { return _previousTabId; }

    function setCurrentKollektiv(kollektiv) {
        if (kollektiv && typeof kollektiv === 'string') {
            _currentKollektiv = kollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, _currentKollektiv);
        }
    }
    function getCurrentKollektiv() { return _currentKollektiv; }

    function setAppliedT2Criteria(criteria) {
        if (criteria && typeof criteria === 'object') {
            _appliedT2Criteria = cloneDeep(criteria);
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA, _appliedT2Criteria);
        }
    }
    function getAppliedT2Criteria() { return cloneDeep(_appliedT2Criteria); }

    function setAppliedT2Logic(logic) {
        if (logic && (logic === 'UND' || logic === 'ODER' || logic === 'KOMBINIERT')) {
            _appliedT2Logic = logic;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.APPLIED_LOGIC, _appliedT2Logic);
        }
    }
    function getAppliedT2Logic() { return _appliedT2Logic; }

    function setCurrentDatenSortState(sortState) {
        if (sortState && typeof sortState === 'object' && sortState.key && sortState.direction) {
            _datenSortState = cloneDeep(sortState);
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT, _datenSortState);
        }
    }
    function getCurrentDatenSortState() { return cloneDeep(_datenSortState); }

    function setCurrentAuswertungSortState(sortState) {
        if (sortState && typeof sortState === 'object' && sortState.key && sortState.direction) {
            _auswertungSortState = cloneDeep(sortState);
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT, _auswertungSortState);
        }
    }
    function getCurrentAuswertungSortState() { return cloneDeep(_auswertungSortState); }
    
    function setBruteForceState(newState) {
        if (['idle', 'start', 'started', 'progress', 'result', 'cancelled', 'error'].includes(newState)) {
            _bruteForceState = newState;
        }
    }
    function getBruteForceState() { return _bruteForceState; }

    function setCurrentStatsLayout(layout) {
        if (layout === 'einzel' || layout === 'vergleich') {
            _currentStatsLayout = layout;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, _currentStatsLayout);
        }
    }
    function getCurrentStatsLayout() { return _currentStatsLayout; }

    function setCurrentStatsKollektiv1(kollektiv) {
        if (kollektiv) { _currentStatsKollektiv1 = kollektiv; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, _currentStatsKollektiv1); }
    }
    function getCurrentStatsKollektiv1() { return _currentStatsKollektiv1; }

    function setCurrentStatsKollektiv2(kollektiv) {
        if (kollektiv) { _currentStatsKollektiv2 = kollektiv; saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, _currentStatsKollektiv2); }
    }
    function getCurrentStatsKollektiv2() { return _currentStatsKollektiv2; }

    function setCurrentPresentationView(view) {
        if (view === 'as-pur' || view === 'as-vs-t2') {
            _currentPresentationView = view;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, _currentPresentationView);
        }
    }
    function getCurrentPresentationView() { return _currentPresentationView; }

    function setCurrentPresentationStudyId(studyId) { 
        _currentPresentationStudyId = studyId; // Erlaube null/undefined explizit
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, _currentPresentationStudyId);
    }
    function getCurrentPresentationStudyId() { return _currentPresentationStudyId; }
    
    function setCurrentPublikationLang(lang) {
        if (lang === 'de' || lang === 'en') {
            _currentPublikationLang = lang;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, _currentPublikationLang);
        }
    }
    function getCurrentPublikationLang() { return _currentPublikationLang; }

    function setCurrentPublikationSection(sectionId) {
        if (sectionId && typeof sectionId === 'string') {
            _currentPublikationSection = sectionId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, _currentPublikationSection);
        }
    }
    function getCurrentPublikationSection() { return _currentPublikationSection; }
    
    function setCurrentPublikationBruteForceMetric(metric) {
        if (metric && typeof metric === 'string') {
            _currentPublikationBruteForceMetric = metric;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, _currentPublikationBruteForceMetric);
        }
    }
    function getCurrentPublikationBruteForceMetric() { return _currentPublikationBruteForceMetric; }

    function setCurrentCriteriaComparisonSets(sets) {
        if (Array.isArray(sets)) {
            _currentCriteriaComparisonSets = cloneDeep(sets);
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS, _currentCriteriaComparisonSets);
        }
    }
    function getCurrentCriteriaComparisonSets() { return cloneDeep(_currentCriteriaComparisonSets); }

    function setCurrentChartColorScheme(scheme) {
        if (scheme && typeof scheme === 'string') {
            _currentChartColorScheme = scheme;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CHART_COLOR_SCHEME, _currentChartColorScheme);
        }
    }
    function getCurrentChartColorScheme() { return _currentChartColorScheme; }

    function setForceTabRefresh(value = true) { _forceTabRefresh = !!value; }
    function getForceTabRefresh() { return _forceTabRefresh; }
    function clearForceTabRefresh() { _forceTabRefresh = false; }


    return Object.freeze({
        initialize,
        setActiveTabId,
        getActiveTabId,
        getPreviousTabId,
        setCurrentKollektiv,
        getCurrentKollektiv,
        setAppliedT2Criteria,
        getAppliedT2Criteria,
        setAppliedT2Logic,
        getAppliedT2Logic,
        setCurrentDatenSortState,
        getCurrentDatenSortState,
        setCurrentAuswertungSortState,
        getCurrentAuswertungSortState,
        setBruteForceState,
        getBruteForceState,
        setCurrentStatsLayout,
        getCurrentStatsLayout,
        setCurrentStatsKollektiv1,
        getCurrentStatsKollektiv1,
        setCurrentStatsKollektiv2,
        getCurrentStatsKollektiv2,
        setCurrentPresentationView,
        getCurrentPresentationView,
        setCurrentPresentationStudyId,
        getCurrentPresentationStudyId,
        setCurrentPublikationLang,
        getCurrentPublikationLang,
        setCurrentPublikationSection,
        getCurrentPublikationSection,
        setCurrentPublikationBruteForceMetric,
        getCurrentPublikationBruteForceMetric,
        setCurrentCriteriaComparisonSets,
        getCurrentCriteriaComparisonSets,
        setCurrentChartColorScheme,
        getCurrentChartColorScheme,
        setForceTabRefresh,
        getForceTabRefresh,
        clearForceTabRefresh
    });
})();
