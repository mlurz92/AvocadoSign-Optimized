function calculateConfusionMatrix(predictions, groundTruth) {
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
    return { tp, fp, tn, fn };
}

function clopperPearsonCI(successes, trials, alpha = 0.05) {
    if (trials === 0) {
        return { lower: 0, upper: 1 };
    }

    const jStat = (typeof window !== 'undefined' && window.jStat) ? window.jStat : require('jstat');

    let lower, upper;

    if (successes === 0) {
        lower = 0;
    } else {
        lower = jStat.beta.inv(alpha / 2, successes, trials - successes + 1);
    }

    if (successes === trials) {
        upper = 1;
    } else {
        upper = jStat.beta.inv(1 - alpha / 2, successes + 1, trials - successes);
    }

    return { lower, upper };
}


function calculateMetricsFromMatrix({ tp, fp, tn, fn }) {
    const total = tp + fp + tn + fn;
    const positiveCount = tp + fn;
    const negativeCount = tn + fp;
    const predictedPositive = tp + fp;
    const predictedNegative = tn + fn;

    const sensitivity = positiveCount > 0 ? tp / positiveCount : 0;
    const specificity = negativeCount > 0 ? tn / negativeCount : 0;
    const ppv = predictedPositive > 0 ? tp / predictedPositive : 0;
    const npv = predictedNegative > 0 ? tn / predictedNegative : 0;
    const accuracy = total > 0 ? (tp + tn) / total : 0;

    const sensCI = clopperPearsonCI(tp, positiveCount);
    const specCI = clopperPearsonCI(tn, negativeCount);
    const ppvCI = clopperPearsonCI(tp, predictedPositive);
    const npvCI = clopperPearsonCI(tn, predictedNegative);
    const accCI = clopperPearsonCI(tp + tn, total);

    return {
        tp, fp, tn, fn,
        sensitivity: { value: sensitivity, lower: sensCI.lower, upper: sensCI.upper },
        specificity: { value: specificity, lower: specCI.lower, upper: specCI.upper },
        ppv: { value: ppv, lower: ppvCI.lower, upper: ppvCI.upper },
        npv: { value: npv, lower: npvCI.lower, upper: npvCI.upper },
        accuracy: { value: accuracy, lower: accCI.lower, upper: accCI.upper }
    };
}


export function calculateDiagnosticMetrics(predictions, groundTruth) {
    const matrix = calculateConfusionMatrix(predictions, groundTruth);
    return calculateMetricsFromMatrix(matrix);
}

export function calculateRocCurve(scores, groundTruth) {
    const pairs = scores.map((score, i) => ({ score, truth: groundTruth[i] }));
    pairs.sort((a, b) => b.score - a.score);

    const positiveCount = groundTruth.filter(t => t === 1).length;
    const negativeCount = groundTruth.length - positiveCount;

    if (positiveCount === 0 || negativeCount === 0) {
        return { rocPoints: [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }], auc: { value: 0.5, lower: 0, upper: 1 } };
    }

    const rocPoints = [{ fpr: 0, tpr: 0 }];
    let tp = 0, fp = 0;
    let lastPair = { score: -Infinity, truth: -1};

    for (let i = 0; i < pairs.length; i++) {
        if(i > 0 && pairs[i].score !== pairs[i-1].score) {
            rocPoints.push({
                fpr: fp / negativeCount,
                tpr: tp / positiveCount
            });
        }

        if (pairs[i].truth === 1) {
            tp++;
        } else {
            fp++;
        }
        lastPair = pairs[i];
    }
    rocPoints.push({ fpr: 1, tpr: 1 });

    let auc = 0;
    for (let i = 1; i < rocPoints.length; i++) {
        auc += (rocPoints[i].fpr - rocPoints[i-1].fpr) * (rocPoints[i].tpr + rocPoints[i-1].tpr) / 2;
    }
    
    return {
        rocPoints,
        auc: { value: auc, lower: null, upper: null }
    };
}

