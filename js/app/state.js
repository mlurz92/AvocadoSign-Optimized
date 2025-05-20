const state = (() => {
    let currentState = {};

    const defaultState = {
        currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        patientTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.PATIENT_TABLE_SORT),
        auswertungTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
        currentMethodenLang: APP_CONFIG.DEFAULT_SETTINGS.METHODEN_LANG,
        currentStatsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
        currentStatsKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
        currentStatsKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
        currentPresentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
        currentPresentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
        activeTabId: 'patienten-tab'
    };

    function init() {
        currentState = {
            currentKollektiv: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) ?? defaultState.currentKollektiv,
            currentMethodenLang: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.METHODEN_LANG) ?? defaultState.currentMethodenLang,
            currentStatsLayout: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) ?? defaultState.currentStatsLayout,
            currentStatsKollektiv1: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) ?? defaultState.currentStatsKollektiv1,
            currentStatsKollektiv2: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) ?? defaultState.currentStatsKollektiv2,
            currentPresentationView: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) ?? defaultState.currentPresentationView,
            currentPresentationStudyId: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) ?? defaultState.currentPresentationStudyId,
            patientTableSort: cloneDeep(defaultState.patientTableSort),
            auswertungTableSort: cloneDeep(defaultState.auswertungTableSort),
            activeTabId: defaultState.activeTabId
        };
        console.log("State Manager initialisiert mit:", currentState);
    }

    function getCurrentKollektiv() {
        return currentState.currentKollektiv;
    }

    function setCurrentKollektiv(newKollektiv) {
        if (typeof newKollektiv === 'string' && currentState.currentKollektiv !== newKollektiv) {
            currentState.currentKollektiv = newKollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, currentState.currentKollektiv);
            return true;
        }
        return false;
    }

    function getPatientTableSort() {
        return cloneDeep(currentState.patientTableSort);
    }

    function updatePatientTableSortDirection(key, subKey = null) {
        if (!key) return false;
        if (currentState.patientTableSort.key === key && currentState.patientTableSort.subKey === subKey) {
            currentState.patientTableSort.direction = currentState.patientTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentState.patientTableSort = { key: key, direction: 'asc', subKey: subKey };
        }
        return true;
     }

    function getAuswertungTableSort() {
        return cloneDeep(currentState.auswertungTableSort);
    }

     function updateAuswertungTableSortDirection(key, subKey = null) {
         if (!key) return false;
         if (currentState.auswertungTableSort.key === key && currentState.auswertungTableSort.subKey === subKey) {
            currentState.auswertungTableSort.direction = currentState.auswertungTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentState.auswertungTableSort = { key: key, direction: 'asc', subKey: subKey };
        }
        return true;
     }

    function getCurrentMethodenLang() {
        return currentState.currentMethodenLang;
    }

    function setCurrentMethodenLang(newLang) {
        if ((newLang === 'de' || newLang === 'en') && currentState.currentMethodenLang !== newLang) {
            currentState.currentMethodenLang = newLang;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.METHODEN_LANG, currentState.currentMethodenLang);
            return true;
        }
        return false;
    }

    function getCurrentStatsLayout() {
        return currentState.currentStatsLayout;
    }

    function setCurrentStatsLayout(newLayout) {
        if ((newLayout === 'einzel' || newLayout === 'vergleich') && currentState.currentStatsLayout !== newLayout) {
            currentState.currentStatsLayout = newLayout;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, currentState.currentStatsLayout);
            return true;
        }
        return false;
    }

    function getCurrentStatsKollektiv1() {
        return currentState.currentStatsKollektiv1;
    }

    function setCurrentStatsKollektiv1(newKollektiv) {
         if (typeof newKollektiv === 'string' && currentState.currentStatsKollektiv1 !== newKollektiv) {
            currentState.currentStatsKollektiv1 = newKollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, currentState.currentStatsKollektiv1);
            return true;
        }
        return false;
    }

    function getCurrentStatsKollektiv2() {
        return currentState.currentStatsKollektiv2;
    }

    function setCurrentStatsKollektiv2(newKollektiv) {
         if (typeof newKollektiv === 'string' && currentState.currentStatsKollektiv2 !== newKollektiv) {
            currentState.currentStatsKollektiv2 = newKollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, currentState.currentStatsKollektiv2);
            return true;
        }
        return false;
    }

    function getCurrentPresentationView() {
        return currentState.currentPresentationView;
    }

    function setCurrentPresentationView(newView) {
        if ((newView === 'as-pur' || newView === 'as-vs-t2') && currentState.currentPresentationView !== newView) {
            currentState.currentPresentationView = newView;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, currentState.currentPresentationView);
            if (newView === 'as-pur') {
                setCurrentPresentationStudyId(null);
            } else if (!currentState.currentPresentationStudyId && newView === 'as-vs-t2') {
                setCurrentPresentationStudyId(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);
            }
            return true;
        }
        return false;
    }

    function getCurrentPresentationStudyId() {
        return currentState.currentPresentationStudyId;
    }

    function setCurrentPresentationStudyId(newStudyId) {
        const newStudyIdValue = newStudyId === undefined ? null : newStudyId;
        if (currentState.currentPresentationStudyId !== newStudyIdValue) {
            currentState.currentPresentationStudyId = newStudyIdValue;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, currentState.currentPresentationStudyId);
            return true;
        }
        return false;
    }

    function getActiveTabId() {
        return currentState.activeTabId;
    }

    function setActiveTabId(newTabId) {
        if (typeof newTabId === 'string' && currentState.activeTabId !== newTabId) {
            currentState.activeTabId = newTabId;
            return true;
        }
        return false;
    }

    return Object.freeze({
        init,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getPatientTableSort,
        updatePatientTableSortDirection,
        getAuswertungTableSort,
        updateAuswertungTableSortDirection,
        getCurrentMethodenLang,
        setCurrentMethodenLang,
        getCurrentStatsLayout,
        setCurrentStatsLayout,
        getCurrentStatsKollektiv1,
        setCurrentStatsKollektiv1,
        getCurrentStatsKollektiv2,
        setCurrentStatsKollektiv2,
        getCurrentPresentationView,
        setCurrentPresentationView,
        getCurrentPresentationStudyId,
        setCurrentPresentationStudyId,
        getActiveTabId,
        setActiveTabId
    });

})();