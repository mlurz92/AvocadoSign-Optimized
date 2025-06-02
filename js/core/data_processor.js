const dataProcessor = (() => {
    let _initialized = false;

    function initialize() {
        _initialized = true;
    }

    function _calculatePatientT2Status(patientLymphknoten, t2Criteria, t2Logic) {
        if (!patientLymphknoten || patientLymphknoten.length === 0) return 0;
        if (!t2Criteria || Object.keys(t2Criteria).length === 0) return 0;

        let overallPatientStatusIsPositive = false;

        for (const lk of patientLymphknoten) {
            let criteriaMetForLK = 0;
            let activeCriteriaCountForLK = 0;
            let lkIsPositive = false;

            if (t2Criteria.size && t2Criteria.size.active) {
                activeCriteriaCountForLK++;
                if (lk.kurzachse_mm >= t2Criteria.size.threshold) {
                    criteriaMetForLK++;
                    if (t2Logic === 'ODER') { lkIsPositive = true; break; }
                } else if (t2Logic === 'UND') {
                    lkIsPositive = false; continue; 
                }
            }
            if (t2Criteria.form && t2Criteria.form.active) {
                activeCriteriaCountForLK++;
                if (lk.form === t2Criteria.form.value) {
                    criteriaMetForLK++;
                    if (t2Logic === 'ODER') { lkIsPositive = true; break; }
                } else if (t2Logic === 'UND') {
                    lkIsPositive = false; continue;
                }
            }
            if (t2Criteria.kontur && t2Criteria.kontur.active) {
                activeCriteriaCountForLK++;
                if (lk.kontur === t2Criteria.kontur.value) {
                    criteriaMetForLK++;
                    if (t2Logic === 'ODER') { lkIsPositive = true; break; }
                } else if (t2Logic === 'UND') {
                    lkIsPositive = false; continue;
                }
            }
            if (t2Criteria.homogenitaet && t2Criteria.homogenitaet.active) {
                activeCriteriaCountForLK++;
                if (lk.homogenitaet === t2Criteria.homogenitaet.value) {
                    criteriaMetForLK++;
                    if (t2Logic === 'ODER') { lkIsPositive = true; break; }
                } else if (t2Logic === 'UND') {
                    lkIsPositive = false; continue;
                }
            }
            if (t2Criteria.signal && t2Criteria.signal.active) {
                activeCriteriaCountForLK++;
                if (lk.signal && lk.signal === t2Criteria.signal.value) { 
                    criteriaMetForLK++;
                    if (t2Logic === 'ODER') { lkIsPositive = true; break; }
                } else if (t2Logic === 'UND') {
                    lkIsPositive = false; continue;
                }
            }
            
            if (activeCriteriaCountForLK === 0) { 
                lkIsPositive = false;
            } else if (t2Logic === 'UND' && criteriaMetForLK === activeCriteriaCountForLK) {
                lkIsPositive = true;
            } else if (t2Logic === 'ODER' && criteriaMetForLK > 0) {
                lkIsPositive = true;
            }


            if (lkIsPositive) {
                overallPatientStatusIsPositive = true;
                break; 
            }
        }
        return overallPatientStatusIsPositive ? 1 : 0;
    }

    function _calculatePatientASStatus(patientLymphknoten) {
        if (!patientLymphknoten || patientLymphknoten.length === 0) return 0;
        for (const lk of patientLymphknoten) {
            if (lk.avocado_sign === 1) {
                return 1; 
            }
        }
        return 0;
    }

    function processRawData(rawData, appliedT2Criteria = null, appliedT2Logic = null) {
        if (!Array.isArray(rawData)) {
            console.error("processRawData: rawData ist kein Array.");
            return [];
        }
        
        const defaultCriteria = appliedT2Criteria || (typeof APP_CONFIG !== 'undefined' ? cloneDeep(APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_T2_CRITERIA) : getDefaultT2Criteria());
        const defaultLogic = appliedT2Logic || (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.DEFAULT_SETTINGS.DEFAULT_T2_LOGIC : 'UND');

        return rawData.map((patient, index) => {
            const processedPatient = { ...patient };
            processedPatient.originalIndex = index; 

            processedPatient.n_status_patient = parseInt(patient.n_status_patient, 10) || 0;
            
            processedPatient.t2_lymphknoten = Array.isArray(patient.t2_lymphknoten) ? patient.t2_lymphknoten.map(lk => ({
                ...lk,
                kurzachse_mm: parseFloat(lk.kurzachse_mm) || 0
            })) : [];

            processedPatient.avocado_sign_lymphknoten = Array.isArray(patient.avocado_sign_lymphknoten) ? patient.avocado_sign_lymphknoten.map(lk => ({
                ...lk,
                avocado_sign: parseInt(lk.avocado_sign, 10) || 0
            })) : [];
            
            processedPatient.as_status_patient = _calculatePatientASStatus(processedPatient.avocado_sign_lymphknoten);
            processedPatient.t2_status_patient = _calculatePatientT2Status(processedPatient.t2_lymphknoten, defaultCriteria, defaultLogic);
            
            processedPatient.alter = parseInt(patient.alter, 10) || null;

            return processedPatient;
        });
    }

    function filterDataByKollektiv(processedData, kollektivId) {
        if (!Array.isArray(processedData)) return [];
        if (!kollektivId || kollektivId === 'Gesamt') {
            return processedData;
        }
        return processedData.filter(patient => patient.therapie === kollektivId);
    }
    
    function getPatientById(patientId, processedData = null, rawDataSource = null) {
        const dataToSearch = processedData || (rawDataSource ? processRawData(rawDataSource) : []);
        if (!patientId || !dataToSearch || dataToSearch.length === 0) return null;
        const id = String(patientId); 
        return dataToSearch.find(p => String(p.id_patient) === id);
    }

    return Object.freeze({
        initialize,
        processRawData,
        filterDataByKollektiv,
        getPatientById
    });
})();
