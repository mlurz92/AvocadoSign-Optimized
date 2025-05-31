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
        if (numericArr.length < 2) return NaN; // SD ist nicht definiert für weniger als 2 Werte
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
        if (stdDev === 0) return x < mean ? 0.0 : (x === mean ? 0.5 : 1.0) ;
        const z = (x - mean) / (stdDev * Math.sqrt(2));
        const result = 0.5 * (1 + erf(z));
        return Math.max(0.0, Math.min(1.0, result));
    }

    function inverseNormalCDF(p, mean = 0, stdDev = 1) {
        if (isNaN(p) || isNaN(mean) || isNaN(stdDev) || p < 0 || p > 1 || stdDev < 0) return NaN;
        if (p === 0) return -Infinity; if (p === 1) return Infinity; if (stdDev === 0) return mean; if (p === 0.5) return mean;

        const p_low = 0.02425;
        const p_high = 1 - p_low;
        let q, r, x;

        if (p < p_low) {
            q = Math.sqrt(-2 * Math.log(p));
            x = ((((( -0.000007784894002430293 * q - 0.0003223964580411365 ) * q - 0.02400758277161838 ) * q - 0.002549732539343734 ) * q + 0.4374664141464968 ) * q + 0.2938163982698783 ) /
                (((( 0.000007784695709041462 * q + 0.0003224671290700398 ) * q + 0.02445134137142996 ) * q + 0.003754408661907416 ) * q + 1.0);
        } else if (p <= p_high) {
            q = p - 0.5;
            r = q * q;
            x = ((((( -3.969683028665376e+01 * r + 2.209460984245205e+02 ) * r - 2.759285104469687e+02 ) * r + 1.383577518672690e+02 ) * r - 3.066479806614716e+01 ) * r + 2.506628277459239e+00 ) * q /
                ((((( -5.447609879822406e+01 * r + 1.615858368580409e+02 ) * r - 1.556989798598866e+02 ) * r + 6.680131188771972e+01 ) * r - 1.328068155288572e+01 ) * r + 1.0);
        } else {
            q = Math.sqrt(-2 * Math.log(1 - p));
            x = -((((( -0.000007784894002430293 * q - 0.0003223964580411365 ) * q - 0.02400758277161838 ) * q - 0.002549732539343734 ) * q + 0.4374664141464968 ) * q + 0.2938163982698783 ) /
                 (((( 0.000007784695709041462 * q + 0.0003224671290700398 ) * q + 0.02445134137142996 ) * q + 0.003754408661907416 ) * q + 1.0);
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
        if (Object.keys(LOG_GAMMA_CACHE).length < 1000) { // Cache-Größe limitieren
             LOG_GAMMA_CACHE[xx] = result;
        }
        return result;
    }

    function logFactorial(n) {
        if (n === null || n === undefined || isNaN(n) || n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 0;
        return logGamma(n + 1);
    }

    function regularizedGammaIncomplete(a, x) { // P(a,x) - Lower regularized incomplete gamma function
        if (isNaN(a) || isNaN(x) || a <= 0 || x < 0) return NaN;
        if (x === 0) return 0.0;
        const logGammaA = logGamma(a);
        if (isNaN(logGammaA)) return NaN;

        const maxIterations = 200, epsilon = 1e-15;

        if (x < a + 1.0) { // Series expansion for small x
            let sum = 1.0 / a, term = sum;
            for (let k = 1; k <= maxIterations; k++) {
                term *= x / (a + k);
                sum += term;
                if (Math.abs(term) < Math.abs(sum) * epsilon) break;
            }
            return Math.max(0.0, Math.min(1.0, sum * Math.exp(a * Math.log(x) - x - logGammaA)));
        } else { // Continued fraction for large x
            let b = x + 1.0 - a, c = 1.0 / epsilon, d = 1.0 / b, h = d, an, del;
            for (let k = 1; k <= maxIterations; k++) {
                an = -k * (k - a);
                b += 2.0;
                d = an * d + b;
                if (Math.abs(d) < epsilon) d = epsilon;
                c = b + an / c;
                if (Math.abs(c) < epsilon) c = epsilon;
                d = 1.0 / d;
                del = d * c;
                h *= del;
                if (Math.abs(del - 1.0) < epsilon) break;
            }
            return Math.max(0.0, Math.min(1.0, 1.0 - (Math.exp(a * Math.log(x) - x - logGammaA) * h)));
        }
    }

    function chiSquareCDF(x, df) {
        if (isNaN(x) || isNaN(df) || x < 0 || df <= 0) return NaN;
        if (df === 0) return x > 0 ? 1.0 : 0.0; // Pathological case
        return x === 0 ? 0.0 : regularizedGammaIncomplete(df / 2.0, x / 2.0);
    }

    function calculateWilsonScoreCI(successes, trials, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        if (isNaN(successes) || isNaN(trials) || isNaN(alpha) || trials <= 0 || successes < 0 || successes > trials || alpha <= 0 || alpha >= 1) return defaultReturn;

        const p_hat = successes / trials;
        const n = trials;
        const z = Math.abs(inverseNormalCDF(alpha / 2.0)); // z_{alpha/2}
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
        const defaultReturn = { value: NaN, ci: null, method: 'Woolf Logit (Haldane-Anscombe correction)' };
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;

        const or_raw = (b === 0 || c === 0) ? ((a > 0 && d > 0 && b === 0 && c === 0) ? NaN : (a > 0 && d > 0) ? Infinity : NaN ) : (a * d) / (b * c);

        const a_adj = a + 0.5;
        const b_adj = b + 0.5;
        const c_adj = c + 0.5;
        const d_adj = d + 0.5;

        const or_adj = (a_adj * d_adj) / (b_adj * c_adj);
        if (or_adj <= 0 || !isFinite(or_adj)) return { ...defaultReturn, value: or_raw };

        const logOR = Math.log(or_adj);
        const seLogOR = Math.sqrt(1.0 / a_adj + 1.0 / b_adj + 1.0 / c_adj + 1.0 / d_adj);
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));

        if (!isFinite(z) || isNaN(seLogOR) || seLogOR <= 0 || !isFinite(seLogOR)) return { ...defaultReturn, value: or_raw };

        const lowerCI = Math.exp(logOR - z * seLogOR);
        const upperCI = Math.exp(logOR + z * seLogOR);

        if (!isFinite(lowerCI) || !isFinite(upperCI)) return { ...defaultReturn, value: or_raw };

        return { value: or_raw, ci: { lower: lowerCI, upper: upperCI }, method: 'Woolf Logit (Haldane-Anscombe correction)' };
    }

    function calculateRDCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Wald' };
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;

        const n1 = a + b;
        const n2 = c + d;
        if (n1 === 0 || n2 === 0) return defaultReturn;

        const p1 = a / n1;
        const p2 = c / n2;
        const rd = p1 - p2;

        const varP1 = (p1 * (1.0 - p1)) / n1;
        const varP2 = (p2 * (1.0 - p2)) / n2;
        if (isNaN(varP1) || isNaN(varP2) || varP1 < 0 || varP2 < 0) return { ...defaultReturn, value: rd };

        const seRD = Math.sqrt(varP1 + varP2);
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));

        if (!isFinite(z) || isNaN(seRD) || seRD <= 0 || !isFinite(seRD)) return { ...defaultReturn, value: rd };

        const lower = rd - z * seRD;
        const upper = rd + z * seRD;
        return { value: rd, ci: { lower: Math.max(-1.0, lower), upper: Math.min(1.0, upper) }, method: 'Wald' };
    }

    function bootstrapCI(data, statisticFn, nBoot = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        if (!Array.isArray(data) || data.length < 2 || typeof statisticFn !== 'function' || isNaN(nBoot) || nBoot <= 0 || isNaN(alpha) || alpha <= 0 || alpha >= 1) {
            return defaultReturn;
        }

        const n = data.length;
        const bootStats = [];
        let sum = 0, sumSq = 0, validCount = 0;

        for (let i = 0; i < nBoot; i++) {
            const bootSample = new Array(n);
            for (let j = 0; j < n; j++) {
                bootSample[j] = data[Math.floor(Math.random() * n)];
            }
            try {
                 const stat = statisticFn(bootSample);
                 if (stat !== null && stat !== undefined && isFinite(stat) && !isNaN(stat)) {
                    bootStats.push(stat);
                    sum += stat;
                    sumSq += stat * stat;
                    validCount++;
                 }
            } catch (e) {
                console.warn("Bootstrap-Iteration fehlgeschlagen:", e);
            }
        }

        if (validCount < Math.max(10, nBoot * 0.1)) { // Erfordert eine minimale Anzahl valider Bootstrap-Samples
            return defaultReturn;
        }

        bootStats.sort((a, b) => a - b);

        const lowerIndex = Math.max(0, Math.min(validCount - 1, Math.floor(validCount * (alpha / 2.0))));
        const upperIndex = Math.max(0, Math.min(validCount - 1, Math.ceil(validCount * (1.0 - alpha / 2.0)) -1)); // -1 for 0-based index

        if (lowerIndex > upperIndex || lowerIndex < 0 || upperIndex >= validCount ) {
            return defaultReturn;
        }
        
        const meanStat = sum / validCount;
        const variance = (validCount > 1) ? (sumSq - (sum * sum / validCount)) / (validCount -1) : NaN;
        const se = (variance > 0 && !isNaN(variance)) ? Math.sqrt(variance) : NaN;


        return { lower: bootStats[lowerIndex], upper: bootStats[upperIndex], method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: se };
    }

    function manualMcNemarTest(b, c) { // b = method1+/method2-, c = method1-/method2+
        if (isNaN(b) || isNaN(c) || b < 0 || c < 0) return { pValue: NaN, statistic: NaN, df: 1, method: "McNemar's Test (Invalid Input)" };
        const n = b + c;
        if (n === 0) return { pValue: 1.0, statistic: 0, df: 1, method: "McNemar's Test (No Discordance)" };

        // Continuity correction for small n (Yates' correction)
        const continuityCorrection = (n < APP_CONFIG.STATISTICAL_CONSTANTS.FISHER_EXACT_THRESHOLD * 4) ? 1 : 0; // Heuristic, e.g. if n < 20
        let statistic = Math.pow(Math.abs(b - c) - continuityCorrection, 2) / n;
        if (isNaN(statistic) || !isFinite(statistic)) statistic = 0; // Handle cases where n might be zero if b+c=0, though checked above

        const pValue = 1.0 - chiSquareCDF(statistic, 1);
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), statistic: statistic, df: 1, method: `McNemar's Test${continuityCorrection > 0 ? " (Yates' continuity corrected)" : ''}` };
    }

    function logProbHypergeometric(k_observed, N_population, K_successes_in_pop, n_drawn) {
        if (k_observed < 0 || n_drawn < 0 || K_successes_in_pop < 0 || N_population < 0 ||
            k_observed > n_drawn || k_observed > K_successes_in_pop || (n_drawn - k_observed) > (N_population - K_successes_in_pop) || n_drawn > N_population) {
            return -Infinity; // Invalid parameters
        }
        try {
            const logC_K_k = logFactorial(K_successes_in_pop) - logFactorial(k_observed) - logFactorial(K_successes_in_pop - k_observed);
            const logC_NK_nk = logFactorial(N_population - K_successes_in_pop) - logFactorial(n_drawn - k_observed) - logFactorial((N_population - K_successes_in_pop) - (n_drawn - k_observed));
            const logC_N_n = logFactorial(N_population) - logFactorial(n_drawn) - logFactorial(N_population - n_drawn);
            if (isNaN(logC_K_k) || isNaN(logC_NK_nk) || isNaN(logC_N_n)) return -Infinity;
            const result = logC_K_k + logC_NK_nk - logC_N_n;
            return isFinite(result) ? result : -Infinity;
        } catch (e) {
            return -Infinity;
        }
    }

    function manualFisherExactTest(a, b, c, d) { // Contingency table: [[a, b], [c, d]]
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return { pValue: NaN, method: "Fisher's Exact Test (Invalid Input)" };

        const N = a + b + c + d;
        if (N === 0) return { pValue: 1.0, method: "Fisher's Exact Test (No Data)" };

        const row1Sum = a + b;
        const col1Sum = a + c;

        const pObservedLog = logProbHypergeometric(a, N, col1Sum, row1Sum);
        if (!isFinite(pObservedLog)) return { pValue: NaN, method: "Fisher's Exact Test (Numerical Issue with Observed Prob)" };

        let pValue = 0.0;
        const minVal = Math.max(0, row1Sum + col1Sum - N);
        const maxVal = Math.min(row1Sum, col1Sum);
        const tolerance = 1e-9; // Tolerance for comparing log-probabilities

        for (let i = minVal; i <= maxVal; i++) {
            const pCurrentLog = logProbHypergeometric(i, N, col1Sum, row1Sum);
            if (isFinite(pCurrentLog) && pCurrentLog <= pObservedLog + tolerance) {
                pValue += Math.exp(pCurrentLog);
            }
        }
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), method: "Fisher's Exact Test" };
    }

    function rankData(arr) {
        const sorted = arr
            .map((value, index) => ({ value: parseFloat(value), originalIndex: index }))
            .filter(item => !isNaN(item.value) && isFinite(item.value))
            .sort((a, b) => a.value - b.value);

        const ranks = new Array(arr.length).fill(NaN);
        if(sorted.length === 0) return ranks;

        let i = 0;
        while (i < sorted.length) {
            let j = i;
            while (j < sorted.length - 1 && sorted[j].value === sorted[j+1].value) {
                j++;
            }
            const averageRank = (i + 1 + j + 1) / 2.0; // Ranks are 1-based
            for (let k = i; k <= j; k++) {
                ranks[sorted[k].originalIndex] = averageRank;
            }
            i = j + 1;
        }
        return ranks;
    }

    function manualMannWhitneyUTest(sample1, sample2) {
        const defaultReturn = { pValue: NaN, U: NaN, Z: NaN, testName: "Mann-Whitney U (Invalid Input)" };
        if (!Array.isArray(sample1) || !Array.isArray(sample2)) return defaultReturn;

        const filteredSample1 = sample1.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        const filteredSample2 = sample2.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        const n1 = filteredSample1.length;
        const n2 = filteredSample2.length;

        if (n1 === 0 || n2 === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No Data in one/both samples)" };

        const combined = [...filteredSample1, ...filteredSample2];
        const ranks = rankData(combined); // rankData should handle potential NaNs from original array if any values were not numeric

        const ranks1 = ranks.slice(0, n1).filter(r => !isNaN(r)); // Only use ranks corresponding to original sample1 values
        if(ranks1.length !== n1 && ranks1.length === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No valid ranks in sample 1)" }; // All values in sample1 were non-numeric

        const R1 = ranks1.reduce((sum, r) => sum + r, 0);
        const U1 = n1 * n2 + (n1 * (n1 + 1)) / 2.0 - R1;
        const U = Math.min(U1, n1 * n2 - U1); // Test statistic U

        const meanU = (n1 * n2) / 2.0;
        const N = n1 + n2;

        // Tie correction for variance
        const tieGroups = {};
        const validRanks = ranks.filter(r => !isNaN(r));
        validRanks.forEach(r => { tieGroups[r] = (tieGroups[r] || 0) + 1; });
        const tieCorrectionFactor = Object.values(tieGroups).reduce((sum, t) => t > 1 ? sum + (t * t * t - t) : sum, 0);

        const varU_numerator = n1 * n2 * ((N * N * N - N) - tieCorrectionFactor);
        const varU_denominator = 12.0 * N * (N - 1);

        if (varU_denominator <= 0 || N <= 1) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (No Variance/Small N)" };
        const varU = varU_numerator / varU_denominator;

        if (varU < 0 || isNaN(varU)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Variance Error)" };
        if (varU === 0) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (Zero Variance)" }; // All values identical

        const stdDevU = Math.sqrt(varU);
        const correction = (U < meanU) ? 0.5 : (U > meanU) ? -0.5 : 0; // Continuity correction
        const z = (U - meanU + correction) / stdDevU;
        if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Z Calculation Error)" };

        const pValue = 2.0 * normalCDF(-Math.abs(z)); // Two-tailed p-value
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), U: U, Z: z, testName: "Mann-Whitney U (Normal Approx. with Tie Correction)" };
    }

    function manualDeLongTest(data, key1, key2, referenceKey) {
        const defaultReturn = { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Invalid Input)" };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return defaultReturn;

        const positives = data.filter(p => p && p[referenceKey] === '+');
        const negatives = data.filter(p => p && p[referenceKey] === '-');
        const n_pos = positives.length, n_neg = negatives.length;

        if (n_pos === 0 || n_neg === 0) return { ...defaultReturn, method: "DeLong Test (No positive or negative cases for reference)" };

        const getAUCAndComponents = (testKey) => {
            let structuralPairs = 0;
            const V10 = new Array(n_pos).fill(0); // Structural components for positive cases
            const V01 = new Array(n_neg).fill(0); // Structural components for negative cases

            for (let i = 0; i < n_pos; i++) {
                for (let j = 0; j < n_neg; j++) {
                    const val_pos = (positives[i]?.[testKey] === '+') ? 1.0 : (positives[i]?.[testKey] === '-') ? 0.0 : 0.5; // Assuming '+' is higher score
                    const val_neg = (negatives[j]?.[testKey] === '+') ? 1.0 : (negatives[j]?.[testKey] === '-') ? 0.0 : 0.5;
                    let score = 0;
                    if (val_pos > val_neg) score = 1.0;
                    else if (val_pos === val_neg) score = 0.5;

                    structuralPairs += score;
                    V10[i] += score;
                    V01[j] += score;
                }
            }
            const auc = (n_pos > 0 && n_neg > 0) ? structuralPairs / (n_pos * n_neg) : NaN;
            if (isNaN(auc)) return null;

            V10.forEach((_, i) => V10[i] = (n_neg > 0) ? V10[i] / n_neg : NaN);
            V01.forEach((_, j) => V01[j] = (n_pos > 0) ? V01[j] / n_pos : NaN);
            return { auc, V10, V01 };
        };

        try {
            const components1 = getAUCAndComponents(key1);
            const components2 = getAUCAndComponents(key2);

            if (!components1 || !components2) return { ...defaultReturn, method: "DeLong Test (AUC Calculation Failed for one/both methods)" };
            const { auc: auc1, V10: V10_1, V01: V01_1 } = components1;
            const { auc: auc2, V10: V10_2, V01: V01_2 } = components2;

            if (isNaN(auc1) || isNaN(auc2)) return { ...defaultReturn, method: "DeLong Test (Invalid AUCs calculated)" };

            const calculateVarianceComponent = (V_arr, mean_auc, n_other_group_size) => {
                if (n_other_group_size === 0 || V_arr.some(isNaN) || V_arr.length < 2) return NaN; // Variance needs at least 2 points
                let sumSqDiff = 0;
                for(let val of V_arr) sumSqDiff += Math.pow(val - mean_auc, 2);
                return sumSqDiff / (V_arr.length -1);
            };
            const S10_1 = calculateVarianceComponent(V10_1, auc1, n_neg);
            const S01_1 = calculateVarianceComponent(V01_1, auc1, n_pos);
            const S10_2 = calculateVarianceComponent(V10_2, auc2, n_neg);
            const S01_2 = calculateVarianceComponent(V01_2, auc2, n_pos);

            const calculateCovarianceComponent = (V_X_arr, V_Y_arr, meanX, meanY, n_other_group_size) => {
                 if (n_other_group_size === 0 || V_X_arr.some(isNaN) || V_Y_arr.some(isNaN) || V_X_arr.length < 2) return NaN;
                 let sumProdDiff = 0;
                 for (let i = 0; i < V_X_arr.length; i++) sumProdDiff += (V_X_arr[i] - meanX) * (V_Y_arr[i] - meanY);
                 return sumProdDiff / (V_X_arr.length - 1);
            };

            const Cov10 = calculateCovarianceComponent(V10_1, V10_2, auc1, auc2, n_neg);
            const Cov01 = calculateCovarianceComponent(V01_1, V01_2, auc1, auc2, n_pos);

            if ([S10_1, S01_1, S10_2, S01_2, Cov10, Cov01].some(isNaN)) {
                return { ...defaultReturn, diffAUC: auc1 - auc2, method: "DeLong Test (Variance/Covariance NaN)" };
            }

            const varDiff = (S10_1 / n_pos) + (S01_1 / n_neg) + (S10_2 / n_pos) + (S01_2 / n_neg) - 2 * ((Cov10 / n_pos) + (Cov01 / n_neg));

            if (isNaN(varDiff) || varDiff <= 1e-12) { // If variance of difference is zero or negative
                const pVal = (Math.abs(auc1 - auc2) < 1e-9) ? 1.0 : NaN; // If AUCs are essentially identical, p=1
                return { pValue: pVal, Z: (pVal === 1.0 ? 0 : NaN), diffAUC: auc1 - auc2, method: "DeLong Test (Near Zero/Zero Variance of Difference)" };
            }
            const seDiff = Math.sqrt(varDiff);
            const z = (auc1 - auc2) / seDiff;
            if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, diffAUC: auc1 - auc2, method: "DeLong Test (Z Calculation Error)" };

            const pValue = 2.0 * normalCDF(-Math.abs(z)); // Two-tailed p-value
            return { pValue: Math.max(0.0, Math.min(1.0, pValue)), Z: z, diffAUC: auc1 - auc2, method: "DeLong Test" };
        } catch (error) {
            console.error("Error in DeLong Test:", error);
            return { ...defaultReturn, method: "DeLong Test (Execution Error)" };
        }
    }

    function calculateZTestForAUCComparison(auc1, se1, n1, auc2, se2, n2) { // For independent samples
        const defaultReturn = { pValue: NaN, Z: NaN, method: "Z-Test (AUC - Independent Samples, Invalid Input)" };
        if (auc1 === null || auc2 === null || se1 === null || se2 === null ||
            isNaN(auc1) || isNaN(auc2) || isNaN(se1) || isNaN(se2) || isNaN(n1) || isNaN(n2) ||
            se1 < 0 || se2 < 0 || n1 < 2 || n2 < 2) {
            return defaultReturn;
        }

        const var1 = se1 * se1;
        const var2 = se2 * se2;
        const varDiff = var1 + var2;

        if (isNaN(varDiff) || varDiff < 0) {
            return { ...defaultReturn, method: "Z-Test (AUC - Independent Samples, Variance Error)" };
        }
        if (varDiff <= 1e-12) {
            const pVal = (Math.abs(auc1 - auc2) < 1e-9) ? 1.0 : NaN;
            return { pValue: pVal, Z: (pVal === 1.0 ? 0 : NaN), method: "Z-Test (AUC - Independent Samples, Near Zero/Zero Variance)" };
        }

        const seDiff = Math.sqrt(varDiff);
        const z = (auc1 - auc2) / seDiff;
        if (isNaN(z) || !isFinite(z)) {
            return { ...defaultReturn, method: "Z-Test (AUC - Independent Samples, Z Calculation Error)" };
        }

        const pValue = 2.0 * (1.0 - normalCDF(Math.abs(z))); // Two-tailed test
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), Z: z, method: "Z-Test (AUC - Independent Samples)" };
    }


    function calculateConfusionMatrix(data, predictionKey, referenceKey) {
        let rp = 0, fp = 0, fn = 0, rn = 0;
        if (!Array.isArray(data)) return { rp, fp, fn, rn };

        data.forEach(p => {
            if (p && typeof p === 'object') {
                const predicted = p[predictionKey] === '+';
                const actual = p[referenceKey] === '+';
                const validPred = p[predictionKey] === '+' || p[predictionKey] === '-';
                const validActual = p[referenceKey] === '+' || p[referenceKey] === '-';

                if (validPred && validActual) {
                    if (predicted && actual) rp++;
                    else if (predicted && !actual) fp++;
                    else if (!predicted && actual) fn++;
                    else if (!predicted && !actual) rn++;
                }
            }
        });
        return { rp, fp, fn, rn };
    }

    function calculatePhi(a, b, c, d) { // Contingency table: [[a, b], [c, d]]
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return NaN;
        const n = a + b + c + d;
        if (n === 0) return NaN;

        const row1 = a + b, row2 = c + d, col1 = a + c, col2 = b + d;
        const denominator = Math.sqrt(row1 * row2 * col1 * col2);
        if (denominator === 0 || isNaN(denominator)) return NaN; // Avoid division by zero if any marginal is zero

        const phi = (a * d - b * c) / denominator;
        return isFinite(phi) ? phi : NaN;
    }


    function calculateDiagnosticPerformance(data, predictionKey, referenceKey) {
        if (!Array.isArray(data) || data.length === 0) {
             console.warn(`calculateDiagnosticPerformance: Keine oder ungültige Daten für ${predictionKey} vs ${referenceKey}.`);
             return null; // Indicate no valid calculation
        }
        const matrix = calculateConfusionMatrix(data, predictionKey, referenceKey);
        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        const nullMetric = { value: NaN, ci: null, method: null, se: NaN, n_success: NaN, n_trials: NaN, matrix_components: null };

        if (total === 0) return { matrix, sens: nullMetric, spez: nullMetric, ppv: nullMetric, npv: nullMetric, acc: nullMetric, balAcc: nullMetric, f1: nullMetric, auc: nullMetric };

        const sens_val = (rp + fn) > 0 ? rp / (rp + fn) : ((rp === 0 && fn === 0) ? NaN : 0) ; // Handle 0/0 for sens/spez
        const spez_val = (fp + rn) > 0 ? rn / (fp + rn) : ((fp === 0 && rn === 0) ? NaN : 0) ;
        const ppv_val = (rp + fp) > 0 ? rp / (rp + fp) : ((rp === 0 && fp === 0) ? NaN : 0) ;
        const npv_val = (fn + rn) > 0 ? rn / (fn + rn) : ((fn === 0 && rn === 0) ? NaN : 0) ;
        const acc_val = total > 0 ? (rp + rn) / total : NaN;
        const balAcc_val = (!isNaN(sens_val) && !isNaN(spez_val)) ? (sens_val + spez_val) / 2.0 : NaN;
        const f1_val = (!isNaN(ppv_val) && !isNaN(sens_val) && (ppv_val + sens_val) > 1e-9) ? 2.0 * (ppv_val * sens_val) / (ppv_val + sens_val) : ((ppv_val === 0 && sens_val === 0 && total > 0) ? 0 : NaN); // F1 is 0 if precision and recall are 0
        const auc_val = balAcc_val; // For binary classifiers, AUC is equivalent to Balanced Accuracy

        const n_sens = rp + fn;
        const n_spez = fp + rn;
        const n_ppv = rp + fp;
        const n_npv = fn + rn;
        const n_acc = total;

        const sensCIResult = !isNaN(sens_val) && n_sens > 0 ? calculateWilsonScoreCI(rp, n_sens) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        const spezCIResult = !isNaN(spez_val) && n_spez > 0 ? calculateWilsonScoreCI(rn, n_spez) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        const ppvCIResult = !isNaN(ppv_val) && n_ppv > 0 ? calculateWilsonScoreCI(rp, n_ppv) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        const npvCIResult = !isNaN(npv_val) && n_npv > 0 ? calculateWilsonScoreCI(rn, n_npv) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        const accCIResult = !isNaN(acc_val) && n_acc > 0 ? calculateWilsonScoreCI(rp + rn, n_acc) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };

        const bootstrapStatFnFactory = (predKey, refKey, metricName) => (sample) => {
            const m_boot = calculateConfusionMatrix(sample, predKey, refKey);
            const t_boot = m_boot.rp + m_boot.fp + m_boot.fn + m_boot.rn;
            if (t_boot === 0) return NaN;
            const se_boot = (m_boot.rp + m_boot.fn) > 0 ? m_boot.rp / (m_boot.rp + m_boot.fn) : ((m_boot.rp === 0 && m_boot.fn === 0) ? NaN : 0);
            const sp_boot = (m_boot.fp + m_boot.rn) > 0 ? m_boot.rn / (m_boot.fp + m_boot.rn) : ((m_boot.fp === 0 && m_boot.rn === 0) ? NaN : 0);

            if (isNaN(se_boot) || isNaN(sp_boot)) return NaN;

            if (metricName === 'balAcc' || metricName === 'auc') return (se_boot + sp_boot) / 2.0;
            if (metricName === 'f1') {
                const pv_boot = (m_boot.rp + m_boot.fp) > 0 ? m_boot.rp / (m_boot.rp + m_boot.fp) : ((m_boot.rp === 0 && m_boot.fp === 0) ? NaN : 0);
                return (isNaN(pv_boot) || (pv_boot + se_boot) <= 1e-9) ? ((pv_boot === 0 && se_boot === 0 && t_boot > 0) ? 0 : NaN) : 2.0 * (pv_boot * se_boot) / (pv_boot + se_boot);
            }
            return NaN;
        };
        
        const dataForBootstrap = data.filter(p => p && typeof p === 'object' && (p[predictionKey] === '+' || p[predictionKey] === '-') && (p[referenceKey] === '+' || p[referenceKey] === '-'));

        const balAccBootCIResult = !isNaN(balAcc_val) && dataForBootstrap.length > 0 ? bootstrapCI(dataForBootstrap, bootstrapStatFnFactory(predictionKey, referenceKey, 'balAcc')) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        const f1BootCIResult = !isNaN(f1_val) && dataForBootstrap.length > 0 ? bootstrapCI(dataForBootstrap, bootstrapStatFnFactory(predictionKey, referenceKey, 'f1')) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        const aucBootCIResult = balAccBootCIResult; // As AUC = BalAcc for binary tests
        
        const matrixComponentsForBootstrapContext = { rp, fp, fn, rn, total };

        return {
            matrix,
            sens: { value: sens_val, ci: { lower: sensCIResult.lower, upper: sensCIResult.upper }, method: sensCIResult.method, se: NaN, n_success: rp, n_trials: n_sens, matrix_components: null },
            spez: { value: spez_val, ci: { lower: spezCIResult.lower, upper: spezCIResult.upper }, method: spezCIResult.method, se: NaN, n_success: rn, n_trials: n_spez, matrix_components: null },
            ppv: { value: ppv_val, ci: { lower: ppvCIResult.lower, upper: ppvCIResult.upper }, method: ppvCIResult.method, se: NaN, n_success: rp, n_trials: n_ppv, matrix_components: null },
            npv: { value: npv_val, ci: { lower: npvCIResult.lower, upper: npvCIResult.upper }, method: npvCIResult.method, se: NaN, n_success: rn, n_trials: n_npv, matrix_components: null },
            acc: { value: acc_val, ci: { lower: accCIResult.lower, upper: accCIResult.upper }, method: accCIResult.method, se: NaN, n_success: rp + rn, n_trials: n_acc, matrix_components: null },
            balAcc: { value: balAcc_val, ci: { lower: balAccBootCIResult.lower, upper: balAccBootCIResult.upper }, method: balAccBootCIResult.method, se: balAccBootCIResult.se, n_success: NaN, n_trials: total, matrix_components: matrixComponentsForBootstrapContext },
            f1: { value: f1_val, ci: { lower: f1BootCIResult.lower, upper: f1BootCIResult.upper }, method: f1BootCIResult.method, se: f1BootCIResult.se, n_success: NaN, n_trials: total, matrix_components: matrixComponentsForBootstrapContext },
            auc: { value: auc_val, ci: { lower: aucBootCIResult.lower, upper: aucBootCIResult.upper }, method: aucBootCIResult.method, se: aucBootCIResult.se, n_success: NaN, n_trials: total, matrix_components: matrixComponentsForBootstrapContext }
        };
    }

    function compareDiagnosticMethods(data, key1, key2, referenceKey) { // For paired data
        const nullReturn = { mcnemar: { pValue: NaN, statistic: NaN, df: NaN, method: "McNemar's Test (Nicht berechnet)" }, delong: { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Nicht berechnet)" } };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return nullReturn;

        let b = 0, c = 0; // b: key1+/key2- (method1 yes, method2 no), c: key1-/key2+ (method1 no, method2 yes)
        data.forEach(p => {
            if (p && typeof p === 'object') {
                const p1_is_plus = p[key1] === '+';
                const p2_is_plus = p[key2] === '+';
                const valid_p1 = p[key1] === '+' || p[key1] === '-';
                const valid_p2 = p[key2] === '+' || p[key2] === '-';

                if (valid_p1 && valid_p2) { // Only consider cases where both methods have a valid prediction
                    if (p1_is_plus && !p2_is_plus) b++;
                    if (!p1_is_plus && p2_is_plus) c++;
                }
            }
        });
        const mcnemarResult = manualMcNemarTest(b, c);
        const delongResult = manualDeLongTest(data, key1, key2, referenceKey);
        return { mcnemar: mcnemarResult, delong: delongResult };
    }

    function calculateAssociations(data, t2Criteria) {
        const nullReturnFeature = { testName: "N/A", pValue: NaN, statistic: NaN, or: { value: NaN, ci: null }, rd: { value: NaN, ci: null }, phi: { value: NaN, ci: null, method: 'Phi Coefficient' }, matrix: null, featureName: "N/A" };
        if (!Array.isArray(data) || data.length === 0 || !t2Criteria) return {};

        const results = {};
        const referenceKey = 'n'; // Gold standard for N-status

        const validDataForAssoc = data.filter(p => p && typeof p === 'object' && (p[referenceKey] === '+' || p[referenceKey] === '-'));
        if(validDataForAssoc.length === 0) return {};


        const matrixAS = calculateConfusionMatrix(validDataForAssoc, 'as', referenceKey);
        const n_as_total = matrixAS.rp + matrixAS.fp + matrixAS.fn + matrixAS.rn;

        if (n_as_total > 0) {
            const fisherAS = manualFisherExactTest(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn);
            const phi_as_val = calculatePhi(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn);
            let phi_as_ci_obj = null;
            if (!isNaN(phi_as_val) && n_as_total >= APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD * 2) {
                 const phi_as_bootstrap_fn = (sample) => { const boot_matrix = calculateConfusionMatrix(sample, 'as', referenceKey); return calculatePhi(boot_matrix.rp, boot_matrix.fp, boot_matrix.fn, boot_matrix.rn); };
                 const bootstrapped_phi_ci = bootstrapCI(validDataForAssoc.filter(p=>(p['as'] === '+' || p['as'] === '-')), phi_as_bootstrap_fn); // Filter for valid 'as' status for bootstrap
                 if (bootstrapped_phi_ci.lower !== undefined && !isNaN(bootstrapped_phi_ci.lower)) {
                    phi_as_ci_obj = {lower: bootstrapped_phi_ci.lower, upper: bootstrapped_phi_ci.upper};
                 }
            }

            results.as = {
                matrix: matrixAS,
                testName: fisherAS.method,
                pValue: fisherAS.pValue,
                statistic: NaN, // Fisher doesn't have a single statistic like Chi2 in this context
                or: calculateORCI(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn),
                rd: calculateRDCI(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn),
                phi: { value: phi_as_val, ci: phi_as_ci_obj, method: phi_as_ci_obj ? APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE : 'Phi Coefficient' },
                featureName: UI_TEXTS.legendLabels.avocadoSign || 'Avocado Sign Positiv'
            };
        } else {
            results.as = {...nullReturnFeature, testName: "Fisher's Exact Test (Keine validen Daten für AS vs N)", featureName: UI_TEXTS.legendLabels.avocadoSign || 'Avocado Sign Positiv'};
        }

        const sizesNplus = [], sizesNminus = [];
        validDataForAssoc.forEach(p => {
            if (Array.isArray(p.lymphknoten_t2)) {
                const isNPos = p[referenceKey] === '+';
                p.lymphknoten_t2.forEach(lk => {
                    if (lk && typeof lk.groesse === 'number' && !isNaN(lk.groesse) && isFinite(lk.groesse)) {
                        if (isNPos) sizesNplus.push(lk.groesse); else sizesNminus.push(lk.groesse);
                    }
                });
            }
        });

        if (sizesNplus.length >= APP_CONFIG.STATISTICAL_CONSTANTS.FISHER_EXACT_THRESHOLD && sizesNminus.length >= APP_CONFIG.STATISTICAL_CONSTANTS.FISHER_EXACT_THRESHOLD ) { // Require min samples in each group for MWU
            const mwuResult = manualMannWhitneyUTest(sizesNplus, sizesNminus);
            results.size_mwu = {
                pValue: mwuResult.pValue,
                statistic: mwuResult.U, // U statistic
                testName: mwuResult.testName, Z: mwuResult.Z,
                or: null, rd: null, phi: null, matrix: null,
                featureName: 'LK Größe (Median Vergleich T2 LKs N+ vs N-)'
            };
        } else {
            results.size_mwu = { ...nullReturnFeature, testName: "Mann-Whitney U (Nicht genug Daten in einer/beiden Gruppen)", featureName: 'LK Größe (Median Vergleich T2 LKs N+ vs N-)' };
        }

        const t2Features = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        t2Features.forEach(featureKey => {
            let featureValueForTest = null, thresholdForTest = null, conditionForTest = '>=';
            let featureNameForDisplay = `T2: ${featureKey}`;

            if (t2Criteria[featureKey]) { // Use applied criteria definition for association
                if (featureKey === 'size') {
                    thresholdForTest = t2Criteria[featureKey].threshold;
                    conditionForTest = t2Criteria[featureKey].condition || '>=';
                    if (thresholdForTest !== null && !isNaN(thresholdForTest)) {
                        featureNameForDisplay = `T2 Größe ${conditionForTest} ${formatNumber(thresholdForTest, 1)}`;
                    }
                } else {
                    featureValueForTest = t2Criteria[featureKey].value;
                    if (featureValueForTest) {
                         featureNameForDisplay = `T2 ${featureKey}=${featureValueForTest}`;
                    }
                }
            }

            if ((featureKey !== 'size' && !featureValueForTest) || (featureKey === 'size' && (thresholdForTest === null || thresholdForTest === undefined || isNaN(thresholdForTest)))) {
                results[featureKey] = { ...nullReturnFeature, testName: `T2 Merkmal '${featureKey}' nicht (spezifisch genug) für Assoziationstest definiert`, featureName: featureNameForDisplay };
                return;
            }

            let a = 0, b = 0, c = 0, d = 0; // Contingency table for this feature vs N-status
            const dataForFeatureBootstrap = [];

            validDataForAssoc.forEach(p => {
                if (!Array.isArray(p.lymphknoten_t2)) return; // Skip if no T2 LKs for this patient
                const actualN_is_Positive = p[referenceKey] === '+';
                let patientHasFeature = false;

                if (featureKey === 'size') {
                    patientHasFeature = p.lymphknoten_t2.some(lk => {
                        if (lk && typeof lk.groesse === 'number' && !isNaN(lk.groesse)) {
                            switch(conditionForTest) {
                                case '>=': return lk.groesse >= thresholdForTest;
                                case '>': return lk.groesse > thresholdForTest;
                                case '<=': return lk.groesse <= thresholdForTest;
                                case '<': return lk.groesse < thresholdForTest;
                                case '==': return lk.groesse === thresholdForTest;
                                default: return false;
                            }
                        }
                        return false;
                    });
                } else {
                    patientHasFeature = p.lymphknoten_t2.some(lk => lk && lk[featureKey] === featureValueForTest);
                }

                if (patientHasFeature && actualN_is_Positive) a++;
                else if (patientHasFeature && !actualN_is_Positive) b++;
                else if (!patientHasFeature && actualN_is_Positive) c++;
                else if (!patientHasFeature && !actualN_is_Positive) d++;
                
                // For bootstrap CI of Phi, need patient-level data structure that indicates feature presence and N-status
                dataForFeatureBootstrap.push({ has_feature: patientHasFeature ? '+' : '-', n: p[referenceKey] });

            });

            const n_feature_total = a + b + c + d;
            if (n_feature_total > 0) {
                const fisherFeature = manualFisherExactTest(a, b, c, d);
                const phi_feat_val = calculatePhi(a, b, c, d);
                let phi_feat_ci_obj = null;

                if (!isNaN(phi_feat_val) && dataForFeatureBootstrap.length >= APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD * 2) {
                    const phi_feat_bootstrap_fn = (sample) => {
                         const boot_matrix = calculateConfusionMatrix(sample, 'has_feature', referenceKey);
                         return calculatePhi(boot_matrix.rp, boot_matrix.fp, boot_matrix.fn, boot_matrix.rn);
                    };
                    const bootstrapped_phi_ci = bootstrapCI(dataForFeatureBootstrap, phi_feat_bootstrap_fn);
                    if (bootstrapped_phi_ci.lower !== undefined && !isNaN(bootstrapped_phi_ci.lower)) {
                        phi_feat_ci_obj = {lower: bootstrapped_phi_ci.lower, upper: bootstrapped_phi_ci.upper};
                    }
                }

                results[featureKey] = {
                    matrix: { rp: a, fp: b, fn: c, rn: d },
                    testName: fisherFeature.method,
                    pValue: fisherFeature.pValue,
                    statistic: NaN,
                    or: calculateORCI(a, b, c, d),
                    rd: calculateRDCI(a, b, c, d),
                    phi: { value: phi_feat_val, ci: phi_feat_ci_obj, method: phi_feat_ci_obj ? APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE : 'Phi Coefficient' },
                    featureName: featureNameForDisplay
                };
            } else {
                results[featureKey] = { ...nullReturnFeature, testName: `Fisher's Exact Test (Keine Daten für T2-${featureKey} vs N)`, featureName: featureNameForDisplay };
            }
        });
        return results;
    }


    function compareCohorts(data1, data2, t2Criteria, t2Logic) { // For independent cohorts
        const nullComp = { pValue: NaN, testName: "N/A", Z: NaN, statistic: NaN };
        const defaultReturn = {
            accuracyComparison: { as: { ...nullComp }, t2: { ...nullComp } },
            aucComparison: { as: { ...nullComp, diffAUC: NaN }, t2: { ...nullComp, diffAUC: NaN } }
        };
        if (!Array.isArray(data1) || !Array.isArray(data2) || data1.length === 0 || data2.length === 0) return defaultReturn;

        let evaluatedData1 = cloneDeep(data1), evaluatedData2 = cloneDeep(data2);
        let t2Evaluated = false;
        if (t2Criteria && t2Logic && typeof t2CriteriaManager !== 'undefined') {
            evaluatedData1 = t2CriteriaManager.evaluateDataset(evaluatedData1, t2Criteria, t2Logic);
            evaluatedData2 = t2CriteriaManager.evaluateDataset(evaluatedData2, t2Criteria, t2Logic);
            t2Evaluated = true;
        } else {
            defaultReturn.accuracyComparison.t2 = { ...nullComp, testName: "T2 nicht ausgewertet oder Kriterien ungültig" };
            defaultReturn.aucComparison.t2 = { ...nullComp, diffAUC: NaN, testName: "T2 nicht ausgewertet oder Kriterien ungültig" };
        }

        const matrix1AS = calculateConfusionMatrix(data1, 'as', 'n');
        const matrix2AS = calculateConfusionMatrix(data2, 'as', 'n');
        // Fisher's test for 2x2 table: (Correct_C1, Incorrect_C1) vs (Correct_C2, Incorrect_C2)
        const accCompASResult = manualFisherExactTest(matrix1AS.rp + matrix1AS.rn, matrix1AS.fp + matrix1AS.fn,
                                                    matrix2AS.rp + matrix2AS.rn, matrix2AS.fp + matrix2AS.fn);

        let accCompT2Result = { pValue: NaN, method: "T2 nicht ausgewertet oder Kriterien ungültig"};
        if (t2Evaluated) {
            const matrix1T2 = calculateConfusionMatrix(evaluatedData1, 't2', 'n');
            const matrix2T2 = calculateConfusionMatrix(evaluatedData2, 't2', 'n');
            accCompT2Result = manualFisherExactTest(matrix1T2.rp + matrix1T2.rn, matrix1T2.fp + matrix1T2.fn,
                                                     matrix2T2.rp + matrix2T2.rn, matrix2T2.fp + matrix2T2.fn);
        }

        const guete1AS = calculateDiagnosticPerformance(data1, 'as', 'n');
        const guete2AS = calculateDiagnosticPerformance(data2, 'as', 'n');
        const aucCompASResult = calculateZTestForAUCComparison(guete1AS?.auc?.value, guete1AS?.auc?.se, data1.length,
                                                               guete2AS?.auc?.value, guete2AS?.auc?.se, data2.length);
        let aucCompT2Result = { pValue: NaN, Z: NaN, method: "Z-Test (AUC - T2 nicht ausgewertet oder Kriterien ungültig)" };
        let diffAUC_T2 = NaN;
        if (t2Evaluated) {
            const guete1T2 = calculateDiagnosticPerformance(evaluatedData1, 't2', 'n');
            const guete2T2 = calculateDiagnosticPerformance(evaluatedData2, 't2', 'n');
            aucCompT2Result = calculateZTestForAUCComparison(guete1T2?.auc?.value, guete1T2?.auc?.se, evaluatedData1.length,
                                                               guete2T2?.auc?.value, guete2T2?.auc?.se, evaluatedData2.length);
            diffAUC_T2 = (guete1T2?.auc?.value ?? NaN) - (guete2T2?.auc?.value ?? NaN);
        }

        return {
            accuracyComparison: {
                as: { pValue: accCompASResult.pValue, testName: accCompASResult.method + " (Accuracy)", Z: NaN, statistic: NaN },
                t2: { pValue: accCompT2Result.pValue, testName: accCompT2Result.method + " (Accuracy)", Z: NaN, statistic: NaN }
            },
            aucComparison: {
                as: { ...aucCompASResult, diffAUC: (guete1AS?.auc?.value ?? NaN) - (guete2AS?.auc?.value ?? NaN), statistic: NaN },
                t2: { ...aucCompT2Result, diffAUC: diffAUC_T2, statistic: NaN }
            }
        };
    }

    function calculateDescriptiveStats(data) {
        const n = data?.length ?? 0;
        const nullMetric = { median: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN, n: 0 };
        const nullReturn = { anzahlPatienten: 0, alter: nullMetric, geschlecht: { m: 0, f: 0, unbekannt: 0 }, therapie: { 'direkt OP': 0, 'nRCT': 0, unbekannt: 0 }, nStatus: { plus: 0, minus: 0, unbekannt: 0 }, asStatus: { plus: 0, minus: 0, unbekannt: 0 }, t2Status: { plus: 0, minus: 0, unbekannt: 0 }, lkAnzahlen: null, alterData: [] };

        if (!Array.isArray(data) || n === 0) return nullReturn;

        const alterData = data.map(p => p?.alter).filter(a => a !== null && a !== undefined && !isNaN(a) && isFinite(a)).sort((a, b) => a - b);
        const geschlecht = data.reduce((acc, p) => { const key = (p?.geschlecht === 'm' || p?.geschlecht === 'f') ? p.geschlecht : 'unbekannt'; acc[key] = (acc[key] || 0) + 1; return acc; }, { m: 0, f: 0, unbekannt: 0 });
        const therapie = data.reduce((acc, p) => { const key = p?.therapie === 'direkt OP' ? 'direkt OP' : (p?.therapie === 'nRCT' ? 'nRCT' : 'unbekannt'); acc[key] = (acc[key] || 0) + 1; return acc; }, { 'direkt OP': 0, 'nRCT': 0, unbekannt: 0 });

        const statusReducer = (key) => data.reduce((acc, p) => { const status = p?.[key]; if (status === '+') acc.plus++; else if (status === '-') acc.minus++; else acc.unbekannt++; return acc; }, { plus: 0, minus: 0, unbekannt: 0 });
        const nStatus = statusReducer('n');
        const asStatus = statusReducer('as');
        const t2Status = statusReducer('t2'); // Basierend auf den aktuell im Dataset evaluierten T2-Werten

        const getLKStats = (keyTotal, keyPlus = null, statusKeyForPlusCount = null) => {
            const getCounts = (arr, prop) => arr.map(p => p?.[prop]).filter(c => c !== null && c !== undefined && !isNaN(c) && isFinite(c) && c >= 0);
            const totalCounts = getCounts(data, keyTotal).sort((a, b) => a - b);
            let plusCounts = [];
            if (keyPlus && statusKeyForPlusCount) {
                plusCounts = getCounts(data.filter(p => p?.[statusKeyForPlusCount] === '+'), keyPlus).sort((a, b) => a - b);
            }
            const getStatsFromCounts = (counts) => counts.length === 0 ? { ...nullMetric, n: 0 } : { median: getMedian(counts), min: counts[0], max: counts[counts.length - 1], mean: getMean(counts), sd: getStdDev(counts), n: counts.length };
            return { total: getStatsFromCounts(totalCounts), plus: (keyPlus && statusKeyForPlusCount) ? getStatsFromCounts(plusCounts) : { ...nullMetric, n: 0 } };
        };

        const lkAnzahlen = {
            n: getLKStats('anzahl_patho_lk', 'anzahl_patho_n_plus_lk', 'n'),
            as: getLKStats('anzahl_as_lk', 'anzahl_as_plus_lk', 'as'),
            t2: getLKStats('anzahl_t2_lk', 'anzahl_t2_plus_lk', 't2') // Nutzt dynamische anzahl_t2_plus_lk
        };
        const alterStats = alterData.length > 0 ? { median: getMedian(alterData), mean: getMean(alterData), sd: getStdDev(alterData), min: alterData[0], max: alterData[alterData.length - 1], n: alterData.length } : nullMetric;

        return { anzahlPatienten: n, alter: alterStats, geschlecht: geschlecht, therapie: therapie, nStatus: nStatus, asStatus: asStatus, t2Status: t2Status, lkAnzahlen: lkAnzahlen, alterData: alterData };
    }

     function calculateAllStatsForPublication(globalRawData, appliedT2Criteria, appliedT2Logic, bruteForceResultsPerKollektiv) {
        if (!globalRawData || !Array.isArray(globalRawData)) return null;
        const results = {
            Gesamt: {},
            'direkt OP': {},
            nRCT: {}
        };
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];

        kollektive.forEach(kollektivId => {
            const filteredRawData = dataProcessor.filterDataByKollektiv(globalRawData, kollektivId);
            if (filteredRawData.length === 0) {
                results[kollektivId] = null; // Oder leeres Objekt, je nach gewünschtem Verhalten
                return;
            }
            
            // Wichtig: Für die Basis-Deskriptiv-Statistiken und AS-Performance nehmen wir die *rohen* gefilterten Daten,
            // da T2-Kriterien hier noch nicht relevant sind bzw. AS-Status bereits in Rohdaten ist.
            results[kollektivId].deskriptiv = calculateDescriptiveStats(filteredRawData);
            results[kollektivId].gueteAS = calculateDiagnosticPerformance(filteredRawData, 'as', 'n');

            // T2-bezogene Statistiken basierend auf *aktuell angewendeten* Kriterien
            const evaluatedDataApplied = t2CriteriaManager.evaluateDataset(cloneDeep(filteredRawData), appliedT2Criteria, appliedT2Logic);
            results[kollektivId].gueteT2_angewandt = calculateDiagnosticPerformance(evaluatedDataApplied, 't2', 'n');
            results[kollektivId].vergleichASvsT2_angewandt = compareDiagnosticMethods(evaluatedDataApplied, 'as', 't2', 'n');
            results[kollektivId].assoziation_angewandt = calculateAssociations(evaluatedDataApplied, appliedT2Criteria);

            // T2-bezogene Statistiken für Literatur-Kriterien
            results[kollektivId].gueteT2_literatur = {};
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySetConf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studySetConf.id);
                if (studySet) {
                    let isApplicable = true;
                    // Wende Literaturkriterien nur an, wenn das Zielkollektiv der Studie mit dem aktuellen Kollektiv übereinstimmt
                    // ODER wenn das Zielkollektiv der Studie 'Gesamt' ist (dann auf aktuelles Kollektiv anwenden)
                    if (studySet.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt' && studySet.applicableKollektiv !== kollektivId) {
                        isApplicable = false;
                    }

                    if (isApplicable) {
                        const evaluatedDataStudy = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredRawData), studySet);
                        results[kollektivId].gueteT2_literatur[studySetConf.id] = calculateDiagnosticPerformance(evaluatedDataStudy, 't2', 'n');
                        results[kollektivId][`vergleichASvsT2_literatur_${studySetConf.id}`] = compareDiagnosticMethods(evaluatedDataStudy, 'as', 't2', 'n');
                    } else {
                        results[kollektivId].gueteT2_literatur[studySetConf.id] = null; // Nicht anwendbar für dieses Kollektiv
                        results[kollektivId][`vergleichASvsT2_literatur_${studySetConf.id}`] = null;
                    }
                }
            });

            // T2-bezogene Statistiken für Brute-Force-optimierte Kriterien
            const bfResultForCurrentKollektiv = bruteForceResultsPerKollektiv ? bruteForceResultsPerKollektiv[kollektivId] : null;
            if (bfResultForCurrentKollektiv && bfResultForCurrentKollektiv.bestResult && bfResultForCurrentKollektiv.bestResult.criteria) {
                const bfCriteria = bfResultForCurrentKollektiv.bestResult.criteria;
                const bfLogic = bfResultForCurrentKollektiv.bestResult.logic;
                const evaluatedDataBF = t2CriteriaManager.evaluateDataset(cloneDeep(filteredRawData), bfCriteria, bfLogic);
                results[kollektivId].gueteT2_bruteforce = calculateDiagnosticPerformance(evaluatedDataBF, 't2', 'n');
                results[kollektivId].vergleichASvsT2_bruteforce = compareDiagnosticMethods(evaluatedDataBF, 'as', 't2', 'n');
                results[kollektivId].bruteforce_definition = { 
                    criteria: bfCriteria, 
                    logic: bfLogic, 
                    metricValue: bfResultForCurrentKollektiv.bestResult.metricValue, 
                    metricName: bfResultForCurrentKollektiv.metric 
                };
            } else {
                results[kollektivId].gueteT2_bruteforce = null;
                results[kollektivId].vergleichASvsT2_bruteforce = null;
                results[kollektivId].bruteforce_definition = null;
            }
        });
        return results;
     }


    return Object.freeze({
        getMedian, // Beibehalten für interne Nutzung falls nötig oder Deskriptiv-Stats
        getMean,   // Beibehalten
        getStdDev, // Beibehalten
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateAssociations,
        compareCohorts,
        calculateDescriptiveStats,
        calculateAllStatsForPublication // Zentrale neue Funktion
    });

})();
