const stateManager = (() => {
    let currentState = {};

    const defaultState = {
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
    };

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
            datenTableSort: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT) ?? utils.cloneDeep(defaultState.datenTableSort),
            auswertungTableSort: utils.loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT) ?? utils.cloneDeep(defaultState.auswertungTableSort),
            activeTabId: defaultState.activeTabId
        };
    }

    function getCurrentKollektiv() {
        return currentState.currentKollektiv;
    }

    function setCurrentKollektiv(newKollektiv) {
        if (typeof newKollektiv === 'string' && currentState.currentKollektiv !== newKollektiv) {
            currentState.currentKollektiv = newKollektiv;
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, currentState.currentKollektiv);
            return true;
        }
        return false;
    }

    function getSortState(tableType) {
        if (tableType === 'daten') {
            return utils.cloneDeep(currentState.datenTableSort);
        }
        if (tableType === 'auswertung') {
            return utils.cloneDeep(currentState.auswertungTableSort);
        }
        return {};
    }

    function setSortState(tableType, { key, subKey, direction }) {
        let targetSortStateKey;
        let targetSortObject;

        if (tableType === 'daten') {
            targetSortStateKey = APP_CONFIG.STORAGE_KEYS.DATEN_TABLE_SORT;
            targetSortObject = currentState.datenTableSort;
        } else if (tableType === 'auswertung') {
            targetSortStateKey = APP_CONFIG.STORAGE_KEYS.AUSWERTUNG_TABLE_SORT;
            targetSortObject = currentState.auswertungTableSort;
        } else {
            return false;
        }

        if (targetSortObject.key !== key || targetSortObject.subKey !== subKey || targetSortObject.direction !== direction) {
            targetSortObject.key = key;
            targetSortObject.subKey = subKey;
            targetSortObject.direction = direction;
            utils.saveToLocalStorage(targetSortStateKey, targetSortObject);
            return true;
        }
        return false;
    }

    function getCurrentPublikationLang() {
        return currentState.currentPublikationLang;
    }

    function setPublikationLang(newLang) {
        if ((newLang === 'de' || newLang === 'en') && currentState.currentPublikationLang !== newLang) {
            currentState.currentPublikationLang = newLang;
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, currentState.currentPublikationLang);
            return true;
        }
        return false;
    }

    function getCurrentPublikationSection() {
        return currentState.currentPublikationSection;
    }

    function setPublikationSection(newSectionId) {
        const isValidSection = PUBLICATION_CONFIG.sections.some(section => section.id === newSectionId || (section.subSections && section.subSections.some(sub => sub.id === newSectionId)));
        if (typeof newSectionId === 'string' && isValidSection && currentState.currentPublikationSection !== newSectionId) {
            currentState.currentPublikationSection = newSectionId;
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, currentState.currentPublikationSection);
            return true;
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
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, currentState.currentPublikationBruteForceMetric);
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
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, currentState.currentStatsLayout);
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
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, currentState.currentStatsKollektiv1);
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
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, currentState.currentStatsKollektiv2);
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
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, currentState.currentPresentationView);
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
            utils.saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, currentState.currentPresentationStudyId);
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
        return utils.loadFromLocalStorage(key);
    }

    function saveStateItem(key, value) {
        utils.saveToLocalStorage(key, value);
    }

    return Object.freeze({
        init,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getSortState,
        setSortState,
        getCurrentPublikationLang,
        setPublikationLang,
        getCurrentPublikationSection,
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