export function mcnemarTest(predictions1, predictions2, groundTruth) {
    let n01 = 0; 
    let n10 = 0;

    for (let i = 0; i < groundTruth.length; i++) {
        const correct1 = predictions1[i] === groundTruth[i];
        const correct2 = predictions2[i] === groundTruth[i];

        if (correct1 && !correct2) {
            n10++;
        } else if (!correct1 && correct2) {
            n01++;
        }
    }
    
    if (n01 + n10 === 0) {
        return { chi2: 0, pValue: 1.0, n01, n10 };
    }

    const chi2 = Math.pow(Math.abs(n01 - n10) - 1, 2) / (n01 + n10);
    
    const pValue = 1 - chi2cdf(chi2, 1);

    return { chi2, pValue, n01, n10 };
}

function chi2cdf(x, df) {
    if(x < 0 || df <= 0) return 0;
    const jStat = (typeof window !== 'undefined' && window.jStat) ? window.jStat : require('jstat');
    return jStat.chisquare.cdf(x, df);
}


export function delongTest(scores1, scores2, groundTruth) {
    const n1 = groundTruth.filter(t => t === 1).length;
    const n0 = groundTruth.length - n1;

    if (n1 === 0 || n0 === 0) {
        return { z: 0, pValue: 1.0 };
    }

    const scoresPositive1 = scores1.filter((s, i) => groundTruth[i] === 1);
    const scoresNegative1 = scores1.filter((s, i) => groundTruth[i] === 0);
    const scoresPositive2 = scores2.filter((s, i) => groundTruth[i] === 1);
    const scoresNegative2 = scores2.filter((s, i) => groundTruth[i] === 0);

    const v10 = scoresPositive1.map(s1 => scoresNegative1.map(s0 => (s1 > s0 ? 1 : (s1 === s0 ? 0.5 : 0))).reduce((a, b) => a + b, 0) / n0);
    const v01 = scoresNegative1.map(s0 => scoresPositive1.map(s1 => (s0 > s1 ? 1 : (s0 === s1 ? 0.5 : 0))).reduce((a, b) => a + b, 0) / n1);

    const v20 = scoresPositive2.map(s1 => scoresNegative2.map(s0 => (s1 > s0 ? 1 : (s1 === s0 ? 0.5 : 0))).reduce((a, b) => a + b, 0) / n0);
    const v02 = scoresNegative2.map(s0 => scoresPositive2.map(s1 => (s0 > s1 ? 1 : (s0 === s1 ? 0.5 : 0))).reduce((a, b) => a + b, 0) / n1);
    
    const auc1 = v10.reduce((a, b) => a + b, 0) / n1;
    const auc2 = v20.reduce((a, b) => a + b, 0) / n1;

    const s10 = v10.reduce((sum, val) => sum + Math.pow(val - auc1, 2), 0) / (n1 - 1);
    const s01 = v01.reduce((sum, val) => sum + Math.pow(val - auc1, 2), 0) / (n0 - 1);
    const s20 = v20.reduce((sum, val) => sum + Math.pow(val - auc2, 2), 0) / (n1 - 1);
    const s02 = v02.reduce((sum, val) => sum + Math.pow(val - auc2, 2), 0) / (n0 - 1);

    const cov1 = v10.reduce((sum, val, i) => sum + (val - auc1) * (v20[i] - auc2), 0) / (n1 - 1);
    const cov2 = v01.reduce((sum, val, i) => sum + (val - auc1) * (v02[i] - auc2), 0) / (n0 - 1);

    const varAuc1 = s10 / n1 + s01 / n0;
    const varAuc2 = s20 / n1 + s02 / n0;
    const covAuc1Auc2 = cov1 / n1 + cov2 / n0;

    const z = (auc1 - auc2) / Math.sqrt(varAuc1 + varAuc2 - 2 * covAuc1Auc2);
    const pValue = 2 * (1 - normalcdf(Math.abs(z)));

    return { z, pValue };
}

function normalcdf(x) {
    const jStat = (typeof window !== 'undefined' && window.jStat) ? window.jStat : require('jstat');
    return jStat.normal.cdf(x, 0, 1);
}
