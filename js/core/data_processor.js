const dataProcessor = (() => {
    let processedData = [];
    let rawData = [];

    function calculateAge(geburtsdatum, untersuchungsdatum) {
        if (!geburtsdatum || !untersuchungsdatum) return null;
        try {
            const birthDate = new Date(geburtsdatum);
            const examDate = new Date(untersuchungsdatum);
            if (isNaN(birthDate.getTime()) || isNaN(examDate.getTime())) return null;

            let age = examDate.getFullYear() - birthDate.getFullYear();
            const monthDiff = examDate.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && examDate.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 0 ? age : null;
        } catch (e) {
            console.error("Fehler bei Altersberechnung:", e);
            return null;
        }
    }

    function initializeData(patientDataRawInput) {
        if (!Array.isArray(patientDataRawInput)) {
            console.error("DataProcessor: Ungültige Rohdaten für Initialisierung empfangen.");
            rawData = [];
            processedData = [];
            return;
        }
        rawData = patientDataRawInput;
        processedData = rawData.map(patient => {
            const age = calculateAge(patient.geburtsdatum, patient.untersuchungsdatum);
            const anzahl_patho_lk_val = parseInt(patient.anzahl_patho_lk, 10);
            const anzahl_patho_n_plus_lk_val = parseInt(patient.anzahl_patho_n_plus_lk, 10);
            const anzahl_as_lk_val = parseInt(patient.anzahl_as_lk, 10);
            const anzahl_as_plus_lk_val = parseInt(patient.anzahl_as_plus_lk, 10);
            
            let lymphknoten_t2_processed = [];
            if (Array.isArray(patient.lymphknoten_t2)) {
                lymphknoten_t2_processed = patient.lymphknoten_t2.map(lk => ({
                    ...lk,
                    groesse: parseFloat(lk.groesse) || null
                }));
            }


            return {
                ...patient,
                id: String(patient.nr), 
                alter: age,
                anzahl_patho_lk: isNaN(anzahl_patho_lk_val) ? null : anzahl_patho_lk_val,
                anzahl_patho_n_plus_lk: isNaN(anzahl_patho_n_plus_lk_val) ? null : anzahl_patho_n_plus_lk_val,
                anzahl_as_lk: isNaN(anzahl_as_lk_val) ? null : anzahl_as_lk_val,
                anzahl_as_plus_lk: isNaN(anzahl_as_plus_lk_val) ? null : anzahl_as_plus_lk_val,
                lymphknoten_t2: lymphknoten_t2_processed,
                t2_status_calculated: 'unbekannt', 
                anzahl_t2_plus_lk_calculated: 0,
                anzahl_t2_lk_calculated: lymphknoten_t2_processed.length
            };
        });
    }

    function getProcessedData(kollektivId = null) {
        if (!kollektivId || kollektivId === 'Gesamt') {
            return cloneDeep(processedData);
        }
        return cloneDeep(processedData.filter(p => p.therapie === kollektivId));
    }
    
    function getPatientById(patientId) {
        const idStr = String(patientId);
        return cloneDeep(processedData.find(p => p.id === idStr));
    }

    function getHeaderStats(kollektivId, t2Criteria, t2Logic) {
        const dataFuerKollektiv = getProcessedData(kollektivId);
        if (!dataFuerKollektiv || dataFuerKollektiv.length === 0) {
            return { kollektiv: getKollektivDisplayName(kollektivId), anzahlPatienten: 0, statusN: '0/0', statusAS: '0/0', statusT2: '0/0' };
        }

        let nPlusCount = 0;
        let asPlusCount = 0;
        let t2PlusCount = 0;

        const dataWithT2Applied = t2CriteriaManager.evaluateCriteriaForAllPatients(dataFuerKollektiv, t2Criteria, t2Logic, 'header_t2_status');

        dataWithT2Applied.forEach(patient => {
            if (patient.n === '+') nPlusCount++;
            if (patient.as === '+') asPlusCount++;
            if (patient.header_t2_status === '+') t2PlusCount++;
        });
        
        const totalPatients = dataFuerKollektiv.length;

        return {
            kollektiv: getKollektivDisplayName(kollektivId),
            anzahlPatienten: totalPatients,
            statusN: `${nPlusCount}/${totalPatients}`,
            statusAS: `${asPlusCount}/${totalPatients}`,
            statusT2: `${t2PlusCount}/${totalPatients}`
        };
    }
    
    function getRawData() {
        return cloneDeep(rawData);
    }

    return Object.freeze({
        initializeData,
        getProcessedData,
        getPatientById,
        getHeaderStats,
        getRawData,
        calculateAge 
    });
})();
