const stateManager = (() => {
    let currentState = {};

    const defaultState = {
        currentKollektiv: APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV,
        datenTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
        auswertungTableSort: cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
        currentPublikationLang: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG,
        currentPublikationSection: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
        currentPublikationBruteForceMetric: APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
        currentStatsLayout: APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT,
        currentStatsKollektiv1: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
        currentStatsKollektiv2: APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
        currentPresentationView: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW,
        currentPresentationStudyId: APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
        activeTabId: 'publikation-tab'
    };

    function init() {
        currentState = {
            currentKollektiv: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) ?? defaultState.currentKollektiv,
            currentPublikationLang: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG) ?? defaultState.currentPublikationLang,
            currentPublikationSection: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION) ?? defaultState.currentPublikationSection,
            currentPublikationBruteForceMetric: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC) ?? defaultState.currentPublikationBruteForceMetric,
            currentStatsLayout: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) ?? defaultState.currentStatsLayout,
            currentStatsKollektiv1: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) ?? defaultState.currentStatsKollektiv1,
            currentStatsKollektiv2: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) ?? defaultState.currentStatsKollektiv2,
            currentPresentationView: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) ?? defaultState.currentPresentationView,
            currentPresentationStudyId: loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) ?? defaultState.currentPresentationStudyId,
            datenTableSort: cloneDeep(defaultState.datenTableSort),
            auswertungTableSort: cloneDeep(defaultState.auswertungTableSort),
            activeTabId: defaultState.activeTabId
        };
        if (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.METHODEN_LANG)) {
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.METHODEN_LANG);
        }
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

    function getSortState(tableType) {
        if (tableType === 'daten') {
            return cloneDeep(currentState.datenTableSort);
        }
        if (tableType === 'auswertung') {
            return cloneDeep(currentState.auswertungTableSort);
        }
        return {};
    }

    function setSortState(tableType, { key, subKey, direction }) {
        let targetSortState;
        if (tableType === 'daten') {
            targetSortState = currentState.datenTableSort;
        } else if (tableType === 'auswertung') {
            targetSortState = currentState.auswertungTableSort;
        } else {
            return false;
        }

        if (targetSortState.key === key && targetSortState.subKey === subKey) {
            targetSortState.direction = direction === 'asc' ? 'desc' : 'asc';
        } else {
            targetSortState.key = key;
            targetSortState.subKey = subKey;
            targetSortState.direction = 'asc';
        }
        return true;
    }


    function getCurrentPublikationLang() {
        return currentState.currentPublikationLang;
    }

    function setPublikationLang(newLang) {
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

    function setPublikationSection(newSectionId) {
        const isValidSection = PUBLICATION_CONFIG.sections.some(section => section.id === newSectionId || section.subSections.some(sub => sub.id === newSectionId));
        if (typeof newSectionId === 'string' && isValidSection && currentState.currentPublikationSection !== newSectionId) {
            currentState.currentPublikationSection = newSectionId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, currentState.currentPublikationSection);
            return true;
        }
        if (!isValidSection) {
            console.warn(`setPublikationSection: Ungültige Sektions-ID '${newSectionId}'`);
        }
        return false;
    }

    function getPublikationBfMetric() {
        return currentState.currentPublikationBruteForceMetric;
    }

    function setPublikationBfMetric(newMetric) {
        const isValidMetric = APP_CONFIG.METRIC_OPTIONS.some(m => m.value === newMetric);
        if (isValidMetric && currentState.currentPublikationBruteForceMetric !== newMetric) {
            currentState.currentPublikationBruteForceMetric = newMetric;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, currentState.currentPublikationBruteForceMetric);
            return true;
        }
        return false;
    }

    function getStatsLayout() {
        return currentState.currentStatsLayout;
    }

    function setStatsLayout(newLayout) {
        if ((newLayout === 'einzel' || newLayout === 'vergleich') && currentState.currentStatsLayout !== newLayout) {
            currentState.currentStatsLayout = newLayout;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, currentState.currentStatsLayout);
            return true;
        }
        return false;
    }

    function getStatsKollektiv1() {
        return currentState.currentStatsKollektiv1;
    }

    function setStatsKollektiv1(newKollektiv) {
         if (typeof newKollektiv === 'string' && currentState.currentStatsKollektiv1 !== newKollektiv) {
            currentState.currentStatsKollektiv1 = newKollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, currentState.currentStatsKollektiv1);
            return true;
        }
        return false;
    }

    function getStatsKollektiv2() {
        return currentState.currentStatsKollektiv2;
    }

    function setStatsKollektiv2(newKollektiv) {
         if (typeof newKollektiv === 'string' && currentState.currentStatsKollektiv2 !== newKollektiv) {
            currentState.currentStatsKollektiv2 = newKollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, currentState.currentStatsKollektiv2);
            return true;
        }
        return false;
    }

    function getPresentationView() {
        return currentState.currentPresentationView;
    }

    function setPresentationView(newView) {
        if ((newView === 'as-pur' || newView === 'as-vs-t2') && currentState.currentPresentationView !== newView) {
            currentState.currentPresentationView = newView;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, currentState.currentPresentationView);
            if (newView === 'as-pur') {
                setPresentationStudyId(null);
            } else if (!currentState.currentPresentationStudyId && newView === 'as-vs-t2') {
                setPresentationStudyId(APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);
            }
            return true;
        }
        return false;
    }

    function getPresentationStudyId() {
        return currentState.currentPresentationStudyId;
    }

    function setPresentationStudyId(newStudyId) {
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

    function loadStateItem(key) {
        return loadFromLocalStorage(key);
    }

    function saveStateItem(key, value) {
        saveToLocalStorage(key, value);
    }

    return Object.freeze({
        init,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getSortState,
        setSortState,
        getPublikationLang,
        setPublikationLang,
        getPublikationSection,
        setPublikationSection,
        getPublikationBfMetric,
        setPublikationBfMetric,
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
        setActiveTabId,
        loadStateItem,
        saveStateItem
    });

})();
