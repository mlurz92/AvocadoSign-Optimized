// workers/brute_force_worker.js

// Duplizierte Konstanten aus js/config/constants.js für die Worker-Umgebung
const WorkerConstants = {
    CRITERIA_TYPES: {
        AVOCADO_SIGN: 'avocadoSign',
        T2_CRITERIA: 't2Criteria'
    },
    AVOCADO_SIGN_CRITERIA: [
        { id: 'avocado_sign_diameter_1', name: 'Durchmesser Lymphknoten > 5mm', param: 'diameter_ln_max', threshold: 5, operator: '>' },
        { id: 'avocado_sign_morphology_round', name: 'Morphologie rundlich', param: 'morphology_round', threshold: true, operator: '==' },
        { id: 'avocado_sign_signal_heterogeneous', name: 'Signal heterogen', param: 'signal_heterogeneous', threshold: true, operator: '==' },
        { id: 'avocado_sign_edema_peritumoral', name: 'Ödem peritumoral', param: 'edema_peritumoral', threshold: true, operator: '==' },
        { id: 'avocado_sign_signal_low', name: 'Signal niedrig', param: 'signal_low', threshold: true, operator: '==' },
        { id: 'avocado_sign_inhomogeneous_contrast', name: 'Inhomogenes Kontrastmittel-Enhancement', param: 'inhomogeneous_contrast', threshold: true, operator: '==' },
        { id: 'avocado_sign_necrosis', name: 'Nekrose', param: 'necrosis', threshold: true, operator: '==' },
        { id: 'avocado_sign_capsular_invasion', name: 'Kapselüberschreitung', param: 'capsular_invasion', threshold: true, operator: '==' }
    ],
    T2_CRITERIA_DEFINITIONS: {
        'Koh 2008': [
            { id: 'koh_diameter_long_axis_gt_8mm', name: 'Längsachsendurchmesser > 8mm', param: 'diameter_ln_long_axis', threshold: 8, operator: '>' },
            { id: 'koh_diameter_short_axis_gt_5mm', name: 'Kurzachsendurchmesser > 5mm', param: 'diameter_ln_short_axis', threshold: 5, operator: '>' },
            { id: 'koh_signal_heterogeneous', name: 'Heterogenes Signal', param: 'signal_heterogeneous', threshold: true, operator: '==' },
            { id: 'koh_signal_low', name: 'Niedriges Signal', param: 'signal_low', threshold: true, operator: '==' },
            { id: 'koh_morphology_round', name: 'Runde Morphologie', param: 'morphology_round', threshold: true, operator: '==' }
        ],
        'Beets-Tan 2004': [
            { id: 'beets_tan_2004_diameter_short_axis_gt_5mm', name: 'Kurzachsendurchmesser > 5mm', param: 'diameter_ln_short_axis', threshold: 5, operator: '>' }
        ],
        'Beets-Tan 2009': [
            { id: 'beets_tan_2009_morphology_irregular', name: 'Irreguläre Morphologie', param: 'morphology_irregular', threshold: true, operator: '==' }
        ],
        'Brown 2003': [
            { id: 'brown_diameter_short_axis_gt_3mm', name: 'Kurzachsendurchmesser > 3mm', param: 'diameter_ln_short_axis', threshold: 3, operator: '>' },
            { id: 'brown_morphology_irregular', name: 'Irreguläre Morphologie', param: 'morphology_irregular', threshold: true, operator: '==' },
            { id: 'brown_inhomogeneous_signal', name: 'Inhomogenes Signal', param: 'inhomogeneous_signal', threshold: true, operator: '==' }
        ],
        'Horvart 2019': [
            { id: 'horvart_morphology_spiculated', name: 'Spikulierte Morphologie', param: 'morphology_spiculated', threshold: true, operator: '==' },
            { id: 'horvart_central_necrosis', name: 'Zentrale Nekrose', param: 'central_necrosis', threshold: true, operator: '==' }
        ],
        'Kaur 2012': [
            { id: 'kaur_diameter_short_axis_gt_8mm', name: 'Kurzachsendurchmesser > 8mm', param: 'diameter_ln_short_axis', threshold: 8, operator: '>' },
            { id: 'kaur_morphology_irregular', name: 'Irreguläre Morphologie', param: 'morphology_irregular', threshold: true, operator: '==' }
        ],
        'Barbaro 2010': [
            { id: 'barbaro_diameter_long_axis_gt_8mm', name: 'Längsachsendurchmesser > 8mm', param: 'diameter_ln_long_axis', threshold: 8, operator: '>' },
            { id: 'barbaro_extracapsular_extension', name: 'Extrakapsuläre Extension', param: 'extracapsular_extension', threshold: true, operator: '==' }
        ]
    }
};

