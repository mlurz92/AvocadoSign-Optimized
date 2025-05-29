const state = (() => {
    const appState = {};

    function initializeState() {
        const defaultSettings = APP_CONFIG.DEFAULT_SETTINGS;
        const storageKeys = APP_CONFIG.STORAGE_KEYS;

        appState.currentKollektiv = loadFromLocalStorage(storageKeys.CURRENT_KOLLEKTIV) || defaultSettings.KOLLEKTIV;
        appState.activeTabId = loadFromLocalStorage(storageKeys.ACTIVE_TAB_ID) || APP_CONFIG.DEFAULT_SETTINGS.ACTIVE_TAB_ID || 'daten-tab'; // Default zu daten-tab, falls nicht anders definiert

        appState.statsLayout = loadFromLocalStorage(storageKeys.STATS_LAYOUT) || defaultSettings.STATS_LAYOUT;
        appState.statsKollektiv1 = loadFromLocalStorage(storageKeys.STATS_KOLLEKTIV1) || defaultSettings.STATS_KOLLEKTIV1;
        appState.statsKollektiv2 = loadFromLocalStorage(storageKeys.STATS_KOLLEKTIV2) || defaultSettings.STATS_KOLLEKTIV2;

        appState.presentationView = loadFromLocalStorage(storageKeys.PRESENTATION_VIEW) || defaultSettings.PRESENTATION_VIEW;
        appState.presentationStudyId = loadFromLocalStorage(storageKeys.PRESENTATION_STUDY_ID); // Kann null sein, daher kein || defaultSettings

        appState.currentPublikationLang = loadFromLocalStorage(storageKeys.PUBLIKATION_LANG) || defaultSettings.PUBLIKATION_LANG;
        appState.currentPublikationSection = loadFromLocalStorage(storageKeys.PUBLIKATION_SECTION) || defaultSettings.PUBLIKATION_SECTION;
        appState.currentPublikationBruteForceMetric = loadFromLocalStorage(storageKeys.PUBLIKATION_BRUTE_FORCE_METRIC) || defaultSettings.PUBLIKATION_BRUTE_FORCE_METRIC;

        appState.currentBruteForceMetric = loadFromLocalStorage(storageKeys.BRUTE_FORCE_METRIC) || defaultSettings.BRUTE_FORCE_METRIC;

        appState.firstAppStart = loadFromLocalStorage(storageKeys.FIRST_APP_START);
        if (appState.firstAppStart === null) {
            appState.firstAppStart = true;
            saveToLocalStorage(storageKeys.FIRST_APP_START, false);
        } else {
            appState.firstAppStart = false;
        }
        appState.criteriaComparisonSets = loadFromLocalStorage(storageKeys.CRITERIA_COMPARISON_SETS) || cloneDeep(defaultSettings.CRITERIA_COMPARISON_SETS);
        appState.chartColorScheme = loadFromLocalStorage(storageKeys.CHART_COLOR_SCHEME) || 'default';

    }

    function getCurrentKollektiv() { return appState.currentKollektiv; }
    function setCurrentKollektiv(kollektivId) {
        if (appState.currentKollektiv !== kollektivId) {
            appState.currentKollektiv = kollektivId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, kollektivId);
        }
    }

    function getActiveTabId() { return appState.activeTabId; }
    function setActiveTabId(tabId) {
        if (appState.activeTabId !== tabId) {
            appState.activeTabId = tabId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.ACTIVE_TAB_ID, tabId);
        }
    }

    function getStatsLayout() { return appState.statsLayout; }
    function setStatsLayout(layout) {
        if (appState.statsLayout !== layout && (layout === 'einzel' || layout === 'vergleich')) {
            appState.statsLayout = layout;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, layout);
        }
    }

    function getStatsKollektiv1() { return appState.statsKollektiv1; }
    function setStatsKollektiv1(kollektivId) {
        if (appState.statsKollektiv1 !== kollektivId) {
            appState.statsKollektiv1 = kollektivId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, kollektivId);
        }
    }

    function getStatsKollektiv2() { return appState.statsKollektiv2; }
    function setStatsKollektiv2(kollektivId) {
        if (appState.statsKollektiv2 !== kollektivId) {
            appState.statsKollektiv2 = kollektivId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, kollektivId);
        }
    }

    function getCurrentPresentationView() { return appState.presentationView; }
    function setPresentationView(view) {
        if (appState.presentationView !== view) {
            appState.presentationView = view;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, view);
        }
    }

    function getCurrentPresentationStudyId() { return appState.presentationStudyId; }
    function setPresentationStudyId(studyId) {
        const newStudyId = (studyId === "null" || studyId === "") ? null : studyId;
        if (appState.presentationStudyId !== newStudyId) {
            appState.presentationStudyId = newStudyId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, newStudyId);
        }
    }

    function getCurrentPublikationLang() { return appState.currentPublikationLang; }
    function setCurrentPublikationLang(lang) {
        if (appState.currentPublikationLang !== lang && (lang === 'de' || lang === 'en')) {
            appState.currentPublikationLang = lang;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, lang);
        }
    }

    function getCurrentPublikationSection() { return appState.currentPublikationSection; }
    function setCurrentPublikationSection(sectionId) {
        if (appState.currentPublikationSection !== sectionId) {
            appState.currentPublikationSection = sectionId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, sectionId);
        }
    }

    function getCurrentPublikationBruteForceMetric() { return appState.currentPublikationBruteForceMetric; }
    function setCurrentPublikationBruteForceMetric(metric) {
        if (appState.currentPublikationBruteForceMetric !== metric) {
            appState.currentPublikationBruteForceMetric = metric;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, metric);
        }
    }

    function getCurrentBruteForceMetric() { return appState.currentBruteForceMetric; }
    function setCurrentBruteForceMetric(metric) {
        if (appState.currentBruteForceMetric !== metric) {
            appState.currentBruteForceMetric = metric;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.BRUTE_FORCE_METRIC, metric);
        }
    }

    function isFirstAppStart() { return appState.firstAppStart; }

    function getCriteriaComparisonSets() { return cloneDeep(appState.criteriaComparisonSets); }
    function setCriteriaComparisonSets(sets) {
        if (Array.isArray(sets)) {
            appState.criteriaComparisonSets = cloneDeep(sets);
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS, appState.criteriaComparisonSets);
        }
    }

    function getCurrentChartColorScheme() { return appState.chartColorScheme; }
    function setCurrentChartColorScheme(schemeKey) {
         if (APP_CONFIG.CHART_SETTINGS.COLOR_SCHEMES && APP_CONFIG.CHART_SETTINGS.COLOR_SCHEMES[schemeKey]) {
            if (appState.chartColorScheme !== schemeKey) {
                appState.chartColorScheme = schemeKey;
                saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CHART_COLOR_SCHEME, schemeKey);
            }
         } else {
            console.warn(`Ungültiges Farbschema '${schemeKey}' ausgewählt.`);
         }
    }


    function getAllState() {
        return {
            currentKollektiv: appState.currentKollektiv,
            activeTabId: appState.activeTabId,
            appliedT2Criteria: t2CriteriaManager ? t2CriteriaManager.getAppliedCriteria() : getDefaultT2Criteria(),
            appliedT2Logic: t2CriteriaManager ? t2CriteriaManager.getAppliedLogic() : APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC,
            statsLayout: appState.statsLayout,
            statsKollektiv1: appState.statsKollektiv1,
            statsKollektiv2: appState.statsKollektiv2,
            presentationView: appState.presentationView,
            presentationStudyId: appState.presentationStudyId,
            currentPublikationLang: appState.currentPublikationLang,
            currentPublikationSection: appState.currentPublikationSection,
            currentPublikationBruteForceMetric: appState.currentPublikationBruteForceMetric,
            currentBruteForceMetric: appState.currentBruteForceMetric,
            criteriaComparisonSets: cloneDeep(appState.criteriaComparisonSets),
            chartColorScheme: appState.chartColorScheme
        };
    }

    return Object.freeze({
        initializeState,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getActiveTabId,
        setActiveTabId,
        getStatsLayout,
        setStatsLayout,
        getStatsKollektiv1,
        setStatsKollektiv1,
        getStatsKollektiv2,
        setStatsKollektiv2,
        getCurrentPresentationView,
        setPresentationView,
        getCurrentPresentationStudyId,
        setPresentationStudyId,
        getCurrentPublikationLang,
        setCurrentPublikationLang,
        getCurrentPublikationSection,
        setCurrentPublikationSection,
        getCurrentPublikationBruteForceMetric,
        setCurrentPublikationBruteForceMetric,
        getCurrentBruteForceMetric,
        setCurrentBruteForceMetric,
        isFirstAppStart,
        getCriteriaComparisonSets,
        setCriteriaComparisonSets,
        getCurrentChartColorScheme,
        setCurrentChartColorScheme,
        getAllState
    });

})();
