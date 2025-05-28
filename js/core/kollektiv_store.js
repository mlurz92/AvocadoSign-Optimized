const kollektivStore = (() => {
    let _processedData = [];

    function setRawData(rawData) {
        if (typeof dataProcessor === 'undefined' || typeof dataProcessor.processPatientData !== 'function') {
            console.error("kollektivStore: dataProcessor.processPatientData ist nicht verfügbar.");
            _processedData = Array.isArray(rawData) ? rawData : [];
            return;
        }
        try {
            _processedData = dataProcessor.processPatientData(rawData);
        } catch (error) {
            console.error("kollektivStore: Fehler bei der Datenverarbeitung mit dataProcessor.processPatientData:", error);
            _processedData = Array.isArray(rawData) ? rawData : [];
        }
    }

    function getAllProcessedData() {
        if (typeof cloneDeep === 'function') {
            return cloneDeep(_processedData);
        } else {
            try {
                return JSON.parse(JSON.stringify(_processedData));
            } catch (e) {
                console.warn("kollektivStore: cloneDeep nicht verfügbar und JSON.parse(JSON.stringify()) fehlgeschlagen. Gebe direkte Referenz zurück, was zu Nebeneffekten führen kann.");
                return _processedData;
            }
        }
    }

    return Object.freeze({
        setRawData,
        getAllProcessedData
    });
})();
