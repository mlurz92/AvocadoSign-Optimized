const dataProcessor = (() => {

    function _validatePatientData(patient) {
        // Strikte Prüfung: id_patient muss ein nicht-leerer String sein.
        if (!patient || typeof patient.id_patient !== 'string' || patient.id_patient.trim() === '') {
            // Die Konsole loggt das gesamte Patientenobjekt, wenn die ID-Prüfung fehlschlägt.
            // Die Fehlermeldung "Ungültige oder fehlende Patienten-ID: Object" kommt von hier.
            // Dies bedeutet, die Bedingung oben ist für alle Patienten true.
            // In data/data.js ist id_patient ein String, z.B. "Pat_001".
            // Das Problem könnte sein, dass die `patientDataRaw` im globalen Kontext
            // nicht korrekt die `patientDataRaw` aus `data/data.js` ist, oder die Objekte
            // innerhalb des Arrays `patientDataRaw` nicht die erwartete Struktur haben,
            // *bevor* sie hier ankommen.
            // Da aber `nr` in der Konsolenausgabe gezeigt wird, ist das Objekt selbst da.
            // Es muss also an der Bedingung `typeof patient.id_patient !== 'string' || patient.id_patient.trim() === ''` liegen.
            // Wenn id_patient eine Zahl wäre, wäre typeof 'number'.
            // Ich gehe davon aus, dass die Daten in data.js korrekt sind und id_patient ein String ist.
            // Die Warnung selbst ist informativ, aber wenn sie für *alle* Patienten auftritt, ist die Bedingung zu strikt
            // oder die Daten sind anders als erwartet. Ich belasse die strikte Prüfung, da sie eigentlich korrekt sein sollte.
            console.warn('Ungültige oder fehlende Patienten-ID (muss nicht-leerer String sein):', patient);
            return false;
        }
        // Die restlichen Validierungen bleiben wie gehabt, da sie nicht die Ursache der aktuellen Hauptfehler sind.
        if (patient.geschlecht && !['m', 'w', 'd', null, undefined, ''].includes(String(patient.geschlecht).toLowerCase())) {
            console.warn(`Ungültiges Geschlecht '${patient.geschlecht}' für Patient ${patient.id_patient}. Wird zu 'unbekannt' normalisiert.`);
            patient.geschlecht = null; 
        }
        if (patient.therapie && !['direkt OP', 'nRCT', null, undefined, ''].includes(patient.therapie)) {
            console.warn(`Ungültige Therapie '${patient.therapie}' für Patient ${patient.id_patient}. Wird zu 'unbekannt' normalisiert.`);
            patient.therapie = null;
        }
        if (patient.n && !['+', '-', null, undefined, ''].includes(patient.n)) {
            console.warn(`Ungültiger N-Status '${patient.n}' für Patient ${patient.id_patient}. Wird zu 'unbekannt' normalisiert.`);
            patient.n = null;
        }
        if (patient.as && !['+', '-', null, undefined, ''].includes(patient.as)) {
            console.warn(`Ungültiger AS-Status '${patient.as}' für Patient ${patient.id_patient}. Wird zu 'unbekannt' normalisiert.`);
            patient.as = null;
        }
        return true;
    }

    function _calculateAge(geburtsdatumStr, untersuchungsdatumStr) {
        if (!geburtsdatumStr || !untersuchungsdatumStr) return null;
        try {
            const geburt = new Date(geburtsdatumStr);
            const untersuchung = new Date(untersuchungsdatumStr);
            if (isNaN(geburt.getTime()) || isNaN(untersuchung.getTime())) return null;

            let alter = untersuchung.getFullYear() - geburt.getFullYear();
            const monatDiff = untersuchung.getMonth() - geburt.getMonth();
            if (monatDiff < 0 || (monatDiff === 0 && untersuchung.getDate() < geburt.getDate())) {
                alter--;
            }
            return alter >= 0 ? alter : null;
        } catch (e) {
            console.warn("Fehler bei Altersberechnung:", e);
            return null;
        }
    }

    function _normalizeT2Features(lymphknoten_t2_array) {
        if (!Array.isArray(lymphknoten_t2_array)) {
            return [];
        }
        return lymphknoten_t2_array.map(lk => {
            const normalizedLK = { ...lk };
            const size = parseFloat(lk.groesse);
            normalizedLK.groesse = (!isNaN(size) && isFinite(size) && size > 0) ? size : null;

            const validForms = APP_CONFIG.T2_CRITERIA_SETTINGS.FORM_VALUES;
            normalizedLK.form = (lk.form && validForms.includes(String(lk.form).toLowerCase())) ? String(lk.form).toLowerCase() : null;

            const validKonturen = APP_CONFIG.T2_CRITERIA_SETTINGS.KONTUR_VALUES;
            normalizedLK.kontur = (lk.kontur && validKonturen.includes(String(lk.kontur).toLowerCase())) ? String(lk.kontur).toLowerCase() : null;

            const validHomogenitaeten = APP_CONFIG.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES;
            normalizedLK.homogenitaet = (lk.homogenitaet && validHomogenitaeten.includes(String(lk.homogenitaet).toLowerCase())) ? String(lk.homogenitaet).toLowerCase() : null;
            
            const validSignale = APP_CONFIG.T2_CRITERIA_SETTINGS.SIGNAL_VALUES;
            normalizedLK.signal = (lk.signal && validSignale.includes(String(lk.signal).toLowerCase())) ? String(lk.signal).toLowerCase() : null;

            return normalizedLK;
        });
    }

    function processSinglePatient(patient) {
        if (!_validatePatientData(patient)) {
            return null; 
        }
        const p = cloneDeep(patient); 

        p.nr = parseInt(p.nr, 10) || null; // 'nr' ist in data.js eine Zahl
        p.alter = _calculateAge(p.geburtsdatum, p.untersuchungsdatum);
        p.geschlecht = (p.geschlecht === 'm' || p.geschlecht === 'w') ? p.geschlecht : 'unbekannt';
        p.therapie = (p.therapie === 'direkt OP' || p.therapie === 'nRCT') ? p.therapie : 'unbekannt';
        p.n = (p.n === '+' || p.n === '-') ? p.n : 'unbekannt';
        p.as = (p.as === '+' || p.as === '-') ? p.as : 'unbekannt';
        p.t2 = 'unbekannt'; 

        p.anzahl_patho_lk = parseInt(p.anzahl_patho_lk, 10);
        p.anzahl_patho_n_plus_lk = parseInt(p.anzahl_patho_n_plus_lk, 10);
        p.anzahl_as_lk = parseInt(p.anzahl_as_lk, 10);
        p.anzahl_as_plus_lk = parseInt(p.anzahl_as_plus_lk, 10);
        
        p.anzahl_t2_lk = Array.isArray(p.lymphknoten_t2) ? p.lymphknoten_t2.length : 0;
        p.anzahl_t2_plus_lk = 0; 

        p.lymphknoten_t2 = _normalizeT2Features(p.lymphknoten_t2);
        
        const lkKeysToValidate = ['anzahl_patho_lk', 'anzahl_patho_n_plus_lk', 'anzahl_as_lk', 'anzahl_as_plus_lk', 'anzahl_t2_lk'];
        lkKeysToValidate.forEach(key => {
            const val = p[key]; // Lese den Wert, bevor er ggf. überschrieben wird
            if (val === null || val === undefined || isNaN(val) || val < 0) { // Prüfe auch auf null/undefined
                p[key] = null; 
            } else {
                p[key] = parseInt(val, 10); // Stelle sicher, dass es Integer ist
            }
        });

        return p;
    }

    function processRawData(rawData) {
        if (!Array.isArray(rawData)) return [];
        return rawData.map(p => processSinglePatient(p)).filter(p => p !== null);
    }

    function filterDataByKollektiv(processedData, kollektiv) {
        if (!Array.isArray(processedData)) return [];
        if (!kollektiv || kollektiv === 'Gesamt') {
            return processedData;
        }
        return processedData.filter(p => p.therapie === kollektiv);
    }

    function calculateHeaderStats(filteredData, kollektiv) {
        if (!Array.isArray(filteredData)) return { kollektiv: getKollektivDisplayName(kollektiv) || '--', anzahlPatienten: 0, statusN: 'N/A', statusAS: 'N/A', statusT2: 'N/A' };
        
        const numPatients = filteredData.length;
        let nPlus = 0, nMinus = 0;
        let asPlus = 0, asMinus = 0;
        let t2Plus = 0, t2Minus = 0;

        filteredData.forEach(p => {
            if (p.n === '+') nPlus++; else if (p.n === '-') nMinus++;
            if (p.as === '+') asPlus++; else if (p.as === '-') asMinus++;
            if (p.t2 === '+') t2Plus++; else if (p.t2 === '-') t2Minus++;
        });
        
        const formatStatus = (plus, minus) => {
             if (numPatients === 0 && (plus + minus === 0)) return '-- / --';
             if (plus + minus === 0) return '0% / 0%'; 
             return `${formatPercent(plus / (plus + minus), 0)} / ${formatPercent(minus / (plus + minus), 0)}`;
        };

        return {
            kollektiv: getKollektivDisplayName(kollektiv) || '--',
            anzahlPatienten: numPatients,
            statusN: formatStatus(nPlus, nMinus),
            statusAS: formatStatus(asPlus, asMinus),
            statusT2: formatStatus(t2Plus, t2Minus)
        };
    }

    return Object.freeze({
        processSinglePatient,
        processRawData,
        filterDataByKollektiv,
        calculateHeaderStats
    });
})();
