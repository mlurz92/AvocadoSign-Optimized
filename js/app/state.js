const state = (() => {
    let processedData = [];
    let rawData = [];
    let currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
    let bruteForceResults = {
        hasResults: false,
        bestResult: null,
        results: [],
        metric: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC,
        kollektiv: null,
        duration: 0,
        totalTested: 0,
        nGesamt: 0,
        nPlus: 0,
        nMinus: 0
    };

    let statistikLayout = APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT;
    let statistikKollektiv1 = APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1;
    let statistikKollektiv2 = APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2;
    let presentationView = APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW;
    let presentationStudyId = APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID;
    let criteriaComparisonSets = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS;
    let publikationLang = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
    let publikationSection = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION;
    let publikationBruteForceMetric = APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;

    function initializeState(initialRawData) {
        rawData = initialRawData;
        processedData = dataProcessor.processPatientData(rawData);

        // Load persisted state from local storage
        currentKollektiv = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV) || APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;
        statistikLayout = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT) || APP_CONFIG.DEFAULT_SETTINGS.STATS_LAYOUT;
        statistikKollektiv1 = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1) || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV1;
        statistikKollektiv2 = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2) || APP_CONFIG.DEFAULT_SETTINGS.STATS_KOLLEKTIV2;
        presentationView = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW) || APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_VIEW;
        presentationStudyId = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID) || APP_CONFIG.DEFAULT_SETTINGS.PRESENTATION_STUDY_ID;
        criteriaComparisonSets = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS) || APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS;
        publikationLang = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG) || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_LANG;
        publikationSection = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION) || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_SECTION;
        publikationBruteForceMetric = loadFromLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC) || APP_CONFIG.DEFAULT_SETTINGS.PUBLIKATION_BRUTE_FORCE_METRIC;

        // Ensure t2CriteriaManager is initialized first as its state depends on local storage
        t2CriteriaManager.initialize();
        // Then apply initial T2 criteria to processed data
        processedData = t2CriteriaManager.evaluateDataset(processedData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());

        // Set initial state for brute force manager
        bruteForceManager.initialize();
        bruteForceManager.setTargetMetric(bruteForceResults.metric); // Initialize BF metric
        // Update local bruteForceResults if manager has previous session data
        const savedBruteForceResults = bruteForceManager.getBruteForceResults();
        if (savedBruteForceResults?.hasResults) {
            bruteForceResults = savedBruteForceResults;
        }
    }

    function getRawData() {
        return cloneDeep(rawData);
    }

    function getProcessedData() {
        return cloneDeep(processedData);
    }

    function getCurrentKollektiv() {
        return currentKollektiv;
    }

    function setCurrentKollektiv(kollektiv) {
        if (currentKollektiv !== kollektiv) {
            currentKollektiv = kollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CURRENT_KOLLEKTIV, currentKollektiv);
        }
    }

    function getBruteForceResults() {
        return cloneDeep(bruteForceResults);
    }

    function setBruteForceResults(results) {
        bruteForceResults = cloneDeep(results);
        bruteForceResults.hasResults = true; // Mark that we have results
    }

    function clearBruteForceResults() {
        bruteForceResults = {
            hasResults: false,
            bestResult: null,
            results: [],
            metric: APP_CONFIG.DEFAULT_SETTINGS.BRUTE_FORCE_METRIC,
            kollektiv: null,
            duration: 0,
            totalTested: 0,
            nGesamt: 0,
            nPlus: 0,
            nMinus: 0
        };
    }

    function getStatsLayout() {
        return statistikLayout;
    }

    function setStatsLayout(layout) {
        if (statistikLayout !== layout) {
            statistikLayout = layout;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_LAYOUT, statistikLayout);
        }
    }

    function getStatsKollektiv1() {
        return statistikKollektiv1;
    }

    function setStatsKollektiv1(kollektiv) {
        if (statistikKollektiv1 !== kollektiv) {
            statistikKollektiv1 = kollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV1, statistikKollektiv1);
        }
    }

    function getStatsKollektiv2() {
        return statistikKollektiv2;
    }

    function setStatsKollektiv2(kollektiv) {
        if (statistikKollektiv2 !== kollektiv) {
            statistikKollektiv2 = kollektiv;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.STATS_KOLLEKTIV2, statistikKollektiv2);
        }
    }

    function getPresentationView() {
        return presentationView;
    }

    function setPresentationView(view) {
        if (presentationView !== view) {
            presentationView = view;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_VIEW, presentationView);
        }
    }

    function getPresentationStudyId() {
        return presentationStudyId;
    }

    function setPresentationStudyId(studyId) {
        if (presentationStudyId !== studyId) {
            presentationStudyId = studyId;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PRESENTATION_STUDY_ID, presentationStudyId);
        }
    }

    function getCriteriaComparisonSets() {
        return cloneDeep(criteriaComparisonSets);
    }

    function setCriteriaComparisonSets(sets) {
        if (!arraysAreEqual(criteriaComparisonSets, sets)) {
            criteriaComparisonSets = cloneDeep(sets);
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.CRITERIA_COMPARISON_SETS, criteriaComparisonSets);
        }
    }

    function getPublikationLang() {
        return publikationLang;
    }

    function setPublikationLang(lang) {
        if (publikationLang !== lang) {
            publikationLang = lang;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_LANG, publikationLang);
        }
    }

    function getPublikationSection() {
        return publikationSection;
    }

    function setPublikationSection(section) {
        if (publikationSection !== section) {
            publikationSection = section;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_SECTION, publikationSection);
        }
    }

    function getPublikationBruteForceMetric() {
        return publikationBruteForceMetric;
    }

    function setPublikationBruteForceMetric(metric) {
        if (publikationBruteForceMetric !== metric) {
            publikationBruteForceMetric = metric;
            saveToLocalStorage(APP_CONFIG.STORAGE_KEYS.PUBLIKATION_BRUTE_FORCE_METRIC, publikationBruteForceMetric);
        }
    }

    function getActiveTabId() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            const target = activeLink.getAttribute('data-bs-target');
            if (target) {
                return target.substring(1).replace('-pane', '');
            }
        }
        return 'data-tab'; // Default tab
    }

    function refreshCurrentTab() {
        const currentTabId = getActiveTabId();
        const reEvaluatedProcessedData = t2CriteriaManager.evaluateDataset(rawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
        processedData = reEvaluatedProcessedData;
        
        // Always recalculate header stats after data refresh
        const headerStats = dataProcessor.calculateHeaderStats(dataProcessor.filterDataByKollektiv(processedData, currentKollektiv), currentKollektiv);
        ui_helpers.updateHeaderStatsUI(headerStats);
        
        viewRenderer.renderTab(currentTabId, processedData, bruteForceResults);
    }

    function applyT2CriteriaAndRefresh() {
        // This function is specifically for when the T2 criteria are applied or changed
        // It updates the processedData with the new T2 evaluations and then triggers a full UI refresh.
        processedData = t2CriteriaManager.evaluateDataset(rawData, t2CriteriaManager.getAppliedCriteria(), t2CriteriaManager.getAppliedLogic());
        refreshCurrentTab();
    }

    return Object.freeze({
        initializeState,
        getRawData,
        getProcessedData,
        getCurrentKollektiv,
        setCurrentKollektiv,
        getBruteForceResults,
        setBruteForceResults,
        clearBruteForceResults,
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
        getCriteriaComparisonSets,
        setCriteriaComparisonSets,
        getPublikationLang,
        setPublikationLang,
        getPublikationSection,
        setPublikationSection,
        getPublikationBruteForceMetric,
        setPublikationBruteForceMetric,
        getActiveTabId,
        refreshCurrentTab,
        applyT2CriteriaAndRefresh
    });
})();
