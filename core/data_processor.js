const DataProcessor = {
    _rawData: null,
    _processedData: null,

    loadAndProcessData: function() {
        if (!window.studyData || !Array.isArray(window.studyData)) {
            console.error("Studiendaten konnten nicht geladen werden oder sind im falschen Format.");
            this._rawData = [];
            this._processedData = [];
            return;
        }
        
        this._rawData = window.studyData;
        this._processedData = this._rawData.map((item, index) => {
            const processedItem = { ...item };
            
            if (typeof processedItem.id === 'undefined') {
                processedItem.id = `item_${index}`;
            }
            
            const requiredKeys = [
                'groundTruth', 'avocado_sign', 't2_short_axis', 
                't2_long_axis', 't2_kontur_begrenzung', 't2_signalintensitaet'
            ];

            for (const key of requiredKeys) {
                if (typeof processedItem[key] === 'undefined' || processedItem[key] === null) {
                    console.warn(`Fehlender oder null-Wert für '${key}' in Datenzeile ${index}. Wird auf 0 gesetzt.`);
                    processedItem[key] = 0;
                }
            }

            return processedItem;
        });
        
        console.log("Daten erfolgreich geladen und verarbeitet.");
    },

    getProcessedData: function() {
        if (!this._processedData) {
            this.loadAndProcessData();
        }
        return this._processedData;
    },
    
    getRawData: function() {
        if (!this._rawData) {
            this.loadAndProcessData();
        }
        return this._rawData;
    },

    getDataHeaders: function() {
        if (!this.getProcessedData() || this.getProcessedData().length === 0) {
            return [];
        }
        return Object.keys(this.getProcessedData()[0]);
    }
};

window.DataProcessor = DataProcessor;
