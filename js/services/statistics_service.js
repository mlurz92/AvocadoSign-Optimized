window.statisticsService = (() => {

    // --- Basic Statistical Helper Functions ---

    function getMedian(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return NaN;
        const sortedArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x)).sort((a, b) => a - b);
        if (sortedArr.length === 0) return NaN;
        const midIndex = Math.floor(sortedArr.length / 2);
        return sortedArr.length % 2 !== 0 ? sortedArr[midIndex] : (sortedArr[midIndex - 1] + sortedArr[midIndex]) / 2;
    }

    function getMean(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return NaN;
        const numericArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        if (numericArr.length === 0) return NaN;
        const sum = numericArr.reduce((acc, val) => acc + val, 0);
        return sum / numericArr.length;
    }

    function getStdDev(arr) {
        if (!Array.isArray(arr) || arr.length < 2) return NaN;
        const numericArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        if (numericArr.length < 2) return NaN;
        const mean = getMean(numericArr);
        if (isNaN(mean)) return NaN;
        const variance = numericArr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (numericArr.length - 1);
        return Math.sqrt(variance);
    }

    function getQuartiles(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return { q1: NaN, q3: NaN };
        const sortedArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x)).sort((a, b) => a - b);
        if (sortedArr.length === 0) return { q1: NaN, q3: NaN };
        const q1Index = (sortedArr.length + 1) / 4;
        const q3Index = (sortedArr.length + 1) * 3 / 4;
        const getQuartileValue = (index) => {
            if (index <= 1) return sortedArr[0];
            if (index >= sortedArr.length) return sortedArr[sortedArr.length - 1];
            const base = Math.floor(index) - 1;
            const frac = index - Math.floor(index);
            if (sortedArr[base + 1] !== undefined) {
                return sortedArr[base] + frac * (sortedArr[base + 1] - sortedArr[base]);
            }
            return sortedArr[base];
        };
        return {
            q1: getQuartileValue(q1Index),
            q3: getQuartileValue(q3Index)
        };
    }

    // --- Distributions & Tests ---

    function erf(x) {
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const sign = (x >= 0) ? 1 : -1;
        const absX = Math.abs(x);
        const t = 1.0 / (1.0 + p * absX);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
        const result = sign * y;
        return isFinite(result) ? result : (sign > 0 ? 1.0 : -1.0);
    }

    function normalCDF(x, mean = 0, stdDev = 1) {
        if (isNaN(x) || isNaN(mean) || isNaN(stdDev) || stdDev <= 0) return NaN;
        const z = (x - mean) / (stdDev * Math.sqrt(2));
        return 0.5 * (1 + erf(z));
    }

    function inverseNormalCDF(p, mean = 0, stdDev = 1) {
        if (isNaN(p) || p <= 0 || p >= 1) return NaN;
        const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
        const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01, 1.0];
        const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
        const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00, 1.0];
        let q, x;
        if (p < 0.02425) {
            q = Math.sqrt(-2 * Math.log(p));
            x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + d[4]);
        } else if (p <= 0.97575) {
            q = p - 0.5;
            const r = q * q;
            x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]);
        } else {
            q = Math.sqrt(-2 * Math.log(1 - p));
            x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + d[4]);
        }
        return mean + stdDev * x;
    }

    const LOG_GAMMA_CACHE = {};
    function logGamma(x) {
        if (LOG_GAMMA_CACHE[x]) return LOG_GAMMA_CACHE[x];
        if (x <= 0) return NaN;
        const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
        let y = x, tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
        const result = -tmp + Math.log(2.5066282746310005 * ser / x);
        if (Object.keys(LOG_GAMMA_CACHE).length < 1000) LOG_GAMMA_CACHE[x] = result;
        return result;
    }

    function regularizedGammaIncomplete(a, x) {
        if (a <= 0 || x < 0) return NaN;
        if (x === 0) return 0.0;
        const logGammaA = logGamma(a);
        const maxIter = 200, epsilon = 1e-15;
        if (x < a + 1.0) {
            let sum = 1.0 / a, term = sum;
            for (let k = 1; k <= maxIter; k++) {
                term *= x / (a + k); sum += term;
                if (Math.abs(term) < Math.abs(sum) * epsilon) break;
            }
            return Math.exp(a * Math.log(x) - x - logGammaA) * sum;
        } else {
            let b = x + 1.0 - a, c = 1.0 / epsilon, d = 1.0 / b, h = d;
            for (let k = 1; k <= maxIter; k++) {
                let an = -k * (k - a); b += 2.0; d = an * d + b;
                if (Math.abs(d) < epsilon) d = epsilon;
                c = b + an / c; if (Math.abs(c) < epsilon) c = epsilon;
                d = 1.0 / d; h *= d * c;
                if (Math.abs(d * c - 1.0) < epsilon) break;
            }
            return 1.0 - (Math.exp(a * Math.log(x) - x - logGammaA) * h);
        }
    }

    function chiSquareCDF(x, df) {
        if (x < 0 || df <= 0) return NaN;
        return regularizedGammaIncomplete(df / 2.0, x / 2.0);
    }
    
    function logFactorial(n) {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        return logGamma(n + 1);
    }

    function calculateFisherExactTest(a, b, c, d) {
        const n = a + b + c + d;
        if (n === 0) return { pValue: 1.0, method: "Fisher's Exact Test" };
        const logP = logFactorial(a+b) + logFactorial(c+d) + logFactorial(a+c) + logFactorial(b+d) - (logFactorial(a)+logFactorial(b)+logFactorial(c)+logFactorial(d)+logFactorial(n));
        const pObserved = Math.exp(logP);
        let pValue = 0;

        for (let i = 0; i <= Math.min(a+b, a+c); i++) {
            const row1 = a+b, col1 = a+c;
            if (col1 - i >= 0 && row1 - i >= 0 && n - row1 - col1 + i >= 0) {
                const pCurrent = Math.exp(logFactorial(row1) + logFactorial(n - row1) + logFactorial(col1) + logFactorial(n - col1) -
                    (logFactorial(i) + logFactorial(row1 - i) + logFactorial(col1 - i) + logFactorial(n - row1 - col1 + i) + logFactorial(n)));
                if (pCurrent <= pObserved * (1 + 1e-8)) {
                    pValue += pCurrent;
                }
            }
        }
        return { pValue: Math.min(1.0, pValue), method: "Fisher's Exact Test" };
    }

    function calculateWilsonScoreCI(successes, trials, alpha = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        if (trials <= 0) return defaultReturn;
        const p_hat = successes / trials, n = trials;
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        if (!isFinite(z)) return defaultReturn;
        const z2 = z * z;
        const center = p_hat + z2 / (2 * n);
        const term = z * Math.sqrt((p_hat * (1 - p_hat) / n) + (z2 / (4 * n * n)));
        const denominator = 1 + z2 / n;
        return {
            lower: Math.max(0.0, (center - term) / denominator),
            upper: Math.min(1.0, (center + term) / denominator),
            method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION
        };
    }

    function bootstrapCI(data, statisticFn, nBoot = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = window.APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        if (!Array.isArray(data) || data.length < 2) return defaultReturn;
        const n = data.length;
        const bootStats = [];
        for (let i = 0; i < nBoot; i++) {
            const bootSample = Array.from({length: n}, () => data[Math.floor(Math.random() * n)]);
            try {
                const stat = statisticFn(bootSample);
                if (isFinite(stat)) bootStats.push(stat);
            } catch (e) { }
        }
        if (bootStats.length < 2) return defaultReturn;
        bootStats.sort((a, b) => a - b);
        const lowerIndex = Math.floor(bootStats.length * (alpha / 2.0));
        const upperIndex = Math.ceil(bootStats.length * (1 - alpha / 2.0)) - 1;
        const finalLowerIndex = Math.max(0, Math.min(lowerIndex, bootStats.length - 1));
        const finalUpperIndex = Math.max(0, Math.min(upperIndex, bootStats.length - 1));
        return { lower: bootStats[finalLowerIndex], upper: bootStats[finalUpperIndex], method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: getStdDev(bootStats) };
    }

    function calculateMcNemarTest(b, c) {
        if (isNaN(b) || isNaN(c) || b < 0 || c < 0) return { pValue: NaN, statistic: NaN, df: 1, method: "McNemar's Test (Invalid Input)" };
        const n = b + c;
        if (n === 0) return { pValue: 1.0, statistic: 0, df: 1, method: "McNemar's Test (No Discordance)" };
        const useCorrection = n < 25;
        const statistic = Math.pow(Math.abs(b - c) - (useCorrection ? 1 : 0), 2) / n;
        const pValue = 1.0 - chiSquareCDF(statistic, 1);
        return { pValue, statistic, df: 1, method: `McNemar's Test${useCorrection ? ' (Yates-corrected)' : ''}` };
    }

    function calculateDeLongTest(data, key1, key2, referenceKey) {
        const defaultReturn = { pValue: NaN, Z: NaN, diffAUC: NaN, varDiff: NaN, n: data?.length || 0, method: "DeLong Test (Invalid Input)" };
        if (!data || data.length === 0 || !key1 || !key2 || !referenceKey) return defaultReturn;

        const validData = data.filter(p => p?.[referenceKey] === '+' || p?.[referenceKey] === '-');
        const positives = validData.filter(p => p?.[referenceKey] === '+');
        const negatives = validData.filter(p => p?.[referenceKey] === '-');
        const n_pos = positives.length;
        const n_neg = negatives.length;

        if (n_pos === 0 || n_neg === 0) {
            return { ...defaultReturn, method: "DeLong Test (No positive or negative reference cases)" };
        }

        const getScores = (patient, testKey) => (patient?.[testKey] === '+') ? 1 : (patient?.[testKey] === '-') ? 0 : NaN;

        const getAUCComponents = (testKey) => {
            let structuralPairs = 0;
            const V10 = new Array(n_pos).fill(0);
            const V01 = new Array(n_neg).fill(0);

            for (let i = 0; i < n_pos; i++) {
                const score_pos = getScores(positives[i], testKey);
                if (isNaN(score_pos)) continue;

                for (let j = 0; j < n_neg; j++) {
                    const score_neg = getScores(negatives[j], testKey);
                    if (isNaN(score_neg)) continue;

                    let score = (score_pos > score_neg) ? 1.0 : (score_pos === score_neg ? 0.5 : 0.0);
                    
                    structuralPairs += score;
                    V10[i] += score;
                    V01[j] += score;
                }
            }
            const auc = (n_pos * n_neg > 0) ? structuralPairs / (n_pos * n_neg) : NaN;
            V10.forEach((val, i) => V10[i] = (n_neg > 0) ? val / n_neg : NaN);
            V01.forEach((val, j) => V01[j] = (n_pos > 0) ? val / n_pos : NaN);
            return { auc, V10, V01 };
        };

        try {
            const c1 = getAUCComponents(key1);
            const c2 = getAUCComponents(key2);

            if (isNaN(c1.auc) || isNaN(c2.auc)) {
                return { ...defaultReturn, method: "DeLong Test (AUC calculation failed)" };
            }

            const calculateVariance = (V_arr, mean) => {
                const filteredV_arr = V_arr.filter(v => isFinite(v));
                if (filteredV_arr.length < 2) return NaN;
                return filteredV_arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (filteredV_arr.length - 1);
            };

            const calculateCovariance = (V_X_orig, V_Y_orig, meanX, meanY) => {
                const V_X = V_X_orig.filter(v => isFinite(v));
                const V_Y = V_Y_orig.filter(v => isFinite(v));
                if (V_X.length !== V_Y.length || V_X.length < 2) return NaN;
                let sum = 0;
                for (let i = 0; i < V_X.length; i++) sum += (V_X[i] - meanX) * (V_Y[i] - meanY);
                return sum / (V_X.length - 1);
            };

            const S10_1 = calculateVariance(c1.V10, c1.auc);
            const S01_1 = calculateVariance(c1.V01, c1.auc);
            const S10_2 = calculateVariance(c2.V10, c2.auc);
            const S01_2 = calculateVariance(c2.V01, c2.auc);
            const Cov10 = calculateCovariance(c1.V10, c2.V10, c1.auc, c2.auc);
            const Cov01 = calculateCovariance(c1.V01, c2.V01, c1.auc, c2.auc);
            
            if ([S10_1, S01_1, S10_2, S01_2, Cov10, Cov01].some(isNaN)) {
                 return { ...defaultReturn, method: "DeLong Test (Variance/Covariance calculation failed)" };
            }

            const varDiff = (S10_1 + S10_2 - 2 * Cov10) / n_pos + (S01_1 + S01_2 - 2 * Cov01) / n_neg;

            if (isNaN(varDiff) || varDiff <= 1e-12) {
                return { pValue: 1.0, Z: 0, diffAUC: c1.auc - c2.auc, varDiff: 0, n: validData.length, method: "DeLong Test (Zero Variance)" };
            }

            const z = (c1.auc - c2.auc) / Math.sqrt(varDiff);
            const pValue = 2.0 * normalCDF(-Math.abs(z));
            return { pValue, Z: z, diffAUC: c1.auc - c2.auc, varDiff, n: validData.length, method: "DeLong Test" };
        } catch (error) {
            return { ...defaultReturn, method: `DeLong Test (Execution Error)` };
        }
    }
    
    function calculatePostHocPower(delongResult, alpha) {
        if (!delongResult || !isFinite(delongResult.Z) || !isFinite(alpha)) return NaN;
        const zAlpha2 = Math.abs(inverseNormalCDF(alpha / 2.0));
        return normalCDF(Math.abs(delongResult.Z) - zAlpha2);
    }
    
    function calculateRequiredSampleSize(delongResult, targetPower, alpha) {
        if (!delongResult || !isFinite(delongResult.diffAUC) || !isFinite(delongResult.varDiff) || delongResult.varDiff <= 0) return NaN;
        const zAlpha2 = Math.abs(inverseNormalCDF(alpha / 2.0));
        const zBeta = Math.abs(inverseNormalCDF(1 - targetPower));
        if (!isFinite(zAlpha2) || !isFinite(zBeta)) return NaN;
        const n_current = delongResult.n;
        const var_normalized = delongResult.varDiff * n_current;
        const requiredN = (Math.pow(zAlpha2 + zBeta, 2) * var_normalized) / Math.pow(delongResult.diffAUC, 2);
        return Math.ceil(requiredN);
    }
    
    function compareDiagnosticMethods(data, key1, key2, referenceKey) {
        const nullReturn = { mcnemar: null, delong: null };
        if (!data || data.length === 0) return nullReturn;
        let b = 0, c = 0;
        data.forEach(p => {
            const pred1 = p[key1];
            const pred2 = p[key2];
            if ((pred1 === '+' || pred1 === '-') && (pred2 === '+' || pred2 === '-')) {
                if (pred1 === '+' && pred2 === '-') b++;
                if (pred1 === '-' && pred2 === '+') c++;
            }
        });
        const delongResult = calculateDeLongTest(data, key1, key2, referenceKey);
        const power = calculatePostHocPower(delongResult, window.APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL);
        return { 
            mcnemar: calculateMcNemarTest(b, c), 
            delong: { ...delongResult, power } 
        };
    }

    function calculateDescriptiveStats(data) {
        const n = data?.length ?? 0;
        const nullMetric = { median: NaN, q1: NaN, q3: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN, n: 0 };
        if (n === 0) return { patientCount: 0, age: nullMetric, sex: { m: 0, f: 0, unknown: 0 }, therapy: { surgeryAlone: 0, neoadjuvantTherapy: 0, unknown: 0 }, nStatus: { plus: 0, minus: 0, unknown: 0 }, asStatus: { plus: 0, minus: 0, unknown: 0 }, t2Status: { plus: 0, minus: 0, unknown: 0 }, lnCounts: null, ageData: [] };

        const ageData = data.map(p => p?.age).filter(a => a !== null && !isNaN(a) && isFinite(a)).sort((a,b) => a-b);
        const ageQuartiles = getQuartiles(ageData);

        const getStats = (arr) => {
            const sortedArr = arr.filter(c => !isNaN(c) && isFinite(c)).sort((a,b) => a-b);
            return sortedArr.length === 0 ? nullMetric : { median: getMedian(sortedArr), min: sortedArr[0], max: sortedArr[sortedArr.length-1], mean: getMean(sortedArr), sd: getStdDev(sortedArr), n: sortedArr.length, ...getQuartiles(sortedArr) };
        };
        
        const getCounts = (key) => data.map(p => p?.[key]).filter(c => c !== undefined && c !== null && typeof c === 'number' && !isNaN(c) && isFinite(c) && c >= 0);

        const nStatusCounts = data.reduce((acc,p) => { if(p.nStatus === '+') acc.plus++; else if(p.nStatus === '-') acc.minus++; else acc.unknown++; return acc; }, { plus: 0, minus: 0, unknown: 0 });
        const asStatusCounts = data.reduce((acc,p) => { if(p.asStatus === '+') acc.plus++; else if(p.asStatus === '-') acc.minus++; else acc.unknown++; return acc; }, { plus: 0, minus: 0, unknown: 0 });
        const t2StatusCounts = data.reduce((acc,p) => { if(p.t2Status === '+') acc.plus++; else if(p.t2Status === '-') acc.minus++; else acc.unknown++; return acc; }, { plus: 0, minus: 0, unknown: 0 });
        const lnCountsNplusData = data.filter(p => p.nStatus === '+').map(p => p.countPathologyNodesPositive).filter(c => c !== undefined && c !== null);
        const lnCountsASplusData = data.filter(p => p.asStatus === '+').map(p => p.countASNodesPositive).filter(c => c !== undefined && c !== null);
        const lnCountsT2plusData = data.filter(p => p.t2Status === '+').map(p => p.countT2NodesPositive).filter(c => c !== undefined && c !== null);

        return {
            patientCount: n,
            age: ageData.length > 0 ? { median: getMedian(ageData), min: ageData[0], max: ageData[ageData.length - 1], mean: getMean(ageData), sd: getStdDev(ageData), q1: ageQuartiles.q1, q3: ageQuartiles.q3, n: ageData.length } : nullMetric,
            sex: data.reduce((acc, p) => { acc[p.sex || 'unknown'] = (acc[p.sex || 'unknown'] || 0) + 1; return acc; }, { m: 0, f: 0, unknown: 0 }),
            therapy: data.reduce((acc, p) => { acc[p.therapy || 'unknown'] = (acc[p.therapy || 'unknown'] || 0) + 1; return acc; }, { surgeryAlone: 0, neoadjuvantTherapy: 0, unknown: 0 }),
            nStatus: nStatusCounts,
            asStatus: asStatusCounts,
            t2Status: t2StatusCounts,
            lnCounts: {
                n: { total: getStats(getCounts('countPathologyNodes')), plus: getStats(lnCountsNplusData) },
                as: { total: getStats(getCounts('countASNodes')), plus: getStats(lnCountsASplusData) },
                t2: { total: getStats(getCounts('countT2Nodes')), plus: getStats(lnCountsT2plusData) }
            },
            ageData: ageData
        };
    }

    function calculateAssociationStats(data, featureEvaluationFn, featureName) {
        let tp = 0, fp = 0, fn = 0, tn = 0;
        data.forEach(p => {
            if (p.nStatus === '+' || p.nStatus === '-') {
                const hasFeature = featureEvaluationFn(p);
                const isPositiveN = p.nStatus === '+';
                if (hasFeature && isPositiveN) tp++;
                else if (hasFeature && !isPositiveN) fp++;
                else if (!hasFeature && isPositiveN) fn++;
                else if (!hasFeature && !isPositiveN) tn++;
            }
        });
        
        const oddsRatio = (tp * tn) / (fp * fn);
        const se_log_or = Math.sqrt(1/tp + 1/fp + 1/fn + 1/tn);
        const or_ci = {
            lower: Math.exp(Math.log(oddsRatio) - 1.96 * se_log_or),
            upper: Math.exp(Math.log(oddsRatio) + 1.96 * se_log_or)
        };
        const risk_exposed = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const risk_unexposed = (fn + tn) > 0 ? fn / (fn + tn) : 0;
        const risk_difference = risk_exposed - risk_unexposed;
        const se_rd = Math.sqrt((risk_exposed * (1 - risk_exposed) / (tp + fp)) + (risk_unexposed * (1 - risk_unexposed) / (fn + tn)));
        const rd_ci = {
            lower: risk_difference - 1.96 * se_rd,
            upper: risk_difference + 1.96 * se_rd
        };
        const phi = (tp * tn - fp * fn) / Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
        const fisher = calculateFisherExactTest(tp, fp, fn, tn);

        return {
            featureName,
            matrix: { tp, fp, fn, tn },
            or: { value: oddsRatio, ci: or_ci },
            rd: { value: risk_difference, ci: rd_ci },
            phi: { value: phi },
            pValue: fisher.pValue,
            testName: fisher.method
        };
    }

    function calculateAggregateNodeCounts(data) {
        const counts = {
            pathology: { total: 0, positive: 0 },
            as: { total: 0, positive: 0 },
            t2: { total: 0, positive: 0 }
        };
        if (!Array.isArray(data)) return counts;

        data.forEach(p => {
            if (!p) return;
            counts.pathology.total += p.countPathologyNodes ?? 0;
            counts.pathology.positive += p.countPathologyNodesPositive ?? 0;
            counts.as.total += p.countASNodes ?? 0;
            counts.as.positive += p.countASNodesPositive ?? 0;
            counts.t2.total += p.countT2Nodes ?? 0;
            counts.t2.positive += p.countT2NodesPositive ?? 0;
        });
        return counts;
    }

    function logBeta(a, b) {
        return logGamma(a) + logGamma(b) - logGamma(a + b);
    }

    function regularizedIncompleteBeta(x, a, b) {
        if (x < 0 || x > 1 || a <= 0 || b <= 0) return NaN;
        if (x === 0) return 0;
        if (x === 1) return 1;

        const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
        if (x < (a + 1) / (a + b + 2)) {
            const continuedFraction = (m, a, b) => {
                const maxIter = 100, epsilon = 1e-14;
                let am = 1, bm = 1, az = 1, qab = a + b, qap = a + 1, qam = a - 1, bz = 1 - qab * x / qap;
                for (let i = 1; i <= maxIter; i++) {
                    let d = i * (b - i) * x / ((qam + 2 * i) * (a + 2 * i));
                    let ap = az + d * am; let bp = bz + d * bm;
                    d = -(a + i) * (qab + i) * x / ((a + 2 * i) * (qap + 2 * i));
                    let app = ap + d * az; let bpp = bp + d * bz;
                    am = ap / bpp; bm = bp / bpp; az = app / bpp; bz = 1;
                    if (Math.abs(az - am) < epsilon * Math.abs(az)) return az;
                }
                return az;
            };
            return bt * continuedFraction(x, a, b) / a;
        } else {
            return 1 - regularizedIncompleteBeta(1 - x, b, a);
        }
    }

    function tDistributionCDF(t, df) {
        if (df <= 0) return NaN;
        const x = df / (df + t * t);
        const p = 0.5 * regularizedIncompleteBeta(x, df / 2, 0.5);
        return t > 0 ? 1 - p : p;
    }

    function _calculateWelchTTest(sample1, sample2) {
        const n1 = sample1.length;
        const n2 = sample2.length;
        if (n1 < 2 || n2 < 2) return { pValue: NaN, method: "Welch's t-test (Not enough data)" };

        const mean1 = getMean(sample1);
        const mean2 = getMean(sample2);
        const var1 = Math.pow(getStdDev(sample1), 2);
        const var2 = Math.pow(getStdDev(sample2), 2);

        if (isNaN(mean1) || isNaN(mean2) || isNaN(var1) || isNaN(var2) || var1 < 0 || var2 < 0) {
            return { pValue: NaN, method: "Welch's t-test (Invalid input)" };
        }

        const se_diff = Math.sqrt(var1 / n1 + var2 / n2);
        if (se_diff < 1e-9) {
            return { pValue: 1.0, method: "Welch's t-test (Zero Variance)" };
        }

        const t = (mean1 - mean2) / se_diff;
        const df_num = Math.pow(var1 / n1 + var2 / n2, 2);
        const df_den = (Math.pow(var2 / n1, 2) / (n1 - 1)) + (Math.pow(var2 / n2, 2) / (n2 - 1));
        const df = df_den > 0 ? df_num / df_den : 1;
        
        const pValue = 2 * tDistributionCDF(-Math.abs(t), df);

        return { pValue: pValue, method: "Welch's t-test" };
    }
    
    function _calculateIndependentAucComparison(auc1, se1, n1, auc2, se2, n2) {
        const defaultReturn = { pValue: NaN, Z: NaN, diffAUC: NaN, method: "Z-Test for Independent AUCs (Invalid Input)" };
        if (!isFinite(auc1) || !isFinite(se1) || !isFinite(n1) || n1 <= 0 || !isFinite(auc2) || !isFinite(se2) || !isFinite(n2) || n2 <= 0) {
            return defaultReturn;
        }
        const diff = auc1 - auc2;
        const se_diff = Math.sqrt(Math.pow(se1, 2) + Math.pow(se2, 2));
        if (se_diff <= 1e-9) {
            return { pValue: (Math.abs(diff) > 1e-9 ? 0.0 : 1.0), Z: (Math.abs(diff) > 1e-9 ? Infinity : 0), diffAUC: diff, method: "Z-Test for Independent AUCs (Zero SE)" };
        }
        const z = diff / se_diff;
        const pValue = 2.0 * normalCDF(-Math.abs(z));
        return { pValue, Z: z, diffAUC: diff, method: "Z-Test for Independent AUCs" };
    }

    // --- REVISED Cross-Validation Logic with Exhaustive Grid Search ---

    function _fastAUC(predictions, actuals) {
        let n_pos = 0, n_neg = 0;
        for (let i = 0; i < actuals.length; i++) {
            if (actuals[i] === 1) n_pos++;
            else if (actuals[i] === 0) n_neg++;
        }
        if (n_pos === 0 || n_neg === 0) return 0.5;

        let correctPairs = 0;
        for (let i = 0; i < predictions.length; i++) {
            if (actuals[i] !== 1) continue; 
            for (let j = 0; j < predictions.length; j++) {
                if (actuals[j] !== 0) continue;
                if (predictions[i] > predictions[j]) correctPairs += 1;
                else if (predictions[i] === predictions[j]) correctPairs += 0.5;
            }
        }
        return correctPairs / (n_pos * n_neg);
    }

    function _performExhaustiveGridSearchSync(trainingData) {
        const patients = trainingData.map(p => ({
            n: p.nStatus === '+' ? 1 : 0,
            nodes: (p.t2Nodes || []).map(n => ({
                size: n.size || 0,
                shape: n.shape === 'round',
                border: n.border === 'irregular',
                homogeneity: n.homogeneity === 'heterogeneous',
                signal: n.signal === 'intermediate' || n.signal === 'high' 
            }))
        }));

        const sizeSettings = window.APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE;
        const minSize = sizeSettings.min;
        const maxSize = sizeSettings.max;
        const stepSize = sizeSettings.step;
        
        const sizeThresholds = [];
        const multiplier = 10;
        const startInt = Math.round(minSize * multiplier);
        const endInt = Math.round(maxSize * multiplier);
        const stepInt = Math.max(1, Math.round(stepSize * multiplier));

        for (let s = startInt; s <= endInt; s += stepInt) {
            sizeThresholds.push(parseFloat((s / multiplier).toFixed(1)));
        }

        const logics = ['AND', 'OR'];
        let bestAUC = -1;
        let bestConfig = null;

        const preds = new Uint8Array(patients.length);
        const actuals = new Uint8Array(patients.length);
        for(let i=0; i<patients.length; i++) actuals[i] = patients[i].n;

        for (const logic of logics) {
            for (let i = 0; i < 16; i++) {
                const useShape = (i & 1) !== 0;
                const useBorder = (i & 2) !== 0;
                const useHomogeneity = (i & 4) !== 0;
                const useSignal = (i & 8) !== 0;

                for (const sizeThreshold of sizeThresholds) {
                    for (let pIdx = 0; pIdx < patients.length; pIdx++) {
                        const p = patients[pIdx];
                        let isPatientPositive = false;
                        
                        if (p.nodes.length > 0) {
                             for (const node of p.nodes) {
                                 const sizePass = node.size >= sizeThreshold;
                                 const activeChecks = [sizePass];
                                 if (useShape) activeChecks.push(node.shape); 
                                 if (useBorder) activeChecks.push(node.border);
                                 if (useHomogeneity) activeChecks.push(node.homogeneity);
                                 if (useSignal) activeChecks.push(node.signal);

                                 let nodePos = false;
                                 if (logic === 'AND') {
                                     nodePos = true;
                                     for(let k=0; k<activeChecks.length; k++) {
                                         if(!activeChecks[k]) { nodePos = false; break; }
                                     }
                                 } else {
                                     nodePos = false;
                                     for(let k=0; k<activeChecks.length; k++) {
                                         if(activeChecks[k]) { nodePos = true; break; }
                                     }
                                 }
                                 
                                 if (nodePos) {
                                     isPatientPositive = true;
                                     break;
                                 }
                             }
                        }
                        preds[pIdx] = isPatientPositive ? 1 : 0;
                    }
                    
                    const auc = _fastAUC(preds, actuals);
                    if (auc > bestAUC) {
                        bestAUC = auc;
                        bestConfig = {
                            logic: logic,
                            criteria: {
                                size: { active: true, threshold: sizeThreshold, condition: '>=' },
                                shape: { active: useShape, value: 'round' },
                                border: { active: useBorder, value: 'irregular' },
                                homogeneity: { active: useHomogeneity, value: 'heterogeneous' },
                                signal: { active: useSignal, value: 'intermediate' } 
                            }
                        };
                    }
                }
            }
        }
        return { bestAUC, bestConfig };
    }

    function performStratifiedKFoldCV(data, k = window.APP_CONFIG.STATISTICAL_CONSTANTS.CV_FOLDS) {
        if (!Array.isArray(data) || data.length < k) return null;

        const positives = data.filter(p => p.nStatus === '+');
        const negatives = data.filter(p => p.nStatus === '-');
        
        const shuffle = (arr) => {
            const array = [...arr];
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };
        
        const posShuffled = shuffle(positives);
        const negShuffled = shuffle(negatives);

        const folds = Array.from({ length: k }, () => []);
        posShuffled.forEach((p, i) => folds[i % k].push(p));
        negShuffled.forEach((p, i) => folds[i % k].push(p));

        const foldResults = [];

        for (let i = 0; i < k; i++) {
            const testSet = folds[i];
            const trainSet = folds.filter((_, idx) => idx !== i).flat();

            const { bestConfig } = _performExhaustiveGridSearchSync(trainSet);
            const evaluatedTestSet = window.t2CriteriaManager.evaluateDataset(testSet.map(p => ({...p})), bestConfig.criteria, bestConfig.logic);
            const perf = calculateDiagnosticPerformance(evaluatedTestSet, 't2Status', 'nStatus');
            
            foldResults.push({
                fold: i + 1,
                auc: perf.auc.value,
                sens: perf.sens.value,
                spec: perf.spec.value,
                ppv: perf.ppv.value,
                npv: perf.npv.value,
                acc: perf.acc.value,
                bestConfig: bestConfig,
                nTest: testSet.length
            });
        }

        const stats = (key) => {
            const values = foldResults.map(r => r[key]).filter(v => !isNaN(v));
            return { mean: getMean(values), sd: getStdDev(values) };
        };

        // Optimism calculation
        const { bestConfig: bestOverallConfig } = _performExhaustiveGridSearchSync(data);
        const apparentPerf = calculateDiagnosticPerformance(window.t2CriteriaManager.evaluateDataset(data.map(p => ({...p})), bestOverallConfig.criteria, bestOverallConfig.logic), 't2Status', 'nStatus');
        const optimism = apparentPerf.auc.value - stats('auc').mean;

        return {
            meanAUC: stats('auc').mean,
            sdAUC: stats('auc').sd,
            meanSens: stats('sens').mean,
            sdSens: stats('sens').sd,
            meanSpec: stats('spec').mean,
            sdSpec: stats('spec').sd,
            meanPPV: stats('ppv').mean,
            sdPPV: stats('ppv').sd,
            meanNPV: stats('npv').mean,
            sdNPV: stats('npv').sd,
            meanAcc: stats('acc').mean,
            sdAcc: stats('acc').sd,
            folds: k,
            details: foldResults,
            optimism: optimism,
            apparentAUC: apparentPerf.auc.value
        };
    }

    // --- Mismatch & Size Analysis ---

    function identifyFalseNegatives(data) {
        if (!Array.isArray(data)) return [];
        return data.filter(p => p.nStatus === '+' && p.asStatus === '-').map(p => {
            let maxT2Node = null;
            let maxT2Size = 0;
            if (p.t2Nodes && p.t2Nodes.length > 0) {
                p.t2Nodes.forEach(n => {
                    if (n.size > maxT2Size) {
                        maxT2Size = n.size;
                        maxT2Node = n;
                    }
                });
            }
            return { ...p, maxT2Size, maxT2Node };
        });
    }

    function identifyDiscordantCases(data, methodKey = 't2Status') {
        const discordance = {
            asCorrect: [], // AS=N, T2!=N
            t2Correct: [], // T2=N, AS!=N
            bothWrong: [], // AS!=N, T2!=N
            bothCorrect: [] // AS=N, T2=N
        };
        
        if (!Array.isArray(data)) return discordance;

        data.forEach(p => {
            const n = p.nStatus;
            const as = p.asStatus;
            const t2 = p[methodKey];
            
            if (n !== '+' && n !== '-') return;
            
            const asMatch = as === n;
            const t2Match = t2 === n;

            if (asMatch && !t2Match) discordance.asCorrect.push(p);
            else if (!asMatch && t2Match) discordance.t2Correct.push(p);
            else if (!asMatch && !t2Match) discordance.bothWrong.push(p);
            else discordance.bothCorrect.push(p);
        });
        return discordance;
    }

    function calculateSizeDistribution(data) {
        const result = {
            all: { values: [], stats: {} },
            nPos: { values: [], stats: {} },
            nNeg: { values: [], stats: {} },
            asPos: { values: [], stats: {} },
            asNeg: { values: [], stats: {} },
            categories: { small: 0, medium: 0, large: 0, total: 0 },
            categoryPerformance: {} 
        };

        if (!Array.isArray(data)) return result;

        const allNodes = [];
        data.forEach(p => {
            if (p.t2Nodes && p.t2Nodes.length > 0) {
                p.t2Nodes.forEach(n => {
                    if (typeof n.size === 'number' && !isNaN(n.size)) {
                        const nodeInfo = { size: n.size, nStatus: p.nStatus, asStatus: p.asStatus };
                        allNodes.push(nodeInfo);
                        
                        result.all.values.push(n.size);
                        if (p.nStatus === '+') result.nPos.values.push(n.size);
                        else if (p.nStatus === '-') result.nNeg.values.push(n.size);
                        
                        // Note: assigning AS status to node based on patient AS status is a proxy
                        if (p.asStatus === '+') result.asPos.values.push(n.size);
                        else if (p.asStatus === '-') result.asNeg.values.push(n.size);

                        // Categorization
                        if (n.size < 5.0) result.categories.small++;
                        else if (n.size < 9.0) result.categories.medium++;
                        else result.categories.large++;
                        result.categories.total++;
                    }
                });
            }
        });

        // Basic Stats per group
        const calc = (vals) => {
            if (vals.length === 0) return { mean: NaN, sd: NaN, median: NaN, min: NaN, max: NaN, n: 0 };
            return {
                mean: getMean(vals),
                sd: getStdDev(vals),
                median: getMedian(vals),
                min: Math.min(...vals),
                max: Math.max(...vals),
                n: vals.length
            };
        };

        result.all.stats = calc(result.all.values);
        result.nPos.stats = calc(result.nPos.values);
        result.nNeg.stats = calc(result.nNeg.values);
        result.asPos.stats = calc(result.asPos.values);
        result.asNeg.stats = calc(result.asNeg.values);

        // Max Node Size Performance Analysis
        // Group patients by their Max Node Size category
        const cats = { small: [], medium: [], large: [] };
        data.forEach(p => {
            if (p.maxNodeSizeCategory) {
                cats[p.maxNodeSizeCategory].push(p);
            }
        });

        Object.keys(cats).forEach(cat => {
            result.categoryPerformance[cat] = {
                count: cats[cat].length,
                performanceAS: calculateDiagnosticPerformance(cats[cat], 'asStatus', 'nStatus'),
                // Only meaningful if T2 criteria are applied, calculated dynamically in UI usually
                // but we can't do it here without the current criteria.
            };
        });

        return result;
    }

    // --- Main Service Logic ---

    function calculateAllPublicationStats(data, appliedT2Criteria, appliedT2Logic, allBruteForceResults) {
        if (!data || !Array.isArray(data)) return null;
        const results = {};
        const cohorts = Object.values(window.APP_CONFIG.COHORTS).map(c => c.id);
        const allLiteratureSets = window.studyT2CriteriaManager.getAllStudyCriteriaSets();

        const globalEvaluatedData = window.t2CriteriaManager.evaluateDataset(data.map(p => ({...p})), appliedT2Criteria, appliedT2Logic);
        results.globalAggregateNodeCounts = calculateAggregateNodeCounts(globalEvaluatedData);

        cohorts.forEach(cohortId => {
            const cohortData = window.dataProcessor.filterDataByCohort(data, cohortId);
            const evaluatedDataApplied = window.t2CriteriaManager.evaluateDataset(cohortData.map(p => ({...p})), appliedT2Criteria, appliedT2Logic);
            
            results[cohortId] = {
                descriptive: calculateDescriptiveStats(evaluatedDataApplied),
                performanceAS: calculateDiagnosticPerformance(evaluatedDataApplied, 'asStatus', 'nStatus'),
                performanceT2Applied: calculateDiagnosticPerformance(evaluatedDataApplied, 't2Status', 'nStatus'),
                comparisonASvsT2Applied: compareDiagnosticMethods(evaluatedDataApplied, 'asStatus', 't2Status', 'nStatus'),
                performanceT2Literature: {},
                comparisonASvsT2Literature: {},
                performanceT2Bruteforce: {},
                comparisonASvsT2Bruteforce: {},
                bruteforceDefinitions: {},
                addedValueAnalysis: {},
                associationsApplied: {},
                aggregateNodeCounts: calculateAggregateNodeCounts(evaluatedDataApplied),
                crossValidation: (cohortData.length >= window.APP_CONFIG.STATISTICAL_CONSTANTS.CV_FOLDS) ? performStratifiedKFoldCV(cohortData) : null,
                sizeAnalysis: calculateSizeDistribution(cohortData),
                mismatchAnalysis: {
                    falseNegatives: identifyFalseNegatives(evaluatedDataApplied),
                    discordance: identifyDiscordantCases(evaluatedDataApplied, 't2Status')
                }
            };
            
            const featuresToTest = [
                { key: 'as', name: 'Avocado Sign', evalFn: (p) => p.asStatus === '+' },
                { key: 'size', name: 'Size ≥ 5mm (any LN)', evalFn: (p) => p.t2Nodes.some(n => n.size >= 5.0) },
                { key: 'border', name: 'Irregular Border (any LN)', evalFn: (p) => p.t2Nodes.some(n => n.border === 'irregular') },
                { key: 'homogeneity', name: 'Heterogeneous Signal (any LN)', evalFn: (p) => p.t2Nodes.some(n => n.homogeneity === 'heterogeneous') },
                { key: 'shape', name: 'Round Shape (any LN)', evalFn: (p) => p.t2Nodes.some(n => n.shape === 'round') }
            ];

            featuresToTest.forEach(feature => {
                results[cohortId].associationsApplied[feature.key] = calculateAssociationStats(cohortData, feature.evalFn, feature.name);
            });
        });

        allLiteratureSets.forEach(studySet => {
            const cohortForSet = studySet.applicableCohort || window.APP_CONFIG.COHORTS.OVERALL.id;
            const dataForSet = window.dataProcessor.filterDataByCohort(data, cohortForSet);
            if (dataForSet.length > 0) {
                const evaluatedDataStudy = window.studyT2CriteriaManager.evaluateDatasetWithStudyCriteria(dataForSet.map(p => ({...p})), studySet);
                results[cohortForSet].performanceT2Literature[studySet.id] = calculateDiagnosticPerformance(evaluatedDataStudy, 't2Status', 'nStatus');
                results[cohortForSet].comparisonASvsT2Literature[studySet.id] = compareDiagnosticMethods(evaluatedDataStudy, 'asStatus', 't2Status', 'nStatus');
                results[cohortForSet].addedValueAnalysis[studySet.id] = calculateAddedValue(evaluatedDataStudy);
                if (!results[cohortForSet].aggregateNodeCountsLiterature) {
                    results[cohortForSet].aggregateNodeCountsLiterature = {};
                }
                results[cohortForSet].aggregateNodeCountsLiterature[studySet.id] = calculateAggregateNodeCounts(evaluatedDataStudy);
            }
        });
        
        cohorts.forEach(cohortId => {
            const cohortBfResults = allBruteForceResults?.[cohortId];
            if (cohortBfResults) {
                const cohortData = window.dataProcessor.filterDataByCohort(data, cohortId);
                Object.keys(cohortBfResults).forEach(metricName => {
                    const bfResult = cohortBfResults[metricName];
                    if (bfResult && bfResult.bestResult?.criteria) {
                        const evaluatedDataBF = window.t2CriteriaManager.evaluateDataset(cohortData.map(p => ({...p})), bfResult.bestResult.criteria, bfResult.bestResult.logic);
                        results[cohortId].performanceT2Bruteforce[metricName] = calculateDiagnosticPerformance(evaluatedDataBF, 't2Status', 'nStatus');
                        results[cohortId].comparisonASvsT2Bruteforce[metricName] = compareDiagnosticMethods(evaluatedDataBF, 'asStatus', 't2Status', 'nStatus');
                        results[cohortId].bruteforceDefinitions[metricName] = { 
                            criteria: bfResult.bestResult.criteria, 
                            logic: bfResult.bestResult.logic, 
                            metricValue: bfResult.bestResult.metricValue, 
                            metricName: bfResult.metric 
                        };
                    }
                });
            }
        });

        if (results.Overall) {
            results.Overall.interobserverKappa = window.APP_CONFIG.STATISTICAL_CONSTANTS.INTEROBSERVER_KAPPA;
        }

        const cohort1Data = results[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id];
        const cohort2Data = results[window.APP_CONFIG.COHORTS.NEOADJUVANT.id];
        if (cohort1Data && cohort2Data) {
            const demoComp = {
                age: _calculateWelchTTest(cohort1Data.descriptive.ageData, cohort2Data.descriptive.ageData),
                sex: calculateFisherExactTest(cohort1Data.descriptive.sex.m, cohort1Data.descriptive.sex.f, cohort2Data.descriptive.sex.m, cohort2Data.descriptive.sex.f),
                nStatus: calculateFisherExactTest(cohort1Data.descriptive.nStatus.plus, cohort1Data.descriptive.nStatus.minus, cohort2Data.descriptive.nStatus.plus, cohort2Data.descriptive.nStatus.minus)
            };
            results.interCohortDemographicComparison = demoComp;
            
            const c1pAS = cohort1Data.performanceAS;
            const c2pAS = cohort2Data.performanceAS;
            const c1pT2 = cohort1Data.performanceT2Applied;
            const c2pT2 = cohort2Data.performanceT2Applied;

            const interComp = {
                as: _calculateIndependentAucComparison(c1pAS.auc.value, c1pAS.auc.se, c1pAS.matrix.tp + c1pAS.matrix.fp + c1pAS.matrix.fn + c1pAS.matrix.tn, c2pAS.auc.value, c2pAS.auc.se, c2pAS.matrix.tp + c2pAS.matrix.fp + c2pAS.matrix.fn + c2pAS.matrix.tn),
                t2Applied: _calculateIndependentAucComparison(c1pT2.auc.value, c1pT2.auc.se, c1pT2.matrix.tp + c1pT2.matrix.fp + c1pT2.matrix.fn + c1pT2.matrix.tn, c2pT2.auc.value, c2pT2.auc.se, c2pT2.matrix.tp + c2pT2.matrix.fp + c2pT2.matrix.fn + c2pT2.matrix.tn)
            };
            results.interCohortComparison = interComp;
        }

        return results;
    }

    function calculateDiagnosticPerformance(data, predictionKey, referenceKey) {
        if (!Array.isArray(data) || data.length === 0) return null;
        const matrix = calculateConfusionMatrix(data, predictionKey, referenceKey);
        const { tp, fp, fn, tn } = matrix;
        const total = tp + fp + fn + tn;
        const nullMetric = { value: NaN, ci: null, method: null, se: NaN };
        if (total === 0) return { matrix, sens: nullMetric, spec: nullMetric, ppv: nullMetric, npv: nullMetric, acc: nullMetric, auc: nullMetric, f1: nullMetric, youden: nullMetric };

        const sens_val = (tp + fn) > 0 ? tp / (tp + fn) : NaN;
        const spec_val = (fp + tn) > 0 ? tn / (fp + tn) : NaN;
        const ppv_val = (tp + fp) > 0 ? tp / (tp + fp) : NaN;
        const npv_val = (fn + tn) > 0 ? tn / (fn + tn) : NaN;
        const acc_val = total > 0 ? (tp + tn) / total : NaN;
        const auc_val = (!isNaN(sens_val) && !isNaN(spec_val)) ? (sens_val + spec_val) / 2.0 : NaN;
        const f1_val = (!isNaN(ppv_val) && !isNaN(sens_val) && (ppv_val + sens_val) > 0) ? 2 * (ppv_val * sens_val) / (ppv_val + sens_val) : NaN;
        const youden_val = (!isNaN(sens_val) && !isNaN(spec_val)) ? (sens_val + spec_val - 1) : NaN;

        const bootstrapFactory = (pKey, rKey, metric) => (sample) => {
            const m = calculateConfusionMatrix(sample, pKey, rKey);
            const s = (m.tp + m.fn) > 0 ? m.tp / (m.tp + m.fn) : NaN;
            const sp = (m.fp + m.tn) > 0 ? m.tn / (m.fp + m.tn) : NaN;
            const p = (m.tp + m.fp) > 0 ? m.tp / (m.tp + m.fp) : NaN;

            switch (metric) {
                case 'f1': return (isNaN(p) || isNaN(s) || (p + s) <= 0) ? NaN : 2 * (p * s) / (p + s);
                case 'auc': return (isNaN(s) || isNaN(sp)) ? NaN : (s + sp) / 2.0;
                case 'youden': return (isNaN(s) || isNaN(sp)) ? NaN : (s + sp - 1);
                default: return NaN;
            }
        };

        const createBootstrapResult = (metric) => {
            const bsResult = bootstrapCI(data, bootstrapFactory(predictionKey, referenceKey, metric));
            return {
                ci: { lower: bsResult.lower, upper: bsResult.upper },
                method: bsResult.method,
                se: bsResult.se
            };
        };

        return {
            matrix,
            sens: { value: sens_val, ci: calculateWilsonScoreCI(tp, tp + fn), n_success: tp, n_trials: tp + fn, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            spec: { value: spec_val, ci: calculateWilsonScoreCI(tn, fp + tn), n_success: tn, n_trials: fp + tn, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            ppv: { value: ppv_val, ci: calculateWilsonScoreCI(tp, tp + fp), n_success: tp, n_trials: tp + fp, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            npv: { value: npv_val, ci: calculateWilsonScoreCI(tn, fn + tn), n_success: tn, n_trials: fn + tn, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            acc: { value: acc_val, ci: calculateWilsonScoreCI(tp + tn, total), n_success: tp + tn, n_trials: total, method: window.APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION },
            auc: { value: auc_val, ...createBootstrapResult('auc'), matrix_components: {tp, fp, fn, tn, total} },
            f1: { value: f1_val, ...createBootstrapResult('f1'), matrix_components: {tp, fp, fn, tn, total} },
            youden: { value: youden_val, ...createBootstrapResult('youden'), matrix_components: {tp, fp, fn, tn, total} }
        };
    }

    function calculateConfusionMatrix(data, predictionKey, referenceKey) {
        let tp = 0, fp = 0, fn = 0, tn = 0;
        if (!Array.isArray(data)) return { tp, fp, fn, tn };
        data.forEach(p => {
            if (p && (p[predictionKey] === '+' || p[predictionKey] === '-') && (p[referenceKey] === '+' || p[referenceKey] === '-')) {
                const predicted = p[predictionKey] === '+';
                const actual = p[referenceKey] === '+';
                if (predicted && actual) tp++;
                else if (predicted && !actual) fp++;
                else if (!predicted && actual) fn++;
                else if (!predicted && !actual) tn++;
            }
        });
        return { tp, fp, fn, tn };
    }

    function calculateAddedValue(data) {
        if (!Array.isArray(data) || data.length === 0) return null;
        const t2FalsePositives = data.filter(p => p.t2Status === '+' && p.nStatus === '-');
        const t2FalseNegatives = data.filter(p => p.t2Status === '-' && p.nStatus === '+');
        return {
            t2FalsePositives: {
                count: t2FalsePositives.length,
                performanceAS: calculateDiagnosticPerformance(t2FalsePositives, 'asStatus', 'nStatus')
            },
            t2FalseNegatives: {
                count: t2FalseNegatives.length,
                performanceAS: calculateDiagnosticPerformance(t2FalseNegatives, 'asStatus', 'nStatus')
            }
        };
    }

    return Object.freeze({
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateDescriptiveStats,
        calculateAllPublicationStats,
        calculateMcNemarTest,
        calculateDeLongTest,
        calculateWilsonScoreCI,
        calculateFisherExactTest,
        calculateAddedValue,
        calculatePostHocPower,
        calculateRequiredSampleSize,
        calculateAssociationStats,
        calculateAggregateNodeCounts,
        performStratifiedKFoldCV,
        identifyFalseNegatives,
        identifyDiscordantCases
    });

})();