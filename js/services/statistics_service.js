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
        let x_lg = xx, y_lg = x_lg, tmp_lg = x_lg + 5.5;
        tmp_lg -= (x_lg + 0.5) * Math.log(tmp_lg);
        let ser_lg = 1.000000000190015;
        for (let j = 0; j <= 5; j++) ser_lg += cof[j] / ++y_lg;
        const result = -tmp_lg + Math.log(2.5066282746310005 * ser_lg / x_lg);
        if (!isFinite(result)) return NaN;
        if (Object.keys(LOG_GAMMA_CACHE).length < 1000) {
             LOG_GAMMA_CACHE[xx] = result;
        }
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
        if (df === 0) return x > 0 ? 1.0 : 0.0;
        return x === 0 ? 0.0 : regularizedGammaIncomplete(df / 2.0, x / 2.0);
    }

    function calculateWilsonScoreCI(successes, trials, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        if (isNaN(successes) || isNaN(trials) || isNaN(alpha) || trials <= 0 || successes < 0 || successes > trials || alpha <= 0 || alpha >= 1) return defaultReturn;
        const p_hat = successes / trials, n_ws = trials;
        const z_ws = Math.abs(inverseNormalCDF(alpha / 2.0));
        if (!isFinite(z_ws)) return defaultReturn;
        const z2_ws = z_ws * z_ws;
        const centerTerm = p_hat + z2_ws / (2.0 * n_ws);
        const variabilityTerm = z_ws * Math.sqrt((p_hat * (1.0 - p_hat) / n_ws) + (z2_ws / (4.0 * n_ws * n_ws)));
        const denominator = 1.0 + z2_ws / n_ws;
        if (denominator === 0) return defaultReturn;
        const lower = (centerTerm - variabilityTerm) / denominator;
        const upper = (centerTerm + variabilityTerm) / denominator;
        return { lower: Math.max(0.0, lower), upper: Math.min(1.0, upper), method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
    }

    function calculateORCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Woolf Logit (Adjusted)' };
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;
        const or_raw = (b === 0 || c === 0) ? ((a > 0 && d > 0 && b === 0 && c === 0) ? NaN : (a > 0 && d > 0) ? Infinity : NaN ) : (a * d) / (b * c);

        const a_adj = a + 0.5, b_adj = b + 0.5, c_adj = c + 0.5, d_adj = d + 0.5;
        const or_adj = (a_adj * d_adj) / (b_adj * c_adj);
        if (or_adj <= 0 || !isFinite(or_adj)) return { ...defaultReturn, value: or_raw };

        const logOR = Math.log(or_adj);
        const seLogOR = Math.sqrt(1.0 / a_adj + 1.0 / b_adj + 1.0 / c_adj + 1.0 / d_adj);
        const z_or = Math.abs(inverseNormalCDF(alpha / 2.0));

        if (!isFinite(z_or) || isNaN(seLogOR) || seLogOR <= 0 || !isFinite(seLogOR)) return { ...defaultReturn, value: or_raw };
        const lowerCI = Math.exp(logOR - z_or * seLogOR);
        const upperCI = Math.exp(logOR + z_or * seLogOR);

        if (!isFinite(lowerCI) || !isFinite(upperCI)) return { ...defaultReturn, value: or_raw };
        return { value: or_raw, ci: { lower: lowerCI, upper: upperCI }, method: 'Woolf Logit (Haldane-Anscombe correction)' };
    }

    function calculateRDCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Wald' };
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;
        const n1_rd = a + b, n2_rd = c + d;
        if (n1_rd === 0 || n2_rd === 0) return defaultReturn;
        const p1_rd = a / n1_rd, p2_rd = c / n2_rd; const rd = p1_rd - p2_rd;

        const varP1 = (p1_rd * (1.0 - p1_rd)) / n1_rd;
        const varP2 = (p2_rd * (1.0 - p2_rd)) / n2_rd;
        if (isNaN(varP1) || isNaN(varP2) || varP1 < 0 || varP2 < 0) return { ...defaultReturn, value: rd };

        const seRD = Math.sqrt(varP1 + varP2);
        const z_rd = Math.abs(inverseNormalCDF(alpha / 2.0));

        if (!isFinite(z_rd) || isNaN(seRD) || seRD <= 0 || !isFinite(seRD)) return { ...defaultReturn, value: rd };
        const lower = rd - z_rd * seRD;
        const upper = rd + z_rd * seRD;
        return { value: rd, ci: { lower: Math.max(-1.0, lower), upper: Math.min(1.0, upper) }, method: 'Wald' };
    }

    function bootstrapCI(data, statisticFn, nBoot = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA, ciMethodName = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE) {
        const defaultReturn = { lower: NaN, upper: NaN, method: ciMethodName, se: NaN };
        if (!Array.isArray(data) || data.length < 2 || typeof statisticFn !== 'function' || isNaN(nBoot) || nBoot <= 0 || isNaN(alpha) || alpha <= 0 || alpha >= 1) return defaultReturn;

        const n_bci = data.length;
        const bootStats = [];
        let sum = 0, sumSq = 0, validCount = 0;

        for (let i = 0; i < nBoot; i++) {
            const bootSample = new Array(n_bci);
            for (let j = 0; j < n_bci; j++) bootSample[j] = data[Math.floor(Math.random() * n_bci)];
            try {
                 const stat = statisticFn(bootSample);
                 if (stat !== null && stat !== undefined && isFinite(stat) && !isNaN(stat)) {
                    bootStats.push(stat);
                    sum += stat;
                    sumSq += stat * stat;
                    validCount++;
                 }
            } catch (e) { console.warn("Bootstrap-Iteration fehlgeschlagen:", e); }
        }

        if (validCount < Math.max(10, nBoot * 0.1)) return defaultReturn;
        bootStats.sort((a_bs, b_bs) => a_bs - b_bs);

        const lowerIndex = Math.max(0, Math.min(validCount - 1, Math.floor(validCount * (alpha / 2.0))));
        const upperIndex = Math.max(0, Math.min(validCount - 1, Math.ceil(validCount * (1.0 - alpha / 2.0)) -1));


        if (lowerIndex > upperIndex || lowerIndex < 0 || upperIndex >= validCount) return defaultReturn;

        const meanStat = sum / validCount;
        const variance = (validCount > 1) ? (sumSq - (sum * sum / validCount)) / (validCount -1) : NaN;
        const se = (variance >= 0 && !isNaN(variance)) ? Math.sqrt(variance) : NaN;

        return { lower: bootStats[lowerIndex], upper: bootStats[upperIndex], method: ciMethodName, se: se };
    }

    function manualMcNemarTest(b, c) {
        if (isNaN(b) || isNaN(c) || b < 0 || c < 0) return { pValue: NaN, statistic: NaN, df: 1, method: "McNemar's Test (Invalid Input)" };
        const n_mcn = b + c;
        if (n_mcn === 0) return { pValue: 1.0, statistic: 0, df: 1, method: "McNemar's Test (No Discordance)" };

        const continuityCorrection = (n_mcn < APP_CONFIG.STATISTICAL_CONSTANTS.FISHER_EXACT_THRESHOLD * 4) ? 1 : 0;
        let statistic = Math.pow(Math.abs(b - c) - continuityCorrection, 2) / n_mcn;
        if (isNaN(statistic) || !isFinite(statistic)) statistic = 0;

        const pValue = 1.0 - chiSquareCDF(statistic, 1);
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), statistic: statistic, df: 1, method: `McNemar's Test${continuityCorrection > 0 ? ' (continuity corrected)' : ''}` };
    }

    function logProbHypergeometric(k_h, N_pop, K_success, n_draw) {
        if (k_h < 0 || n_draw < 0 || K_success < 0 || N_pop < 0 || k_h > n_draw || k_h > K_success || (n_draw - k_h) > (N_pop - K_success) || n_draw > N_pop) return -Infinity;
        try {
            const logC_K_k = logFactorial(K_success) - logFactorial(k_h) - logFactorial(K_success - k_h);
            const logC_NK_nk = logFactorial(N_pop - K_success) - logFactorial(n_draw - k_h) - logFactorial((N_pop - K_success) - (n_draw - k_h));
            const logC_N_n = logFactorial(N_pop) - logFactorial(n_draw) - logFactorial(N_pop - n_draw);
            if (isNaN(logC_K_k) || isNaN(logC_NK_nk) || isNaN(logC_N_n)) return -Infinity;
            const result = logC_K_k + logC_NK_nk - logC_N_n;
            return isFinite(result) ? result : -Infinity;
        } catch (e) { return -Infinity; }
    }

    function manualFisherExactTest(a_fet, b_fet, c_fet, d_fet) {
        if (isNaN(a_fet) || isNaN(b_fet) || isNaN(c_fet) || isNaN(d_fet) || a_fet < 0 || b_fet < 0 || c_fet < 0 || d_fet < 0) return { pValue: NaN, method: "Fisher's Exact Test (Invalid Input)" };
        const n1_fet = a_fet + b_fet, n2_fet = c_fet + d_fet;
        const k1_fet = a_fet + c_fet;
        const N_fet = a_fet + b_fet + c_fet + d_fet;
        if (N_fet === 0) return { pValue: 1.0, method: "Fisher's Exact Test (No Data)" };

        const pObservedLog = logProbHypergeometric(a_fet, N_fet, k1_fet, n1_fet);
        if (!isFinite(pObservedLog)) return { pValue: NaN, method: "Fisher's Exact Test (Numerical Issue)" };

        let pValue = 0.0;
        const minVal = Math.max(0, k1_fet - n2_fet);
        const maxVal = Math.min(k1_fet, n1_fet);
        const tolerance = 1e-9;

        for (let i = minVal; i <= maxVal; i++) {
            const pCurrentLog = logProbHypergeometric(i, N_fet, k1_fet, n1_fet);
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
            .sort((a_rd, b_rd) => a_rd.value - b_rd.value);

        const ranks = new Array(arr.length).fill(NaN);
        if(sorted.length === 0) return ranks;

        let i_rd = 0;
        while (i_rd < sorted.length) {
            let j_rd = i_rd;
            while (j_rd < sorted.length - 1 && sorted[j_rd].value === sorted[j_rd+1].value) {
                j_rd++;
            }
            const averageRank = (i_rd + 1 + j_rd + 1) / 2.0;
            for (let k_rd = i_rd; k_rd <= j_rd; k_rd++) {
                ranks[sorted[k_rd].originalIndex] = averageRank;
            }
            i_rd = j_rd + 1;
        }
        return ranks;
    }

    function manualMannWhitneyUTest(sample1, sample2) {
        const defaultReturn = { pValue: NaN, U: NaN, Z: NaN, testName: "Mann-Whitney U (Invalid Input)" };
        if (!Array.isArray(sample1) || !Array.isArray(sample2)) return defaultReturn;

        const filteredSample1 = sample1.map(x_s1 => parseFloat(x_s1)).filter(x_s1 => !isNaN(x_s1) && isFinite(x_s1));
        const filteredSample2 = sample2.map(x_s2 => parseFloat(x_s2)).filter(x_s2 => !isNaN(x_s2) && isFinite(x_s2));
        const n1_mwu = filteredSample1.length, n2_mwu = filteredSample2.length;

        if (n1_mwu === 0 || n2_mwu === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No Data in one/both samples)" };

        const combined = [...filteredSample1, ...filteredSample2];
        const ranks = rankData(combined);

        const ranks1 = ranks.slice(0, n1_mwu).filter(r_mwu => !isNaN(r_mwu));
        if(ranks1.length === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No valid ranks in sample 1)" };

        const R1 = ranks1.reduce((sum_mwu, r_mwu) => sum_mwu + r_mwu, 0);
        const U1 = n1_mwu * n2_mwu + (n1_mwu * (n1_mwu + 1)) / 2.0 - R1;
        const U = Math.min(U1, n1_mwu * n2_mwu - U1);

        const meanU = (n1_mwu * n2_mwu) / 2.0;
        const N_mwu = n1_mwu + n2_mwu;

        const tieGroups = {};
        const validRanks = ranks.filter(r_mwu => !isNaN(r_mwu));
        validRanks.forEach(r_mwu => { tieGroups[r_mwu] = (tieGroups[r_mwu] || 0) + 1; });
        const tieCorrectionFactor = Object.values(tieGroups).reduce((sum_mwu, t_mwu) => t_mwu > 1 ? sum_mwu + (t_mwu * t_mwu * t_mwu - t_mwu) : sum_mwu, 0);

        const varU_numerator = n1_mwu * n2_mwu * ((N_mwu * N_mwu * N_mwu - N_mwu) - tieCorrectionFactor);
        const varU_denominator = 12.0 * N_mwu * (N_mwu - 1);

        if (varU_denominator <= 0 || N_mwu <= 1) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (No Variance)" };
        const varU = varU_numerator / varU_denominator;
        if (varU < 0 || isNaN(varU)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Variance Error)" };
        if (varU === 0) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (Zero Variance)" };

        const stdDevU = Math.sqrt(varU);
        const correction = (U < meanU) ? 0.5 : (U > meanU) ? -0.5 : 0;
        const z_mwu = (U - meanU + correction) / stdDevU;
        if (isNaN(z_mwu) || !isFinite(z_mwu)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Z Calculation Error)" };

        const pValue = 2.0 * normalCDF(-Math.abs(z_mwu));
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), U: U, Z: z_mwu, testName: "Mann-Whitney U (Normal Approx. with Tie Correction)" };
    }

    function manualDeLongTest(data, key1, key2, referenceKey) {
        const defaultReturn = { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Invalid Input)" };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return defaultReturn;

        const positives = data.filter(p_dl => p_dl && p_dl[referenceKey] === '+');
        const negatives = data.filter(p_dl => p_dl && p_dl[referenceKey] === '-');
        const n_pos = positives.length, n_neg = negatives.length;

        if (n_pos === 0 || n_neg === 0) return { ...defaultReturn, method: "DeLong Test (No positive or negative cases)" };

        const getAUCAndComponents = (testKey) => {
            let structuralPairs = 0;
            const V10 = new Array(n_pos).fill(0);
            const V01 = new Array(n_neg).fill(0);

            for (let i_dl = 0; i_dl < n_pos; i_dl++) {
                for (let j_dl = 0; j_dl < n_neg; j_dl++) {
                    const val_pos = (positives[i_dl]?.[testKey] === '+') ? 1.0 : (positives[i_dl]?.[testKey] === '-') ? 0.0 : 0.5;
                    const val_neg = (negatives[j_dl]?.[testKey] === '+') ? 1.0 : (negatives[j_dl]?.[testKey] === '-') ? 0.0 : 0.5;
                    let score = 0;
                    if (val_pos > val_neg) score = 1.0;
                    else if (val_pos === val_neg) score = 0.5;

                    structuralPairs += score;
                    V10[i_dl] += score;
                    V01[j_dl] += score;
                }
            }
            const auc = (n_pos > 0 && n_neg > 0) ? structuralPairs / (n_pos * n_neg) : NaN;
            if (isNaN(auc)) return null;

            V10.forEach((_, i_dl) => V10[i_dl] = (n_neg > 0) ? V10[i_dl] / n_neg : NaN);
            V01.forEach((_, j_dl) => V01[j_dl] = (n_pos > 0) ? V01[j_dl] / n_pos : NaN);
            return { auc, V10, V01 };
        };

        try {
            const components1 = getAUCAndComponents(key1);
            const components2 = getAUCAndComponents(key2);

            if (!components1 || !components2) return { ...defaultReturn, method: "DeLong Test (AUC Calculation Failed for one/both methods)" };
            const { auc: auc1, V10: V10_1, V01: V01_1 } = components1;
            const { auc: auc2, V10: V10_2, V01: V01_2 } = components2;

            if (isNaN(auc1) || isNaN(auc2)) return { ...defaultReturn, method: "DeLong Test (Invalid AUCs calculated)" };

            const calculateVarianceComponent = (V_arr, mean_auc, n_other) => {
                if (n_other === 0 || !Array.isArray(V_arr) || V_arr.some(isNaN) || V_arr.length < 2) return NaN;
                let sumSqDiff = 0;
                for(let val of V_arr) sumSqDiff += Math.pow(val - mean_auc, 2);
                return sumSqDiff / (V_arr.length -1);
            };
            const S10_1 = calculateVarianceComponent(V10_1, auc1, n_neg);
            const S01_1 = calculateVarianceComponent(V01_1, auc1, n_pos);
            const S10_2 = calculateVarianceComponent(V10_2, auc2, n_neg);
            const S01_2 = calculateVarianceComponent(V01_2, auc2, n_pos);

            const calculateCovarianceComponent = (V_X_arr, V_Y_arr, meanX, meanY, n_other) => {
                if (n_other === 0 || !Array.isArray(V_X_arr) || !Array.isArray(V_Y_arr) || V_X_arr.some(isNaN) || V_Y_arr.some(isNaN) || V_X_arr.length < 2 || V_X_arr.length !== V_Y_arr.length) return NaN;
                 let sumProdDiff = 0;
                 for (let i_dl = 0; i_dl < V_X_arr.length; i_dl++) sumProdDiff += (V_X_arr[i_dl] - meanX) * (V_Y_arr[i_dl] - meanY);
                 return sumProdDiff / (V_X_arr.length - 1);
            };

            const Cov10 = calculateCovarianceComponent(V10_1, V10_2, auc1, auc2, n_neg);
            const Cov01 = calculateCovarianceComponent(V01_1, V01_2, auc1, auc2, n_pos);

            if ([S10_1, S01_1, S10_2, S01_2, Cov10, Cov01].some(isNaN)) {
                return { ...defaultReturn, diffAUC: auc1 - auc2, method: "DeLong Test (Variance/Covariance NaN)" };
            }

            const varDiff = (S10_1 / n_pos) + (S01_1 / n_neg) + (S10_2 / n_pos) + (S01_2 / n_neg) - 2 * ((Cov10 / n_pos) + (Cov01 / n_neg));

            if (isNaN(varDiff) || varDiff <= 1e-12) {
                const pVal = (Math.abs(auc1 - auc2) < 1e-9) ? 1.0 : NaN;
                return { pValue: pVal, Z: (pVal === 1.0 ? 0 : NaN), diffAUC: auc1 - auc2, method: "DeLong Test (Near Zero/Zero Variance of Difference)" };
            }
            const seDiff = Math.sqrt(varDiff);
            const z_dl = (auc1 - auc2) / seDiff;
            if (isNaN(z_dl) || !isFinite(z_dl)) return { ...defaultReturn, diffAUC: auc1 - auc2, method: "DeLong Test (Z Calculation Error)" };

            const pValue = 2.0 * normalCDF(-Math.abs(z_dl));
            return { pValue: Math.max(0.0, Math.min(1.0, pValue)), Z: z_dl, diffAUC: auc1 - auc2, method: "DeLong Test" };
        } catch (error) {
            console.error("Error in DeLong Test:", error);
            return { ...defaultReturn, method: "DeLong Test (Execution Error)" };
        }
    }

    function calculateZTestForAUCComparison(auc1, se1, n1_z, auc2, se2, n2_z) {
        const defaultReturn = { pValue: NaN, Z: NaN, method: "Z-Test (AUC - Independent Samples, Invalid Input)" };
        if (auc1 === null || auc2 === null || se1 === null || se2 === null || isNaN(auc1) || isNaN(auc2) || isNaN(se1) || isNaN(se2) || isNaN(n1_z) || isNaN(n2_z) || se1 < 0 || se2 < 0 || n1_z < 2 || n2_z < 2) return defaultReturn;

        const var1 = se1 * se1;
        const var2 = se2 * se2;
        const varDiff = var1 + var2;

        if (isNaN(varDiff) || varDiff < 0) return { ...defaultReturn, method: "Z-Test (AUC - Independent Samples, Variance Error)" };
        if (varDiff <= 1e-12) {
            const pVal = (Math.abs(auc1 - auc2) < 1e-9) ? 1.0 : NaN;
            return { pValue: pVal, Z: (pVal === 1.0 ? 0 : NaN), method: "Z-Test (AUC - Independent Samples, Near Zero/Zero Variance)" };
        }

        const seDiff = Math.sqrt(varDiff);
        const z_auc = (auc1 - auc2) / seDiff;
        if (isNaN(z_auc) || !isFinite(z_auc)) return { ...defaultReturn, method: "Z-Test (AUC - Independent Samples, Z Calculation Error)" };

        const pValue = 2.0 * (1.0 - normalCDF(Math.abs(z_auc)));
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), Z: z_auc, method: "Z-Test (AUC - Independent Samples)" };
    }

    function calculateConfusionMatrix(data, predictionKey, referenceKey) {
        let rp = 0, fp = 0, fn = 0, rn = 0;
        if (!Array.isArray(data)) return { rp, fp, fn, rn };

        data.forEach(p_cm => {
            if (p_cm && typeof p_cm === 'object') {
                const predicted = p_cm[predictionKey] === '+';
                const actual = p_cm[referenceKey] === '+';
                const validPred = p_cm[predictionKey] === '+' || p_cm[predictionKey] === '-';
                const validActual = p_cm[referenceKey] === '+' || p_cm[referenceKey] === '-';

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

    function calculatePhi(a_phi, b_phi, c_phi, d_phi) {
        if (isNaN(a_phi) || isNaN(b_phi) || isNaN(c_phi) || isNaN(d_phi) || a_phi < 0 || b_phi < 0 || c_phi < 0 || d_phi < 0) return NaN;
        const n_phi = a_phi + b_phi + c_phi + d_phi;
        if (n_phi === 0) return NaN;

        const row1 = a_phi + b_phi, row2 = c_phi + d_phi, col1 = a_phi + c_phi, col2 = b_phi + d_phi;
        const denominator = Math.sqrt(row1 * row2 * col1 * col2);
        if (denominator === 0 || isNaN(denominator)) return NaN;

        const phi = (a_phi * d_phi - b_phi * c_phi) / denominator;
        return isFinite(phi) ? phi : NaN;
    }

    function calculateDiagnosticPerformance(data, predictionKey, referenceKey) {
        if (!Array.isArray(data) || data.length === 0) {
             console.warn(`calculateDiagnosticPerformance: Keine oder ungültige Daten für ${predictionKey} vs ${referenceKey}.`);
             return null;
        }
        const matrix = calculateConfusionMatrix(data, predictionKey, referenceKey);
        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        const nullMetric = { value: NaN, ci: null, method: null, se: NaN, n_success: NaN, n_trials: NaN, matrix_components: null };

        if (total === 0) return { matrix, sens: nullMetric, spez: nullMetric, ppv: nullMetric, npv: nullMetric, acc: nullMetric, balAcc: nullMetric, f1: nullMetric, auc: nullMetric, lrPlus: nullMetric, lrMinus: nullMetric };

        const sens_val = (rp + fn) > 0 ? rp / (rp + fn) : ((rp === 0 && fn === 0) ? NaN : 0) ;
        const spez_val = (fp + rn) > 0 ? rn / (fp + rn) : ((fp === 0 && rn === 0) ? NaN : 0) ;
        const ppv_val = (rp + fp) > 0 ? rp / (rp + fp) : ((rp === 0 && fp === 0) ? NaN : 0) ;
        const npv_val = (fn + rn) > 0 ? rn / (fn + rn) : ((fn === 0 && rn === 0) ? NaN : 0) ;
        const acc_val = total > 0 ? (rp + rn) / total : NaN;
        const balAcc_val = (!isNaN(sens_val) && !isNaN(spez_val)) ? (sens_val + spez_val) / 2.0 : NaN;
        const f1_val = (!isNaN(ppv_val) && !isNaN(sens_val) && (ppv_val + sens_val) > 1e-9) ? 2.0 * (ppv_val * sens_val) / (ppv_val + sens_val) : ((ppv_val === 0 && sens_val === 0) ? 0 : NaN);
        const auc_val = balAcc_val;

        const lrPlus_val = (!isNaN(sens_val) && !isNaN(spez_val) && spez_val !== 1) ? sens_val / (1 - spez_val) : NaN;
        const lrMinus_val = (!isNaN(sens_val) && !isNaN(spez_val) && spez_val !== 0) ? (1 - sens_val) / spez_val : NaN;


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

        const bootstrapStatFnFactory = (pKey, rKey, metric) => (sample) => {
            const m = calculateConfusionMatrix(sample, pKey, rKey);
            const t_boot = m.rp + m.fp + m.fn + m.rn;
            if (t_boot === 0) return NaN;
            const se_b = (m.rp + m.fn) > 0 ? m.rp / (m.rp + m.fn) : ((m.rp === 0 && m.fn === 0) ? NaN : 0);
            const sp_b = (m.fp + m.rn) > 0 ? m.rn / (m.fp + m.rn) : ((m.fp === 0 && m.rn === 0) ? NaN : 0);

            if (isNaN(se_b) || isNaN(sp_b)) return NaN;

            if (metric === 'balAcc' || metric === 'auc') return (se_b + sp_b) / 2.0;
            if (metric === 'f1') {
                const pv_b = (m.rp + m.fp) > 0 ? m.rp / (m.rp + m.fp) : ((m.rp === 0 && m.fp === 0) ? NaN : 0);
                return (isNaN(pv_b) || (pv_b + se_b) <= 1e-9) ? ((pv_b === 0 && se_b === 0) ? 0 : NaN) : 2.0 * (pv_b * se_b) / (pv_b + se_b);
            }
            if (metric === 'lrPlus') return (sp_b !== 1) ? se_b / (1 - sp_b) : NaN;
            if (metric === 'lrMinus') return (sp_b !== 0) ? (1 - se_b) / sp_b : NaN;
            return NaN;
        };

        const balAccBootCIResult = !isNaN(balAcc_val) ? bootstrapCI(data, bootstrapStatFnFactory(predictionKey, referenceKey, 'balAcc')) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        const f1BootCIResult = !isNaN(f1_val) ? bootstrapCI(data, bootstrapStatFnFactory(predictionKey, referenceKey, 'f1')) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        const aucBootCIResult = balAccBootCIResult;
        const lrPlusBootCIResult = !isNaN(lrPlus_val) && isFinite(lrPlus_val) ? bootstrapCI(data, bootstrapStatFnFactory(predictionKey, referenceKey, 'lrPlus'), undefined, undefined, APP_CONFIG.STATISTICAL_CONSTANTS.LIKELIHOOD_RATIO_CI_METHOD) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.LIKELIHOOD_RATIO_CI_METHOD, se: NaN };
        const lrMinusBootCIResult = !isNaN(lrMinus_val) && isFinite(lrMinus_val) ? bootstrapCI(data, bootstrapStatFnFactory(predictionKey, referenceKey, 'lrMinus'), undefined, undefined, APP_CONFIG.STATISTICAL_CONSTANTS.LIKELIHOOD_RATIO_CI_METHOD) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.LIKELIHOOD_RATIO_CI_METHOD, se: NaN };
        
        const matrixComponentsForBootstrap = { rp, fp, fn, rn, total };

        return {
            matrix,
            sens: { value: sens_val, ci: { lower: sensCIResult.lower, upper: sensCIResult.upper }, method: sensCIResult.method, se: NaN, n_success: rp, n_trials: n_sens, matrix_components: null },
            spez: { value: spez_val, ci: { lower: spezCIResult.lower, upper: spezCIResult.upper }, method: spezCIResult.method, se: NaN, n_success: rn, n_trials: n_spez, matrix_components: null },
            ppv: { value: ppv_val, ci: { lower: ppvCIResult.lower, upper: ppvCIResult.upper }, method: ppvCIResult.method, se: NaN, n_success: rp, n_trials: n_ppv, matrix_components: null },
            npv: { value: npv_val, ci: { lower: npvCIResult.lower, upper: npvCIResult.upper }, method: npvCIResult.method, se: NaN, n_success: rn, n_trials: n_npv, matrix_components: null },
            acc: { value: acc_val, ci: { lower: accCIResult.lower, upper: accCIResult.upper }, method: accCIResult.method, se: NaN, n_success: rp + rn, n_trials: n_acc, matrix_components: null },
            balAcc: { value: balAcc_val, ci: { lower: balAccBootCIResult.lower, upper: balAccBootCIResult.upper }, method: balAccBootCIResult.method, se: balAccBootCIResult.se, n_success: NaN, n_trials: NaN, matrix_components: matrixComponentsForBootstrap },
            f1: { value: f1_val, ci: { lower: f1BootCIResult.lower, upper: f1BootCIResult.upper }, method: f1BootCIResult.method, se: f1BootCIResult.se, n_success: NaN, n_trials: NaN, matrix_components: matrixComponentsForBootstrap },
            auc: { value: auc_val, ci: { lower: aucBootCIResult.lower, upper: aucBootCIResult.upper }, method: aucBootCIResult.method, se: aucBootCIResult.se, n_success: NaN, n_trials: NaN, matrix_components: matrixComponentsForBootstrap },
            lrPlus: { value: lrPlus_val, ci: { lower: lrPlusBootCIResult.lower, upper: lrPlusBootCIResult.upper }, method: lrPlusBootCIResult.method, se: lrPlusBootCIResult.se, n_success: NaN, n_trials: NaN, matrix_components: matrixComponentsForBootstrap },
            lrMinus: { value: lrMinus_val, ci: { lower: lrMinusBootCIResult.lower, upper: lrMinusBootCIResult.upper }, method: lrMinusBootCIResult.method, se: lrMinusBootCIResult.se, n_success: NaN, n_trials: NaN, matrix_components: matrixComponentsForBootstrap }
        };
    }

    function bootstrapCIDifference(data1, data2, statFn1, statFn2, nBoot = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA, isPaired = false) {
        const defaultReturn = { value: NaN, lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_DIFFERENCE, se: NaN };
        if (!Array.isArray(data1) || !statFn1 || (isPaired && (!Array.isArray(data2) || data1.length !== data2.length)) || (!isPaired && !Array.isArray(data2))) {
            return defaultReturn;
        }

        const n1_bcd = data1.length;
        const n2_bcd = isPaired ? 0 : data2.length;
        const bootDiffs = [];
        let sum = 0, sumSq = 0, validCount = 0;

        for (let i = 0; i < nBoot; i++) {
            let bootSample1, bootSample2;
            if (isPaired) {
                bootSample1 = new Array(n1_bcd);
                bootSample2 = new Array(n1_bcd);
                for (let j = 0; j < n1_bcd; j++) {
                    const randomIndex = Math.floor(Math.random() * n1_bcd);
                    bootSample1[j] = data1[randomIndex];
                    bootSample2[j] = data2[randomIndex];
                }
            } else {
                bootSample1 = new Array(n1_bcd);
                for (let j = 0; j < n1_bcd; j++) bootSample1[j] = data1[Math.floor(Math.random() * n1_bcd)];
                bootSample2 = new Array(n2_bcd);
                for (let j = 0; j < n2_bcd; j++) bootSample2[j] = data2[Math.floor(Math.random() * n2_bcd)];
            }

            try {
                const stat1 = statFn1(bootSample1);
                const stat2 = statFn2(bootSample2);
                if (isFinite(stat1) && isFinite(stat2) && !isNaN(stat1) && !isNaN(stat2)) {
                    const diff = stat1 - stat2;
                    bootDiffs.push(diff);
                    sum += diff;
                    sumSq += diff * diff;
                    validCount++;
                }
            } catch (e) { console.warn("Bootstrap CI Difference Iteration failed:", e); }
        }

        if (validCount < Math.max(10, nBoot * 0.1)) return defaultReturn;
        bootDiffs.sort((a_bsd, b_bsd) => a_bsd - b_bsd);

        const lowerIndex = Math.max(0, Math.min(validCount - 1, Math.floor(validCount * (alpha / 2.0))));
        const upperIndex = Math.max(0, Math.min(validCount - 1, Math.ceil(validCount * (1.0 - alpha / 2.0)) -1));
        if (lowerIndex > upperIndex || lowerIndex < 0 || upperIndex >= validCount) return defaultReturn;

        const meanDiff = sum / validCount;
        const variance = (validCount > 1) ? (sumSq - (sum * sum / validCount)) / (validCount -1) : NaN;
        const se = (variance >= 0 && !isNaN(variance)) ? Math.sqrt(variance) : NaN;
        const originalStat1 = statFn1(data1);
        const originalStat2 = statFn2(isPaired ? data2 : data2);
        const originalDiff = (isFinite(originalStat1) && isFinite(originalStat2)) ? originalStat1 - originalStat2 : NaN;

        return { value: originalDiff, lower: bootDiffs[lowerIndex], upper: bootDiffs[upperIndex], method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_DIFFERENCE, se: se };
    }


    function compareDiagnosticMethods(data, key1, key2, referenceKey) {
        const nullMetricDiff = { value: NaN, ci: null, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_DIFFERENCE };
        const nullReturn = {
            mcnemar: { pValue: NaN, statistic: NaN, df: NaN, method: "McNemar's Test (Nicht berechnet)" },
            delong: { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Nicht berechnet)" },
            diffSens: nullMetricDiff,
            diffSpez: nullMetricDiff
        };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return nullReturn;

        let b_cdm = 0, c_cdm = 0;
        data.forEach(p_cdm => {
            if (p_cdm && typeof p_cdm === 'object') {
                const p1_is_plus = p_cdm[key1] === '+';
                const p2_is_plus = p_cdm[key2] === '+';
                const valid_p1 = p_cdm[key1] === '+' || p_cdm[key1] === '-';
                const valid_p2 = p_cdm[key2] === '+' || p_cdm[key2] === '-';
                if (valid_p1 && valid_p2) {
                    if (p1_is_plus && !p2_is_plus) b_cdm++;
                    if (!p1_is_plus && p2_is_plus) c_cdm++;
                }
            }
        });
        const mcnemarResult = manualMcNemarTest(b_cdm, c_cdm);
        const delongResult = manualDeLongTest(data, key1, key2, referenceKey);

        const statFnSensFactory = (k, refK) => (d_fn) => calculateDiagnosticPerformance(d_fn, k, refK)?.sens.value;
        const statFnSpezFactory = (k, refK) => (d_fn) => calculateDiagnosticPerformance(d_fn, k, refK)?.spez.value;
        
        const diffSensCI = bootstrapCIDifference(data, data, statFnSensFactory(key1, referenceKey), statFnSensFactory(key2, referenceKey), undefined, undefined, true);
        const diffSpezCI = bootstrapCIDifference(data, data, statFnSpezFactory(key1, referenceKey), statFnSpezFactory(key2, referenceKey), undefined, undefined, true);


        return {
            mcnemar: mcnemarResult,
            delong: delongResult,
            diffSens: { value: diffSensCI.value, ci: { lower: diffSensCI.lower, upper: diffSensCI.upper }, method: diffSensCI.method },
            diffSpez: { value: diffSpezCI.value, ci: { lower: diffSpezCI.lower, upper: diffSpezCI.upper }, method: diffSpezCI.method }
        };
    }

    function calculateAssociations(data, t2Criteria) {
        const nullReturn = { testName: "N/A", pValue: NaN, statistic: NaN, or: { value: NaN, ci: null }, rd: { value: NaN, ci: null }, phi: { value: NaN, ci: null }, matrix: null, featureName: "N/A" };
        if (!Array.isArray(data) || data.length === 0 || !t2Criteria) return {};

        const results = {};
        const referenceKey = 'n';

        const matrixAS = calculateConfusionMatrix(data, 'as', referenceKey);
        const n_as_total = matrixAS.rp + matrixAS.fp + matrixAS.fn + matrixAS.rn;
        if (n_as_total > 0) {
            const fisherAS = manualFisherExactTest(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn);
            results.as = {
                matrix: matrixAS,
                testName: fisherAS.method,
                pValue: fisherAS.pValue,
                statistic: NaN,
                or: calculateORCI(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn),
                rd: calculateRDCI(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn),
                phi: { value: calculatePhi(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn), ci: null, method: 'Phi Coefficient' },
                featureName: 'AS Positiv'
            };
        } else {
            results.as = {...nullReturn, testName: "Fisher's Exact Test (Keine Daten)", featureName: 'AS Positiv'};
        }

        const sizesNplus = [], sizesNminus = [];
        data.forEach(p_assoc => {
            if (p_assoc && Array.isArray(p_assoc.lymphknoten_t2)) {
                const validN = p_assoc[referenceKey] === '+' || p_assoc[referenceKey] === '-';
                if (!validN) return;
                const isNPos = p_assoc[referenceKey] === '+';
                p_assoc.lymphknoten_t2.forEach(lk_assoc => {
                    if (lk_assoc && typeof lk_assoc.groesse === 'number' && !isNaN(lk_assoc.groesse) && isFinite(lk_assoc.groesse)) {
                        if (isNPos) sizesNplus.push(lk_assoc.groesse); else sizesNminus.push(lk_assoc.groesse);
                    }
                });
            }
        });
        if (sizesNplus.length > 0 && sizesNminus.length > 0) {
            const mwuResult = manualMannWhitneyUTest(sizesNplus, sizesNminus);
            results.size_mwu = {
                pValue: mwuResult.pValue,
                statistic: mwuResult.U,
                testName: mwuResult.testName, Z: mwuResult.Z,
                or: null, rd: null, phi: null, matrix: null,
                featureName: 'LK Größe (Median Vgl.)'
            };
        } else {
            results.size_mwu = { ...nullReturn, testName: "Mann-Whitney U (Nicht genug Daten)", featureName: 'LK Größe (Median Vgl.)' };
        }

        const t2Features = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        t2Features.forEach(featureKey => {
            let featureValue = null, threshold = null, condition = '>=';
            let featureNameForDisplay = `T2: ${featureKey}`;

            if (t2Criteria[featureKey]) {
                if (featureKey === 'size') {
                    threshold = t2Criteria[featureKey].threshold;
                    condition = t2Criteria[featureKey].condition || '>=';
                    if (threshold !== null && !isNaN(threshold)) {
                        featureNameForDisplay = `T2 Größe ${condition}${formatNumber(threshold, 1)}`;
                    }
                } else {
                    featureValue = t2Criteria[featureKey].value;
                    if (featureValue) {
                         featureNameForDisplay = `T2 ${featureKey}=${featureValue}`;
                    }
                }
            }

            if ((featureKey !== 'size' && !featureValue) || (featureKey === 'size' && (threshold === null || threshold === undefined || isNaN(threshold)))) {
                results[featureKey] = { ...nullReturn, testName: `T2 Merkmal '${featureKey}' nicht (spezifisch genug) definiert für Assoziationstest`, featureName: featureNameForDisplay };
                return;
            }

            let a_t2 = 0, b_t2 = 0, c_t2 = 0, d_t2 = 0;
            data.forEach(p_assoc2 => {
                const validN = p_assoc2?.[referenceKey] === '+' || p_assoc2?.[referenceKey] === '-';
                if (!validN || !Array.isArray(p_assoc2.lymphknoten_t2)) return;
                const actualN_is_Positive = p_assoc2[referenceKey] === '+';
                let patientHasFeature = false;

                if (featureKey === 'size') {
                    patientHasFeature = p_assoc2.lymphknoten_t2.some(lk_assoc2 => {
                        if (lk_assoc2 && typeof lk_assoc2.groesse === 'number' && !isNaN(lk_assoc2.groesse)) {
                            switch(condition) {
                                case '>=': return lk_assoc2.groesse >= threshold;
                                case '>': return lk_assoc2.groesse > threshold;
                                case '<=': return lk_assoc2.groesse <= threshold;
                                case '<': return lk_assoc2.groesse < threshold;
                                case '==': return lk_assoc2.groesse === threshold;
                                default: return false;
                            }
                        }
                        return false;
                    });
                } else {
                    patientHasFeature = p_assoc2.lymphknoten_t2.some(lk_assoc2 => lk_assoc2 && lk_assoc2[featureKey] === featureValue);
                }

                if (patientHasFeature && actualN_is_Positive) a_t2++;
                else if (patientHasFeature && !actualN_is_Positive) b_t2++;
                else if (!patientHasFeature && actualN_is_Positive) c_t2++;
                else if (!patientHasFeature && !actualN_is_Positive) d_t2++;
            });

            const n_feature_total = a_t2 + b_t2 + c_t2 + d_t2;
            if (n_feature_total > 0) {
                const fisherFeature = manualFisherExactTest(a_t2, b_t2, c_t2, d_t2);
                results[featureKey] = {
                    matrix: { rp: a_t2, fp: b_t2, fn: c_t2, rn: d_t2 },
                    testName: fisherFeature.method,
                    pValue: fisherFeature.pValue,
                    statistic: NaN,
                    or: calculateORCI(a_t2, b_t2, c_t2, d_t2),
                    rd: calculateRDCI(a_t2, b_t2, c_t2, d_t2),
                    phi: { value: calculatePhi(a_t2, b_t2, c_t2, d_t2), ci: null, method: 'Phi Coefficient' },
                    featureName: featureNameForDisplay
                };
            } else {
                results[featureKey] = { ...nullReturn, testName: `Fisher's Exact Test (Keine Daten für T2-${featureKey})`, featureName: featureNameForDisplay };
            }
        });
        return results;
    }

    function compareCohorts(data1, data2, t2Criteria, t2Logic) {
        const nullComp = { pValue: NaN, testName: "N/A", Z: NaN, statistic: NaN };
        const nullMetricDiff = { value: NaN, ci: null, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_DIFFERENCE, se: NaN };
        const defaultReturn = {
            accuracyComparison: { as: { ...nullComp }, t2: { ...nullComp } },
            aucComparison: { as: { ...nullComp, diffAUC: NaN }, t2: { ...nullComp, diffAUC: NaN } },
            sensComparisonAS: nullMetricDiff, spezComparisonAS: nullMetricDiff,
            sensComparisonT2: nullMetricDiff, spezComparisonT2: nullMetricDiff
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
        const accCompASResult = manualFisherExactTest(matrix1AS.rp + matrix1AS.rn, matrix1AS.fp + matrix1AS.fn, matrix2AS.rp + matrix2AS.rn, matrix2AS.fp + matrix2AS.fn);

        let accCompT2Result = { pValue: NaN, method: "T2 nicht ausgewertet oder Kriterien ungültig"};
        if (t2Evaluated) {
            const matrix1T2 = calculateConfusionMatrix(evaluatedData1, 't2', 'n');
            const matrix2T2 = calculateConfusionMatrix(evaluatedData2, 't2', 'n');
            accCompT2Result = manualFisherExactTest(matrix1T2.rp + matrix1T2.rn, matrix1T2.fp + matrix1T2.fn, matrix2T2.rp + matrix2T2.rn, matrix2T2.fp + matrix2T2.fn);
        }

        const guete1AS = calculateDiagnosticPerformance(data1, 'as', 'n');
        const guete2AS = calculateDiagnosticPerformance(data2, 'as', 'n');
        const aucCompASResult = calculateZTestForAUCComparison(guete1AS?.auc?.value, guete1AS?.auc?.se, data1.length, guete2AS?.auc?.value, guete2AS?.auc?.se, data2.length);
        
        const statFnSensFactoryUnpaired = (predKey, refKey) => (sampleData) => calculateDiagnosticPerformance(sampleData, predKey, refKey)?.sens?.value;
        const statFnSpezFactoryUnpaired = (predKey, refKey) => (sampleData) => calculateDiagnosticPerformance(sampleData, predKey, refKey)?.spez?.value;

        const diffSensAS_CI = bootstrapCIDifference(data1, data2, statFnSensFactoryUnpaired('as', 'n'), statFnSensFactoryUnpaired('as', 'n'), undefined, undefined, false);
        const diffSpezAS_CI = bootstrapCIDifference(data1, data2, statFnSpezFactoryUnpaired('as', 'n'), statFnSpezFactoryUnpaired('as', 'n'), undefined, undefined, false);

        let aucCompT2Result = { pValue: NaN, Z: NaN, method: "Z-Test (AUC - T2 nicht ausgewertet oder Kriterien ungültig)" };
        let diffSensT2_CI = { ...nullMetricDiff, method: "T2 nicht ausgewertet" };
        let diffSpezT2_CI = { ...nullMetricDiff, method: "T2 nicht ausgewertet" };
        let diffAUC_T2 = NaN;

        if (t2Evaluated) {
            const guete1T2 = calculateDiagnosticPerformance(evaluatedData1, 't2', 'n');
            const guete2T2 = calculateDiagnosticPerformance(evaluatedData2, 't2', 'n');
            aucCompT2Result = calculateZTestForAUCComparison(guete1T2?.auc?.value, guete1T2?.auc?.se, evaluatedData1.length, guete2T2?.auc?.value, guete2T2?.auc?.se, evaluatedData2.length);
            diffAUC_T2 = (guete1T2?.auc?.value ?? NaN) - (guete2T2?.auc?.value ?? NaN);
            diffSensT2_CI = bootstrapCIDifference(evaluatedData1, evaluatedData2, statFnSensFactoryUnpaired('t2', 'n'), statFnSensFactoryUnpaired('t2', 'n'), undefined, undefined, false);
            diffSpezT2_CI = bootstrapCIDifference(evaluatedData1, evaluatedData2, statFnSpezFactoryUnpaired('t2', 'n'), statFnSpezFactoryUnpaired('t2', 'n'), undefined, undefined, false);
        }

        return {
            accuracyComparison: {
                as: { pValue: accCompASResult.pValue, testName: accCompASResult.method + " (Accuracy)", Z: NaN, statistic: NaN },
                t2: { pValue: accCompT2Result.pValue, testName: accCompT2Result.method + " (Accuracy)", Z: NaN, statistic: NaN }
            },
            aucComparison: {
                as: { ...aucCompASResult, diffAUC: (guete1AS?.auc?.value ?? NaN) - (guete2AS?.auc?.value ?? NaN), statistic: NaN },
                t2: { ...aucCompT2Result, diffAUC: diffAUC_T2, statistic: NaN }
            },
            sensComparisonAS: { value: diffSensAS_CI.value, ci: {lower: diffSensAS_CI.lower, upper: diffSensAS_CI.upper}, method: diffSensAS_CI.method, se: diffSensAS_CI.se },
            spezComparisonAS: { value: diffSpezAS_CI.value, ci: {lower: diffSpezAS_CI.lower, upper: diffSpezAS_CI.upper}, method: diffSpezAS_CI.method, se: diffSpezAS_CI.se },
            sensComparisonT2: { value: diffSensT2_CI.value, ci: {lower: diffSensT2_CI.lower, upper: diffSensT2_CI.upper}, method: diffSensT2_CI.method, se: diffSensT2_CI.se },
            spezComparisonT2: { value: diffSpezT2_CI.value, ci: {lower: diffSpezT2_CI.lower, upper: diffSpezT2_CI.upper}, method: diffSpezT2_CI.method, se: diffSpezT2_CI.se }
        };
    }

    function calculateDescriptiveStats(data) {
        const n_ds = data?.length ?? 0;
        const nullMetric = { median: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN, n: 0 };
        const nullReturn = { anzahlPatienten: 0, alter: nullMetric, geschlecht: { m: 0, f: 0, unbekannt: 0 }, therapie: { 'direkt OP': 0, 'nRCT': 0, unbekannt: 0 }, nStatus: { plus: 0, minus: 0, unbekannt: 0 }, asStatus: { plus: 0, minus: 0, unbekannt: 0 }, t2Status: { plus: 0, minus: 0, unbekannt: 0 }, lkAnzahlen: null, alterData: [] };

        if (!Array.isArray(data) || n_ds === 0) return nullReturn;

        const alterData = data.map(p_ds => p_ds?.alter).filter(a_ds => a_ds !== null && a_ds !== undefined && !isNaN(a_ds) && isFinite(a_ds)).sort((a_ds1, b_ds1) => a_ds1 - b_ds1);
        const geschlecht = data.reduce((acc, p_ds) => { const key = (p_ds?.geschlecht === 'm' || p_ds?.geschlecht === 'f') ? p_ds.geschlecht : 'unbekannt'; acc[key] = (acc[key] || 0) + 1; return acc; }, { m: 0, f: 0, unbekannt: 0 });
        const therapie = data.reduce((acc, p_ds) => { const key = p_ds?.therapie === 'direkt OP' ? 'direkt OP' : (p_ds?.therapie === 'nRCT' ? 'nRCT' : 'unbekannt'); acc[key] = (acc[key] || 0) + 1; return acc; }, { 'direkt OP': 0, 'nRCT': 0, unbekannt: 0 });

        const statusReducer = (key) => data.reduce((acc, p_ds) => { const status = p_ds?.[key]; if (status === '+') acc.plus++; else if (status === '-') acc.minus++; else acc.unbekannt++; return acc; }, { plus: 0, minus: 0, unbekannt: 0 });
        const nStatus = statusReducer('n');
        const asStatus = statusReducer('as');
        const t2Status = statusReducer('t2');

        const getLKStats = (keyTotal, keyPlus = null, statusKeyForPlusCount = null) => {
            const getCounts = (arr, prop) => arr.map(p_lk => p_lk?.[prop]).filter(c_lk => c_lk !== null && c_lk !== undefined && !isNaN(c_lk) && isFinite(c_lk) && c_lk >= 0);
            const totalCounts = getCounts(data, keyTotal).sort((a_lk, b_lk) => a_lk - b_lk);
            let plusCounts = [];
            if (keyPlus && statusKeyForPlusCount) {
                plusCounts = getCounts(data.filter(p_lk => p_lk?.[statusKeyForPlusCount] === '+'), keyPlus).sort((a_lk, b_lk) => a_lk - b_lk);
            }
            const getStatsFromCounts = (counts) => counts.length === 0 ? { ...nullMetric, n: 0 } : { median: getMedian(counts), min: counts[0], max: counts[counts.length - 1], mean: getMean(counts), sd: getStdDev(counts), n: counts.length };
            return { total: getStatsFromCounts(totalCounts), plus: (keyPlus && statusKeyForPlusCount) ? getStatsFromCounts(plusCounts) : { ...nullMetric, n: 0 } };
        };

        const lkAnzahlen = {
            n: getLKStats('anzahl_patho_lk', 'anzahl_patho_n_plus_lk', 'n'),
            as: getLKStats('anzahl_as_lk', 'anzahl_as_plus_lk', 'as'),
            t2: getLKStats('anzahl_t2_lk', 'anzahl_t2_plus_lk', 't2')
        };
        const alterStats = alterData.length > 0 ? { median: getMedian(alterData), mean: getMean(alterData), sd: getStdDev(alterData), min: alterData[0], max: alterData[alterData.length - 1], n: alterData.length } : nullMetric;

        return { anzahlPatienten: n_ds, alter: alterStats, geschlecht: geschlecht, therapie: therapie, nStatus: nStatus, asStatus: asStatus, t2Status: t2Status, lkAnzahlen: lkAnzahlen, alterData: alterData };
    }

     function calculateAllStatsForPublication(data, appliedT2Criteria, appliedT2Logic, bruteForceResultsPerKollektiv) {
        if (!data || !Array.isArray(data)) {
             console.error("calculateAllStatsForPublication: Ungültige Eingabedaten.");
             return null;
        }
        if (!appliedT2Criteria || !appliedT2Logic) {
            console.error("calculateAllStatsForPublication: Angewandte T2 Kriterien oder Logik fehlen.");
            return null;
        }

        const results = {
            Gesamt: {},
            'direkt OP': {},
            nRCT: {}
        };
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const emptyStatsResult = { deskriptiv: null, gueteAS: null, gueteT2_angewandt: null, vergleichASvsT2_angewandt: null, assoziation_angewandt: null, gueteT2_literatur: {}, vergleichASvsT2_literatur: {}, gueteT2_bruteforce: null, vergleichASvsT2_bruteforce: null, bruteforce_definition: null };


        kollektive.forEach(kollektivId => {
            results[kollektivId] = cloneDeep(emptyStatsResult);
            try {
                const filteredData = dataProcessor.filterDataByKollektiv(data, kollektivId);
                if (filteredData.length === 0) {
                    console.warn(`calculateAllStatsForPublication: Keine Daten für Kollektiv '${kollektivId}'.`);
                    results[kollektivId].deskriptiv = calculateDescriptiveStats(filteredData); // Returns a valid empty structure
                    return;
                }

                const evaluatedDataApplied = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), appliedT2Criteria, appliedT2Logic);

                results[kollektivId].deskriptiv = calculateDescriptiveStats(filteredData);
                results[kollektivId].gueteAS = calculateDiagnosticPerformance(evaluatedDataApplied, 'as', 'n');
                results[kollektivId].gueteT2_angewandt = calculateDiagnosticPerformance(evaluatedDataApplied, 't2', 'n');
                results[kollektivId].vergleichASvsT2_angewandt = compareDiagnosticMethods(evaluatedDataApplied, 'as', 't2', 'n');
                results[kollektivId].assoziation_angewandt = calculateAssociations(evaluatedDataApplied, appliedT2Criteria);

                results[kollektivId].gueteT2_literatur = {};
                PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySetConf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studySetConf.id);
                    if (studySet) {
                        let isApplicable = true;
                        if (studySet.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt' && studySet.applicableKollektiv !== kollektivId) {
                            isApplicable = false;
                        }

                        if (isApplicable) {
                            const evaluatedDataStudy = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet);
                            results[kollektivId].gueteT2_literatur[studySetConf.id] = calculateDiagnosticPerformance(evaluatedDataStudy, 't2', 'n');
                            results[kollektivId][`vergleichASvsT2_literatur_${studySetConf.id}`] = compareDiagnosticMethods(evaluatedDataStudy, 'as', 't2', 'n');
                        } else {
                            results[kollektivId].gueteT2_literatur[studySetConf.id] = null;
                            results[kollektivId][`vergleichASvsT2_literatur_${studySetConf.id}`] = null;
                        }
                    }
                });

                const bfResultForKollektiv = bruteForceResultsPerKollektiv?.[kollektivId];
                if (bfResultForKollektiv && bfResultForKollektiv.bestResult && bfResultForKollektiv.bestResult.criteria) {
                    const bfCriteria = bfResultForKollektiv.bestResult.criteria;
                    const bfLogic = bfResultForKollektiv.bestResult.logic;
                    const evaluatedDataBF = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), bfCriteria, bfLogic);
                    results[kollektivId].gueteT2_bruteforce = calculateDiagnosticPerformance(evaluatedDataBF, 't2', 'n');
                    results[kollektivId].vergleichASvsT2_bruteforce = compareDiagnosticMethods(evaluatedDataBF, 'as', 't2', 'n');
                    results[kollektivId].bruteforce_definition = { criteria: bfCriteria, logic: bfLogic, metricValue: bfResultForKollektiv.bestResult.metricValue, metricName: bfResultForKollektiv.metric };
                } else {
                    results[kollektivId].gueteT2_bruteforce = null;
                    results[kollektivId].vergleichASvsT2_bruteforce = null;
                    results[kollektivId].bruteforce_definition = null;
                }
            } catch (err) {
                console.error(`Fehler bei der Statistikberechnung für Kollektiv ${kollektivId}:`, err);
                results[kollektivId] = cloneDeep(emptyStatsResult); 
                 if(results[kollektivId].deskriptiv === null) results[kollektivId].deskriptiv = calculateDescriptiveStats([]);
            }
        });
        return results;
     }


    return Object.freeze({
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateAssociations,
        compareCohorts,
        calculateDescriptiveStats,
        calculateAllStatsForPublication,
        bootstrapCI,
        bootstrapCIDifference
    });

})();
