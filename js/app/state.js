const state = (() => {
    let currentState = {};

    function init() {
        // Use getAppConfig() to ensure APP_CONFIG is fully loaded and available
        const appConfig = getAppConfig();

        const defaultState = {
            currentKollektiv: appConfig.DEFAULT_SETTINGS.KOLLEKTIV,
            datenTableSort: cloneDeep(appConfig.DEFAULT_SETTINGS.DATEN_TABLE_SORT),
            auswertungTableSort: cloneDeep(appConfig.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT),
            currentPublikationLang: appConfig.DEFAULT_SETTINGS.PUBLIKATION_LANG,
            currentPublikationSection: appConfig.DEFAULT_SETTINGS.PUBLIKATION_SECTION,
            currentPublikationBruteForceMetric: appConfig.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC,
            currentStatsLayout: appConfig.DEFAULT_SETTINGS.STATS_LAYOUT,
            currentStatsKollektiv1: appConfig.DEFAULT_SETTINGS.STATS_KOLLEKTIV1,
            currentStatsKollektiv2: appConfig.DEFAULT_SETTINGS.STATS_KOLLEKTIV2,
            currentPresentationView: appConfig.DEFAULT_SETTINGS.PRESENTATION_VIEW,
            currentPresentationStudyId: appConfig.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID,
            activeTabId: 'publikation-tab'
        };

        currentState = {
            currentKollektiv: loadFromLocalStorage(appConfig.STORAGE_KEYS.CURRENT_KOLLEKTIV) ?? defaultState.currentKollektiv,
            currentPublikationLang: loadFromLocalStorage(appConfig.STORAGE_KEYS.PUBLIKATION_LANG) ?? defaultState.currentPublikationLang,
            currentPublikationSection: loadFromLocalStorage(appConfig.STORAGE_KEYS.PUBLIKATION_SECTION) ?? defaultState.currentPublikationSection,
            currentPublikationBruteForceMetric: loadFromLocalStorage(appConfig.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC) ?? defaultState.currentPublikationBruteForceMetric,
            currentStatsLayout: loadFromLocalStorage(appConfig.STORAGE_KEYS.STATS_LAYOUT) ?? defaultState.currentStatsLayout,
            currentStatsKollektiv1: loadFromLocalStorage(appConfig.STORAGE_KEYS.STATS_KOLLEKTIV1) ?? defaultState.currentStatsKollektiv1,
            currentStatsKollektiv2: loadFromLocalStorage(appConfig.STORAGE_KEYS.STATS_KOLLEKTIV2) ?? defaultState.currentStatsKollektiv2,
            currentPresentationView: loadFromLocalStorage(appConfig.STORAGE_KEYS.PRESENTATION_VIEW) ?? defaultState.currentPresentationView,
            currentPresentationStudyId: loadFromLocalStorage(appConfig.STORAGE_KEYS.PRESENTATION_STUDY_ID) ?? defaultState.currentPresentationStudyId,
            datenTableSort: cloneDeep(defaultState.datenTableSort),
            auswertungTableSort: cloneDeep(defaultState.auswertungTableSort),
            activeTabId: defaultState.activeTabId
        };
        // Remove old storage key if it exists, to ensure consistency
        if (localStorage.getItem('methodenLang')) { // Old key was 'methodenLang'
            localStorage.removeItem('methodenLang');
        }
        console.log("State Manager initialisiert mit:", currentState);
    }

    function getCurrentKollektiv() {
        return currentState.currentKollektiv;
    }

    function setCurrentKollektiv(newKollektiv) {
        if (typeof newKollektiv === 'string' && currentState.currentKollektiv !== newKollektiv) {
            currentState.currentKollektiv = newKollektiv;
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.CURRENT_KOLLEKTIV, currentState.currentKollektiv);
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

    function getCurrentPublikationLang() {
        return currentState.currentPublikationLang;
    }

    function setCurrentPublikationLang(newLang) {
        if ((newLang === 'de' || newLang === 'en') && currentState.currentPublikationLang !== newLang) {
            currentState.currentPublikationLang = newLang;
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.PUBLIKATION_LANG, currentState.currentPublikationLang);
            return true;
        }
        return false;
    }

    function getCurrentPublikationSection() {
        return currentState.currentPublikationSection;
    }

    function setCurrentPublikationSection(newSectionId) {
        // Use getAppConfig() to access PUBLICATION_CONFIG safely
        const publicationConfig = getAppConfig().PUBLICATION_CONFIG;
        const isValidSection = publicationConfig.sections.some(section => section.id === newSectionId);
        if (typeof newSectionId === 'string' && isValidSection && currentState.currentPublikationSection !== newSectionId) {
            currentState.currentPublikationSection = newSectionId;
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.PUBLIKATION_SECTION, currentState.currentPublikationSection);
            return true;
        }
        if (!isValidSection) {
            console.warn(`setCurrentPublikationSection: Ungültige Sektions-ID '${newSectionId}'`);
        }
        return false;
    }

    function getCurrentPublikationBruteForceMetric() {
        return currentState.currentPublikationBruteForceMetric;
    }

    function setCurrentPublikationBruteForceMetric(newMetric) {
        // Use getAppConfig() to access PUBLICATION_CONFIG safely
        const publicationConfig = getAppConfig().PUBLICATION_CONFIG;
        const isValidMetric = publicationConfig.bruteForceMetricsForPublication.some(m => m.value === newMetric);
        if (isValidMetric && currentState.currentPublikationBruteForceMetric !== newMetric) {
            currentState.currentPublikationBruteForceMetric = newMetric;
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, currentState.currentPublikationBruteForceMetric);
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
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.STATS_LAYOUT, currentState.currentStatsLayout);
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
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.STATS_KOLLEKTIV1, currentState.currentStatsKollektiv1);
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
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.STATS_KOLLEKTIV2, currentState.currentStatsKollektiv2);
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
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.PRESENTATION_VIEW, currentState.currentPresentationView);
            if (newView === 'as-pur') {
                setCurrentPresentationStudyId(null); 
            } else if (!currentState.currentPresentationStudyId && newView === 'as-vs-t2') {
                setCurrentPresentationStudyId(getAppConfig().SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID);
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
            saveToLocalStorage(getAppConfig().STORAGE_KEYS.PRESENTATION_STUDY_ID, currentState.currentPresentationStudyId);
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

    function getCurrentChartSettings() {
        // This function retrieves chart settings from APP_CONFIG.
        // It does not directly manage state within the state module itself,
        // but provides a centralized access point for other modules to get these settings.
        // This is necessary because chart settings are not stored in localStorage
        // as part of the dynamic user preferences handled by the state manager.
        return getAppConfig().CHART_SETTINGS;
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
        getCurrentPublikationBruteForceMetric,
        setCurrentPublikationBruteForceMetric,
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
        setActiveTabId,
        getCurrentChartSettings // Expose this getter
    });
})();
