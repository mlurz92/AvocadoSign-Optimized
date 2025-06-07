const appState = (() => {
    let _state = {};

    const _defaultState = Object.freeze({
        currentKollektiv: CONSTANTS.KOLEKTIV.GESAMT,
        datenTableSort: { key: CONSTANTS.DATA_KEYS.PATIENT_NR, direction: 'asc', subKey: null },
        auswertungTableSort: { key: CONSTANTS.DATA_KEYS.PATIENT_NR, direction: 'asc', subKey: null },
        currentPublikationLang: 'de',
        currentPublikationSection: 'abstract',
        currentPublikationBruteForceMetric: 'Balanced Accuracy',
        currentStatsLayout: 'einzel',
        currentStatsKollektiv1: CONSTANTS.KOLEKTIV.GESAMT,
        currentStatsKollektiv2: CONSTANTS.KOLEKTIV.NRCT,
        currentPresentationView: 'as-pur',
        currentPresentationStudyId: null,
        activeTabId: 'publikation-tab'
    });

    function _saveState(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Fehler beim Speichern des Zustands für Schlüssel ${key}:`, error);
        }
    }

    function _loadState(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Fehler beim Laden des Zustands für Schlüssel ${key}. Verwende Standardwert.`, error);
            localStorage.removeItem(key);
            return defaultValue;
        }
    }

    function init() {
        _state = {
            currentKollektiv: _loadState(CONSTANTS.STORAGE_KEYS.CURRENT_KOLLEKTIV, _defaultState.currentKollektiv),
            datenTableSort: cloneDeep(_defaultState.datenTableSort),
            auswertungTableSort: cloneDeep(_defaultState.auswertungTableSort),
            currentPublikationLang: _loadState(CONSTANTS.STORAGE_KEYS.PUBLIKATION_LANG, _defaultState.currentPublikationLang),
            currentPublikationSection: _loadState(CONSTANTS.STORAGE_KEYS.PUBLIKATION_SECTION, _defaultState.currentPublikationSection),
            currentPublikationBruteForceMetric: _loadState(CONSTANTS.STORAGE_KEYS.PUBLIKATION_BF_METRIC, _defaultState.currentPublikationBruteForceMetric),
            currentStatsLayout: _loadState(CONSTANTS.STORAGE_KEYS.STATS_LAYOUT, _defaultState.currentStatsLayout),
            currentStatsKollektiv1: _loadState(CONSTANTS.STORAGE_KEYS.STATS_KOLLEKTIV1, _defaultState.currentStatsKollektiv1),
            currentStatsKollektiv2: _loadState(CONSTANTS.STORAGE_KEYS.STATS_KOLLEKTIV2, _defaultState.currentStatsKollektiv2),
            currentPresentationView: _loadState(CONSTANTS.STORAGE_KEYS.PRESENTATION_VIEW, _defaultState.currentPresentationView),
            currentPresentationStudyId: _loadState(CONSTANTS.STORAGE_KEYS.PRESENTATION_STUDY_ID, _defaultState.currentPresentationStudyId),
            activeTabId: _defaultState.activeTabId
        };
    }

    function getState() {
        return cloneDeep(_state);
    }
    
    function getCurrentKollektiv() { return _state.currentKollektiv; }
    function setCurrentKollektiv(newKollektiv) {
        if (Object.values(CONSTANTS.KOLEKTIV).includes(newKollektiv) && _state.currentKollektiv !== newKollektiv) {
            _state.currentKollektiv = newKollektiv;
            _saveState(CONSTANTS.STORAGE_KEYS.CURRENT_KOLLEKTIV, newKollektiv);
            return true;
        }
        return false;
    }

    function getDatenTableSort() { return cloneDeep(_state.datenTableSort); }
    function updateDatenTableSort(key, subKey = null) {
        if (!key) return false;
        if (_state.datenTableSort.key === key && _state.datenTableSort.subKey === subKey) {
            _state.datenTableSort.direction = _state.datenTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            _state.datenTableSort = { key, direction: 'asc', subKey };
        }
        return true;
    }

    function getAuswertungTableSort() { return cloneDeep(_state.auswertungTableSort); }
    function updateAuswertungTableSort(key, subKey = null) {
        if (!key) return false;
        if (_state.auswertungTableSort.key === key && _state.auswertungTableSort.subKey === subKey) {
            _state.auswertungTableSort.direction = _state.auswertungTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            _state.auswertungTableSort = { key, direction: 'asc', subKey };
        }
        return true;
    }

    function getPublikationLang() { return _state.currentPublikationLang; }
    function setPublikationLang(newLang) {
        if (['de', 'en'].includes(newLang) && _state.currentPublikationLang !== newLang) {
            _state.currentPublikationLang = newLang;
            _saveState(CONSTANTS.STORAGE_KEYS.PUBLIKATION_LANG, newLang);
            return true;
        }
        return false;
    }

    function getPublikationSection() { return _state.currentPublikationSection; }
    function setPublikationSection(newSection) {
        if (_state.currentPublikationSection !== newSection) {
            _state.currentPublikationSection = newSection;
            _saveState(CONSTANTS.STORAGE_KEYS.PUBLIKATION_SECTION, newSection);
            return true;
        }
        return false;
    }

    function getPublikationBruteForceMetric() { return _state.currentPublikationBruteForceMetric; }
    function setPublikationBruteForceMetric(newMetric) {
        if (_state.currentPublikationBruteForceMetric !== newMetric) {
            _state.currentPublikationBruteForceMetric = newMetric;
            _saveState(CONSTANTS.STORAGE_KEYS.PUBLIKATION_BF_METRIC, newMetric);
            return true;
        }
        return false;
    }

    function getStatsLayout() { return _state.currentStatsLayout; }
    function setStatsLayout(newLayout) {
        if (['einzel', 'vergleich'].includes(newLayout) && _state.currentStatsLayout !== newLayout) {
            _state.currentStatsLayout = newLayout;
            _saveState(CONSTANTS.STORAGE_KEYS.STATS_LAYOUT, newLayout);
            return true;
        }
        return false;
    }

    function getStatsKollektiv1() { return _state.currentStatsKollektiv1; }
    function setStatsKollektiv1(newKollektiv) {
        if (_state.currentStatsKollektiv1 !== newKollektiv) {
            _state.currentStatsKollektiv1 = newKollektiv;
            _saveState(CONSTANTS.STORAGE_KEYS.STATS_KOLLEKTIV1, newKollektiv);
            return true;
        }
        return false;
    }

    function getStatsKollektiv2() { return _state.currentStatsKollektiv2; }
    function setStatsKollektiv2(newKollektiv) {
        if (_state.currentStatsKollektiv2 !== newKollektiv) {
            _state.currentStatsKollektiv2 = newKollektiv;
            _saveState(CONSTANTS.STORAGE_KEYS.STATS_KOLLEKTIV2, newKollektiv);
            return true;
        }
        return false;
    }

    function getPresentationView() { return _state.currentPresentationView; }
    function setPresentationView(newView) {
        if (['as-pur', 'as-vs-t2'].includes(newView) && _state.currentPresentationView !== newView) {
            _state.currentPresentationView = newView;
            _saveState(CONSTANTS.STORAGE_KEYS.PRESENTATION_VIEW, newView);
            if (newView === 'as-pur') {
                setPresentationStudyId(null);
            } else if (!_state.currentPresentationStudyId) {
                setPresentationStudyId(CONSTANTS.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);
            }
            return true;
        }
        return false;
    }
    
    function getPresentationStudyId() { return _state.currentPresentationStudyId; }
    function setPresentationStudyId(newStudyId) {
        const studyId = newStudyId === undefined ? null : newStudyId;
        if (_state.currentPresentationStudyId !== studyId) {
            _state.currentPresentationStudyId = studyId;
            _saveState(CONSTANTS.STORAGE_KEYS.PRESENTATION_STUDY_ID, studyId);
            return true;
        }
        return false;
    }

    function getActiveTabId() { return _state.activeTabId; }
    function setActiveTabId(newTabId) {
        if (typeof newTabId === 'string' && _state.activeTabId !== newTabId) {
            _state.activeTabId = newTabId;
            return true;
        }
        return false;
    }

    return Object.freeze({
        init,
        getState,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getDatenTableSort,
        updateDatenTableSort,
        getAuswertungTableSort,
        updateAuswertungTableSort,
        getPublikationLang,
        setPublikationLang,
        getPublikationSection,
        setPublikationSection,
        getPublikationBruteForceMetric,
        setPublikationBruteForceMetric,
        getStatsLayout,
        setStatsLayout,
        getStatsKollektiv1,
        setStatsKollektiv1,
        getStatsKollektiv2,
        setStatsKollektiv2,
        getPresentationView,
        setPresentationView,
        getPresentationStudyId,
        setPresentationStudyId,
        getActiveTabId,
        setActiveTabId
    });
})();
