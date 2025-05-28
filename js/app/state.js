const state = (() => {
    let currentState = {};

    const defaultState = Object.freeze({
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
    });

    function isValidKollektiv(kollektiv) {
        return typeof kollektiv === 'string' && (kollektiv === 'Gesamt' || kollektiv === 'direkt OP' || kollektiv === 'nRCT');
    }

    function isValidPublikationLang(lang) {
        return lang === 'de' || lang === 'en';
    }

    function isValidPublikationSection(sectionId) {
        return typeof sectionId === 'string' && PUBLICATION_CONFIG.sections.some(section => section.id === sectionId);
    }

    function isValidPublikationBruteForceMetric(metric) {
        return typeof metric === 'string' && PUBLICATION_CONFIG.bruteForceMetricsForPublication.some(m => m.value === metric);
    }

    function isValidStatsLayout(layout) {
        return layout === 'einzel' || layout === 'vergleich';
    }

    function isValidPresentationView(view) {
        return view === 'as-pur' || view === 'as-vs-t2';
    }

    function isValidPresentationStudyId(studyId) {
        if (studyId === null) return true;
        if (typeof studyId === 'string') {
            if (studyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return true;
            if (typeof studyT2CriteriaManager !== 'undefined' && studyT2CriteriaManager.getStudyCriteriaSetById(studyId)) return true;
            return false;
        }
        return false;
    }


    function init() {
        const loadedKollektiv = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV);
        currentState.currentKollektiv = isValidKollektiv(loadedKollektiv) ? loadedKollektiv : defaultState.currentKollektiv;

        const loadedPubLang = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG);
        currentState.currentPublikationLang = isValidPublikationLang(loadedPubLang) ? loadedPubLang : defaultState.currentPublikationLang;

        const loadedPubSection = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION);
        currentState.currentPublikationSection = isValidPublikationSection(loadedPubSection) ? loadedPubSection : defaultState.currentPublikationSection;

        const loadedPubBfMetric = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC);
        currentState.currentPublikationBruteForceMetric = isValidPublikationBruteForceMetric(loadedPubBfMetric) ? loadedPubBfMetric : defaultState.currentPublikationBruteForceMetric;

        const loadedStatsLayout = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT);
        currentState.currentStatsLayout = isValidStatsLayout(loadedStatsLayout) ? loadedStatsLayout : defaultState.currentStatsLayout;

        const loadedStatsKoll1 = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1);
        currentState.currentStatsKollektiv1 = isValidKollektiv(loadedStatsKoll1) ? loadedStatsKoll1 : defaultState.currentStatsKollektiv1;

        const loadedStatsKoll2 = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2);
        currentState.currentStatsKollektiv2 = isValidKollektiv(loadedStatsKoll2) ? loadedStatsKoll2 : defaultState.currentStatsKollektiv2;

        const loadedPresView = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW);
        currentState.currentPresentationView = isValidPresentationView(loadedPresView) ? loadedPresView : defaultState.currentPresentationView;

        const loadedPresStudyId = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID);
        currentState.currentPresentationStudyId = isValidPresentationStudyId(loadedPresStudyId) ? loadedPresStudyId : defaultState.currentPresentationStudyId;
        if (currentState.currentPresentationView === 'as-pur' && currentState.currentPresentationStudyId !== null) {
            currentState.currentPresentationStudyId = null;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, null);
        } else if (currentState.currentPresentationView === 'as-vs-t2' && currentState.currentPresentationStudyId === null) {
             currentState.currentPresentationStudyId = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
             saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, currentState.currentPresentationStudyId);
        }


        currentState.datenTableSort = cloneDeep(defaultState.datenTableSort);
        currentState.auswertungTableSort = cloneDeep(defaultState.auswertungTableSort);
        currentState.activeTabId = defaultState.activeTabId;

        if (!loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START)) {
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, 'true');
        }
    }

    function getCurrentKollektiv() {
        return currentState.currentKollektiv;
    }

    function setCurrentKollektiv(newKollektiv) {
        if (isValidKollektiv(newKollektiv) && currentState.currentKollektiv !== newKollektiv) {
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
        if (!key || typeof key !== 'string') return false;
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
         if (!key || typeof key !== 'string') return false;
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
        if (isValidPublikationLang(newLang) && currentState.currentPublikationLang !== newLang) {
            currentState.currentPublikationLang = newLang;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, currentState.currentPublikationLang);
            return true;
        }
        return false;
    }

    function getCurrentPublikationSection() {
        return currentState.currentPublikationSection;
    }

    function setCurrentPublikationSection(newSectionId) {
        if (isValidPublikationSection(newSectionId) && currentState.currentPublikationSection !== newSectionId) {
            currentState.currentPublikationSection = newSectionId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, currentState.currentPublikationSection);
            return true;
        }
        if (!isValidPublikationSection(newSectionId) && typeof newSectionId === 'string') {
             console.warn(`setCurrentPublikationSection: Ungültige Sektions-ID '${newSectionId}'`);
        }
        return false;
    }

    function getCurrentPublikationBruteForceMetric() {
        return currentState.currentPublikationBruteForceMetric;
    }

    function setCurrentPublikationBruteForceMetric(newMetric) {
        if (isValidPublikationBruteForceMetric(newMetric) && currentState.currentPublikationBruteForceMetric !== newMetric) {
            currentState.currentPublikationBruteForceMetric = newMetric;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, currentState.currentPublikationBruteForceMetric);
            return true;
        }
        return false;
    }

    function getCurrentStatsLayout() {
        return currentState.currentStatsLayout;
    }

    function setCurrentStatsLayout(newLayout) {
        if (isValidStatsLayout(newLayout) && currentState.currentStatsLayout !== newLayout) {
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
         if (isValidKollektiv(newKollektiv) && currentState.currentStatsKollektiv1 !== newKollektiv) {
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
         if (isValidKollektiv(newKollektiv) && currentState.currentStatsKollektiv2 !== newKollektiv) {
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
        if (isValidPresentationView(newView) && currentState.currentPresentationView !== newView) {
            currentState.currentPresentationView = newView;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, currentState.currentPresentationView);
            if (newView === 'as-pur') {
                setCurrentPresentationStudyId(null);
            } else if (newView === 'as-vs-t2' && !currentState.currentPresentationStudyId) {
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
        const newStudyIdValue = (newStudyId === undefined || newStudyId === "") ? null : newStudyId;
        if (currentState.currentPresentationStudyId !== newStudyIdValue) {
            if (isValidPresentationStudyId(newStudyIdValue)) {
                currentState.currentPresentationStudyId = newStudyIdValue;
                saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, currentState.currentPresentationStudyId);
                return true;
            } else {
                console.warn(`setCurrentPresentationStudyId: Ungültige Studien-ID '${newStudyIdValue}'`);
            }
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
        setActiveTabId
    });

})();
