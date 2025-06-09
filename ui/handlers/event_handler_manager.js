const EventHandlerManager = {
    _appState: null,
    _uiManager: null,
    _bruteForceService: null,

    init: function(appState, uiManager, bruteForceService) {
        this._appState = appState;
        this._uiManager = uiManager;
        this._bruteForceService = bruteForceService;

        this._addTabClickHandlers();
        this._addCriteriaChangeHandler();
        this._addBruteForceHandler();
        this._addExportHandlers();
    },

    _addTabClickHandlers: function() {
        const tabContainer = document.getElementById(AppConfig.domIds.tabContainer);
        if (!tabContainer) return;

        tabContainer.addEventListener('click', (event) => {
            if (event.target.matches('[data-tab]')) {
                const tabId = event.target.getAttribute('data-tab');
                this._appState.setActiveTab(tabId);
                this._uiManager.updateActiveTab(tabId);
                this._uiManager.renderCurrentTabContent();
            }
        });
    },

    _addCriteriaChangeHandler: function() {
        const selectElement = document.getElementById(AppConfig.domIds.inputs.t2CriteriaSelect);
        if (!selectElement) return;

        selectElement.addEventListener('change', (event) => {
            const selectedCriteriaId = event.target.value;
            this._appState.setSelectedCriteria(selectedCriteriaId);
            this._uiManager.updateResults();
        });
    },

    _addBruteForceHandler: function() {
        const button = document.getElementById(AppConfig.domIds.buttons.startBruteForce);
        if (!button) return;

        button.addEventListener('click', () => {
            this._bruteForceService.start();
        });
    },

    _addExportHandlers: function() {
        const downloadPubBtn = document.getElementById(AppConfig.domIds.buttons.downloadPublication);
        const downloadPresBtn = document.getElementById(AppConfig.domIds.buttons.downloadPresentation);

        if(downloadPubBtn) {
            downloadPubBtn.addEventListener('click', () => {
                const content = document.getElementById(AppConfig.domIds.inputs.publicationContent).innerText;
                ExportService.exportTextAsFile(content, 'publication_avocado_sign.txt');
            });
        }

        if(downloadPresBtn) {
            downloadPresBtn.addEventListener('click', () => {
                // This will be expanded to export slides as PNGs or a PPTX file later.
                // For now, we export the ROC chart.
                ExportService.exportCanvasAsPNG(AppConfig.domIds.inputs.rocChart, 'roc_curve.png');
            });
        }
    }
};

window.EventHandlerManager = EventHandlerManager;
