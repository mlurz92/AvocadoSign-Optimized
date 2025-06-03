const auswertungTabLogic = (() => {
    let dataView = [];
    let currentSortState = cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
    let tableRendererInstance = null;
    let bruteForceManagerInstance = null;
    let currentKollektiv = APP_CONFIG.DEFAULT_SETTINGS.KOLLEKTIV;

    const appliedCriteriaDisplayId = 'applied-t2-criteria-display-text';

    function initialize(data, bruteForceManager) {
        if (!Array.isArray(data)) {
            console.error("AuswertungTabLogic: Ungültige Daten für Initialisierung empfangen.");
            dataView = [];
        } else {
            dataView = data;
        }
        
        if (!bruteForceManager || typeof bruteForceManager.initialize !== 'function') {
            console.error("AuswertungTabLogic: Ungültiger BruteForceManager übergeben.");
        } else {
            bruteForceManagerInstance = bruteForceManager;
        }
        
        currentKollektiv = stateManager.getCurrentKollektiv();
        currentSortState = stateManager.getAuswertungTableSort() || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
        _updateAppliedCriteriaDisplay();
        _renderTable();
    }

    function updateData(newData) {
        if (!Array.isArray(newData)) {
            console.error("AuswertungTabLogic: Ungültige Daten für Update empfangen.");
            return;
        }
        dataView = newData;
        currentKollektiv = stateManager.getCurrentKollektiv();
        _renderTable();
        if (bruteForceManagerInstance) {
            bruteForceManagerInstance.updateData(getFilteredData(currentKollektiv));
        }
         _updateAppliedCriteriaDisplay();
    }
    
    function _updateAppliedCriteriaDisplay() {
        const displayElement = document.getElementById(appliedCriteriaDisplayId);
        if (displayElement && typeof t2CriteriaManager !== 'undefined' && typeof studyT2CriteriaManager !== 'undefined') {
            const appliedCriteria = t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = t2CriteriaManager.getAppliedLogic();
            const formattedText = studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false);
            ui_helpers.updateElementText(appliedCriteriaDisplayId, formattedText || 'Keine Kriterien angewendet.');
        } else if (displayElement) {
            ui_helpers.updateElementText(appliedCriteriaDisplayId, 'Anzeige der Kriterien nicht verfügbar.');
        }
    }

    function getFilteredData(kollektivId) {
        if (!dataView || dataView.length === 0) return [];
        if (kollektivId === 'Gesamt') {
            return dataView;
        }
        return dataView.filter(p => p.therapie === kollektivId);
    }

    function _renderTable() {
        const tableContainer = document.getElementById('auswertung-table-container');
        const toggleDetailsButtonId = 'auswertung-toggle-details';
        
        if (!tableContainer) {
            console.error("AuswertungTabLogic: Tabellencontainer nicht gefunden.");
            return;
        }

        const filteredData = getFilteredData(currentKollektiv);
        const tableHeaderId = 'auswertung-table-header'; 

        if (!tableRendererInstance && typeof TableRenderer === 'function') {
            tableRendererInstance = new TableRenderer(
                filteredData,
                auswertungTableConfig, 
                tableContainer.id,
                toggleDetailsButtonId,
                currentSortState,
                handleSortChange,
                handleRowClick 
            );
        } else if (tableRendererInstance) {
            tableRendererInstance.updateData(filteredData);
            tableRendererInstance.updateSortState(currentSortState);
        } else {
            console.error("TableRenderer Klasse nicht verfügbar oder Instanz konnte nicht erstellt werden.");
            ui_helpers.updateElementHTML(tableContainer.id, '<p class="text-danger">Fehler beim Laden der Tabelle.</p>');
            return;
        }
        tableRendererInstance.render();
        ui_helpers.updateSortIcons(tableHeaderId, currentSortState);
    }

    function handleSortChange(newSortKey, newSubKey = null) {
        if (currentSortState.key === newSortKey && currentSortState.subKey === newSubKey) {
            currentSortState.direction = currentSortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortState.key = newSortKey;
            currentSortState.subKey = newSubKey;
            currentSortState.direction = 'asc';
        }
        stateManager.setAuswertungTableSort(cloneDeep(currentSortState));
        _renderTable();
    }

    function handleRowClick(patientId, rowIndex, event) {
        if (event.target.closest('.no-row-click, .form-check-input, button, a')) {
            return;
        }
        
        const detailsRowId = `auswertung-detail-${patientId}`;
        const detailsRow = document.getElementById(detailsRowId);

        if (detailsRow && typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(detailsRow);
            bsCollapse.toggle();
        }
    }

    function applyBruteForceResults(criteria, logic) {
        if (criteria && logic) {
            t2CriteriaManager.setCriteria(criteria, logic);
            t2CriteriaManager.saveAll(); 
            if (mainAppInterface && typeof mainAppInterface.refreshAllTabs === 'function') {
                mainAppInterface.refreshAllTabs(true);
            }
            ui_helpers.showToast("Brute-Force Kriterien wurden erfolgreich angewendet und gespeichert.", "success");
            ui_helpers.highlightElement('t2-criteria-card');
            _updateAppliedCriteriaDisplay();
        } else {
            ui_helpers.showToast("Fehler beim Anwenden der Brute-Force Kriterien.", "danger");
        }
    }
    
    function refreshUI() {
        currentKollektiv = stateManager.getCurrentKollektiv();
        currentSortState = stateManager.getAuswertungTableSort() || cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.AUSWERTUNG_TABLE_SORT);
         _updateAppliedCriteriaDisplay();
        _renderTable();
        if (bruteForceManagerInstance) {
            bruteForceManagerInstance.updateKollektiv(currentKollektiv);
        }
    }

    return Object.freeze({
        initialize,
        updateData,
        getFilteredData,
        handleSortChange,
        handleRowClick,
        applyBruteForceResults,
        refreshUI
    });
})();
