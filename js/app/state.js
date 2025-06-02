const state = (() => {
    let _mainAppInterface = null;
    let _listeners = [];
    let _rawData = [];

    const initialSettings = APP_CONFIG.DEFAULT_SETTINGS || {};
    const defaults = {
        CURRENT_KOLLEKTIV: initialSettings.DEFAULT_KOLLEKTIV || 'Gesamt',
        CURRENT_TAB_ID: initialSettings.DEFAULT_TAB_ID || 'daten-tab',
        APPLIED_T2_LOGIC: initialSettings.DEFAULT_T2_LOGIC || 'UND',
        STATISTIK_LAYOUT: initialSettings.DEFAULT_STATISTIK_LAYOUT || 'einzel',
        STATISTIK_VERGLEICH_KOLLEKTIV1: initialSettings.DEFAULT_KOLLEKTIV_VERGLEICH1 || 'direkt OP',
        STATISTIK_VERGLEICH_KOLLEKTIV2: initialSettings.DEFAULT_KOLLEKTIV_VERGLEICH2 || 'nRCT',
        PRAESENTATION_VIEW: initialSettings.DEFAULT_PRAESENTATION_VIEW || 'as-pur',
        PRAESENTATION_STUDY_ID: initialSettings.DEFAULT_PRAESENTATION_STUDY_ID || APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
        PUBLIKATION_LANG: initialSettings.DEFAULT_PUBLIKATION_LANG || 'de',
        PUBLIKATION_SECTION: initialSettings.DEFAULT_PUBLIKATION_SECTION || (PUBLICATION_CONFIG.defaultSection || 'methoden_studienanlage'),
        PUBLIKATION_BF_METRIC: initialSettings.DEFAULT_PUBLIKATION_BF_METRIC || (PUBLICATION_CONFIG.defaultBruteForceMetricForPublication || 'Balanced Accuracy'),
        BRUTE_FORCE_METRIC: initialSettings.BRUTE_FORCE_METRIC || 'Balanced Accuracy'
    };
    
    const storageKeys = {
        CURRENT_KOLLEKTIV: 'avocadoSign.currentKollektiv',
        CURRENT_TAB_ID: 'avocadoSign.currentTabId',
        APPLIED_T2_CRITERIA: 'avocadoSign.appliedT2Criteria',
        APPLIED_T2_LOGIC: 'avocadoSign.appliedT2Logic',
        STATISTIK_LAYOUT: 'avocadoSign.statistikLayout',
        STATISTIK_VERGLEICH_KOLLEKTIV1: 'avocadoSign.statistikVergleichKollektiv1',
        STATISTIK_VERGLEICH_KOLLEKTIV2: 'avocadoSign.statistikVergleichKollektiv2',
        PRAESENTATION_VIEW: 'avocadoSign.praesentationView',
        PRAESENTATION_STUDY_ID: 'avocadoSign.praesentationStudyId',
        PUBLIKATION_LANG: 'avocadoSign.publikationLang',
        PUBLIKATION_SECTION: 'avocadoSign.publikationSection',
        PUBLIKATION_BF_METRIC: 'avocadoSign.publikationBfMetric',
        BRUTE_FORCE_RESULTS: 'avocadoSign.bruteForceResults',
        CURRENT_BRUTE_FORCE_METRIC: 'avocadoSign.currentBruteForceMetric'
    };

    let _currentKollektiv = defaults.CURRENT_KOLLEKTIV;
    let _currentTabId = defaults.CURRENT_TAB_ID;
    let _appliedT2Criteria = null; 
    let _appliedT2Logic = defaults.APPLIED_T2_LOGIC;
    
    let _bruteForceResults = { status: 'idle', results: [], bestResult: null, metric: null, kollektiv: null, message: null, progress: 0, totalCombinations: 0, startTime: null, duration:0, nGesamt:0, nPlus:0, nMinus:0 };
    let _currentBruteForceMetric = defaults.BRUTE_FORCE_METRIC;

    let _statistikLayout = defaults.STATISTIK_LAYOUT;
    let _statistikVergleichKollektiv1 = defaults.STATISTIK_VERGLEICH_KOLLEKTIV1;
    let _statistikVergleichKollektiv2 = defaults.STATISTIK_VERGLEICH_KOLLEKTIV2;
    
    let _praesentationView = defaults.PRAESENTATION_VIEW;
    let _praesentationStudyId = defaults.PRAESENTATION_STUDY_ID;

    let _publikationLang = defaults.PUBLIKATION_LANG;
    let _publikationSection = defaults.PUBLIKATION_SECTION;
    let _publikationBruteForceMetric = defaults.PUBLIKATION_BF_METRIC;

    let _headerStats = {
        kollektiv: _currentKollektiv,
        anzahlPatienten: 0,
        nPatho: { pos: 0, neg: 0, total: 0 },
        asStatus: { pos: 0, neg: 0, total: 0 },
        t2Status: { pos: 0, neg: 0, total: 0 }
    };

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
        _currentKollektiv = loadFromLocalStorage(storageKeys.CURRENT_KOLLEKTIV) || defaults.CURRENT_KOLLEKTIV;
        _currentTabId = loadFromLocalStorage(storageKeys.CURRENT_TAB_ID) || defaults.CURRENT_TAB_ID;
        
        const loadedCriteria = loadFromLocalStorage(storageKeys.APPLIED_T2_CRITERIA);
        _appliedT2Criteria = loadedCriteria ? loadedCriteria : cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_T2_CRITERIA || getDefaultT2Criteria());
        _appliedT2Logic = loadFromLocalStorage(storageKeys.APPLIED_T2_LOGIC) || defaults.APPLIED_T2_LOGIC;

        _statistikLayout = loadFromLocalStorage(storageKeys.STATISTIK_LAYOUT) || defaults.STATISTIK_LAYOUT;
        _statistikVergleichKollektiv1 = loadFromLocalStorage(storageKeys.STATISTIK_VERGLEICH_KOLLEKTIV1) || defaults.STATISTIK_VERGLEICH_KOLLEKTIV1;
        _statistikVergleichKollektiv2 = loadFromLocalStorage(storageKeys.STATISTIK_VERGLEICH_KOLLEKTIV2) || defaults.STATISTIK_VERGLEICH_KOLLEKTIV2;
        
        _praesentationView = loadFromLocalStorage(storageKeys.PRAESENTATION_VIEW) || defaults.PRAESENTATION_VIEW;
        _praesentationStudyId = loadFromLocalStorage(storageKeys.PRAESENTATION_STUDY_ID) || defaults.PRAESENTATION_STUDY_ID;

        _publikationLang = loadFromLocalStorage(storageKeys.PUBLIKATION_LANG) || defaults.PUBLIKATION_LANG;
        _publikationSection = loadFromLocalStorage(storageKeys.PUBLIKATION_SECTION) || defaults.PUBLIKATION_SECTION;
        _publikationBruteForceMetric = loadFromLocalStorage(storageKeys.PUBLIKATION_BF_METRIC) || defaults.PUBLIKATION_BF_METRIC;
        
        const loadedBfResults = loadFromLocalStorage(storageKeys.BRUTE_FORCE_RESULTS);
        if (loadedBfResults && loadedBfResults.status) { // Basic check
            _bruteForceResults = loadedBfResults;
        }
        _currentBruteForceMetric = loadFromLocalStorage(storageKeys.CURRENT_BRUTE_FORCE_METRIC) || defaults.BRUTE_FORCE_METRIC;

        console.log("State Modul initialisiert.");
        _notify('initialization');
    }

    function subscribe(listenerFn) {
        if (typeof listenerFn === 'function') {
            _listeners.push(listenerFn);
        }
    }

    function _notify(changeKey = 'general') {
        console.log(`State benachrichtigt Listener über Änderung: ${changeKey}`);
        _listeners.forEach(listener => {
            try {
                listener(changeKey);
            } catch (error) {
                console.error("Fehler im State-Listener:", error, "Für Änderung:", changeKey, "Listener:", listener);
            }
        });
    }

    function _calculateHeaderStats() {
        if (!_rawData || _rawData.length === 0 || typeof dataProcessor === 'undefined' || typeof t2CriteriaManager === 'undefined') {
             _headerStats = { kollektiv: _currentKollektiv, anzahlPatienten: 0, nPatho: { pos: 0, neg: 0, total:0 }, asStatus: { pos: 0, neg: 0, total:0 }, t2Status: { pos: 0, neg: 0, total:0 } };
            return;
        }
        
        const processedDataFull = dataProcessor.processRawData(cloneDeep(_rawData));
        const currentKollektivData = dataProcessor.filterDataByKollektiv(processedDataFull, _currentKollektiv);
        const t2EvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(currentKollektivData), _appliedT2Criteria, _appliedT2Logic);

        const newHeaderStats = {
            kollektiv: _currentKollektiv,
            anzahlPatienten: currentKollektivData.length,
            nPatho: {
                pos: currentKollektivData.filter(p => p.n_status_patient === 1).length,
                neg: currentKollektivData.filter(p => p.n_status_patient === 0).length,
                total: currentKollektivData.length
            },
            asStatus: {
                pos: currentKollektivData.filter(p => p.as_status_patient === 1).length,
                neg: currentKollektivData.filter(p => p.as_status_patient === 0).length,
                total: currentKollektivData.length
            },
            t2Status: {
                pos: t2EvaluatedData.filter(p => p.t2_status_patient === 1).length,
                neg: t2EvaluatedData.filter(p => p.t2_status_patient === 0).length,
                total: t2EvaluatedData.length
            }
        };
        
        if (JSON.stringify(_headerStats) !== JSON.stringify(newHeaderStats)) {
            _headerStats = newHeaderStats;
        }
    }

    function setRawData(data) {
        _rawData = cloneDeep(data);
        _calculateHeaderStats();
        _notify('rawData');
    }

    function getRawData() {
        return cloneDeep(_rawData);
    }

    function setCurrentKollektiv(kollektiv) {
        if (_currentKollektiv !== kollektiv) {
            _currentKollektiv = kollektiv;
            saveToLocalStorage(storageKeys.CURRENT_KOLLEKTIV, _currentKollektiv);
            _calculateHeaderStats();
            _notify('currentKollektiv');
        }
    }

    function getCurrentKollektiv() {
        return _currentKollektiv;
    }

    function setCurrentTabId(tabId) {
        if (_currentTabId !== tabId) {
            _currentTabId = tabId;
            saveToLocalStorage(storageKeys.CURRENT_TAB_ID, _currentTabId);
            _notify('currentTabId');
        }
    }

    function getCurrentTabId() {
        return _currentTabId;
    }

    function setAppliedT2Criteria(criteria, logic) {
        let changed = false;
        if (JSON.stringify(_appliedT2Criteria) !== JSON.stringify(criteria)) {
            _appliedT2Criteria = cloneDeep(criteria);
            saveToLocalStorage(storageKeys.APPLIED_T2_CRITERIA, _appliedT2Criteria);
            changed = true;
        }
        if (_appliedT2Logic !== logic) {
            _appliedT2Logic = logic;
            saveToLocalStorage(storageKeys.APPLIED_T2_LOGIC, _appliedT2Logic);
            changed = true;
        }
        if (changed) {
            _calculateHeaderStats();
            _notify('appliedT2Criteria'); 
        }
    }

    function getAppliedT2Criteria() {
        return cloneDeep(_appliedT2Criteria);
    }

    function getAppliedT2Logic() {
        return _appliedT2Logic;
    }

    function setBruteForceResults(resultsData) {
        if (resultsData && typeof resultsData === 'object') {
            _bruteForceResults = { ..._bruteForceResults, ...resultsData, status: 'completed' };
             if (resultsData.bestResult) {
                 _bruteForceResults.bestResult = cloneDeep(resultsData.bestResult);
             }
             if (resultsData.results) {
                 _bruteForceResults.results = cloneDeep(resultsData.results);
             }
        } else {
            _bruteForceResults.status = 'error';
            _bruteForceResults.message = 'Ungültige Ergebnisdaten erhalten.';
        }
        saveToLocalStorage(storageKeys.BRUTE_FORCE_RESULTS, _bruteForceResults);
        _notify('bruteForceResults');
    }
    
    function setBruteForceStatus(status, details = {}) {
        _bruteForceResults = {
            ..._bruteForceResults, 
            status: status,
            kollektiv: details.kollektiv || _bruteForceResults.kollektiv,
            metric: details.metric || _bruteForceResults.metric,
            progress: details.progress !== undefined ? details.progress : _bruteForceResults.progress,
            totalCombinations: details.totalCombinations !== undefined ? details.totalCombinations : _bruteForceResults.totalCombinations,
            startTime: details.startTime || _bruteForceResults.startTime,
            duration: details.duration !== undefined ? details.duration : _bruteForceResults.duration,
            nGesamt: details.nGesamt !== undefined ? details.nGesamt : _bruteForceResults.nGesamt,
            nPlus: details.nPlus !== undefined ? details.nPlus : _bruteForceResults.nPlus,
            nMinus: details.nMinus !== undefined ? details.nMinus : _bruteForceResults.nMinus,
            currentBestResult: details.currentBestResult ? cloneDeep(details.currentBestResult) : _bruteForceResults.currentBestResult,
            message: details.error || details.message || null,
            results: status === 'completed' && details.results ? cloneDeep(details.results) : (status === 'cancelled' || status === 'error' ? [] : _bruteForceResults.results),
            bestResult: status === 'completed' && details.bestResult ? cloneDeep(details.bestResult) : (status === 'cancelled' || status === 'error' ? null : _bruteForceResults.bestResult),
        };
        if (status === 'idle' || status === 'cancelled' || status === 'error') {
             _bruteForceResults.progress = 0;
             _bruteForceResults.startTime = null;
             if (status !== 'error') _bruteForceResults.message = null;
        }
        saveToLocalStorage(storageKeys.BRUTE_FORCE_RESULTS, _bruteForceResults);
        _notify('bruteForceStatus');
    }


    function getBruteForceResults() {
        return cloneDeep(_bruteForceResults);
    }
    
    function clearBruteForceResults() {
        _bruteForceResults = { status: 'idle', results: [], bestResult: null, metric: null, kollektiv: null, message: null, progress: 0, totalCombinations: 0, startTime: null, duration:0, nGesamt:0, nPlus:0, nMinus:0 };
        saveToLocalStorage(storageKeys.BRUTE_FORCE_RESULTS, _bruteForceResults);
        _notify('bruteForceResultsCleared');
    }

    function setCurrentBruteForceMetric(metric) {
        if (_currentBruteForceMetric !== metric) {
            _currentBruteForceMetric = metric;
            saveToLocalStorage(storageKeys.CURRENT_BRUTE_FORCE_METRIC, _currentBruteForceMetric);
            _notify('currentBruteForceMetric');
        }
    }

    function getCurrentBruteForceMetric() {
        return _currentBruteForceMetric;
    }
    
    function setStatistikLayout(layout) {
        if (_statistikLayout !== layout) {
            _statistikLayout = layout;
            saveToLocalStorage(storageKeys.STATISTIK_LAYOUT, _statistikLayout);
            _notify('statistikLayout');
        }
    }

    function getStatistikLayout() {
        return _statistikLayout;
    }

    function setStatistikVergleichKollektiv1(kollektiv) {
        if (_statistikVergleichKollektiv1 !== kollektiv) {
            _statistikVergleichKollektiv1 = kollektiv;
            saveToLocalStorage(storageKeys.STATISTIK_VERGLEICH_KOLLEKTIV1, _statistikVergleichKollektiv1);
            _notify('statistikVergleichKollektiv1');
        }
    }

    function getStatistikVergleichKollektiv1() {
        return _statistikVergleichKollektiv1;
    }

    function setStatistikVergleichKollektiv2(kollektiv) {
        if (_statistikVergleichKollektiv2 !== kollektiv) {
            _statistikVergleichKollektiv2 = kollektiv;
            saveToLocalStorage(storageKeys.STATISTIK_VERGLEICH_KOLLEKTIV2, _statistikVergleichKollektiv2);
            _notify('statistikVergleichKollektiv2');
        }
    }

    function getStatistikVergleichKollektiv2() {
        return _statistikVergleichKollektiv2;
    }

    function setCurrentPresentationView(view) {
        if (_praesentationView !== view) {
            _praesentationView = view;
            saveToLocalStorage(storageKeys.PRAESENTATION_VIEW, _praesentationView);
            _notify('praesentationView');
        }
    }

    function getCurrentPresentationView() {
        return _praesentationView;
    }

    function setCurrentPresentationStudyId(studyId) {
        if (_praesentationStudyId !== studyId) {
            _praesentationStudyId = studyId;
            saveToLocalStorage(storageKeys.PRAESENTATION_STUDY_ID, _praesentationStudyId);
            _notify('praesentationStudyId');
        }
    }

    function getCurrentPresentationStudyId() {
        return _praesentationStudyId;
    }

    function setCurrentPublikationLang(lang) {
        if (_publikationLang !== lang) {
            _publikationLang = lang;
            saveToLocalStorage(storageKeys.PUBLIKATION_LANG, _publikationLang);
            _notify('publikationLang');
        }
    }

    function getCurrentPublikationLang() {
        return _publikationLang;
    }

    function setCurrentPublikationSection(section) {
        if (_publikationSection !== section) {
            _publikationSection = section;
            saveToLocalStorage(storageKeys.PUBLIKATION_SECTION, _publikationSection);
            _notify('publikationSection');
        }
    }

    function getCurrentPublikationSection() {
        return _publikationSection;
    }

    function setCurrentPublikationBruteForceMetric(metric) {
        if (_publikationBruteForceMetric !== metric) {
            _publikationBruteForceMetric = metric;
            saveToLocalStorage(storageKeys.PUBLIKATION_BF_METRIC, _publikationBruteForceMetric);
            _notify('publikationBruteForceMetric');
        }
    }

    function getCurrentPublikationBruteForceMetric() {
        return _publikationBruteForceMetric;
    }

    function getStateSnapshot() {
        return Object.freeze({
            rawData: cloneDeep(_rawData),
            currentKollektiv: _currentKollektiv,
            currentTabId: _currentTabId,
            appliedT2Criteria: cloneDeep(_appliedT2Criteria),
            appliedT2Logic: _appliedT2Logic,
            bruteForceResults: cloneDeep(_bruteForceResults),
            currentBruteForceMetric: _currentBruteForceMetric,
            statistikLayout: _statistikLayout,
            statistikVergleichKollektiv1: _statistikVergleichKollektiv1,
            statistikVergleichKollektiv2: _statistikVergleichKollektiv2,
            praesentationView: _praesentationView,
            praesentationStudyId: _praesentationStudyId,
            publikationLang: _publikationLang,
            publikationSection: _publikationSection,
            publikationBruteForceMetric: _publikationBruteForceMetric,
            headerStats: cloneDeep(_headerStats),
            appConfig: APP_CONFIG, 
            publicationConfig: PUBLICATION_CONFIG,
            uiTexts: UI_TEXTS,
            tooltipContent: TOOLTIP_CONTENT
        });
    }

    return Object.freeze({
        initialize,
        subscribe,
        setRawData,
        getRawData,
        setCurrentKollektiv,
        getCurrentKollektiv,
        setCurrentTabId,
        getCurrentTabId,
        setAppliedT2Criteria,
        getAppliedT2Criteria,
        getAppliedT2Logic,
        setBruteForceResults,
        setBruteForceStatus,
        getBruteForceResults,
        clearBruteForceResults,
        setCurrentBruteForceMetric,
        getCurrentBruteForceMetric,
        setStatistikLayout,
        getStatistikLayout,
        setStatistikVergleichKollektiv1,
        getStatistikVergleichKollektiv1,
        setStatistikVergleichKollektiv2,
        getStatistikVergleichKollektiv2,
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
        getStateSnapshot
    });

})();
