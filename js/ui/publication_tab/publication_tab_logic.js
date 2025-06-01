const publicationTabLogic = (() => {
    let _mainAppInterface = null;
    let _globalRawData = [];
    let _currentKollektivGlobal = '';
    let _appliedT2CriteriaGlobal = null;
    let _appliedT2LogicGlobal = '';
    let _bruteForceResults = null;
    let _publikationLang = 'de';
    let _publikationSection = 'abstract';
    let _publikationBruteForceMetric = 'auc';
    let _isInitialized = false;
    let _isDataStale = true;
    let _publicationStats = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function setDataStale() {
        _isDataStale = true;
        _publicationStats = null;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function _initializeData() {
        if (!_isDataStale && _publicationStats) {
            return _publicationStats;
        }
        _isDataStale = true; 
        _publicationStats = null;

        try {
            const processedDataFull = dataProcessor.processRawData(cloneDeep(_globalRawData));
            if (!processedDataFull || processedDataFull.length === 0) {
                throw new Error("Keine verarbeiteten Patientendaten verfügbar.");
            }
            
            const allStats = statisticsService.calculateAllStatsForPublication(
                processedDataFull,
                _appliedT2CriteriaGlobal,
                _appliedT2LogicGlobal,
                _bruteForceResults,
                _publikationBruteForceMetric
            );

            if (!allStats) {
                throw new Error("Fehler bei der Berechnung der umfassenden Statistiken für die Publikation.");
            }
            _publicationStats = allStats;
            _isDataStale = false;

        } catch (error) {
            console.error("Fehler bei der Berechnung der Statistikdaten für den Publikationstab:", error);
            _publicationStats = { error: error.message, details: {} };
            _isDataStale = false; 
        }
        return _publicationStats;
    }


    function _renderPublicationTabContent() {
        const tabContentPane = document.getElementById('publikation-tab-pane');
        const mainContentArea = document.getElementById('publikation-content-area');
        const sidebarArea = document.getElementById('publikation-sidebar-nav-container');

        if (!tabContentPane || !mainContentArea || !sidebarArea) {
            console.error("Ein oder mehrere Hauptcontainer für den Publikationstab nicht gefunden.");
            if(tabContentPane) tabContentPane.innerHTML = '<p class="text-danger p-3">Fehler: Haupt-Layout-Elemente für Publikationstab fehlen.</p>';
            return;
        }

        if (!_publicationStats || _publicationStats.error) {
            mainContentArea.innerHTML = `<div class="alert alert-danger m-3">Fehler beim Laden der Publikationsdaten: ${_publicationStats?.error || 'Unbekannter Fehler'}. Bitte überprüfen Sie die Browser-Konsole für Details.</div>`;
            sidebarArea.innerHTML = '<p class="text-muted p-2 small">Daten nicht verfügbar.</p>';
            return;
        }
        
        const tocItems = publicationTextGenerator.getTableOfContents(_publikationLang, _publicationStats);
        sidebarArea.innerHTML = publicationRenderer.renderSidebarNavigation(tocItems, _publikationSection, _publikationLang);
        
        const sectionContent = publicationRenderer.renderContent(
            _publikationLang,
            _publikationSection,
            _publicationStats,
            _currentKollektivGlobal,
            _appliedT2CriteriaGlobal,
            _appliedT2LogicGlobal,
            _publikationBruteForceMetric
        );
        mainContentArea.innerHTML = sectionContent;
        
        ui_helpers.updatePublicationControlsUI(_publikationLang, _publikationSection, _publikationBruteForceMetric, _bruteForceResults);
        ui_helpers.initializeTooltips(tabContentPane);

        const activeNavItem = sidebarArea.querySelector(`.nav-link[data-section-id="${_publikationSection}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
            // Scroll into view if needed, e.g. for deep links or after language change.
            // However, the scroll should ideally happen on section change by event handler.
        }
         // Attach specific event listeners for copy buttons or interactive elements rendered by publicationRenderer
        publicationRenderer.attachPublicationTabEventListeners(mainContentArea);
    }


    function initializeTab(data, currentKollektiv, appliedT2Criteria, appliedT2Logic, bruteForceResults, publikationLang, publikationSection, publikationBruteForceMetric) {
        _globalRawData = data;
        _currentKollektivGlobal = currentKollektiv;
        _appliedT2CriteriaGlobal = appliedT2Criteria;
        _appliedT2LogicGlobal = appliedT2Logic;
        _bruteForceResults = bruteForceResults;
        _publikationLang = publikationLang;
        _publikationSection = publikationSection;
        _publikationBruteForceMetric = publikationBruteForceMetric;
        
        setDataStale(); // Markiere Daten als veraltet, um Neuberechnung zu erzwingen
        _initializeData(); // Daten aufbereiten
        _renderPublicationTabContent(); // UI rendern

        _isInitialized = true;
    }

    function getPubDataForToc() {
        if (_isDataStale || !_publicationStats) {
            _initializeData();
        }
        return _publicationStats; // Enthält nun auch Metadaten, die für ToC nützlich sein könnten
    }
    
    function getPubDataForCurrentSection() {
         if (_isDataStale || !_publicationStats) {
            _initializeData();
        }
        // Hier könnten spezifische Daten für die aktuelle Sektion extrahiert/transformiert werden,
        // falls publicationRenderer.renderContent nicht das gesamte _publicationStats Objekt benötigt.
        // Vorerst geben wir das Gesamtobjekt zurück.
        return _publicationStats;
    }

    function getFullPublicationStats() {
        if (_isDataStale || !_publicationStats) {
            _initializeData();
        }
        return cloneDeep(_publicationStats);
    }


    return Object.freeze({
        initialize,
        initializeTab,
        isInitialized,
        setDataStale,
        getPubDataForToc,
        getPubDataForCurrentSection,
        getFullPublicationStats
    });
})();
