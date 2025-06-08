"use strict";

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


function calculateAccuracy(predictions, groundTruth) {
    let tp = 0, fp = 0, tn = 0, fn = 0;

    for (let i = 0; i < predictions.length; i++) {
        const pred = predictions[i];
        const truth = groundTruth[i];

        if (pred === 1 && truth === 1) {
            tp++;
        } else if (pred === 1 && truth === 0) {
            fp++;
        } else if (pred === 0 && truth === 0) {
            tn++;
        } else if (pred === 0 && truth === 1) {
            fn++;
        }
    }
    
    const total = tp + fp + tn + fn;
    if (total === 0) return 0;
    
    return (tp + tn) / total;
}

function getPowerSet(arr) {
    return arr.reduce(
        (subsets, value) => subsets.concat(
            subsets.map(set => [value, ...set])
        ),
        [[]]
    );
}

self.onmessage = function(e) {
    const { patientData, parameterRanges } = e.data;

    const sizeRange = [];
    for (let i = parameterRanges.size.min; i <= parameterRanges.size.max; i += parameterRanges.size.step) {
        sizeRange.push(i);
    }
    
    const borderCombinations = getPowerSet(parameterRanges.border.options);
    const signalCombinations = getPowerSet(parameterRanges.signal.options);

    let bestResult = {
        parameters: null,
        accuracy: -1,
    };

    const totalCombinations = sizeRange.length * borderCombinations.length * signalCombinations.length;
    let combinationsDone = 0;
    let lastReportedProgress = -1;

    for (const size of sizeRange) {
        for (const border of borderCombinations) {
            for (const signal of signalCombinations) {
                
                const currentParameters = { size, border, signal };
                
                const predictions = patientData.map(p => _evaluateT2(p, currentParameters).prediction);
                const groundTruth = patientData.map(p => p.groundTruth);
                
                const accuracy = calculateAccuracy(predictions, groundTruth);

                if (accuracy > bestResult.accuracy) {
                    bestResult = {
                        parameters: currentParameters,
                        accuracy: accuracy,
                    };
                }

                combinationsDone++;
                const progress = Math.round((combinationsDone / totalCombinations) * 100);

                if (progress > lastReportedProgress) {
                    self.postMessage({
                        type: 'progress',
                        progress: progress
                    });
                    lastReportedProgress = progress;
                }
            }
        }
    }

    self.postMessage({
        type: 'done',
        bestResult: bestResult
    });
};
