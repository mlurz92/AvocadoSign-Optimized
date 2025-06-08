// js/core/t2_criteria_manager.js

class T2CriteriaManager {
    constructor() {
        // Der Konstruktor kann Initialisierungen vornehmen, falls benötigt
    }

    /**
     * Helper function to evaluate a single criterion for a patient.
     * This function is duplicated here to ensure the class is self-contained
     * for criterion evaluation logic, mirroring its use in other core components and workers.
     * @param {Object} patientData - The data of a single patient.
     * @param {Object} criterion - A criterion object with param, threshold, and operator.
     * @returns {boolean} True if the criterion is met, otherwise False.
     */
    evaluateCriterion(patientData, criterion) {
        const value = patientData[criterion.param];
        const threshold = criterion.threshold;
        const operator = criterion.operator;

        switch (operator) {
            case '>': return value > threshold;
            case '<': return value < threshold;
            case '>=': return value >= threshold;
            case '<=': return value <= threshold;
            case '==': return value === threshold;
            case '!=': return value !== threshold;
            default: return false;
        }
    }

    /**
     * Evaluates a set of T2 criteria for a patient.
     * For a specific T2 criteria set (e.g., Koh 2008), ALL criteria within that set must be met.
     * @param {Object} patientData - The data of a single patient.
     * @param {Array<Object>} criterionDefinition - An array of criterion objects defining a specific T2 criterion set.
     * @returns {boolean} True if all criteria in the definition are met, otherwise False.
     */
    calculateT2Criteria(patientData, criterionDefinition) {
        if (!patientData || !criterionDefinition || !Array.isArray(criterionDefinition)) {
            console.error("Invalid input for calculateT2Criteria:", { patientData, criterionDefinition });
            return false;
        }

        if (criterionDefinition.length === 0) {
            // If no criteria are defined for a set, it cannot be met.
            return false;
        }

        // A patient is considered positive for this T2 criterion set if ALL criteria within the definition are met.
        for (const criterion of criterionDefinition) {
            if (!this.evaluateCriterion(patientData, criterion)) {
                return false; // If any single criterion is not met, the entire set is not met.
            }
        }
        return true; // All criteria in the definition were met.
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen, wie in der ursprünglichen Architektur
const T2CriteriaManagerInstance = new T2CriteriaManager();
