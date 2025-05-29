const state = (() => {
    let _currentState = {};

    const _defaultT2Criteria = getDefaultT2Criteria();

    function _getInitialState() {
        return {
            appliedT2Criteria: cloneDeep(_defaultT2Criteria),
            appliedT2Logic: APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
            currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
            currentPublikationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
            currentPublikationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
            currentPublikationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
            currentStatsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
            currentStatsKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
            currentStatsKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
            currentPresentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
            currentPresentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
            criteriaComparisonSets: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS),
            currentChartColorScheme: APP_CONFIG.DEFAULT_SETTINGS.CHART_COLOR_SCHEME,
            isFirstAppStart: true // Wird in loadState überschrieben, falls nicht der erste Start
        };
    }

    function _saveStateToLocalStorage() {
        try {
            Object.keys(_currentState).forEach(key => {
                const storageKeyConstant = key.replace(/([A-Z])/g, '_$1').toUpperCase(); // z.B. currentKollektiv -> CURRENT_KOLLEKTIV
                if (APP_CONFIG.STORAGE_KEYS[storageKeyConstant]) {
                    const valueToStore = _currentState[key];
                    localStorage.setItem(APP_CONFIG.STORAGE_KEYS[storageKeyConstant], JSON.stringify(valueToStore));
                }
            });
        } catch (error) {
            console.error("Fehler beim Speichern des Zustands im Local Storage:", error);
            if (error.name === 'QuotaExceededError') {
                 ui_helpers.showToast("Speicherlimit des Browsers erreicht. Einige Einstellungen konnten nicht gespeichert werden.", "danger", 7000);
            }
        }
    }

    function loadStateFromLocalStorage() {
        _currentState = _getInitialState(); // Beginne mit Defaults
        try {
            const firstStartStored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START);
            if (firstStartStored !== null) {
                _currentState.isFirstAppStart = JSON.parse(firstStartStored);
            }

            Object.keys(APP_CONFIG.STORAGE_KEYS).forEach(keyConstant => {
                const storageKey = APP_CONFIG.STORAGE_KEYS[keyConstant];
                const storedValue = localStorage.getItem(storageKey);
                if (storedValue !== null) {
                    // Finde den passenden _currentState Schlüssel (z.B. CURRENT_KOLLEKTIV -> currentKollektiv)
                    const stateKey = keyConstant.toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
                    if (_currentState.hasOwnProperty(stateKey)) {
                         try {
                             _currentState[stateKey] = JSON.parse(storedValue);
                         } catch (e) {
                             console.warn(`Ungültiger JSON-Wert im LocalStorage für ${storageKey}: ${storedValue}. Verwende Standardwert.`);
                             // Standardwert ist bereits in _currentState durch _getInitialState()
                         }
                    }
                }
            });
             // Spezifische Behandlung für Objekte, um sicherzustellen, dass sie korrekte Defaults haben, falls Teile fehlen
            if (!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.APPLIED_CRITERIA)) {
                _currentState.appliedT2Criteria = cloneDeep(_defaultT2Criteria);
            } else {
                // Ensure loaded criteria have all keys, even if saved with an older structure
                const loadedCriteria = _currentState.appliedT2Criteria;
                _currentState.appliedT2Criteria = { ...cloneDeep(_defaultT2Criteria), ...cloneDeep(loadedCriteria) };
                // Ensure sub-objects like 'size' also have all their default keys if partially saved
                Object.keys(_defaultT2Criteria).forEach(critKey => {
                    if (typeof _defaultT2Criteria[critKey] === 'object' && _defaultT2Criteria[critKey] !== null) {
                        _currentState.appliedT2Criteria[critKey] = { ..._defaultT2Criteria[critKey], ...(loadedCriteria[critKey] || {}) };
                    }
                });
            }

            if (!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS)) {
                 _currentState.criteriaComparisonSets = cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS);
            }


        } catch (error) {
            console.error("Fehler beim Laden des Zustands aus dem Local Storage:", error);
            _currentState = _getInitialState(); // Fallback auf Defaults bei schwerem Fehler
        }
        return _currentState.isFirstAppStart;
    }

    function resetStateToDefaults() {
        _currentState = _getInitialState();
        _currentState.isFirstAppStart = false; // Nach Reset ist es nicht mehr der "erste Start" im Sinne von Default-Anzeige
        _saveStateToLocalStorage(); // Speichere die zurückgesetzten Standardwerte
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, JSON.stringify(false)); // Explizit setzen
        console.info("Anwendungszustand auf Standardwerte zurückgesetzt.");
    }


    function getAppliedT2Criteria() { return cloneDeep(_currentState.appliedT2Criteria); }
    function setAppliedT2Criteria(criteria) { _currentState.appliedT2Criteria = cloneDeep(criteria); _saveStateToLocalStorage(); }

    function getAppliedT2Logic() { return _currentState.appliedT2Logic; }
    function setAppliedT2Logic(logic) { _currentState.appliedT2Logic = logic; _saveStateToLocalStorage(); }

    function getCurrentKollektiv() { return _currentState.currentKollektiv; }
    function setCurrentKollektiv(kollektiv) { _currentState.currentKollektiv = kollektiv; _saveStateToLocalStorage(); }

    function getCurrentPublikationLang() { return _currentState.currentPublikationLang; }
    function setCurrentPublikationLang(lang) { _currentState.currentPublikationLang = lang; _saveStateToLocalStorage(); }

    function getCurrentPublikationSection() { return _currentState.currentPublikationSection; }
    function setCurrentPublikationSection(section) { _currentState.currentPublikationSection = section; _saveStateToLocalStorage(); }

    function getCurrentPublikationBruteForceMetric() { return _currentState.currentPublikationBruteForceMetric; }
    function setCurrentPublikationBruteForceMetric(metric) { _currentState.currentPublikationBruteForceMetric = metric; _saveStateToLocalStorage(); }

    function getCurrentStatsLayout() { return _currentState.currentStatsLayout; }
    function setCurrentStatsLayout(layout) { _currentState.currentStatsLayout = layout; _saveStateToLocalStorage(); }

    function getCurrentStatsKollektiv1() { return _currentState.currentStatsKollektiv1; }
    function setCurrentStatsKollektiv1(kollektiv) { _currentState.currentStatsKollektiv1 = kollektiv; _saveStateToLocalStorage(); }

    function getCurrentStatsKollektiv2() { return _currentState.currentStatsKollektiv2; }
    function setCurrentStatsKollektiv2(kollektiv) { _currentState.currentStatsKollektiv2 = kollektiv; _saveStateToLocalStorage(); }

    function getCurrentPresentationView() { return _currentState.currentPresentationView; }
    function setCurrentPresentationView(view) { _currentState.currentPresentationView = view; _saveStateToLocalStorage(); }

    function getCurrentPresentationStudyId() { return _currentState.currentPresentationStudyId; }
    function setCurrentPresentationStudyId(studyId) { _currentState.currentPresentationStudyId = studyId; _saveStateToLocalStorage(); }

    function getCriteriaComparisonSets() { return cloneDeep(_currentState.criteriaComparisonSets); }
    function setCriteriaComparisonSets(sets) { _currentState.criteriaComparisonSets = cloneDeep(sets); _saveStateToLocalStorage(); }

    function getCurrentChartColorScheme() { return _currentState.currentChartColorScheme; }
    function setCurrentChartColorScheme(scheme) { _currentState.currentChartColorScheme = scheme; _saveStateToLocalStorage(); }

    function isFirstAppStart() { return _currentState.isFirstAppStart; }
    function setFirstAppStart(value) { _currentState.isFirstAppStart = !!value; localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, JSON.stringify(!!value)); _saveStateToLocalStorage(); }


    loadStateFromLocalStorage(); // Initialisiere den Zustand beim Laden des Moduls

    return Object.freeze({
        loadStateFromLocalStorage,
        saveState: _saveStateToLocalStorage, // Nur für explizites Speichern, wenn nötig (normalerweise automatisch)
        resetStateToDefaults,

        getAppliedT2Criteria, setAppliedT2Criteria,
        getAppliedT2Logic, setAppliedT2Logic,
        getCurrentKollektiv, setCurrentKollektiv,
        getCurrentPublikationLang, setCurrentPublikationLang,
        getCurrentPublikationSection, setCurrentPublikationSection,
        getCurrentPublikationBruteForceMetric, setCurrentPublikationBruteForceMetric,
        getCurrentStatsLayout, setCurrentStatsLayout,
        getCurrentStatsKollektiv1, setCurrentStatsKollektiv1,
        getCurrentStatsKollektiv2, setCurrentStatsKollektiv2,
        getCurrentPresentationView, setCurrentPresentationView,
        getCurrentPresentationStudyId, setCurrentPresentationStudyId,
        getCriteriaComparisonSets, setCriteriaComparisonSets,
        getCurrentChartColorScheme, setCurrentChartColorScheme,
        isFirstAppStart, setFirstAppStart
    });
})();
