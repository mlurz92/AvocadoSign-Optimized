const dataProcessor = (() => {

    function calculateAge(birthdate, examDate) {
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

    function processSinglePatient(patient, index, config) {
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
        processedPatient.alter = calculateAge(processedPatient.geburtsdatum, processedPatient.untersuchungsdatum);

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

                processedLk.form = validateEnum(lk.form, config.T2_CRITERIA_SETTINGS.FORM_VALUES);
                processedLk.kontur = validateEnum(lk.kontur, config.T2_CRITERIA_SETTINGS.KONTUR_VALUES);
                processedLk.homogenitaet = validateEnum(lk.homogenitaet, config.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES);
                processedLk.signal = validateEnum(lk.signal, config.T2_CRITERIA_SETTINGS.SIGNAL_VALUES);

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
            console.error("processPatientData: Ungültige Eingabedaten, Array erwartet.");
            return [];
        }
        if (typeof APP_CONFIG === 'undefined') {
             console.error("processPatientData: APP_CONFIG ist nicht verfügbar.");
             return [];
        }

        return rawData.map((patient, index) => processSinglePatient(patient, index, APP_CONFIG));
    }

    function filterDataByKollektiv(data, kollektiv) {
        if (!Array.isArray(data)) {
            console.error("filterDataByKollektiv: Ungültige Eingabedaten, Array erwartet.");
            return [];
        }
        const filteredData = (kollektiv && kollektiv !== 'Gesamt')
            ? data.filter(p => p && p.therapie === kollektiv)
            : data;

        return cloneDeep(filteredData);
    }

    function calculateHeaderStats(data, currentKollektiv) {
         const n = data?.length ?? 0;
         const kollektivName = getKollektivDisplayName(currentKollektiv);
         const placeholder = '--';

         if (!Array.isArray(data) || n === 0) {
             return { kollektiv: kollektivName, anzahlPatienten: 0, statusN: placeholder, statusAS: placeholder, statusT2: placeholder, nPos: 0, nNeg: 0, asPos: 0, asNeg: 0, t2Pos: 0, t2Neg: 0 };
         }

         let nPos = 0, nNeg = 0, asPos = 0, asNeg = 0, t2Pos = 0, t2Neg = 0;
         data.forEach(p => {
             if (p) {
                if (p.n === '+') nPos++; else if (p.n === '-') nNeg++;
                if (p.as === '+') asPos++; else if (p.as === '-') asNeg++;
                if (p.t2 === '+') t2Pos++; else if (p.t2 === '-') t2Neg++;
             }
         });

         const formatStatus = (pos, neg) => {
             const totalKnown = pos + neg;
             return totalKnown > 0 ? `${formatPercent(pos / totalKnown, 1)} (+)` : placeholder;
         };

         return {
            kollektiv: kollektivName,
            anzahlPatienten: n,
            statusN: formatStatus(nPos, nNeg),
            statusAS: formatStatus(asPos, asNeg),
            statusT2: formatStatus(t2Pos, t2Neg),
            nPos: nPos,
            nNeg: nNeg,
            asPos: asPos,
            asNeg: asNeg,
            t2Pos: t2Pos,
            t2Neg: t2Neg
         };
    }

    return Object.freeze({
        processPatientData,
        filterDataByKollektiv,
        calculateHeaderStats
    });

})();
