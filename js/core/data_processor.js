import { calculateAge, deepClone } from '../utils/helpers.js';
import { studyCriteria, evaluatePatient } from './criteria_manager.js';

export function processInitialData(rawData) {
    const processedData = deepClone(rawData);

    return processedData.map(patient => {
        patient.age = calculateAge(patient.geburtsdatum, patient.untersuchungsdatum);
        patient.groundTruth = patient.n === '+' ? 1 : 0;
        
        patient.evaluations = {};

        for (const key in studyCriteria) {
            if (Object.prototype.hasOwnProperty.call(studyCriteria, key)) {
                const criterion = studyCriteria[key];
                patient.evaluations[criterion.id] = evaluatePatient(patient, criterion);
            }
        }
        
        return patient;
    });
}
