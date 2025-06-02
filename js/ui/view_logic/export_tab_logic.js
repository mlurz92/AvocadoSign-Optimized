const exportTabLogic = (() => {
    let _mainAppInterface = null;
    let _isInitialized = false;
    let _currentKollektiv = null;

    function initialize(mainAppInterface) {
        if (_isInitialized) return;
        _mainAppInterface = mainAppInterface;
        _isInitialized = true;
    }

    function isInitialized() {
        return _isInitialized;
    }

    function setDataStale() {
        // Diese Funktion ist für Konsistenz vorhanden, hat aber im Export-Tab
        // aktuell keine spezifische Auswirkung auf zwischengespeicherte Daten,
        // da die UI meist bei jedem Aufruf von initializeTab neu generiert wird
        // und die Exportlogik auf aktuellen Daten aus dem State operiert.
    }

    function initializeTab(rawData, currentKollektiv, appliedT2Criteria, appliedT2Logic, bruteForceResults, allStudySets) {
        if (!_mainAppInterface) {
            console.error("ExportTabLogic: Hauptinterface nicht initialisiert.");
            return;
        }
        _currentKollektiv = currentKollektiv;
        
        const appConfig = _mainAppInterface.getStateSnapshot().appConfig;
        const contentAreaId = appConfig?.TAB_CONTENT_AREAS?.['export-tab'] || 'export-content-area';
        const contentArea = document.getElementById(contentAreaId);

        if (!contentArea) {
            console.error(`ExportTabLogic: Content-Bereich '${contentAreaId}' nicht gefunden.`);
            const uiHelpers = _mainAppInterface.getUiHelpers();
            if (uiHelpers && typeof uiHelpers.showToast === 'function') {
                uiHelpers.showToast(`Export-Tab konnte nicht vollständig initialisiert werden (Container '${contentAreaId}' fehlt).`, "error");
            }
            return;
        }

        if (typeof uiComponents !== 'undefined' && typeof uiComponents.createExportOptions === 'function') {
            contentArea.innerHTML = uiComponents.createExportOptions(currentKollektiv);
        } else {
            contentArea.innerHTML = '<p class="text-danger">Fehler: Export-Komponenten konnten nicht geladen werden.</p>';
            console.error("ExportTabLogic: uiComponents.createExportOptions ist nicht definiert.");
        }
        
        const uiHelpers = _mainAppInterface.getUiHelpers();
        if (uiHelpers && typeof uiHelpers.initializeTooltips === 'function') {
            uiHelpers.initializeTooltips(contentArea);
        }
        
        if (uiHelpers && typeof uiHelpers.updateExportButtonStates === 'function' && typeof _mainAppInterface.getStateSnapshot === 'function') {
            const stateSnapshot = _mainAppInterface.getStateSnapshot();
            const bfManager = _mainAppInterface.getBruteForceManager();
            const hasBruteForceData = bfManager && typeof bfManager.hasResults === 'function' ? bfManager.hasResults(currentKollektiv) : false;
            const canExportData = rawData && rawData.length > 0;
            uiHelpers.updateExportButtonStates(stateSnapshot.currentTabId, hasBruteForceData, canExportData);
        }
    }

    return Object.freeze({
        initialize,
        isInitialized,
        setDataStale,
        initializeTab
    });
})();
