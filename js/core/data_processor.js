const dataProcessor = (() => {

    function _calculateAge(birthdate, examDate) {
        if (!birthdate || !examDate) {
            return null;
        }
        let birth;
        let exam;
        try {
            birth = new Date(birthdate);
            exam = new Date(examDate);
            if (isNaN(birth.getTime()) || isNaN(exam.getTime()) || birth > exam) {
                return null;
            }
        } catch (e) {
            return null;
        }
        let age = exam.getFullYear() - birth.getFullYear();
        const monthDiff = exam.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && exam.getDate() < birth.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    }

    function _processSinglePatient(patient, index) {
        const processedPatient = {};
        const patientNr = typeof patient.nr === 'number' ? patient.nr : index + 1;

        processedPatient.nr = patientNr;
        processedPatient.name = typeof patient.name === 'string' ? patient.name.trim() : 'Unbekannt';
        processedPatient.vorname = typeof patient.vorname === 'string' ? patient.vorname.trim() : '';
        processedPatient.geburtsdatum = patient.geburtsdatum || null;
        processedPatient.untersuchungsdatum = patient.untersuchungsdatum || null;
        processedPatient.geschlecht = (patient.geschlecht === 'm' || patient.geschlecht === 'f') ? patient.geschlecht : 'unbekannt';
        processedPatient.therapie = (patient.therapie === 'direkt OP' || patient.therapie === 'nRCT') ? patient.therapie : 'unbekannt';
        processedPatient.n = (patient.n === '+' || patient.n === '-') ? patient.n : null;
        processedPatient.as = (patient.as === '+' || patient.as === '-') ? patient.as : null;

        const validateCount = (value) => (typeof value === 'number' && value >= 0 && Number.isInteger(value)) ? value : 0;
        processedPatient.anzahl_patho_lk = validateCount(patient.anzahl_patho_lk);
        processedPatient.anzahl_patho_n_plus_lk = validateCount(patient.anzahl_patho_n_plus_lk);
        processedPatient.anzahl_as_lk = validateCount(patient.anzahl_as_lk);
        processedPatient.anzahl_as_plus_lk = validateCount(patient.anzahl_as_plus_lk);

        processedPatient.bemerkung = typeof patient.bemerkung === 'string' ? patient.bemerkung.trim() : '';
        processedPatient.alter = _calculateAge(processedPatient.geburtsdatum, processedPatient.untersuchungsdatum);

        const rawLymphknotenT2 = patient.lymphknoten_t2;
        processedPatient.lymphknoten_t2 = [];
        processedPatient.anzahl_t2_lk = 0;

        if (Array.isArray(rawLymphknotenT2)) {
            processedPatient.lymphknoten_t2 = rawLymphknotenT2.map(lk => {
                if (typeof lk !== 'object' || lk === null) return null;
                const processedLk = {};
                processedLk.groesse = (typeof lk.groesse === 'number' && !isNaN(lk.groesse) && lk.groesse >= 0) ? lk.groesse : null;

                const validateEnum = (value, allowedValues) => {
                     return (typeof value === 'string' && value !== null && allowedValues.includes(value.trim().toLowerCase()))
                         ? value.trim().toLowerCase()
                         : null;
                };

                processedLk.form = validateEnum(lk.form, APP_CONFIG.T2_CRITERIA_SETTINGS.FORM_VALUES);
                processedLk.kontur = validateEnum(lk.kontur, APP_CONFIG.T2_CRITERIA_SETTINGS.KONTUR_VALUES);
                processedLk.homogenitaet = validateEnum(lk.homogenitaet, APP_CONFIG.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES);
                processedLk.signal = validateEnum(lk.signal, APP_CONFIG.T2_CRITERIA_SETTINGS.SIGNAL_VALUES);

                return processedLk;
            }).filter(lk => lk !== null);
            processedPatient.anzahl_t2_lk = processedPatient.lymphknoten_t2.length;
        }

        processedPatient.t2 = null;
        processedPatient.anzahl_t2_plus_lk = 0;
        processedPatient.lymphknoten_t2_bewertet = [];

        return processedPatient;
    }

    function processPatientData(rawData) {
        if (!Array.isArray(rawData)) {
            return [];
        }
        return rawData.map((patient, index) => _processSinglePatient(patient, index));
    }

    function filterDataByKollektiv(data, kollektiv) {
        if (!Array.isArray(data)) {
            return [];
        }
        const filteredData = (kollektiv && kollektiv !== 'Gesamt')
            ? data.filter(p => p && p.therapie === kollektiv)
            : data;

        return utils.cloneDeep(filteredData);
    }

    return Object.freeze({
        processPatientData,
        filterDataByKollektiv
    });

})();
