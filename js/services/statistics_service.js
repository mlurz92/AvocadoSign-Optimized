// js/services/statistics_service.js

class StatisticsService {
    constructor() {
        // Der Konstruktor kann Initialisierungen vornehmen, falls benötigt
    }

    /**
     * Rundet einen numerischen Wert auf eine bestimmte Anzahl von Dezimalstellen.
     * @param {number} value - Der zu rundende Wert.
     * @param {number} decimals - Die Anzahl der Dezimalstellen.
     * @returns {number} Der gerundete Wert.
     */
    roundToDecimalPlaces(value, decimals) {
        if (typeof value !== 'number' || isNaN(value)) {
            return NaN;
        }
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    /**
     * Berechnet die Sensitivität (True Positive Rate).
     * @param {number} truePositives - Anzahl der echten Positiven.
     * @param {number} falseNegatives - Anzahl der falschen Negativen.
     * @returns {number} Die Sensitivität.
     */
    calculateSensitivity(truePositives, falseNegatives) {
        const denominator = truePositives + falseNegatives;
        if (denominator === 0) return 0;
        return truePositives / denominator;
    }

    /**
     * Berechnet die Spezifität (True Negative Rate).
     * @param {number} trueNegatives - Anzahl der echten Negativen.
     * @param {number} falsePositives - Anzahl der falschen Positiven.
     * @returns {number} Die Spezifität.
     */
    calculateSpecificity(trueNegatives, falsePositives) {
        const denominator = trueNegatives + falsePositives;
        if (denominator === 0) return 0;
        return trueNegatives / denominator;
    }

    /**
     * Berechnet die Genauigkeit (Accuracy).
     * @param {number} truePositives - Anzahl der echten Positiven.
     * @param {number} trueNegatives - Anzahl der echten Negativen.
     * @param {number} total - Gesamtzahl der Fälle.
     * @returns {number} Die Genauigkeit.
     */
    calculateAccuracy(truePositives, trueNegatives, total) {
        if (total === 0) return 0;
        return (truePositives + trueNegatives) / total;
    }

    /**
     * Berechnet den Positiven Prädiktiven Wert (PPV).
     * @param {number} truePositives - Anzahl der echten Positiven.
     * @param {number} falsePositives - Anzahl der falschen Positiven.
     * @returns {number} Der PPV.
     */
    calculatePPV(truePositives, falsePositives) {
        const denominator = truePositives + falsePositives;
        if (denominator === 0) return 0;
        return truePositives / denominator;
    }

    /**
     * Berechnet den Negativen Prädiktiven Wert (NPV).
     * @param {number} trueNegatives - Anzahl der echten Negativen.
     * @param {number} falseNegatives - Anzahl der falschen Negativen.
     * @returns {number} Der NPV.
     */
    calculateNPV(trueNegatives, falseNegatives) {
        const denominator = trueNegatives + falseNegatives;
        if (denominator === 0) return 0;
        return trueNegatives / denominator;
    }

    /**
     * Berechnet den F1-Score.
     * @param {number} truePositives - Anzahl der echten Positiven.
     * @param {number} falsePositives - Anzahl der falschen Positiven.
     * @param {number} falseNegatives - Anzahl der falschen Negativen.
     * @returns {number} Der F1-Score.
     */
    calculateF1Score(truePositives, falsePositives, falseNegatives) {
        const precision = this.calculatePPV(truePositives, falsePositives);
        const recall = this.calculateSensitivity(truePositives, falseNegatives);
        const denominator = precision + recall;
        if (denominator === 0) return 0;
        return 2 * (precision * recall) / denominator;
    }

    /**
     * Berechnet ein umfassendes Set von Metriken für binäre Klassifikation.
     * Beachten Sie: AUC kann aus reinen binären Vorhersagen nicht sinnvoll berechnet werden.
     * Für AUC benötigen Sie kontinuierliche Scores oder Wahrscheinlichkeiten, die Sie schwellen können.
     * @param {Array<Object>} data - Die Patientendaten, wobei jedes Objekt eine Vorhersage und einen Ground Truth enthält.
     * @param {string} predictionKey - Der Schlüssel im Datenobjekt für die binäre Vorhersage (true/false).
     * @param {string} groundTruthKey - Der Schlüssel im Datenobjekt für den tatsächlichen Zustand (true/false).
     * @returns {Object} Ein Objekt mit verschiedenen Leistungsmetriken.
     */
    calculateMetrics(data, predictionKey, groundTruthKey) {
        let tp = 0; // True Positives
        let tn = 0; // True Negatives
        let fp = 0; // False Positives
        let fn = 0; // False Negatives

        data.forEach(item => {
            const prediction = item[predictionKey];
            const groundTruth = item[groundTruthKey];

            if (prediction === true && groundTruth === true) {
                tp++;
            } else if (prediction === false && groundTruth === false) {
                tn++;
            } else if (prediction === true && groundTruth === false) {
                fp++;
            } else if (prediction === false && groundTruth === true) {
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

        // AUC wird hier nicht berechnet, da dies binäre Vorhersagen sind.
        // Eine AUC-Berechnung erfordert das Variieren eines Schwellenwerts über
        // kontinuierliche Vorhersagewerte (Scores oder Wahrscheinlichkeiten).
        // Die Funktion calculateROCAndAUC unten dient diesem Zweck.
        const auc = NaN; // Setze AUC auf NaN, da hier nicht anwendbar

        return {
            tp: tp,
            tn: tn,
            fp: fp,
            fn: fn,
            total: total,
            sensitivity: this.roundToDecimalPlaces(sensitivity, 4),
            specificity: this.roundToDecimalPlaces(specificity, 4),
            accuracy: this.roundToDecimalPlaces(accuracy, 4),
            ppv: this.roundToDecimalPlaces(ppv, 4),
            npv: this.roundToDecimalPlaces(npv, 4),
            f1Score: this.roundToDecimalPlaces(f1Score, 4),
            auc: auc
        };
    }

    /**
     * Berechnet die ROC-Kurve und den AUC-Wert.
     * Diese Funktion erwartet Daten mit einem kontinuierlichen Score und einem binären Ground Truth.
     * @param {Array<Object>} data - Die Patientendaten, wobei jedes Objekt einen Score und einen Ground Truth enthält.
     * @param {string} scoreKey - Der Schlüssel im Datenobjekt für den kontinuierlichen Score.
     * @param {string} groundTruthKey - Der Schlüssel im Datenobjekt für den tatsächlichen Zustand (true/false).
     * @returns {Object} Ein Objekt mit rocPoints (Array von {fpr, tpr}) und auc.
     */
    calculateROCAndAUC(data, scoreKey, groundTruthKey) {
        if (!data || data.length === 0) {
            return { rocPoints: [], auc: 0 };
        }

        // Sortiere Daten nach Score absteigend
        const sortedData = [...data].sort((a, b) => b[scoreKey] - a[scoreKey]);

        let truePositives = 0;
        let falsePositives = 0;
        let totalPositives = 0;
        let totalNegatives = 0;

        sortedData.forEach(item => {
            if (item[groundTruthKey] === true) {
                totalPositives++;
            } else {
                totalNegatives++;
            }
        });

        const rocPoints = [{ fpr: 0, tpr: 0 }]; // Startpunkt (0,0)

        for (let i = 0; i < sortedData.length; i++) {
            const item = sortedData[i];
            const currentScore = item[scoreKey];

            if (item[groundTruthKey] === true) {
                truePositives++;
            } else {
                falsePositives++;
            }

            // Füge einen Punkt hinzu, wenn sich der Score ändert oder es der letzte Punkt ist
            if (i + 1 < sortedData.length && sortedData[i+1][scoreKey] !== currentScore) {
                const fpr = totalNegatives > 0 ? falsePositives / totalNegatives : 0;
                const tpr = totalPositives > 0 ? truePositives / totalPositives : 0;
                rocPoints.push({ fpr: this.roundToDecimalPlaces(fpr, 4), tpr: this.roundToDecimalPlaces(tpr, 4) });
            } else if (i + 1 === sortedData.length) {
                 const fpr = totalNegatives > 0 ? falsePositives / totalNegatives : 0;
                 const tpr = totalPositives > 0 ? truePositives / totalPositives : 0;
                 rocPoints.push({ fpr: this.roundToDecimalPlaces(fpr, 4), tpr: this.roundToDecimalPlaces(tpr, 4) });
            }
        }

        // Stelle sicher, dass der Endpunkt (1,1) hinzugefügt wird, falls nicht bereits vorhanden
        if (rocPoints[rocPoints.length - 1].fpr < 1 || rocPoints[rocPoints.length - 1].tpr < 1) {
             rocPoints.push({ fpr: 1, tpr: 1 });
        }


        // Berechne AUC mit der Trapezregel
        let auc = 0;
        for (let i = 0; i < rocPoints.length - 1; i++) {
            const p1 = rocPoints[i];
            const p2 = rocPoints[i + 1];
            auc += (p2.fpr - p1.fpr) * (p1.tpr + p2.tpr) / 2;
        }

        return { rocPoints: rocPoints, auc: this.roundToDecimalPlaces(auc, 4) };
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen
const StatisticsServiceInstance = new StatisticsService();
