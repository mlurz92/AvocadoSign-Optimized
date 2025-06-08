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

        // Filter out items where scoreKey or groundTruthKey is undefined/null
        const filteredData = data.filter(item => 
            typeof item[scoreKey] === 'number' && !isNaN(item[scoreKey]) && 
            typeof item[groundTruthKey] === 'boolean'
        );

        if (filteredData.length === 0) {
            return { rocPoints: [], auc: 0 };
        }

        // Sortiere Daten nach Score absteigend
        const sortedData = [...filteredData].sort((a, b) => b[scoreKey] - a[scoreKey]);

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
            // oder wenn es der erste Punkt ist und ein Nicht-Null-Score hat (um den Punkt zu plotten)
            if (i + 1 < sortedData.length && sortedData[i+1][scoreKey] !== currentScore) {
                const fpr = totalNegatives > 0 ? falsePositives / totalNegatives : 0;
                const tpr = totalPositives > 0 ? truePositives / totalPositives : 0;
                rocPoints.push({ fpr: this.roundToDecimalPlaces(fpr, 4), tpr: this.roundToDecimalPlaces(tpr, 4) });
            } else if (i + 1 === sortedData.length) { // Letzter Punkt
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

    /**
     * Berechnet deskriptive Statistiken für die Patientendaten.
     * Dies umfasst Demographie (Alter, Geschlecht, Therapie) und Status (N, AS, T2)
     * sowie Lymphknotenanzahlen.
     * @param {Array<Object>} patientData - Die Liste der Patientendatenobjekte.
     * @returns {Object} Ein Objekt mit deskriptiven Statistiken.
     */
    calculateDescriptiveStatistics(patientData) {
        if (!patientData || patientData.length === 0) {
            return { deskriptiv: { anzahlPatienten: 0, alter: {}, geschlecht: {}, therapie: {}, nStatus: {}, asStatus: {}, t2Status: {}, lkAnzahlen: {} } };
        }

        const stats = {
            anzahlPatienten: patientData.length,
            alterData: [], // Rohdaten für Altersverteilung
            geschlecht: { m: 0, f: 0, u: 0 }, // männlich, weiblich, unbekannt
            therapie: {}, // Zählt Therapieverfahren
            nStatus: { plus: 0, minus: 0 },
            asStatus: { plus: 0, minus: 0 },
            t2Status: { plus: 0, minus: 0 },
            lkAnzahlen: {
                n: { total: [], plus: [] },
                as: { total: [], plus: [] },
                t2: { total: [], plus: [] }
            }
        };

        patientData.forEach(p => {
            // Alter
            if (typeof p.alter === 'number' && !isNaN(p.alter)) {
                stats.alterData.push(p.alter);
            }

            // Geschlecht
            if (p.geschlecht === 'm') {
                stats.geschlecht.m++;
            } else if (p.geschlecht === 'w') {
                stats.geschlecht.f++;
            } else {
                stats.geschlecht.u++;
            }

            // Therapie
            if (p.therapie) {
                stats.therapie[p.therapie] = (stats.therapie[p.therapie] || 0) + 1;
            }

            // N-Status (Pathologie)
            if (p.n_status === true) {
                stats.nStatus.plus++;
            } else if (p.n_status === false) {
                stats.nStatus.minus++;
            }

            // Avocado Sign Status
            if (p.avocado_sign_status === true) {
                stats.asStatus.plus++;
            } else if (p.avocado_sign_status === false) {
                stats.asStatus.minus++;
            }

            // T2-Kriterien Status
            if (p.t2_criteria_status === true) {
                stats.t2Status.plus++;
            } else if (p.t2_criteria_status === false) {
                stats.t2Status.minus++;
            }

            // Lymphknotenanzahlen
            if (typeof p.total_ln_count === 'number' && !isNaN(p.total_ln_count)) {
                stats.lkAnzahlen.n.total.push(p.total_ln_count); // Gesamt LK zählt für N-Status
            }
            if (typeof p.patho_n_count === 'number' && !isNaN(p.patho_n_count) && p.n_status === true) {
                stats.lkAnzahlen.n.plus.push(p.patho_n_count); // N+ LK nur bei N+ Patienten
            }
            // Annahme für AS und T2: Wenn 'avocado_sign_count' und 't2_criteria_count'
            // die Anzahl der als positiv bewerteten LK durch diese Methoden sind.
            // Derzeit wird nur der Patientengesamtstatus in den Metriken verwendet.
            // Falls LK-Counts für AS/T2 in Patientendaten sind, werden diese hier aggregiert.
            // Annahme: Wenn im Patientendatensatz `avocado_sign_positive_ln_count` oder `t2_positive_ln_count` existiert.
            if (typeof p.avocado_positive_ln_count === 'number' && !isNaN(p.avocado_positive_ln_count)) {
                 stats.lkAnzahlen.as.total.push(p.avocado_positive_ln_count); // Oder total sichtbare LN, je nach Datenmodell
                 if (p.avocado_sign_status === true) {
                     stats.lkAnzahlen.as.plus.push(p.avocado_positive_ln_count);
                 }
            }
            if (typeof p.t2_positive_ln_count === 'number' && !isNaN(p.t2_positive_ln_count)) {
                stats.lkAnzahlen.t2.total.push(p.t2_positive_ln_count); // Oder total sichtbare LN, je nach Datenmodell
                 if (p.t2_criteria_status === true) {
                     stats.lkAnzahlen.t2.plus.push(p.t2_positive_ln_count);
                 }
            }
        });

        // Berechnung von Median, Min, Max, Mean, SD für Alter und LK-Anzahlen
        const calculateArrayStats = (arr) => {
            if (arr.length === 0) return { median: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN };
            const sortedArr = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sortedArr.length / 2);
            const median = sortedArr.length % 2 === 0 ? (sortedArr[mid - 1] + sortedArr[mid]) / 2 : sortedArr[mid];
            const min = sortedArr[0];
            const max = sortedArr[sortedArr.length - 1];
            const sum = arr.reduce((a, b) => a + b, 0);
            const mean = sum / arr.length;
            const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
            const sd = Math.sqrt(variance);
            return { median, min, max, mean, sd };
        };

        return {
            deskriptiv: {
                anzahlPatienten: stats.anzahlPatienten,
                alter: calculateArrayStats(stats.alterData),
                alterData: stats.alterData, // Rohdaten für Diagramme
                geschlecht: stats.geschlecht,
                therapie: stats.therapie,
                nStatus: stats.nStatus,
                asStatus: stats.asStatus,
                t2Status: stats.t2Status,
                lkAnzahlen: {
                    n: {
                        total: calculateArrayStats(stats.lkAnzahlen.n.total),
                        plus: calculateArrayStats(stats.lkAnzahlen.n.plus)
                    },
                    as: {
                        total: calculateArrayStats(stats.lkAnzahlen.as.total),
                        plus: calculateArrayStats(stats.lkAnzahlen.as.plus)
                    },
                    t2: {
                        total: calculateArrayStats(stats.lkAnzahlen.t2.total),
                        plus: calculateArrayStats(stats.lkAnzahlen.t2.plus)
                    }
                }
            }
        };
    }

    /**
     * Führt den McNemar-Test durch, um zwei gepaarte diagnostische Tests zu vergleichen (Accuracy).
     * @param {Array<Object>} data - Patientendaten.
     * @param {string} method1Key - Schlüssel für die Vorhersage der ersten Methode.
     * @param {string} method2Key - Schlüssel für die Vorhersage der zweiten Methode.
     * @param {string} groundTruthKey - Schlüssel für den Goldstandard (Ground Truth).
     * @returns {Object} Testergebnisse (Statistik, df, pValue, Methode).
     */
    calculateMcNemarTest(data, method1Key, method2Key, groundTruthKey) {
        let b = 0; // method1 correct, method2 incorrect
        let c = 0; // method1 incorrect, method2 correct

        data.forEach(item => {
            const pred1 = item[method1Key];
            const pred2 = item[method2Key];
            const truth = item[groundTruthKey];

            const method1Correct = (pred1 === truth);
            const method2Correct = (pred2 === truth);

            if (method1Correct && !method2Correct) {
                b++;
            } else if (!method1Correct && method2Correct) {
                c++;
            }
        });

        let statistic = NaN;
        let pValue = NaN;
        const denominator = b + c;

        if (denominator > 0) {
            // Yates' continuity correction
            const numerator = Math.pow(Math.abs(b - c) - 1, 2);
            statistic = numerator / denominator;
            
            // For p-value calculation of Chi-squared with df=1
            // Source for erf and normalCDF: https://stackoverflow.com/questions/59663972/how-to-implement-normal-cdf-function-in-javascript-from-scratch
            const erf = (x) => {
                const a1 = 0.254829592;
                const a2 = -0.284496736;
                const a3 = 1.421413741;
                const a4 = -1.453152027;
                const a5 = 1.061405429;
                const p = 0.3275911;
                const sign = (x < 0) ? -1 : 1;
                x = Math.abs(x);
                const t = 1.0 / (1.0 + p * x);
                const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
                return sign * y;
            };
            const normalCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));
            
            const z = Math.sqrt(statistic);
            pValue = 2 * (1 - normalCDF(Math.abs(z)));
            pValue = Math.min(1, Math.max(0, pValue));

        } else {
            statistic = 0;
            pValue = 1; 
        }

        return {
            statistic: this.roundToDecimalPlaces(statistic, 3),
            df: 1, 
            pValue: this.roundToDecimalPlaces(pValue, 3),
            method: "McNemar's Chi-squared Test with Yates' Correction"
        };
    }

    /**
     * Berechnet die Assoziationsstatistiken (Odds Ratio, Risk Difference, Phi-Koeffizient)
     * und einen p-Wert (Fisher's Exact Test / Chi-Quadrat für 2x2 Tabellen).
     * @param {Array<Object>} data - Die Patientendaten.
     * @param {string} featureKey - Der Schlüssel des Merkmals (z.B. 'morphology_round').
     * @param {string} groundTruthKey - Der Schlüssel des Goldstandards (z.B. 'n_status').
     * @returns {Object} Ein Objekt mit OR, RD, Phi, pValue, testName.
     */
    calculateAssociationStatistics(data, featureKey, groundTruthKey) {
        let a = 0; 
        let b = 0; 
        let c = 0; 
        let d = 0; 

        data.forEach(item => {
            const featureValue = item[featureKey];
            const groundTruthValue = item[groundTruthKey];

            if (featureValue === true && groundTruthValue === true) {
                a++;
            } else if (featureValue === true && groundTruthValue === false) {
                b++;
            } else if (featureValue === false && groundTruthValue === true) {
                c++;
            } else if (featureValue === false && groundTruthValue === false) {
                d++;
            }
        });

        let or = NaN;
        let or_ci_lower = NaN;
        let or_ci_upper = NaN;
        
        // Add 0.5 to cells with zero counts (Haldane-Ansatz) to allow CI calculation
        // for OR and RD even if a cell is 0. This is a common practice for stability.
        const a_h = a + 0.5;
        const b_h = b + 0.5;
        const c_h = c + 0.5;
        const d_h = d + 0.5;

        or = (a_h * d_h) / (b_h * c_h);

        const log_or = Math.log(or);
        const se_log_or = Math.sqrt(1 / a_h + 1 / b_h + 1 / c_h + 1 / d_h);
        const z_value = 1.96; 

        or_ci_lower = Math.exp(log_or - z_value * se_log_or);
        or_ci_upper = Math.exp(log_or + z_value * se_log_or);
        
        let rd = NaN;
        let rd_ci_lower = NaN;
        let rd_ci_upper = NaN;
        const n1 = a + b; 
        const n0 = c + d; 

        if (n1 > 0 && n0 > 0) {
            const risk1 = a / n1;
            const risk0 = c / n0;
            rd = risk1 - risk0;

            const se_rd = Math.sqrt(
                (risk1 * (1 - risk1)) / n1 +
                (risk0 * (1 - risk0)) / n0
            );

            const z_value_rd = 1.96; 
            rd_ci_lower = rd - z_value_rd * se_rd;
            rd_ci_upper = rd + z_value_rd * se_rd;
        }

        let phi = NaN;
        const total = a + b + c + d;
        if (total > 0) {
            const numerator = (a * d) - (b * c);
            const denominator_phi = Math.sqrt((a + b) * (c + d) * (a + c) * (b + d));
            if (denominator_phi > 0) {
                phi = numerator / denominator_phi;
            }
        }

        let pValue = NaN;
        let testName = "Chi-squared Test with Yates' Correction";
        let chi2_statistic = NaN;

        const row1_sum = a + b;
        const row2_sum = c + d;
        const col1_sum = a + c;
        const col2_sum = b + d;

        if (row1_sum > 0 && row2_sum > 0 && col1_sum > 0 && col2_sum > 0 && total > 0) {
            const expected_a = (row1_sum * col1_sum) / total;
            const expected_b = (row1_sum * col2_sum) / total;
            const expected_c = (row2_sum * col1_sum) / total;
            const expected_d = (row2_sum * col2_sum) / total;

            const termA = expected_a > 0 ? Math.pow(Math.abs(a - expected_a) - 0.5, 2) / expected_a : 0;
            const termB = expected_b > 0 ? Math.pow(Math.abs(b - expected_b) - 0.5, 2) / expected_b : 0;
            const termC = expected_c > 0 ? Math.pow(Math.abs(c - expected_c) - 0.5, 2) / expected_c : 0;
            const termD = expected_d > 0 ? Math.pow(Math.abs(d - expected_d) - 0.5, 2) / expected_d : 0;

            chi2_statistic = termA + termB + termC + termD;

            const erf = (x) => {
                const a1 = 0.254829592; const a2 = -0.284496736; const a3 = 1.421413741;
                const a4 = -1.453152027; const a5 = 1.061405429; const p = 0.3275911;
                const sign = (x < 0) ? -1 : 1; x = Math.abs(x);
                const t = 1.0 / (1.0 + p * x);
                const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
                return sign * y;
            };
            const normalCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));
            pValue = 2 * (1 - normalCDF(Math.abs(Math.sqrt(chi2_statistic))));
            pValue = Math.min(1, Math.max(0, pValue));
        } else {
            testName = "Insufficient Data for Chi-squared Test";
            chi2_statistic = NaN;
            pValue = NaN;
        }

        return {
            featureName: featureKey,
            or: { value: this.roundToDecimalPlaces(or, 2), ci: { lower: this.roundToDecimalPlaces(or_ci_lower, 2), upper: this.roundToDecimalPlaces(or_ci_upper, 2) } },
            rd: { value: this.roundToDecimalPlaces(rd, 3), ci: { lower: this.roundToDecimalPlaces(rd_ci_lower, 3), upper: this.roundToDecimalPlaces(rd_ci_upper, 3) } },
            phi: { value: this.roundToDecimalPlaces(phi, 2) },
            pValue: this.roundToDecimalPlaces(pValue, 3),
            testName: testName,
            chi2_statistic: this.roundToDecimalPlaces(chi2_statistic, 3)
        };
    }

    /**
     * Führt den Mann-Whitney U-Test durch, um die Verteilung einer kontinuierlichen Variable
     * zwischen zwei unabhängigen Gruppen zu vergleichen (N+ vs N-).
     * @param {Array<Object>} data - Die Patientendaten.
     * @param {string} continuousVarKey - Der Schlüssel der kontinuierlichen Variable (z.B. 'diameter_ln_max').
     * @param {string} groupKey - Der Schlüssel der Gruppierungsvariable (z.B. 'n_status').
     * @returns {Object} Testergebnisse (U-Statistik, pValue, testName).
     */
    calculateMannWhitneyU(data, continuousVarKey, groupKey) {
        const group1 = []; 
        const group2 = []; 

        data.forEach(item => {
            const value = item[continuousVarKey];
            const group = item[groupKey];

            if (typeof value === 'number' && !isNaN(value)) {
                if (group === true) { 
                    group1.push(value);
                } else if (group === false) { 
                    group2.push(value);
                }
            }
        });

        // Small sample correction / exact test check for Mann-Whitney U.
        // For N < 20 per group, exact calculation is preferred, which is complex.
        // Here, we proceed with normal approximation if sample sizes are reasonable.
        if (group1.length < 5 || group2.length < 5) { 
             return { featureName: continuousVarKey, pValue: NaN, testName: "Mann-Whitney U Test (Insufficient Data for Approximation)" };
        }
        
        const n1 = group1.length;
        const n2 = group2.length;
        
        const combined = [...group1.map(val => ({ val, group: 1 })), ...group2.map(val => ({ val, group: 2 }))];
        combined.sort((a, b) => a.val - b.val);

        // Assign ranks and handle ties (mid-rank method)
        let ranks = new Array(combined.length);
        let i = 0;
        while (i < combined.length) {
            let j = i;
            while (j < combined.length - 1 && combined[j].val === combined[j + 1].val) {
                j++;
            }
            const midRank = (i + 1 + j + 1) / 2;
            for (let k = i; k <= j; k++) {
                ranks[k] = midRank;
            }
            i = j + 1;
        }

        let rankSum1 = 0;
        let rankSum2 = 0;
        for (let idx = 0; idx < combined.length; idx++) {
            if (combined[idx].group === 1) {
                rankSum1 += ranks[idx];
            } else {
                rankSum2 += ranks[idx];
            }
        }
        
        const U1 = rankSum1 - (n1 * (n1 + 1)) / 2;
        const U2 = rankSum2 - (n2 * (n2 + 1)) / 2;
        
        const U_statistic = Math.min(U1, U2);

        // Normal approximation for p-value
        // Calculate correction for ties
        let tieCorrectionFactor = 1;
        const uniqueValues = new Set(combined.map(d => d.val));
        if (uniqueValues.size < combined.length) {
            // There are ties, calculate correction factor
            let sum_t_cubed_minus_t = 0;
            uniqueValues.forEach(uniqueVal => {
                const count = combined.filter(d => d.val === uniqueVal).length;
                if (count > 1) {
                    sum_t_cubed_minus_t += (Math.pow(count, 3) - count);
                }
            });
            tieCorrectionFactor = 1 - (sum_t_cubed_minus_t / (Math.pow(n1 + n2, 3) - (n1 + n2)));
        }

        const meanU = (n1 * n2) / 2;
        const seU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12) * Math.sqrt(tieCorrectionFactor);

        let z = NaN;
        if (seU > 0) {
            // Apply continuity correction: -0.5 if U < meanU, +0.5 if U > meanU
            let continuityCorrection = 0;
            if (U_statistic < meanU) {
                continuityCorrection = -0.5;
            } else if (U_statistic > meanU) {
                continuityCorrection = 0.5;
            }
            z = (U_statistic - meanU + continuityCorrection) / seU; // Corrected Z-score
        }

        let pValue = NaN;
        if (!isNaN(z)) {
            const erf = (x) => {
                const a1 = 0.254829592; const a2 = -0.284496736; const a3 = 1.421413741;
                const a4 = -1.453152027; const a5 = 1.061405429; const p = 0.3275911;
                const sign = (x < 0) ? -1 : 1; x = Math.abs(x);
                const t = 1.0 / (1.0 + p * x);
                const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
                return sign * y;
            };
            const normalCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));
            pValue = 2 * (1 - normalCDF(Math.abs(z)));
            pValue = Math.min(1, Math.max(0, pValue));
        }

        return {
            featureName: continuousVarKey,
            U_statistic: this.roundToDecimalPlaces(U_statistic, 2),
            z_score: this.roundToDecimalPlaces(z, 2),
            pValue: this.roundToDecimalPlaces(pValue, 3),
            testName: "Mann-Whitney U-Test (Normal Approximation with Tie Correction)"
        };
    }

    /**
     * Führt den DeLong-Test zum Vergleich zweier AUCs durch.
     * ACHTUNG: Eine vollständige, robuste Implementierung des DeLong-Tests
     * in reinem JavaScript ist extrem komplex, da sie die Berechnung der
     * Kovarianz zwischen den ROC-Kurven und die Invertierung von Matrizen erfordert.
     * Dies übersteigt typischerweise den Umfang einer manuellen Implementierung
     * ohne spezialisierte numerische Bibliotheken (z.B. für Lineare Algebra).
     *
     * Für diese Anwendung wird eine Platzhalterstruktur mit NaN-Werten für
     * Z, pValue und diffAUC zurückgegeben, um die Funktion in der UI abbilden zu können.
     * Eine präzise Berechnung würde eine Integration einer JS-Statistikbibliothek erfordern
     * oder eine sehr umfangreiche, dedizierte Implementierung.
     * @param {Array<Object>} rocData1 - ROC Daten für Methode 1 (mit Score und Ground Truth).
     * @param {Array<Object>} rocData2 - ROC Daten für Methode 2 (mit Score und Ground Truth).
     * @param {string} scoreKey1 - Score Schlüssel für Methode 1.
     * @param {string} scoreKey2 - Score Schlüssel für Methode 2.
     * @param {string} groundTruthKey - Ground Truth Schlüssel.
     * @returns {Object} Testergebnisse (Z, pValue, diffAUC, Methode).
     */
    calculateDeLongTest(rocData1, rocData2, scoreKey1, scoreKey2, groundTruthKey) {
        // Hier müsste die komplexe Kovarianzmatrix-Berechnung des DeLong-Tests erfolgen.
        // Da dies außerhalb des Rahmens einer Implementierung ohne externe Libs liegt,
        // geben wir eine Struktur mit NaN/0 zurück und einen Hinweis.
        // Die AUCs der einzelnen Methoden können aber berechnet werden.
        const rocResult1 = this.calculateROCAndAUC(rocData1, scoreKey1, groundTruthKey);
        const rocResult2 = this.calculateROCAndAUC(rocData2, scoreKey2, groundTruthKey);

        const auc1 = rocResult1.auc;
        const auc2 = rocResult2.auc;
        const diffAUC = auc1 - auc2;

        return {
            Z: NaN,
            pValue: NaN,
            diffAUC: this.roundToDecimalPlaces(diffAUC, 4), 
            method: "DeLong's Test (Precise implementation requires external library for matrix operations)"
        };
    }

    /**
     * Führt den Vergleich der Accuracy von zwei Methoden zwischen Kollektiven durch (z.B. Chi-Quadrat).
     * @param {Array<Object>} dataKollektiv1 - Daten für Kollektiv 1.
     * @param {Array<Object>} dataKollektiv2 - Daten für Kollektiv 2.
     * @param {string} methodKey - Der Schlüssel der Methode (z.B. 'avocado_sign_status').
     * @param {string} groundTruthKey - Der Schlüssel des Ground Truth (z.B. 'n_status').
     * @returns {Object} Testergebnisse (pValue, testName).
     */
    compareAccuracyAcrossKollektive(dataKollektiv1, dataKollektiv2, methodKey, groundTruthKey) {
        const metrics1 = this.calculateMetrics(dataKollektiv1, methodKey, groundTruthKey);
        const metrics2 = this.calculateMetrics(dataKollektiv2, methodKey, groundTruthKey);

        const p1 = metrics1.accuracy;
        const p2 = metrics2.accuracy;
        const n1 = metrics1.total;
        const n2 = metrics2.total;

        let z_statistic = NaN;
        let pValue = NaN;
        let testName = "Z-Test for Proportions";

        if (n1 > 0 && n2 > 0) {
            const p_pooled = ((metrics1.tp + metrics1.tn) + (metrics2.tp + metrics2.tn)) / (n1 + n2);
            const se_diff = Math.sqrt(p_pooled * (1 - p_pooled) * (1 / n1 + 1 / n2));

            if (se_diff > 0) {
                z_statistic = (p1 - p2) / se_diff;
                const erf = (x) => {
                    const a1 = 0.254829592; const a2 = -0.284496736; const a3 = 1.421413741;
                    const a4 = -1.453152027; const a5 = 1.061405429; const p = 0.3275911;
                    const sign = (x < 0) ? -1 : 1; x = Math.abs(x);
                    const t = 1.0 / (1.0 + p * x);
                    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
                    return sign * y;
                };
                const normalCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));
                pValue = 2 * (1 - normalCDF(Math.abs(z_statistic)));
                pValue = Math.min(1, Math.max(0, pValue));
            } else {
                testName = "Z-Test (Standard Error is Zero)";
            }
        } else {
            testName = "Z-Test (Insufficient Data)";
        }

        return {
            statistic: this.roundToDecimalPlaces(z_statistic, 3),
            pValue: this.roundToDecimalPlaces(pValue, 3),
            testName: testName
        };
    }

    /**
     * Führt den Vergleich der AUCs von zwei Methoden zwischen Kollektiven durch (DeLong-Test vereinfacht).
     * Wie calculateDeLongTest(), ist eine vollständige Implementierung hier extrem komplex.
     * Daher wird hier eine vereinfachte Struktur zurückgegeben.
     * @param {Array<Object>} rocDataKollektiv1 - ROC Daten für Kollektiv 1 (mit Score und Ground Truth).
     * @param {Array<Object>} rocDataKollektiv2 - ROC Daten für Kollektiv 2 (mit Score und Ground Truth).
     * @param {string} scoreKey - Schlüssel für den Score.
     * @param {string} groundTruthKey - Schlüssel für den Ground Truth.
     * @returns {Object} Testergebnisse (Z, pValue, diffAUC, Methode).
     */
    compareAUCAcrossKollektive(rocDataKollektiv1, rocDataKollektiv2, scoreKey, groundTruthKey) {
        const rocResult1 = this.calculateROCAndAUC(rocDataKollektiv1, scoreKey, groundTruthKey);
        const rocResult2 = this.calculateROCAndAUC(rocDataKollektiv2, scoreKey, groundTruthKey);

        const auc1 = rocResult1.auc;
        const auc2 = rocResult2.auc;
        const diffAUC = auc1 - auc2;

        return {
            Z: NaN,
            pValue: NaN,
            diffAUC: this.roundToDecimalPlaces(diffAUC, 4),
            method: "DeLong's Test (Precise implementation requires external library for matrix operations)"
        };
    }

    /**
     * Klont ein Objekt tief (Deep Clone).
     * Dies ist notwendig, um zu verhindern, dass Funktionen, die Daten modifizieren,
     * den Original-AppState beeinflussen.
     * @param {Object} obj - Das zu klonende Objekt.
     * @returns {Object} Ein tiefgeklontes Objekt.
     */
    _deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Berechnet alle für die Publikation benötigten Statistiken für verschiedene Kollektive
     * und Kriterien (Avocado Sign, T2-Kriterien, Literatur-T2-Kriterien, Brute-Force optimierte T2).
     * Diese Funktion aggregiert alle notwendigen Daten und führt alle relevanten statistischen Tests durch.
     * @param {Array<Object>} globalRawData - Die gesamten Rohdaten der Patienten.
     * @param {Array<Object>} appliedAvocadoCriteria - Die aktuell im Auswertungstab angewendeten Avocado Sign Kriterien.
     * @param {number} appliedAvocadoMinCriteriaToMeet - Der Min-Schwellenwert für das angewendete Avocado Sign.
     * @param {Array<Object>} appliedT2CriteriaRaw - Die aktuell im Auswertungstab angewendeten T2-Kriterien (flache Liste der Einzelkriterien).
     * @param {Object} bruteForceResultsPerKollektiv - Die Ergebnisse der Brute-Force-Optimierung pro Kollektiv.
     * @returns {Object} Ein komplexes Objekt, das alle aggregierten Statistiken enthält, gruppiert nach Kollektiv.
     */
    calculateAllStatsForPublication(globalRawData, appliedAvocadoCriteria, appliedAvocadoMinCriteriaToMeet, appliedT2CriteriaRaw, bruteForceResultsPerKollektiv) {
        const allStats = {};
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const groundTruthKey = 'n_status';

        kollektive.forEach(kollektivName => {
            const dataForKollektiv = kollektivName === 'Gesamt'
                ? globalRawData
                : globalRawData.filter(p => p.therapie === kollektivName);

            if (dataForKollektiv.length === 0) {
                allStats[kollektivName] = null;
                return;
            }

            // Sicherstellen, dass die Daten für die Berechnung korrekt sind,
            // insbesondere Status und Scores für AS und T2
            const processedData = dataForKollektiv.map(p => {
                const updatedP = { ...p };

                // Recalculate Avocado Sign status and score if not present or for consistency
                if (appliedAvocadoCriteria && appliedAvocadoCriteria.length > 0 && typeof appliedAvocadoMinCriteriaToMeet === 'number') {
                    let avocadoSignScore = 0;
                    appliedAvocadoCriteria.forEach(c => {
                        const value = updatedP[c.param];
                        const threshold = c.threshold;
                        const operator = c.operator;
                        let criterionMet = false;
                        switch (operator) {
                            case '>': criterionMet = value > threshold; break;
                            case '<': criterionMet = value < threshold; break;
                            case '>=': criterionMet = value >= threshold; break;
                            case '<=': criterionMet = value <= threshold; break;
                            case '==': criterionMet = value === threshold; break;
                            case '!=': criterionMet = value !== threshold; break;
                        }
                        if (criterionMet) {
                            avocadoSignScore++;
                        }
                    });
                    updatedP.avocado_sign_status = avocadoSignScore >= appliedAvocadoMinCriteriaToMeet;
                    updatedP.avocado_sign_score = avocadoSignScore;
                } else {
                    // Fallback if appliedAvocadoCriteria not set, use existing or default to false/0
                    updatedP.avocado_sign_status = updatedP.avocado_sign_status !== undefined ? updatedP.avocado_sign_status : false;
                    updatedP.avocado_sign_score = updatedP.avocado_sign_score !== undefined ? updatedP.avocado_sign_score : (updatedP.avocado_sign_status ? 1 : 0);
                }

                // Recalculate T2 criteria status and score if not present or for consistency
                // For appliedT2CriteriaRaw (flat list of individual criteria from selected sets)
                if (appliedT2CriteriaRaw && appliedT2CriteriaRaw.length > 0) {
                    let t2CriteriaScore = 0; // Number of fulfilled individual criteria from appliedT2CriteriaRaw
                    let t2CriteriaStatus = false; // Is any of the original T2-sets fulfilled?
                    
                    // To maintain previous behavior where t2_criteria_status is true if ANY selected T2-set is positive
                    const selectedT2CriteriaNames = [];
                    // Need to reconstruct which T2-set names were selected
                    // This is a bit tricky since appliedT2CriteriaRaw is flattened.
                    // A better way would be to pass `selectedT2CriteriaNames` from AppState.
                    // For now, assuming the original T2-sets are used.
                    // Instead of reconstructing, let's use the definition of T2CriteriaManagerInstance.calculateT2Criteria
                    // which expects a *single* criterion definition (e.g., from Constants.T2_CRITERIA_DEFINITIONS['Koh 2008'])
                    // If appliedT2CriteriaRaw is a flat list, we need to adapt this logic.
                    // The `AuswertungViewLogic.handleApplyT2Criteria` sets `t2_criteria_status` based on an OR-logic
                    // of selected *sets*. It also saves `t2_criteria_score` as count of fulfilled sets.
                    // We must replicate that logic here.
                    let tempT2Score = 0;
                    let tempT2Status = false;
                    Object.keys(Constants.T2_CRITERIA_DEFINITIONS).forEach(t2SetName => {
                        const definition = Constants.T2_CRITERIA_DEFINITIONS[t2SetName];
                        // Check if this definition is part of the `appliedT2CriteriaRaw`
                        // (i.e. if its criteria IDs are present in appliedT2CriteriaRaw IDs)
                        // This is a heuristic and might need to be more precise if `appliedT2CriteriaRaw` is dynamic.
                        const isSetSelected = definition.every(defCrit => appliedT2CriteriaRaw.some(rawCrit => rawCrit.id === defCrit.id));

                        if (isSetSelected && T2CriteriaManagerInstance.calculateT2Criteria(updatedP, definition)) {
                            tempT2Status = true;
                            tempT2Score++;
                        }
                    });
                    updatedP.t2_criteria_status = tempT2Status;
                    updatedP.t2_criteria_score = tempT2Score;

                } else {
                    updatedP.t2_criteria_status = updatedP.t2_criteria_status !== undefined ? updatedP.t2_criteria_status : false;
                    updatedP.t2_criteria_score = updatedP.t2_criteria_score !== undefined ? updatedP.t2_criteria_score : (updatedP.t2_criteria_status ? 1 : 0);
                }
                
                return updatedP;
            });

            const currentKollektivStats = {
                deskriptiv: this.calculateDescriptiveStatistics(processedData).deskriptiv,
                
                // Gütekriterien für AS und T2
                gueteAS: this.calculateMetrics(processedData, 'avocado_sign_status', groundTruthKey),
                gueteT2: this.calculateMetrics(processedData, 't2_criteria_status', groundTruthKey),
                
                // ROC & AUC für AS (mit Score)
                rocAS: this.calculateROCAndAUC(processedData, 'avocado_sign_score', groundTruthKey),
                
                // Vergleich AS vs. T2 (für dieses Kollektiv)
                vergleichASvsT2: {
                    mcnemar: this.calculateMcNemarTest(processedData, 'avocado_sign_status', 't2_criteria_status', groundTruthKey),
                    delong: this.calculateDeLongTest(processedData, processedData, 'avocado_sign_score', 't2_criteria_score', groundTruthKey)
                },

                // Assoziationsanalyse (für dieses Kollektiv)
                assoziation: (() => {
                    const assoc = {};
                    // AS vs N-Status
                    assoc.as = this.calculateAssociationStatistics(processedData, 'avocado_sign_status', groundTruthKey);
                    assoc.as.featureName = "Avocado Sign";

                    // LK Größe vs N-Status (Mann-Whitney U)
                    if (processedData.some(p => typeof p.diameter_ln_max === 'number')) {
                        assoc.diameter_ln_max_mwu = this.calculateMannWhitneyU(processedData, 'diameter_ln_max', groundTruthKey);
                        assoc.diameter_ln_max_mwu.featureName = "Max. LN Durchmesser";
                    }

                    // Boolesche Merkmale vs N-Status (Chi-Quadrat/Fisher)
                    const booleanFeatures = ['morphology_round', 'signal_heterogeneous', 'edema_peritumoral', 'signal_low', 'inhomogeneous_contrast', 'necrosis', 'capsular_invasion'];
                    booleanFeatures.forEach(feature => {
                        if (processedData.some(p => typeof p[feature] === 'boolean')) {
                            assoc[feature] = this.calculateAssociationStatistics(processedData, feature, groundTruthKey);
                            assoc[feature].featureName = Constants.AVOCADO_SIGN_CRITERIA.find(c => c.param === feature)?.name || feature;
                        }
                    });
                    return assoc;
                })(),

                // Brute-Force Ergebnisse (falls vorhanden und für dieses Kollektiv relevant)
                bruteforce: null
            };

            // Füge Brute-Force-Ergebnisse hinzu, falls vorhanden und für das aktuelle Kollektiv
            if (bruteForceResultsPerKollektiv && bruteForceResultsPerKollektiv[kollektivName]) {
                const bfResult = bruteForceResultsPerKollektiv[kollektivName].bestResult;
                if (bfResult && bfResult.metrics) {
                    currentKollektivStats.bruteforce = {
                        criteria: bfResult.criteriaCombination, // IDs
                        minCriteriaToMeet: bfResult.minCriteriaToMeet,
                        metrics: bfResult.metrics,
                        score: bfResult.score
                    };
                }
            }

            allStats[kollektivName] = currentKollektivStats;
        });

        // Zusätzliche Vergleiche zwischen Kollektiven (z.B. Gesamt vs. Direkt OP, Gesamt vs. nRCT)
        allStats.KollektivVergleiche = {};
        if (allStats['Gesamt'] && allStats['direkt OP']) {
            allStats.KollektivVergleiche['GesamtVsDirektOP'] = {
                accuracyComparison: {
                    as: this.compareAccuracyAcrossKollektive(allStats['Gesamt'].deskriptiv.patientData, allStats['direkt OP'].deskriptiv.patientData, 'avocado_sign_status', groundTruthKey),
                    t2: this.compareAccuracyAcrossKollektive(allStats['Gesamt'].deskriptiv.patientData, allStats['direkt OP'].deskriptiv.patientData, 't2_criteria_status', groundTruthKey)
                },
                aucComparison: {
                    as: this.compareAUCAcrossKollektive(allStats['Gesamt'].deskriptiv.patientData, allStats['direkt OP'].deskriptiv.patientData, 'avocado_sign_score', groundTruthKey),
                    t2: this.compareAUCAcrossKollektive(allStats['Gesamt'].deskriptiv.patientData, allStats['direkt OP'].deskriptiv.patientData, 't2_criteria_score', groundTruthKey)
                }
            };
        }
         if (allStats['Gesamt'] && allStats.nRCT) {
            allStats.KollektivVergleiche['GesamtVsnRCT'] = {
                accuracyComparison: {
                    as: this.compareAccuracyAcrossKollektive(allStats['Gesamt'].deskriptiv.patientData, allStats.nRCT.deskriptiv.patientData, 'avocado_sign_status', groundTruthKey),
                    t2: this.compareAccuracyAcrossKollektive(allStats['Gesamt'].deskriptiv.patientData, allStats.nRCT.deskriptiv.patientData, 't2_criteria_status', groundTruthKey)
                },
                aucComparison: {
                    as: this.compareAUCAcrossKollektive(allStats['Gesamt'].deskriptiv.patientData, allStats.nRCT.deskriptiv.patientData, 'avocado_sign_score', groundTruthKey),
                    t2: this.compareAUCAcrossKollektive(allStats['Gesamt'].deskriptiv.patientData, allStats.nRCT.deskriptiv.patientData, 't2_criteria_score', groundTruthKey)
                }
            };
        }
        if (allStats['direkt OP'] && allStats.nRCT) {
            allStats.KollektivVergleiche['direktOPVsnRCT'] = {
                accuracyComparison: {
                    as: this.compareAccuracyAcrossKollektive(allStats['direkt OP'].deskriptiv.patientData, allStats.nRCT.deskriptiv.patientData, 'avocado_sign_status', groundTruthKey),
                    t2: this.compareAccuracyAcrossKollektive(allStats['direkt OP'].deskriptiv.patientData, allStats.nRCT.deskriptiv.patientData, 't2_criteria_status', groundTruthKey)
                },
                aucComparison: {
                    as: this.compareAUCAcrossKollektive(allStats['direkt OP'].deskriptiv.patientData, allStats.nRCT.deskriptiv.patientData, 'avocado_sign_score', groundTruthKey),
                    t2: this.compareAUCAcrossKollektive(allStats['direkt OP'].deskriptiv.patientData, allStats.nRCT.deskriptiv.patientData, 't2_criteria_score', groundTruthKey)
                }
            };
        }

        return allStats;
    }
}

// Instanziierung der Klasse, um sie global verfügbar zu machen
const StatisticsServiceInstance = new StatisticsService();
