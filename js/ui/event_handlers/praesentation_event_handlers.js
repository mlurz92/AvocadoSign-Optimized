const praesentationEventHandlers = (() => {

    function _handleViewChange(event) {
        const newView = event.target.value;
        if (typeof stateManager !== 'undefined' && typeof stateManager.setCurrentPresentationView === 'function') {
            stateManager.setCurrentPresentationView(newView);
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                 mainAppInterface.refreshCurrentTab(true); 
            }
        } else {
            console.error("stateManager.setCurrentPresentationView ist nicht verfügbar.");
        }
    }

    function _handleStudySelectChange(event) {
        const newStudyId = event.target.value;
        if (typeof stateManager !== 'undefined' && typeof stateManager.setCurrentPresentationStudyId === 'function') {
            stateManager.setCurrentPresentationStudyId(newStudyId);
             if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                 mainAppInterface.refreshCurrentTab(true); 
            }
        } else {
            console.error("stateManager.setCurrentPresentationStudyId ist nicht verfügbar.");
        }
    }
    
    function _handleCriteriaComparisonSetChange(event) {
        const checkbox = event.target;
        const setId = checkbox.value;
        const isChecked = checkbox.checked;
        
        if (typeof stateManager !== 'undefined' && typeof stateManager.getCriteriaComparisonSets === 'function' && typeof stateManager.setCriteriaComparisonSets === 'function') {
            let currentSets = stateManager.getCriteriaComparisonSets();
            if (isChecked) {
                if (!currentSets.includes(setId)) {
                    currentSets.push(setId);
                }
            } else {
                currentSets = currentSets.filter(id => id !== setId);
            }
            stateManager.setCriteriaComparisonSets(currentSets);
             if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.refreshCurrentTab === 'function') {
                 mainAppInterface.refreshCurrentTab(true);
            }
        } else {
             console.error("stateManager für CriteriaComparisonSets nicht verfügbar.");
        }
    }


    function register() {
        const praesentationTabPane = document.getElementById('praesentation-tab-pane');
        if (!praesentationTabPane) {
            console.warn("PraesentationEventHandlers: Praesentation-Tab-Pane ('praesentation-tab-pane') nicht gefunden. Handler nicht registriert.");
            return;
        }

        const viewRadios = praesentationTabPane.querySelectorAll('input[name="praesentationAnsicht"]');
        if (viewRadios && viewRadios.length > 0) {
            viewRadios.forEach(radio => {
                radio.removeEventListener('change', _handleViewChange);
                radio.addEventListener('change', _handleViewChange);
            });
        } else {
            console.warn("PraesentationEventHandlers: Ansicht-Radio-Buttons ('praesentationAnsicht') nicht gefunden.");
        }

        const studySelect = praesentationTabPane.querySelector('#praes-study-select');
        if (studySelect) {
            studySelect.removeEventListener('change', _handleStudySelectChange);
            studySelect.addEventListener('change', _handleStudySelectChange);
        } else {
            console.warn("PraesentationEventHandlers: Studien-Select ('praes-study-select') nicht gefunden.");
        }
        
        const criteriaComparisonCheckboxes = praesentationTabPane.querySelectorAll('.criteria-comparison-set-checkbox');
        if (criteriaComparisonCheckboxes && criteriaComparisonCheckboxes.length > 0) {
            criteriaComparisonCheckboxes.forEach(checkbox => {
                checkbox.removeEventListener('change', _handleCriteriaComparisonSetChange);
                checkbox.addEventListener('change', _handleCriteriaComparisonSetChange);
            });
        } else {
            
        }

        const contentArea = praesentationTabPane.querySelector('#praesentation-content-area');
        if (contentArea) {
            contentArea.removeEventListener('click', _handleDownloadDelegated);
            contentArea.addEventListener('click', _handleDownloadDelegated);
        } else {
            console.warn("PraesentationEventHandlers: Inhaltsbereich ('#praesentation-content-area') für delegierte Download-Handler nicht gefunden.");
        }
    }

    function _handleDownloadDelegated(event) {
        const chartDownloadBtn = event.target.closest('.chart-download-btn');
        const tableDownloadPngBtn = event.target.closest('.table-download-png-btn');
        const downloadPerformanceAsPurCsv = event.target.closest('#download-performance-as-pur-csv');
        const downloadPerformanceAsPurMd = event.target.closest('#download-performance-as-pur-md');
        const downloadPerformanceAsVsT2Csv = event.target.closest('#download-performance-as-vs-t2-csv');
        const downloadCompTableAsVsT2Md = event.target.closest('#download-comp-table-as-vs-t2-md');
        const downloadTestsAsVsT2Md = event.target.closest('#download-tests-as-vs-t2-md');

        if (chartDownloadBtn) {
            const chartId = chartDownloadBtn.dataset.chartId;
            const format = chartDownloadBtn.dataset.format;
            const chartName = chartDownloadBtn.dataset.chartName;
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleExportRequest === 'function') {
                mainAppInterface.handleExportRequest(format === 'png' ? 'chartSinglePNG' : 'chartSingleSVG', { chartId: chartId, chartName: chartName, format: format });
            }
        } else if (tableDownloadPngBtn) {
            const tableId = tableDownloadPngBtn.dataset.tableId;
            const tableName = tableDownloadPngBtn.dataset.tableName;
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleExportRequest === 'function') {
                mainAppInterface.handleExportRequest('tableSinglePNG', { tableId: tableId, tableName: tableName, format: 'png' });
            }
        } else if (downloadPerformanceAsPurCsv) {
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleExportRequest === 'function') {
                mainAppInterface.handleExportRequest('praesentationPerformanceASPurCSV');
            }
        } else if (downloadPerformanceAsPurMd) {
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleExportRequest === 'function') {
                mainAppInterface.handleExportRequest('praesentationPerformanceASPurMD');
            }
        } else if (downloadPerformanceAsVsT2Csv) {
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleExportRequest === 'function') {
                mainAppInterface.handleExportRequest('praesentationPerformanceASvsT2CSV');
            }
        } else if (downloadCompTableAsVsT2Md) {
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleExportRequest === 'function') {
                mainAppInterface.handleExportRequest('praesentationCompTableASvsT2MD');
            }
        } else if (downloadTestsAsVsT2Md) {
            if (typeof mainAppInterface !== 'undefined' && typeof mainAppInterface.handleExportRequest === 'function') {
                mainAppInterface.handleExportRequest('praesentationTestsASvsT2MD');
            }
        }
    }

    return Object.freeze({
        register
    });
})();

window.praesentationEventHandlers = praesentationEventHandlers;
