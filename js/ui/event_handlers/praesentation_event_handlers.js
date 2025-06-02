const praesentationEventHandlers = (() => {
    let _mainAppInterface = null;
    let _isInitialized = false;

    function initialize(mainAppInterface) {
        if (_isInitialized) return;
        _mainAppInterface = mainAppInterface;
        _isInitialized = true;
    }

    function handlePresentationViewChange(event) {
        if (!event || !event.target || typeof state === 'undefined' || typeof ui_helpers === 'undefined') return;
        const newView = event.target.value;
        state.setCurrentPresentationView(newView);
        // Direkter UI-Update kann hier erfolgen für sofortiges Feedback,
        // obwohl der State-Change auch einen Refresh auslöst.
        // Stellt sicher, dass die korrekte Funktion aufgerufen wird:
        if (typeof ui_helpers.updatePresentationViewSelectorUI === 'function') {
            ui_helpers.updatePresentationViewSelectorUI(newView);
        } else {
            console.warn("ui_helpers.updatePresentationViewSelectorUI ist nicht definiert.");
        }
    }

    function handlePresentationStudyChange(event) {
        if (!event || !event.target || typeof state === 'undefined') return;
        const newStudyId = event.target.value;
        state.setCurrentPresentationStudyId(newStudyId);
    }

    function attachPraesentationEventListeners(tabPaneId) {
        if (!_isInitialized || !_mainAppInterface) {
            console.warn("PraesentationEventHandlers nicht initialisiert oder kein mainAppInterface vorhanden.");
            return;
        }

        const viewRadios = document.querySelectorAll('input[name="praesentationAnsicht"]');
        viewRadios.forEach(radio => {
            radio.removeEventListener('change', handlePresentationViewChange);
            radio.addEventListener('change', handlePresentationViewChange);
        });

        const studySelect = document.getElementById('praes-study-select');
        if (studySelect) {
            studySelect.removeEventListener('change', handlePresentationStudyChange);
            studySelect.addEventListener('change', handlePresentationStudyChange);
        }
        
        // Event Listener für dynamisch erstellte Download-Buttons in Statistik-Karten.
        // Diese werden an den Container delegiert, der die Karten enthält.
        const contentArea = document.getElementById('praesentation-content-area');
        if (contentArea) {
             contentArea.removeEventListener('click', _handlePraesentationCardButtonClick); // Alte Listener entfernen
             contentArea.addEventListener('click', _handlePraesentationCardButtonClick);
        }
    }

    function _handlePraesentationCardButtonClick(event) {
        const button = event.target.closest('button.praes-dl-btn');
        if (!button || !button.dataset || !_mainAppInterface) return;

        const exportService = (typeof exportService !== 'undefined') ? exportService : null;
        if (!exportService || typeof exportService.triggerExport !== 'function') {
            console.error("ExportService nicht verfügbar für Präsentations-Download.");
            _mainAppInterface.showToast("Export-Service nicht bereit.", "error");
            return;
        }

        const format = button.dataset.format;
        const targetId = button.dataset.targetId; // Dies könnte eine Tabellen-ID oder Chart-Container-ID sein
        const praesData = (typeof praesentationTabLogic !== 'undefined' && typeof praesentationTabLogic._praesentationData === 'object') ? praesentationTabLogic._praesentationData : null;
        const view = (typeof state !== 'undefined') ? state.getCurrentPresentationView() : null;

        let exportType = '';
        let customData = null; // Für spezifische Daten, die an den ExportService übergeben werden
        let chartContainerId = null;
        let tableElementId = null;
        let baseFilename = "Praesentation";

        if (targetId === 'praes-as-pur-perf-table' && format) { // AS Pur Performance Tabelle
            exportType = `TABLE_EXPORT_PRAES_AS_PUR_${format.toUpperCase()}`;
            tableElementId = targetId;
            baseFilename = `AS_Performance_Uebersicht`;
            customData = { // Daten für CSV/MD Export der AS Pur Tabelle
                kollektive: ['Gesamt', 'direkt OP', 'nRCT'],
                stats: {
                    'Gesamt': praesData?.statsGesamt,
                    'direkt OP': praesData?.statsDirektOP,
                    'nRCT': praesData?.statsNRCT
                }
            };
        } else if (targetId === 'praes-as-performance-chart' && format) { // AS Performance Chart
            exportType = `CHART_EXPORT_${format.toUpperCase()}`;
            chartContainerId = targetId;
            baseFilename = `AS_Performance_Chart_${state.getCurrentKollektiv().replace(/\s+/g,'_')}`;
        } else if (targetId === 'praes-as-vs-t2-comp-table' && format) { // AS vs T2 Vergleichstabelle
             exportType = `TABLE_EXPORT_PRAES_AS_VS_T2_COMP_${format.toUpperCase()}`;
             tableElementId = targetId;
             baseFilename = `AS_vs_T2_Vergleich_${praesData?.t2CriteriaLabelShort?.replace(/\s+/g,'_') || 'T2'}_${praesData?.kollektivForComparison?.replace(/\s+/g,'_') || 'Koll'}`;
             customData = {
                 statsAS: praesData?.statsAS,
                 statsT2: praesData?.statsT2,
                 kollektiv: praesData?.kollektivForComparison,
                 t2SetName: praesData?.t2CriteriaLabelShort
             };
        } else if (targetId === 'praes-as-vs-t2-test-table' && format) { // AS vs T2 Test Tabelle
            exportType = `TABLE_EXPORT_PRAES_AS_VS_T2_TESTS_${format.toUpperCase()}`;
            tableElementId = targetId;
            baseFilename = `AS_vs_T2_Tests_${praesData?.t2CriteriaLabelShort?.replace(/\s+/g,'_') || 'T2'}_${praesData?.kollektivForComparison?.replace(/\s+/g,'_') || 'Koll'}`;
            customData = {
                vergleich: praesData?.vergleich,
                kollektiv: praesData?.kollektivForComparison,
                t2SetName: praesData?.t2CriteriaLabelShort
            };
        } else if (targetId === 'praes-comp-chart-container' && format) { // AS vs T2 Vergleichs-Chart
            exportType = `CHART_EXPORT_${format.toUpperCase()}`;
            chartContainerId = targetId;
            baseFilename = `VergleichsChart_AS_vs_${praesData?.t2CriteriaLabelShort?.replace(/\s+/g,'_') || 'T2'}_${praesData?.kollektivForComparison?.replace(/\s+/g,'_') || 'Koll'}`;
        } else {
            // Spezifische Download-IDs aus den Buttons, die in ui_helpers.js (createStatistikCard) generiert wurden
            if (button.id === 'dl-praes-as-pur-csv' && format === 'csv') {
                exportType = 'PRAES_AS_PUR_CSV';
                customData = praesData;
            } else if (button.id === 'dl-praes-as-pur-md' && format === 'md') {
                exportType = 'PRAES_AS_PUR_MD';
                 customData = praesData;
            } else if (button.id === 'download-performance-as-vs-t2-csv' && format === 'csv') {
                exportType = 'PRAES_AS_VS_T2_CSV';
                customData = praesData;
            } else if (button.id === 'download-comp-table-as-vs-t2-md' && format === 'md') {
                exportType = 'PRAES_AS_VS_T2_MD';
                customData = praesData;
            } else if (button.id === 'download-tests-as-vs-t2-md' && format === 'md') {
                exportType = 'PRAES_COMP_TESTS_MD';
                customData = praesData;
            }
        }

        if (exportType) {
            exportService.triggerExport(exportType, {
                baseFilename,
                chartContainerId,
                tableElementId,
                specificData: customData, // Übergabe spezifischer Daten, die für den Export benötigt werden
                view, // Übergabe des aktuellen Views, falls der ExportService dies benötigt
                praesentationData: praesData // Übergabe der gesamten Präsentationsdaten
            });
        } else {
            console.warn("Unbekannter Download-Button-Typ oder Format im Präsentationstab:", button.id, format, targetId);
            _mainAppInterface.showToast("Unbekannter Exporttyp.", "warning");
        }
    }


    return Object.freeze({
        initialize,
        attachPraesentationEventListeners,
        handlePresentationViewChange,
        handlePresentationStudyChange
    });

})();
