const UIManager = {
    _appState: null,

    init: function(appState) {
        this._appState = appState;
        this._renderAppShell();
        this.updateActiveTab(appState.getActiveTab());
        this.renderCurrentTabContent();
    },

    _renderAppShell: function() {
        const appContainer = document.getElementById(AppConfig.domIds.appContainer);
        appContainer.innerHTML = ''; // Clear previous content

        const header = DOMComponents.createElement('header', {
            className: 'bg-white shadow-md',
            innerHTML: `<div class="container mx-auto px-4 py-4">
                            <h1 class="text-2xl font-bold text-gray-800">${AppConfig.appName}</h1>
                            <p class="text-sm text-gray-600">Version ${AppConfig.appVersion}</p>
                        </div>`
        });
        
        const tabContainer = DOMComponents.createElement('div', { id: AppConfig.domIds.tabContainer, className: 'container mx-auto px-4 border-b border-gray-200' });
        const tabsWrapper = DOMComponents.createElement('nav', { className: 'flex space-x-4' });
        
        const tabs = [
            { id: 'daten', text: 'Daten' },
            { id: 'auswertung', text: 'Auswertung' },
            { id: 'statistik', text: 'Statistik' },
            { id: 'publikation', text: 'Publikation' },
            { id: 'praesentation', text: 'Präsentation' }
        ];

        tabs.forEach(tab => {
            const tabEl = DOMComponents.createElement('button', {
                className: `py-3 px-1 border-b-2 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300`,
                textContent: tab.text,
                attributes: { 'data-tab': tab.id }
            });
            tabsWrapper.appendChild(tabEl);
        });
        tabContainer.appendChild(tabsWrapper);
        
        const contentContainer = DOMComponents.createElement('main', { id: AppConfig.domIds.contentContainer, className: 'container mx-auto p-4' });

        appContainer.append(header, tabContainer, contentContainer);
    },
    
    updateActiveTab: function(activeTabId) {
        document.querySelectorAll('[data-tab]').forEach(tab => {
            if (tab.getAttribute('data-tab') === activeTabId) {
                tab.classList.remove('text-gray-500', 'border-transparent');
                tab.classList.add('text-blue-600', 'border-blue-600');
            } else {
                tab.classList.remove('text-blue-600', 'border-blue-600');
                tab.classList.add('text-gray-500', 'border-transparent');
            }
        });
    },

    renderCurrentTabContent: function() {
        const contentContainer = document.getElementById(AppConfig.domIds.contentContainer);
        contentContainer.innerHTML = '';
        const activeTabId = this._appState.getActiveTab();
        
        const tabContentContainer = DOMComponents.createElement('div', { id: AppConfig.domIds.tabs[activeTabId] });

        switch (activeTabId) {
            case 'daten':
                this._renderDatenTab(tabContentContainer);
                break;
            case 'auswertung':
                this._renderAuswertungTab(tabContentContainer);
                break;
            case 'statistik':
                this._renderStatistikTab(tabContentContainer);
                break;
            case 'publikation':
                this._renderPublikationTab(tabContentContainer);
                break;
            case 'praesentation':
                this._renderPraesentationTab(tabContentContainer);
                break;
        }
        contentContainer.appendChild(tabContentContainer);
    },
    
    _renderDatenTab: function(container) {
        const data = DataProcessor.getProcessedData();
        const headers = DataProcessor.getDataHeaders();
        const tableContainer = DOMComponents.createElement('div', { id: AppConfig.domIds.inputs.dataTable });
        container.appendChild(tableContainer);
        TableRenderer.renderDataTable(AppConfig.domIds.inputs.dataTable, headers, data);
    },

    _renderAuswertungTab: function(container) {
        container.className = 'space-y-6';
        const criteriaSection = DOMComponents.createContainer({ id: AppConfig.domIds.sections.criteriaSelection });
        criteriaSection.appendChild(DOMComponents.createSectionHeader('Kriterien auswählen'));
        const selectOptions = CriteriaManager.getSelectOptions();
        const select = DOMComponents.createSelect({ id: AppConfig.domIds.inputs.t2CriteriaSelect, options: selectOptions });
        criteriaSection.appendChild(select);
        
        const bruteForceSection = DOMComponents.createContainer({ id: AppConfig.domIds.sections.bruteForce });
        bruteForceSection.appendChild(DOMComponents.createSectionHeader('Brute-Force-Optimierung'));
        const progressBar = DOMComponents.createProgressBar(AppConfig.domIds.inputs.bruteForceProgress, AppConfig.domIds.inputs.bruteForceProgressLabel);
        const startButton = DOMComponents.createButton({id: AppConfig.domIds.buttons.startBruteForce, text: 'Optimierung starten'});
        bruteForceSection.append(progressBar, startButton);
        
        container.append(criteriaSection, bruteForceSection);
    },

    _renderStatistikTab: function(container) {
        container.className = 'grid grid-cols-1 lg:grid-cols-2 gap-6';
        const resultsContainer = DOMComponents.createContainer({ id: AppConfig.domIds.sections.results });
        const chartContainer = DOMComponents.createContainer({ id: AppConfig.domIds.sections.charts });
        chartContainer.appendChild(DOMComponents.createElement('canvas', { id: AppConfig.domIds.inputs.rocChart, attributes: { height: '400px' }}));
        resultsContainer.innerHTML = `<div id="${AppConfig.domIds.inputs.resultsTable}"></div>`;
        container.append(resultsContainer, chartContainer);
        this.updateResults();
    },

    _renderPublikationTab: function(container) {
        const downloadBtn = DOMComponents.createButton({ id: AppConfig.domIds.buttons.downloadPublication, text: 'Als Textdatei herunterladen' });
        const contentDiv = DOMComponents.createElement('div', { id: AppConfig.domIds.inputs.publicationContent, className: 'mt-4' });
        container.append(downloadBtn, contentDiv);
        PublicationRenderer.renderPublication(AppConfig.domIds.inputs.publicationContent, this._appState.getPublicationData());
    },

    _renderPraesentationTab: function(container) {
        const downloadBtn = DOMComponents.createButton({ id: AppConfig.domIds.buttons.downloadPresentation, text: 'ROC-Kurve herunterladen (PNG)' });
        container.append(downloadBtn);
    },
    
    updateResults: function() {
        if (this._appState.getActiveTab() !== 'statistik') return;
        
        const selectedId = this._appState.getSelectedCriteria();
        const criterion = CriteriaManager.getCriteriaById(selectedId);
        if (!criterion) return;
        
        const data = DataProcessor.getProcessedData();
        const matrix = StatisticsService.calculateConfusionMatrix(data, criterion.apply.bind(criterion));
        const metrics = StatisticsService.calculateMetrics(matrix);
        
        TableRenderer.renderResultsTable(AppConfig.domIds.inputs.resultsTable, metrics);
        
        const rocData = StatisticsService.calculateROCData(data, criterion);
        const auc = StatisticsService.calculateAUC(rocData);
        const chartDataSet = [{
            label: `${criterion.name} (AUC = ${auc.toFixed(3)})`,
            data: rocData,
            borderColor: AppConfig.settings.chartColors.t2
        }];

        ChartRenderer.renderRocChart(AppConfig.domIds.inputs.rocChart, chartDataSet);
    },

    updateBruteForceProgress: function(progress, message) {
        const progressBar = document.getElementById(AppConfig.domIds.inputs.bruteForceProgress);
        const progressLabel = document.getElementById(AppConfig.domIds.inputs.bruteForceProgressLabel);
        if (progressBar && progressLabel) {
            const percentage = Math.round(progress * 100);
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `${percentage}%`;
            progressLabel.textContent = message;
        }
    }
};

window.UIManager = UIManager;
