const state = (() => {
    let currentState = {};

    const defaultState = Object.freeze({
        currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        datenTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
        auswertungTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
        currentPublikationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
        currentPublikationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
        currentStatsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
        currentStatsKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
        currentStatsKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
        currentPresentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
        currentPresentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
        activeTabId: APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB
    });

    function init() {
        currentState = {
            currentKollektiv: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) ?? defaultState.currentKollektiv,
            currentPublikationLang: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG) ?? defaultState.currentPublikationLang,
            currentPublikationSection: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION) ?? defaultState.currentPublikationSection,
            currentStatsLayout: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) ?? defaultState.currentStatsLayout,
            currentStatsKollektiv1: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) ?? defaultState.currentStatsKollektiv1,
            currentStatsKollektiv2: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) ?? defaultState.currentStatsKollektiv2,
            currentPresentationView: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) ?? defaultState.currentPresentationView,
            currentPresentationStudyId: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) === undefined ? defaultState.currentPresentationStudyId : loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID),
            datenTableSort: cloneDeep(loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT) ?? defaultState.datenTableSort),
            auswertungTableSort: cloneDeep(loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT) ?? defaultState.auswertungTableSort),
            activeTabId: defaultState.activeTabId
        };
         if (typeof currentState.datenTableSort.subKey === 'undefined') currentState.datenTableSort.subKey = null;
         if (typeof currentState.auswertungTableSort.subKey === 'undefined') currentState.auswertungTableSort.subKey = null;
    }

    function getCurrentKollektiv() {
        return currentState.currentKollektiv;
    }

    function setCurrentKollektiv(newKollektiv) {
        if (typeof newKollektiv === 'string' && currentState.currentKollektiv !== newKollektiv && ['Gesamt', 'direkt OP', 'nRCT'].includes(newKollektiv)) {
            currentState.currentKollektiv = newKollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, currentState.currentKollektiv);
            return true;
        }
        return false;
    }

    function getDatenTableSort() {
        return cloneDeep(currentState.datenTableSort);
    }

    function updateDatenTableSortDirection(key, subKey = null) {
        if (!key) return false;
        if (currentState.datenTableSort.key === key && currentState.datenTableSort.subKey === subKey) {
            currentState.datenTableSort.direction = currentState.datenTableSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentState.datenTableSort = { key: key, direction: 'asc', subKey: subKey };
        }
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT, currentState.datenTableSort);
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
        saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT, currentState.auswertungTableSort);
        return true;
     }

    function getCurrentPublikationLang() {
        return currentState.currentPublikationLang;
    }

    function setCurrentPublikationLang(newLang) {
        if ((newLang === 'de' || newLang === 'en') && currentState.currentPublikationLang !== newLang) {
            currentState.currentPublikationLang = newLang;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, currentState.currentPublikationLang);
            return true;
        }
        return false;
    }

    function getCurrentPublikationSection() {
        return currentState.currentPublikationSection;
    }

    function setCurrentPublikationSection(newSection) {
        const isValidSection = APP_CONFIG.UI_SETTINGS.PUBLIKATION_SECTIONS.some(s => s.id === newSection);
        if (isValidSection && currentState.currentPublikationSection !== newSection) {
            currentState.currentPublikationSection = newSection;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, currentState.currentPublikationSection);
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
         if (typeof newKollektiv === 'string' && currentState.currentStatsKollektiv1 !== newKollektiv && ['Gesamt', 'direkt OP', 'nRCT'].includes(newKollektiv)) {
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
         if (typeof newKollektiv === 'string' && currentState.currentStatsKollektiv2 !== newKollektiv && ['Gesamt', 'direkt OP', 'nRCT'].includes(newKollektiv)) {
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
        const newStudyIdValue = (newStudyId === undefined || newStudyId === '') ? null : newStudyId;
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
        const validTabIds = ['daten-tab', 'auswertung-tab', 'statistik-tab', 'praesentation-tab', 'publikation-tab', 'export-tab'];
        if (typeof newTabId === 'string' && validTabIds.includes(newTabId) && currentState.activeTabId !== newTabId) {
            currentState.activeTabId = newTabId;
            return true;
        }
        return false;
    }

    return Object.freeze({
        init,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getDatenTableSort,
        updateDatenTableSortDirection,
        getAuswertungTableSort,
        updateAuswertungTableSortDirection,
        getCurrentPublikationLang,
        setCurrentPublikationLang,
        getCurrentPublikationSection,
        setCurrentPublikationSection,
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