// Duplizierte Hilfsfunktionen aus js/utils/helpers.js für die Worker-Umgebung
function roundToDecimalPlaces(value, decimals) {
    if (typeof value !== 'number' || isNaN(value)) {
        return NaN;
    }
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

// Duplizierte Logik für Kriterienprüfung
function evaluateCriterion(patientData, criterion) {
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

// Duplizierte Logik für Avocado Sign und T2 Kriterien aus js/core/study_criteria_manager.js und js/core/t2_criteria_manager.js
const WorkerStudyCriteriaManager = {
    // Implementierung der Avocado Sign Logik: Ein Patient hat Avocado Sign, wenn mindestens 'minCriteriaToMeet'
    // der übergebenen 'criteria' für den Patienten zutreffen.
    calculateAvocadoSign: function(patientData, criteria, minCriteriaToMeet) {
        let score = 0;
        criteria.forEach(c => {
            if (evaluateCriterion(patientData, c)) {
                score++;
            }
        });
        return score >= minCriteriaToMeet;
    }
};

const WorkerT2CriteriaManager = {
    // Implementierung der T2 Kriterien Logik für eine gegebene Kriteriendefinition.
    // Diese Funktion prüft, ob ALLE Kriterien in der 'criterionDefinition' (ein Array von Kriterienobjekten)
    // für den Patienten zutreffen. Dies repräsentiert einen spezifischen Satz an Kriterien aus einer Publikation.
    calculateT2Criteria: function(patientData, criterionDefinition) {
        if (!criterionDefinition || criterionDefinition.length === 0) {
            return false;
        }
        return criterionDefinition.every(c => evaluateCriterion(patientData, c));
    }
};

// Duplizierte Statistik-Funktionen aus js/services/statistics_service.js für die Worker-Umgebung
const WorkerStatisticsService = {
    calculateSensitivity: function(truePositives, falseNegatives) {
        if ((truePositives + falseNegatives) === 0) return 0;
        return truePositives / (truePositives + falseNegatives);
    },

    calculateSpecificity: function(trueNegatives, falsePositives) {
        if ((trueNegatives + falsePositives) === 0) return 0;
        return trueNegatives / (trueNegatives + falsePositives);
    },

    calculateAccuracy: function(truePositives, trueNegatives, total) {
        if (total === 0) return 0;
        return (truePositives + trueNegatives) / total;
    },

    calculatePPV: function(truePositives, falsePositives) {
        if ((truePositives + falsePositives) === 0) return 0;
        return truePositives / (truePositives + falsePositives);
    },

    calculateNPV: function(trueNegatives, falseNegatives) {
        if ((trueNegatives + falseNegatives) === 0) return 0;
        return trueNegatives / (trueNegatives + falseNegatives);
    },

    calculateF1Score: function(truePositives, falsePositives, falseNegatives) {
        const precision = this.calculatePPV(truePositives, falsePositives);
        const recall = this.calculateSensitivity(truePositives, falseNegatives);
        if ((precision + recall) === 0) return 0;
        return 2 * (precision * recall) / (precision + recall);
    },

    calculateMetrics: function(data, predictionKey, groundTruthKey) {
        let tp = 0; // True Positives
        let tn = 0; // True Negatives
        let fp = 0; // False Positives
        let fn = 0; // False Negatives

        data.forEach(item => {
            const prediction = item[predictionKey];
            const groundTruth = item[groundTruthKey];

            if (prediction && groundTruth) {
                tp++;
            } else if (!prediction && !groundTruth) {
                tn++;
            } else if (prediction && !groundTruth) {
                fp++;
            } else if (!prediction && groundTruth) {
                fn++;
            }
        });

        const total = tp + tn + fp + fn;

        const sensitivity = this.calculateSensitivity(tp, fn);
        const specificity = this.calculateSpecificity(tn, fp);
        const accuracy = this.calculateAccuracy(tp, tn, total);
        const ppv = this.calculatePPV(tp, fp);
        const npv = this.calculateNPV(tn, fn);
        const f1Score = this.calculateF1Score(tp, fp, fn);

        // AUC calculation requires a continuous score, which is not directly applicable
        // to binary criterion application during brute force. It will be implemented
        // in Phase 4 in the main application logic if a scoring mechanism is introduced.
        const auc = 0;

        return {
            tp: tp,
            tn: tn,
            fp: fp,
            fn: fn,
            total: total,
            sensitivity: roundToDecimalPlaces(sensitivity, 4),
            specificity: roundToDecimalPlaces(specificity, 4),
            accuracy: roundToDecimalPlaces(accuracy, 4),
            ppv: roundToDecimalPlaces(ppv, 4),
            npv: roundToDecimalPlaces(npv, 4),
            f1Score: roundToDecimalPlaces(f1Score, 4),
            auc: roundToDecimalPlaces(auc, 4)
        };
    },

    // ROC curve calculation requires continuous scores and varying thresholds,
    // which is not directly applicable to binary criterion application during brute force.
    calculateROC: function(data, scoreKey, groundTruthKey) {
        return [];
    }
};

let stopBruteForce = false;

self.onmessage = function(e) {
    const { type, payload } = e.data;

    switch (type) {
        case 'startBruteForce':
            stopBruteForce = false;
            performBruteForce(payload.patientData, payload.criteriaType, payload.groundTruthKey);
            break;
        case 'stopBruteForce':
            stopBruteForce = true;
            break;
    }
};

function performBruteForce(patientData, criteriaType, groundTruthKey) {
    const bestResult = {
        score: -1, // Der F1-Score oder die Genauigkeit der besten Kombination
        criteriaCombination: [], // Die IDs der Kriterien in der besten Kombination
        minCriteriaToMeet: null, // Der optimale Schwellenwert (Anzahl der erfüllten Kriterien) für die beste Kombination
        metrics: null // Die vollständigen Metriken der besten Kombination
    };

    let criteriaPool;
    if (criteriaType === WorkerConstants.CRITERIA_TYPES.AVOCADO_SIGN) {
        criteriaPool = WorkerConstants.AVOCADO_SIGN_CRITERIA;
    } else if (criteriaType === WorkerConstants.CRITERIA_TYPES.T2_CRITERIA) {
        // Für T2-Kriterien kombinieren wir individuelle Sub-Kriterien aus ALLEN T2-Definitionen,
        // um "optimierte" T2-Kriterien zu finden, ähnlich dem Avocado Sign.
        // Dies ermöglicht eine flexiblere Brute-Force-Optimierung jenseits der festen Publikations-Kriterien.
        criteriaPool = Object.values(WorkerConstants.T2_CRITERIA_DEFINITIONS).flat();
    } else {
        self.postMessage({ type: 'error', message: 'Unbekannter Kriterientyp für Brute Force.' });
        return;
    }

    const numCriteriaInPool = criteriaPool.length;
    let iterations = 0;

    // Hilfsfunktion zur Generierung von Kombinationen (Subset-Sum-Problem-ähnlich)
    function generateCombinations(arr, k) {
        const result = [];
        function f(prefix, arr, k) {
            if (k === 0) {
                result.push(prefix);
                return;
            }
            if (arr.length === 0) {
                return;
            }
            // Inkludiere das erste Element
            f(prefix.concat(arr[0]), arr.slice(1), k - 1);
            // Exkludiere das erste Element
            f(prefix, arr.slice(1), k);
        }
        f([], arr, k);
        return result;
    }

    // Iteriere über alle möglichen Kombinationen von Kriterien-Elementen aus dem Pool
    for (let i = 1; i <= numCriteriaInPool; i++) { // i ist die Anzahl der Kriterien in der aktuellen Kombination
        const combinations = generateCombinations(criteriaPool, i);

        for (const combination of combinations) {
            // Für jede gefundene Kriterienkombination, probiere alle möglichen Schwellenwerte
            // (d.h. wie viele der ausgewählten Kriterien in 'combination' müssen erfüllt sein)
            for (let minCrit = 1; minCrit <= combination.length; minCrit++) {
                if (stopBruteForce) {
                    self.postMessage({ type: 'stopped' });
                    return;
                }

                iterations++;
                // Sende Fortschritts-Updates an den Hauptthread
                // Die Frequenz wurde angepasst, um nicht zu viele Nachrichten zu senden.
                if (iterations % 5000 === 0) {
                    self.postMessage({ type: 'progress', progress: iterations });
                }

                // Wende die aktuelle Kriterienkombination und den Schwellenwert auf alle Patientendaten an
                const processedData = patientData.map(p => {
                    let prediction;
                    if (criteriaType === WorkerConstants.CRITERIA_TYPES.AVOCADO_SIGN) {
                        // Die Avocado Sign Logik wird mit der aktuellen Kombination und dem Schwellenwert aufgerufen
                        prediction = WorkerStudyCriteriaManager.calculateAvocadoSign(p, combination, minCrit);
                    } else if (criteriaType === WorkerConstants.CRITERIA_TYPES.T2_CRITERIA) {
                        // Bei T2-Kriterien wird der "Score" für die aktuelle Kombination von individuellen
                        // T2-Sub-Kriterien berechnet, und die Vorhersage basiert auf diesem Score und minCrit.
                        // Dies ist die "Brute-Force optimierte Kriterien"-Logik für T2.
                        let score = 0;
                        combination.forEach(crit => {
                            if (evaluateCriterion(p, crit)) {
                                score++;
                            }
                        });
                        prediction = score >= minCrit;
                    }
                    return { ...p, predicted_positive: prediction };
                });

                // Berechne die statistischen Metriken für die aktuelle Vorhersage
                const currentMetrics = WorkerStatisticsService.calculateMetrics(processedData, 'predicted_positive', groundTruthKey);

                // Bewerte die Kombination basierend auf dem F1-Score
                const currentScore = currentMetrics.f1Score;

                // Aktualisiere das beste Ergebnis, wenn die aktuelle Kombination besser ist
                if (currentScore > bestResult.score) {
                    bestResult.score = currentScore;
                    bestResult.criteriaCombination = combination.map(c => c.id); // Speichere nur die IDs der Kriterien
                    bestResult.minCriteriaToMeet = minCrit;
                    bestResult.metrics = currentMetrics;
                }
            }
        }
    }

    // Sende das Endergebnis zurück an den Hauptthread
    self.postMessage({ type: 'result', bestResult: bestResult });
}
