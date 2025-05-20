const statisticsService = (() => {

    function getMedian(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return NaN;
        const sortedArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x)).sort((a, b) => a - b);
        if (sortedArr.length === 0) return NaN;
        const midIndex = Math.floor(sortedArr.length / 2);
        if (sortedArr.length % 2 !== 0) {
            return sortedArr[midIndex];
        } else {
            return midIndex > 0 ? (sortedArr[midIndex - 1] + sortedArr[midIndex]) / 2 : sortedArr[midIndex];
        }
    }

    function getMean(arr) {
        if (!Array.isArray(arr) || arr.length === 0) return NaN;
        const numericArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        if (numericArr.length === 0) return NaN;
        const sum = numericArr.reduce((acc, val) => acc + val, 0);
        return sum / numericArr.length;
    }

    function getStdDev(arr) {
        if (!Array.isArray(arr)) return NaN;
        const numericArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        if (numericArr.length < 2) return NaN;
        const mean = getMean(numericArr);
        if (isNaN(mean)) return NaN;
        const variance = numericArr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (numericArr.length - 1);
        return variance >= 0 ? Math.sqrt(variance) : NaN;
    }

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
        if (isNaN(x) || isNaN(mean) || isNaN(stdDev) || stdDev < 0) return NaN;
        if (stdDev === 0) return x < mean ? 0.0 : 1.0;
        const z = (x - mean) / (stdDev * Math.sqrt(2));
        const result = 0.5 * (1 + erf(z));
        return Math.max(0.0, Math.min(1.0, result));
    }

    function inverseNormalCDF(p, mean = 0, stdDev = 1) {
        if (isNaN(p) || isNaN(mean) || isNaN(stdDev) || p < 0 || p > 1 || stdDev < 0) return NaN;
        if (p === 0) return -Infinity; if (p === 1) return Infinity; if (stdDev === 0) return mean; if (p === 0.5) return mean;
        const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
        const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
        const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
        const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
        const p_low = 0.02425, p_high = 1 - p_low;
        let q, r, x;
        if (p < p_low) {
            q = Math.sqrt(-2 * Math.log(p));
            x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        } else if (p <= p_high) {
            q = p - 0.5; r = q * q;
            x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
        } else {
            q = Math.sqrt(-2 * Math.log(1 - p));
            x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        }
        const result = mean + stdDev * x;
        return isFinite(result) ? result : NaN;
    }

    const LOG_GAMMA_CACHE = {};
    function logGamma(xx) {
        if (xx === null || xx === undefined || isNaN(xx) || xx <= 0) return NaN;
        if (LOG_GAMMA_CACHE[xx]) return LOG_GAMMA_CACHE[xx];
        const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
        let x = xx, y = x, tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j <= 5; j++) ser += cof[j] / ++y;
        const result = -tmp + Math.log(2.5066282746310005 * ser / x);
        if (!isFinite(result)) return NaN;
        LOG_GAMMA_CACHE[xx] = result;
        return result;
    }

    function logFactorial(n) {
        if (n === null || n === undefined || isNaN(n) || n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 0;
        return logGamma(n + 1);
    }

    function regularizedGammaIncomplete(a, x) {
        if (isNaN(a) || isNaN(x) || a <= 0 || x < 0) return NaN;
        if (x === 0) return 0.0;
        const logGammaA = logGamma(a);
        if (isNaN(logGammaA)) return NaN;
        const maxIterations = 200, epsilon = 1e-15;
        if (x < a + 1.0) {
            let sum = 1.0 / a, term = sum;
            for (let k = 1; k <= maxIterations; k++) {
                term *= x / (a + k); sum += term;
                if (Math.abs(term) < Math.abs(sum) * epsilon) break;
            }
            return Math.max(0.0, Math.min(1.0, sum * Math.exp(a * Math.log(x) - x - logGammaA)));
        } else {
            let b = x + 1.0 - a, c = 1.0 / epsilon, d = 1.0 / b, h = d, an, del;
            for (let k = 1; k <= maxIterations; k++) {
                an = -k * (k - a); b += 2.0; d = an * d + b;
                if (Math.abs(d) < epsilon) d = epsilon;
                c = b + an / c; if (Math.abs(c) < epsilon) c = epsilon;
                d = 1.0 / d; del = d * c; h *= del;
                if (Math.abs(del - 1.0) < epsilon) break;
            }
            return Math.max(0.0, Math.min(1.0, 1.0 - (Math.exp(a * Math.log(x) - x - logGammaA) * h)));
        }
    }

    function chiSquareCDF(x, df) {
        if (isNaN(x) || isNaN(df) || x < 0 || df <= 0) return NaN;
        return x === 0 ? 0.0 : regularizedGammaIncomplete(df / 2.0, x / 2.0);
    }

    function calculateWilsonScoreCI(successes, trials, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        if (isNaN(successes) || isNaN(trials) || isNaN(alpha) || trials <= 0 || successes < 0 || successes > trials || alpha <= 0 || alpha >= 1) return defaultReturn;
        const p_hat = successes / trials, n = trials;
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        if (!isFinite(z)) return defaultReturn;
        const z2 = z * z;
        const centerTerm = p_hat + z2 / (2.0 * n);
        const variabilityTerm = z * Math.sqrt((p_hat * (1.0 - p_hat) / n) + (z2 / (4.0 * n * n)));
        const denominator = 1.0 + z2 / n;
        if (denominator === 0) return defaultReturn;
        const lower = (centerTerm - variabilityTerm) / denominator;
        const upper = (centerTerm + variabilityTerm) / denominator;
        return { lower: Math.max(0.0, lower), upper: Math.min(1.0, upper), method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
    }

    function calculateORCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Woolf Logit (Adjusted)' };
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;
        const or_raw = (b === 0 || c === 0) ? ((a > 0 && d > 0) ? Infinity : NaN) : (a * d) / (b * c);
        const a_adj = a + 0.5, b_adj = b + 0.5, c_adj = c + 0.5, d_adj = d + 0.5;
        const or_adj = (a_adj * d_adj) / (b_adj * c_adj);
        if (or_adj <= 0 || !isFinite(or_adj)) return { ...defaultReturn, value: or_raw };
        const logOR = Math.log(or_adj);
        const seLogOR = Math.sqrt(1.0 / a_adj + 1.0 / b_adj + 1.0 / c_adj + 1.0 / d_adj);
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        if (!isFinite(z) || isNaN(seLogOR) || seLogOR <= 0 || !isFinite(seLogOR)) return { ...defaultReturn, value: or_raw };
        const lowerCI = Math.exp(logOR - z * seLogOR);
        const upperCI = Math.exp(logOR + z * seLogOR);
        if (!isFinite(lowerCI) || !isFinite(upperCI)) return { ...defaultReturn, value: or_raw };
        return { value: or_raw, ci: { lower: lowerCI, upper: upperCI }, method: 'Woolf Logit (Adjusted)' };
    }

    function calculateRDCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Wald' };
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;
        const n1 = a + b, n2 = c + d;
        if (n1 === 0 || n2 === 0) return defaultReturn;
        const p1 = a / n1, p2 = c / n2; const rd = p1 - p2;
        const varP1 = (p1 * (1.0 - p1)) / n1, varP2 = (p2 * (1.0 - p2)) / n2;
        if (isNaN(varP1) || isNaN(varP2) || varP1 < 0 || varP2 < 0) return { ...defaultReturn, value: rd };
        const seRD = Math.sqrt(varP1 + varP2);
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        if (!isFinite(z) || isNaN(seRD) || seRD <= 0 || !isFinite(seRD)) return { ...defaultReturn, value: rd };
        const lower = rd - z * seRD, upper = rd + z * seRD;
        return { value: rd, ci: { lower: Math.max(-1.0, lower), upper: Math.min(1.0, upper) }, method: 'Wald' };
    }

    function bootstrapCI(data, statisticFn, nBoot = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        if (!Array.isArray(data) || data.length < 2 || typeof statisticFn !== 'function' || isNaN(nBoot) || nBoot <= 0 || isNaN(alpha) || alpha <= 0 || alpha >= 1) return defaultReturn;
        const n = data.length;
        const bootStats = []; let sum = 0, sumSq = 0, validCount = 0;
        for (let i = 0; i < nBoot; i++) {
            const bootSample = new Array(n);
            for (let j = 0; j < n; j++) bootSample[j] = data[Math.floor(Math.random() * n)];
            try {
                 const stat = statisticFn(bootSample);
                 if (stat !== null && stat !== undefined && isFinite(stat) && !isNaN(stat)) {
                    bootStats.push(stat); sum += stat; sumSq += stat * stat; validCount++;
                 }
            } catch (e) { console.warn("Bootstrap-Iteration fehlgeschlagen:", e); }
        }
        if (validCount < Math.max(10, nBoot * 0.1)) return defaultReturn;
        bootStats.sort((a, b) => a - b);
        const lowerIndex = Math.max(0, Math.min(validCount - 1, Math.floor(validCount * (alpha / 2.0))));
        const upperIndex = Math.max(0, Math.min(validCount - 1, Math.ceil(validCount * (1.0 - alpha / 2.0)) - 1));
        if (lowerIndex > upperIndex || lowerIndex < 0 || upperIndex >= validCount) return defaultReturn;
        const meanStat = sum / validCount;
        const variance = (validCount > 1) ? (sumSq / validCount) - (meanStat * meanStat) : NaN;
        const se = (variance > 0 && !isNaN(variance)) ? Math.sqrt(variance) : NaN;
        return { lower: bootStats[lowerIndex], upper: bootStats[upperIndex], method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: se };
    }

    function manualMcNemarTest(b, c) {
        if (isNaN(b) || isNaN(c) || b < 0 || c < 0) return { pValue: NaN, statistic: NaN, df: 1, method: "McNemar's Test (Invalid Input)" };
        const n = b + c; if (n === 0) return { pValue: 1.0, statistic: 0, df: 1, method: "McNemar's Test (No Discordance)" };
        const diff = Math.abs(b - c), continuityCorrection = (n < 25) ? 1 : 0;
        let statistic = Math.pow(diff - continuityCorrection, 2) / n;
        if (isNaN(statistic) || !isFinite(statistic)) statistic = 0;
        const pValue = 1.0 - chiSquareCDF(statistic, 1);
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), statistic: statistic, df: 1, method: `McNemar's Test${continuityCorrection > 0 ? ' (continuity corrected)' : ''}` };
    }

    function logProbHypergeometric(k, N_pop, K_success, n_draw) {
        if (k < 0 || n_draw < 0 || K_success < 0 || N_pop < 0 || k > n_draw || k > K_success || n_draw - k > N_pop - K_success || n_draw > N_pop) return -Infinity;
        try {
            const logC_K_k = logFactorial(K_success) - logFactorial(k) - logFactorial(K_success - k);
            const logC_NK_nk = logFactorial(N_pop - K_success) - logFactorial(n_draw - k) - logFactorial((N_pop - K_success) - (n_draw - k));
            const logC_N_n = logFactorial(N_pop) - logFactorial(n_draw) - logFactorial(N_pop - n_draw);
            if (isNaN(logC_K_k) || isNaN(logC_NK_nk) || isNaN(logC_N_n)) return -Infinity;
            const result = logC_K_k + logC_NK_nk - logC_N_n;
            return isFinite(result) ? result : -Infinity;
        } catch (e) { return -Infinity; }
    }

    function manualFisherExactTest(a, b, c, d) {
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return { pValue: NaN, method: "Fisher's Exact Test (Invalid Input)" };
        const n1 = a + b, k1 = a + c, N = a + b + c + d;
        if (N === 0) return { pValue: 1.0, method: "Fisher's Exact Test (No Data)" };
        const pObservedLog = logProbHypergeometric(a, N, k1, n1);
        if (!isFinite(pObservedLog)) return { pValue: NaN, method: "Fisher's Exact Test (Numerical Issue)" };
        let pValue = 0.0; const minVal = Math.max(0, k1 - (N - n1)), maxVal = Math.min(k1, n1); const tolerance = 1e-9;
        for (let i = minVal; i <= maxVal; i++) {
            const pCurrentLog = logProbHypergeometric(i, N, k1, n1);
            if (isFinite(pCurrentLog) && pCurrentLog <= pObservedLog + tolerance) pValue += Math.exp(pCurrentLog);
        }
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), method: "Fisher's Exact Test" };
    }

    function rankData(arr) {
        const sorted = arr.map((value, index) => ({ value: parseFloat(value), originalIndex: index })).filter(item => !isNaN(item.value) && isFinite(item.value)).sort((a, b) => a.value - b.value);
        const ranks = new Array(arr.length).fill(NaN); if(sorted.length === 0) return ranks; let i = 0;
        while (i < sorted.length) {
            let j = i; while (j < sorted.length - 1 && sorted[j].value === sorted[j+1].value) j++;
            const averageRank = (i + 1 + j + 1) / 2.0;
            for (let k = i; k <= j; k++) ranks[sorted[k].originalIndex] = averageRank;
            i = j + 1;
        } return ranks;
    }

    function manualMannWhitneyUTest(sample1, sample2) {
        const defaultReturn = { pValue: NaN, U: NaN, Z: NaN, testName: "Mann-Whitney U (Invalid Input)" };
        if (!Array.isArray(sample1) || !Array.isArray(sample2)) return defaultReturn;
        const filteredSample1 = sample1.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        const filteredSample2 = sample2.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        const n1 = filteredSample1.length, n2 = filteredSample2.length;
        if (n1 === 0 || n2 === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No Data in one/both samples)" };
        const combined = [...filteredSample1, ...filteredSample2]; const ranks = rankData(combined);
        const ranks1 = ranks.slice(0, n1).filter(r => !isNaN(r)); if(ranks1.length === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No valid ranks in sample 1)" };
        const R1 = ranks1.reduce((sum, r) => sum + r, 0); const U1 = n1 * n2 + (n1 * (n1 + 1)) / 2.0 - R1; const U = Math.min(U1, n1 * n2 - U1);
        const meanU = (n1 * n2) / 2.0; const N = n1 + n2; const tieGroups = {}; const validRanks = ranks.filter(r => !isNaN(r)); validRanks.forEach(r => { tieGroups[r] = (tieGroups[r] || 0) + 1; });
        const tieCorrectionFactor = Object.values(tieGroups).reduce((sum, t) => t > 1 ? sum + (t * t * t - t) : sum, 0);
        const varU_numerator = n1 * n2 * ((N * N * N - N) - tieCorrectionFactor); const varU_denominator = 12.0 * N * (N - 1);
        if (varU_denominator <= 0 || N <= 1) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (No Variance)" };
        const varU = varU_numerator / varU_denominator; if (varU < 0 || isNaN(varU)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Variance Error)" };
        if (varU === 0) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (Zero Variance)" };
        const stdDevU = Math.sqrt(varU); const correction = (U < meanU) ? 0.5 : (U > meanU) ? -0.5 : 0;
        const z = (U - meanU + correction) / stdDevU; if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Z Calculation Error)" };
        const pValue = 2.0 * normalCDF(-Math.abs(z));
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), U: U, Z: z, testName: "Mann-Whitney U (Normal Approx.)" };
    }

    function manualDeLongTest(data, key1, key2, referenceKey) {
        const defaultReturn = { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Invalid Input)" };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return defaultReturn;
        const positives = data.filter(p => p && p[referenceKey] === '+'); const negatives = data.filter(p => p && p[referenceKey] === '-');
        const n_pos = positives.length, n_neg = negatives.length; if (n_pos === 0 || n_neg === 0) return { ...defaultReturn, method: "DeLong Test (No positive or negative cases)" };

        const getAUCAndComponents = (testKey) => {
            let structuralPairs = 0; const V10 = new Array(n_pos).fill(0); const V01 = new Array(n_neg).fill(0);
            for (let i = 0; i < n_pos; i++) { for (let j = 0; j < n_neg; j++) {
                const val_pos = (positives[i]?.[testKey] === '+') ? 1.0 : (positives[i]?.[testKey] === '-') ? 0.0 : NaN;
                const val_neg = (negatives[j]?.[testKey] === '+') ? 1.0 : (negatives[j]?.[testKey] === '-') ? 0.0 : NaN;
                if (isNaN(val_pos) || isNaN(val_neg)) continue;
                let score = (val_pos > val_neg) ? 1.0 : (val_pos === val_neg) ? 0.5 : 0.0;
                structuralPairs += score; V10[i] += score; V01[j] += score; } }
            const auc = (n_pos > 0 && n_neg > 0) ? structuralPairs / (n_pos * n_neg) : NaN; if (isNaN(auc)) return null;
            V10.forEach((_, i) => V10[i] = (n_neg > 0) ? V10[i] / n_neg : NaN); V01.forEach((_, j) => V01[j] = (n_pos > 0) ? V01[j] / n_pos : NaN);
            return { auc, V10, V01 };
        };

        try {
            const components1 = getAUCAndComponents(key1); const components2 = getAUCAndComponents(key2);
            if (!components1 || !components2) return { ...defaultReturn, method: "DeLong Test (AUC Calculation Failed)" };
            const { auc: auc1, V10: V10_1, V01: V01_1 } = components1; const { auc: auc2, V10: V10_2, V01: V01_2 } = components2;
            if (isNaN(auc1) || isNaN(auc2)) return { ...defaultReturn, method: "DeLong Test (Invalid AUCs)" };
            const calculateVariance = (V, mean, n) => { if (n <= 1) return NaN; let sumSqDiff = 0, validCount = 0; for (let i = 0; i < V.length; i++) { if(!isNaN(V[i])) { sumSqDiff += Math.pow(V[i] - mean, 2); validCount++; } } return validCount > 1 ? sumSqDiff / (validCount - 1) : NaN; };
            const S10_1 = calculateVariance(V10_1, auc1, n_pos), S01_1 = calculateVariance(V01_1, auc1, n_neg), S10_2 = calculateVariance(V10_2, auc2, n_pos), S01_2 = calculateVariance(V01_2, auc2, n_neg);
            const calculateCovariance = (V_X, V_Y, meanX, meanY, n) =
