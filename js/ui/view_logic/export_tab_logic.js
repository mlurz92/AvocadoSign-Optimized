const exportTabLogic = (() => {
    let _mainAppInterface = null;
    let _isInitialized = false;
    let _currentKollektiv = null;

    function initialize(mainAppInterface) {
        _mainAppInterface = mainAppInterface;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function setDataStale() {
        // Für den Export-Tab ist "stale" weniger relevant, da er meist on-demand Daten generiert
        // oder auf bereits berechneten globalen Daten basiert.
        // Diese Funktion ist für Konsistenz mit anderen Logik-Modulen vorhanden.
    }

    function initializeTab(rawData, currentKollektiv, appliedT2Criteria, appliedT2Logic, bruteForceResults, allStudySets) {
        _currentKollektiv = currentKollektiv; // Speichere das aktuelle Kollektiv für Dateinamen etc.
        
        const contentArea = document.getElementById('export-content-area');
        if (!contentArea) {
            console.error("ExportTabLogic: Content-Bereich 'export-content-area' nicht gefunden.");
            return;
        }

        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createExportOptions === 'function') {
            contentArea.innerHTML = uiComponents.createExportOptions(currentKollektiv);
        } else {
            contentArea.innerHTML = '<p class="text-danger">Fehler: Export-Komponenten konnten nicht geladen werden.</p>';
            console.error("ExportTabLogic: uiComponents.createExportOptions ist nicht definiert.");
        }
        
        // Event-Listener für die Export-Buttons werden typischerweise global in main.js oder
        // einem dedizierten Export-Event-Handler-Modul angehängt, da die Buttons dynamisch sind
        // und der ExportService direkt aufgerufen wird.
        // Hier könnten spezifische Initialisierungen für den Export-Tab erfolgen, falls nötig.

        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.initializeTooltips === 'function') {
            ui_helpers.initializeTooltips(contentArea);
        }
        
        if (typeof ui_helpers !== 'undefined' && typeof ui_helpers.updateExportButtonStates === 'function' && typeof state !== 'undefined' && typeof bruteForceManager !== 'undefined') {
            const hasBruteForceData = bruteForceManager.hasResults(currentKollektiv);
            const canExportData = rawData && rawData.length > 0;
            ui_helpers.updateExportButtonStates(state.getActiveTabId(), hasBruteForceData, canExportData);
        }


        _isInitialized = true;
    }

    return Object.freeze({
        initialize,
        isInitialized,
        setDataStale,
        initializeTab
    });
})();
