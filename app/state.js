const AppState = {
    _state: {
        activeTab: AppConfig.settings.initialTab,
        selectedCriteriaId: 'avocado',
        allResults: {},
        publicationData: null
    },

    init: function() {
        this.calculateAllResults();
        this._preparePublicationData();
    },

    getActiveTab: function() {
        return this._state.activeTab;
    },

    setActiveTab: function(tabId) {
        this._state.activeTab = tabId;
    },

    getSelectedCriteria: function() {
        return this._state.selectedCriteriaId;
    },

    setSelectedCriteria: function(criteriaId) {
        this._state.selectedCriteriaId = criteriaId;
    },
    
    getResultsForCriterion: function(criteriaId) {
        return this._state.allResults[criteriaId];
    },

    calculateAllResults: function() {
        const data = DataProcessor.getProcessedData();
        const criteria = CriteriaManager.getAllCriteria();
        
        criteria.forEach(criterion => {
            if (criterion.type === 'dynamic' && !criterion.isOptimized) {
                this._state.allResults[criterion.id] = null;
                return;
            }
            
            const matrix = StatisticsService.calculateConfusionMatrix(data, criterion.apply.bind(criterion));
            const metrics = StatisticsService.calculateMetrics(matrix);
            const rocData = StatisticsService.calculateROCData(data, criterion);
            const auc = StatisticsService.calculateAUC(rocData);
            metrics.auc = { value: auc };
            
            this._state.allResults[criterion.id] = metrics;
        });
    },

    updateBruteForceResults: function(bestParams, bestThreshold) {
        CriteriaManager.updateBruteForceCriterion(bestParams, bestThreshold);
        this.calculateAllResults(); // Recalculate all results including the new one
        this._preparePublicationData(); // Update publication data as well
    },
    
    _preparePublicationData: function() {
        const data = DataProcessor.getProcessedData();
        const criteriaToCompare = ['beets_tan_2018', 'koh_2008', 'barbaro_2024', 'rutegard_2025'];
        const avocadoCriterion = CriteriaManager.getCriteriaById('avocado');

        const comparisons = {};
        criteriaToCompare.forEach(id => {
            const otherCriterion = CriteriaManager.getCriteriaById(id);
            const key = `avocado_vs_${id}`;
            // DeLong test would be called here. For now, we mock the result structure.
            // const delongResult = StatisticsService.compareROC_AUC(data, avocadoCriterion, otherCriterion);
            // comparisons[key] = delongResult;
            
            // Mocked data for demonstration until DeLong library is integrated
            const mockAUC1 = this._state.allResults['avocado'] ? this._state.allResults['avocado'].auc.value : 0;
            const mockAUC2 = this._state.allResults[id] ? this._state.allResults[id].auc.value : 0;
            const pValue = Math.random(); // Placeholder
            comparisons[key] = {
                p: pValue,
                z: (mockAUC1 - mockAUC2) * 5, // Placeholder
                auc1: mockAUC1,
                auc2: mockAUC2
            };
        });
        
        const positiveLnCount = data.filter(d => d.groundTruth === 1).length;

        this._state.publicationData = {
            patientCount: new Set(data.map(d => d.patient_id)).size,
            lnCount: data.length,
            positiveLnCount: positiveLnCount,
            avocado: this.getResultsForCriterion('avocado'),
            beets_tan_2018: this.getResultsForCriterion('beets_tan_2018'),
            koh_2008: this.getResultsForCriterion('koh_2008'),
            barbaro_2024: this.getResultsForCriterion('barbaro_2024'),
            rutegard_2025: this.getResultsForCriterion('rutegard_2025'),
            bruteForce: {
                ...this.getResultsForCriterion('brute_force_optimized'),
                name: CriteriaManager.getCriteriaById('brute_force_optimized').name
            },
            comparison: comparisons
        };
    },
    
    getPublicationData: function() {
        if (!this._state.publicationData) {
            this._preparePublicationData();
        }
        return this._state.publicationData;
    }
};

window.AppState = AppState;
