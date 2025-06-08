export const studyCriteria = {
    LurzSchaefer: {
        id: 'LurzSchaefer',
        name: 'Avocado Sign (Lurz & Schaefer)',
        type: 'avocado',
        citation: 'Lurz M, Schaefer J, et al. 2025',
        parameters: {} 
    },
    Brown: {
        id: 'Brown',
        name: 'T2 (Brown et al.)',
        type: 't2',
        citation: 'Brown G, et al. Radiology 2003',
        parameters: {
            size: 5,
            border: ['irregulär'],
            signal: ['heterogen']
        }
    },
    Koh: {
        id: 'Koh',
        name: 'T2 (Koh et al.)',
        type: 't2',
        citation: 'Koh DM, et al. Br J Radiol 2008',
        parameters: {
            size: 8,
            border: [],
            signal: []
        }
    },
    Horvat: {
        id: 'Horvat',
        name: 'T2 (Horvat et al.)',
        type: 't2',
        citation: 'Horvat N, et al. Radiology 2019',
        parameters: {
            size: 5,
            border: ['irregulär', 'spikuliert'],
            signal: ['heterogen']
        }
    }
};

function _evaluateAvocado(patient) {
    const prediction = patient.as === '+' ? 1 : 0;
    const score = patient.anzahl_as_plus_lk || 0;
    return { prediction, score };
}

function _evaluateT2(patient, parameters) {
    let isPatientPositive = false;
    let maxSuspiciousNodeSize = 0;

    if (!patient.lymphknoten_t2 || patient.lymphknoten_t2.length === 0) {
        return { prediction: 0, score: 0 };
    }

    for (const lk of patient.lymphknoten_t2) {
        let isLkSuspicious = false;
        
        const sizeCriteriaMet = lk.groesse >= parameters.size;
        
        let featureCriteriaMet = 0;
        const totalFeatures = parameters.border.length + parameters.signal.length;

        if (totalFeatures === 0) {
            if (sizeCriteriaMet) {
                isLkSuspicious = true;
            }
        } else {
            if (parameters.border.length > 0 && parameters.border.includes(lk.kontur)) {
                featureCriteriaMet++;
            }
            if (parameters.signal.length > 0 && parameters.signal.includes(lk.homogenitaet)) {
                featureCriteriaMet++;
            }
            
            if (sizeCriteriaMet && featureCriteriaMet > 0) {
                 isLkSuspicious = true;
            }
        }
        
        if (isLkSuspicious) {
            isPatientPositive = true;
            if (lk.groesse > maxSuspiciousNodeSize) {
                maxSuspiciousNodeSize = lk.groesse;
            }
        }
    }

    return {
        prediction: isPatientPositive ? 1 : 0,
        score: maxSuspiciousNodeSize
    };
}


function _evaluateBruteForce(patient, parameters) {
    const t2Result = _evaluateT2(patient, parameters);
    return t2Result;
}


export function evaluatePatient(patient, criterion) {
    switch (criterion.type) {
        case 'avocado':
            return _evaluateAvocado(patient);
        case 't2':
            return _evaluateT2(patient, criterion.parameters);
        case 'brute-force':
            return _evaluateBruteForce(patient, criterion.parameters);
        default:
            throw new Error(`Unknown criterion type: ${criterion.type}`);
    }
}
