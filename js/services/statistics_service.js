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

    function getQuartile(arr, q) {
        if (!Array.isArray(arr) || arr.length === 0 || q < 0 || q > 1) return NaN;
        const sortedArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x)).sort((a, b) => a - b);
        if (sortedArr.length === 0) return NaN;
        const pos = (sortedArr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sortedArr[base + 1] !== undefined) {
            return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
        } else {
            return sortedArr[base];
        }
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
        
        const p_hat = successes / trials;
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        
        if (!isFinite(z)) return defaultReturn;

        const z2 = z * z;
        const denominator = 1.0 + z2 / trials;
        
        // Handle cases where denominator might be zero due to tiny trials, though z2/trials should usually prevent this.
        if (denominator === 0) return defaultReturn; 

        const lower = (p_hat + z2 / (2.0 * trials) - z * Math.sqrt((p_hat * (1.0 - p_hat) / trials) + (z2 / (4.0 * trials * trials)))) / denominator;
        const upper = (p_hat + z2 / (2.0 * trials) + z * Math.sqrt((p_hat * (1.0 - p_hat) / trials) + (z2 / (4.0 * trials * trials)))) / denominator;
        
        return { lower: Math.max(0.0, lower), upper: Math.min(1.0, upper), method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
    }

    function calculateORCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Woolf Logit (Adjusted)' };
        
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;

        // Add 0.5 to all cells for Haldane-Anscombe correction if any cell is zero
        const a_adj = (a === 0 || b === 0 || c === 0 || d === 0) ? a + 0.5 : a;
        const b_adj = (a === 0 || b === 0 || c === 0 || d === 0) ? b + 0.5 : b;
        const c_adj = (a === 0 || b === 0 || c === 0 || d === 0) ? c + 0.5 : c;
        const d_adj = (a === 0 || b === 0 || c === 0 || d === 0) ? d + 0.5 : d;

        const or_raw = (b * c === 0) ? ((a > 0 && d > 0) ? Infinity : NaN) : (a * d) / (b * c);
        const or_adj = (b_adj * c_adj === 0) ? NaN : (a_adj * d_adj) / (b_adj * c_adj);

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
        
        if (n1 === 0 && n2 === 0) return defaultReturn; // No data in either group
        if (n1 === 0) return { ...defaultReturn, value: c / n2 - 0, ci: null }; // Only group 2 has data, RD is -p2
        if (n2 === 0) return { ...defaultReturn, value: a / n1 - 0, ci: null }; // Only group 1 has data, RD is p1

        const p1 = a / n1;
        const p2 = c / n2;
        const rd = p1 - p2;

        const varP1 = (p1 * (1.0 - p1)) / n1;
        const varP2 = (p2 * (1.0 - p2)) / n2;
        
        // Handle cases where variance is NaN due to n=0 for a specific group
        if (isNaN(varP1) && isNaN(varP2)) return { ...defaultReturn, value: rd };
        if (isNaN(varP1)) return { ...defaultReturn, value: rd };
        if (isNaN(varP2)) return { ...defaultReturn, value: rd };

        const seRD = Math.sqrt(varP1 + varP2);
        
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));

        if (!isFinite(z) || isNaN(seRD) || seRD <= 0 || !isFinite(seRD)) return { ...defaultReturn, value: rd };
        
        const lower = rd - z * seRD;
        const upper = rd + z * seRD;
        
        return { value: rd, ci: { lower: Math.max(-1.0, lower), upper: Math.min(1.0, upper) }, method: 'Wald' };
    }

    function bootstrapCI(data, statisticFn, nBoot = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        if (!Array.isArray(data) || data.length < 2 || typeof statisticFn !== 'function' || isNaN(nBoot) || nBoot <= 0 || isNaN(alpha) || alpha <= 0 || alpha >= 1) return defaultReturn;

        const n = data.length;
        const bootStats = [];
        let sum = 0, sumSq = 0, validCount = 0;

        for (let i = 0; i < nBoot; i++) {
            const bootSample = new Array(n);
            for (let j = 0; j < n; j++) bootSample[j] = data[Math.floor(Math.random() * n)];
            try {
                 const stat = statisticFn(bootSample);
                 if (stat !== null && stat !== undefined && isFinite(stat) && !isNaN(stat)) {
                    bootStats.push(stat);
                    sum += stat;
                    sumSq += stat * stat;
                    validCount++;
                 }
            } catch (e) { }
        }

        if (validCount < Math.max(2, nBoot * 0.05)) return defaultReturn; // Mindestens 2 valide Bootstrap-Stichproben oder 5% von nBoot
        bootStats.sort((a, b) => a - b);

        const lowerIndex = Math.floor(validCount * (alpha / 2.0));
        const upperIndex = Math.ceil(validCount * (1.0 - alpha / 2.0)) - 1;

        if (lowerIndex > upperIndex || lowerIndex < 0 || upperIndex >= validCount) return defaultReturn;

        const meanStat = sum / validCount;
        const variance = (validCount > 1) ? (sumSq - (sum * sum / validCount)) / (validCount -1) : NaN;
        const se = (variance >= 0 && !isNaN(variance)) ? Math.sqrt(variance) : NaN;

        return { lower: bootStats[lowerIndex], upper: bootStats[upperIndex], method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: se };
    }

    function manualMcNemarTest(b, c) {
        if (isNaN(b) || isNaN(c) || b < 0 || c < 0) return { pValue: NaN, statistic: NaN, df: 1, method: "McNemar Test (Invalid Input)" };
        const n = b + c;
        if (n === 0) return { pValue: 1.0, statistic: 0, df: 1, method: "McNemar Test (No Discordance)" };

        const continuityCorrection = (n < APP_CONFIG.STATISTICAL_CONSTANTS.FISHER_EXACT_THRESHOLD * 4) ? 1 : 0; // Heuristik für Kontinuitätskorrektur
        let statistic;
        if (Math.abs(b - c) - continuityCorrection < 0) { // falls durch Korrektur negativ
            statistic = 0;
        } else {
            statistic = Math.pow(Math.abs(b - c) - continuityCorrection, 2) / n;
        }
        
        if (isNaN(statistic) || !isFinite(statistic) || statistic < 0) statistic = 0;

        const pValue = 1.0 - chiSquareCDF(statistic, 1);
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), statistic: statistic, df: 1, method: `McNemar Test${continuityCorrection > 0 ? ' (continuity corrected)' : ''}` };
    }

    function logProbHypergeometric(k, N_pop, K_success, n_draw) {
        if (k < 0 || n_draw < 0 || K_success < 0 || N_pop < 0 || k > n_draw || k > K_success || (n_draw - k) > (N_pop - K_success) || n_draw > N_pop) return -Infinity;
        if (k === 0 && (n_draw === 0 || K_success === 0)) return 0; // log(1)
        if (k === n_draw && k === K_success && n_draw === N_pop) return 0; // log(1)
        try {
            const logC_K_k = logFactorial(K_success) - logFactorial(k) - logFactorial(K_success - k);
            const logC_NK_nk = logFactorial(N_pop - K_success) - logFactorial(n_draw - k) - logFactorial((N_pop - K_success) - (n_draw - k));
            const logC_N_n = logFactorial(N_pop) - logFactorial(n_draw) - logFactorial(N_pop - n_draw);
            const result = logC_K_k + logC_NK_nk - logC_N_n;
            return isFinite(result) ? result : -Infinity;
        } catch (e) { return -Infinity; }
    }

    function manualFisherExactTest(a, b, c, d) {
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return { pValue: NaN, method: "Fisher's Exact Test (Invalid Input)" };
        const n1 = a + b; // row total 1
        const n2 = c + d; // row total 2
        const k1 = a + c; // col total 1
        const k2 = b + d; // col total 2
        const N = a + b + c + d; // grand total

        if (N === 0) return { pValue: 1.0, method: "Fisher's Exact Test (No Data)" };
        if (n1 === 0 || n2 === 0 || k1 === 0 || k2 === 0) return { pValue: 1.0, method: "Fisher's Exact Test (Zero Margin)" }; // If any marginal total is zero

        const pObservedLog = logProbHypergeometric(a, N, k1, n1);
        if (!isFinite(pObservedLog)) return { pValue: NaN, method: "Fisher's Exact Test (Numerical Issue)" };

        let pValue = 0.0;
        const minVal = Math.max(0, k1 - n2);
        const maxVal = Math.min(k1, n1);
        const tolerance = 1e-12; // Erhöhte Toleranz für numerische Vergleiche

        for (let i = minVal; i <= maxVal; i++) {
            const current_b = n1 - i;
            const current_c = k1 - i;
            const current_d = n2 - current_c;

            // Überprüfen, ob die Werte für die 2x2 Tabelle gültig sind
            if (current_b >= 0 && current_c >= 0 && current_d >= 0) {
                const pCurrentLog = logProbHypergeometric(i, N, k1, n1);
                if (isFinite(pCurrentLog) && pCurrentLog <= pObservedLog + tolerance) {
                    pValue += Math.exp(pCurrentLog);
                }
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
            const averageRank = (i + 1 + j + 1) / 2.0;
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
        const n1 = filteredSample1.length, n2 = filteredSample2.length;

        if (n1 === 0 || n2 === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No Data in one/both samples)" };

        const combined = [...filteredSample1, ...filteredSample2];
        const ranks = rankData(combined);

        const ranks1 = ranks.slice(0, n1).filter(r => !isNaN(r));
        // const ranks2 = ranks.slice(n1, n1 + n2).filter(r => !isNaN(r)); // Not strictly needed for U1

        if(ranks1.length === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No valid ranks in sample 1)" };

        const R1 = ranks1.reduce((sum, r) => sum + r, 0);
        const U1 = n1 * n2 + (n1 * (n1 + 1)) / 2.0 - R1;
        // const U2 = n1 * n2 - U1; // Can be calculated from U1

        const U = Math.min(U1, n1 * n2 - U1);

        const meanU = (n1 * n2) / 2.0;
        const N = n1 + n2;

        const tieGroups = {};
        const validRanks = ranks.filter(r => !isNaN(r));
        validRanks.forEach(r => { tieGroups[r] = (tieGroups[r] || 0) + 1; });
        const tieCorrectionFactor = Object.values(tieGroups).reduce((sum, t) => t > 1 ? sum + (t * t * t - t) : sum, 0);

        const varU_numerator = n1 * n2 * ((N * N * N - N) - tieCorrectionFactor);
        const varU_denominator = 12.0 * N * (N - 1);

        if (varU_denominator <= 0 || N <= 1 || isNaN(varU_denominator)) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (No Variance)" };
        const varU = varU_numerator / varU_denominator;
        if (varU < 0 || isNaN(varU)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Variance Error)" };
        if (varU === 0) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (Zero Variance)" };

        const stdDevU = Math.sqrt(varU);
        const correction = (U1 > meanU) ? -0.5 : (U1 < meanU) ? 0.5 : 0; // Kontinuitätskorrektur basierend auf U1
        const z = (U1 - meanU + correction) / stdDevU; // Z-Wert basierend auf U1
        
        if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Z Calculation Error)" };

        const pValue = 2.0 * normalCDF(-Math.abs(z));
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), U: U, Z: z, testName: "Mann-Whitney U (Normal Approx. with Tie Correction)" };
    }

    function manualDeLongTest(data, key1, key2, referenceKey) {
        const defaultReturn = { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Invalid Input)" };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return defaultReturn;

        const positives = data.filter(p => p && p[referenceKey] === '+');
        const negatives = data.filter(p => p && p[referenceKey] === '-');
        const n_pos = positives.length;
        const n_neg = negatives.length;

        if (n_pos === 0 || n_neg === 0) return { ...defaultReturn, method: "DeLong Test (No positive or negative reference cases)" };

        const getAUCAndComponents = (testKey) => {
            let structuralPairs = 0;
            const V10 = new Array(n_pos).fill(0); // For positives (N+)
            const V01 = new Array(n_neg).fill(0); // For negatives (N-)

            for (let i = 0; i < n_pos; i++) {
                for (let j = 0; j < n_neg; j++) {
                    // Ordinaler oder binärer Vergleich
                    const val_pos_score = (positives[i]?.[testKey] === '+') ? 1.0 : (positives[i]?.[testKey] === '-') ? 0.0 : NaN;
                    const val_neg_score = (negatives[j]?.[testKey] === '+') ? 1.0 : (negatives[j]?.[testKey] === '-') ? 0.0 : NaN;
                    
                    if (isNaN(val_pos_score) || isNaN(val_neg_score)) {
                        // Skip if prediction is not binary ('+' or '-')
                        continue;
                    }

                    let score = 0;
                    if (val_pos_score > val_neg_score) score = 1.0;
                    else if (val_pos_score === val_neg_score) score = 0.5;

                    structuralPairs += score;
                    V10[i] += score;
                    V01[j] += score;
                }
            }
            const auc = (n_pos > 0 && n_neg > 0) ? structuralPairs / (n_pos * n_neg) : NaN;
            if (isNaN(auc)) return null;

            V10.forEach((val, i) => V10[i] = (n_neg > 0) ? val / n_neg : NaN);
            V01.forEach((val, j) => V01[j] = (n_pos > 0) ? val / n_pos : NaN);
            
            return { auc, V10, V01 };
        };

        try {
            const components1 = getAUCAndComponents(key1);
            const components2 = getAUCAndComponents(key2);

            if (!components1 || !components2) return { ...defaultReturn, method: "DeLong Test (AUC Calculation Failed for one/both methods)" };
            
            const { auc: auc1, V10: V10_1, V01: V01_1 } = components1;
            const { auc: auc2, V10: V10_2, V01: V01_2 } = components2;

            if (isNaN(auc1) || isNaN(auc2)) return { ...defaultReturn, method: "DeLong Test (Invalid AUCs calculated)" };

            const calculateVarianceComponent = (V_arr, mean_auc) => {
                if (!Array.isArray(V_arr) || V_arr.length < 2 || V_arr.some(isNaN)) return NaN;
                let sumSqDiff = 0;
                for(let val of V_arr) sumSqDiff += Math.pow(val - mean_auc, 2);
                return sumSqDiff / (V_arr.length - 1); // Sample variance
            };

            const S10_1 = calculateVarianceComponent(V10_1, auc1);
            const S01_1 = calculateVarianceComponent(V01_1, auc1);
            const S10_2 = calculateVarianceComponent(V10_2, auc2);
            const S01_2 = calculateVarianceComponent(V01_2, auc2);

            const calculateCovarianceComponent = (V_X_arr, V_Y_arr, meanX, meanY) => {
                if (!Array.isArray(V_X_arr) || V_X_arr.length < 2 || V_X_arr.some(isNaN) || V_Y_arr.some(isNaN) || V_X_arr.length !== V_Y_arr.length) return NaN;
                 let sumProdDiff = 0;
                 for (let i = 0; i < V_X_arr.length; i++) sumProdDiff += (V_X_arr[i] - meanX) * (V_Y_arr[i] - meanY);
                 return sumProdDiff / (V_X_arr.length - 1); // Sample covariance
            };

            const Cov10 = calculateCovarianceComponent(V10_1, V10_2, auc1, auc2);
            const Cov01 = calculateCovarianceComponent(V01_1, V01_2, auc1, auc2);

            if ([S10_1, S01_1, S10_2, S01_2, Cov10, Cov01].some(isNaN)) {
                return { ...defaultReturn, diffAUC: auc1 - auc2, method: "DeLong Test (Variance/Covariance Calculation Error)" };
            }

            const varDiff = (S10_1 / n_pos) + (S01_1 / n_neg) + (S10_2 / n_pos) + (S01_2 / n_neg) - 2 * ((Cov10 / n_pos) + (Cov01 / n_neg));

            if (isNaN(varDiff) || varDiff <= 1e-18) { // Sehr kleine Varianz als 0 behandeln
                const pVal = (Math.abs(auc1 - auc2) < 1e-9) ? 1.0 : NaN;
                return { pValue: pVal, Z: (pVal === 1.0 ? 0 : NaN), diffAUC: auc1 - auc2, method: "DeLong Test (Near Zero/Zero Variance of Difference)" };
            }
            const seDiff = Math.sqrt(varDiff);
            const z = (auc1 - auc2) / seDiff;
            if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, diffAUC: auc1 - auc2, method: "DeLong Test (Z Calculation Error)" };

            const pValue = 2.0 * normalCDF(-Math.abs(z));
            return { pValue: Math.max(0.0, Math.min(1.0, pValue)), Z: z, diffAUC: auc1 - auc2, method: "DeLong Test" };
        } catch (error) {
            return { ...defaultReturn, method: "DeLong Test (Execution Error)" };
        }
    }

    function calculateZTestForAUCComparison(auc1, se1, n1, auc2, se2, n2) {
        const defaultReturn = { pValue: NaN, Z: NaN, method: "Z-Test (AUC - Independent Samples, Invalid Input)", diffAUC: NaN };
        
        // n1 and n2 are total number of patients, not n_pos/n_neg. Used for sample size check.
        if (auc1 === null || auc2 === null || se1 === null || se2 === null || isNaN(auc1) || isNaN(auc2) || isNaN(se1) || isNaN(se2) || n1 < 2 || n2 < 2) return defaultReturn;
        
        const var1 = se1 * se1;
        const var2 = se2 * se2;
        const varDiff = var1 + var2;

        if (isNaN(varDiff) || varDiff < 0) return { ...defaultReturn, method: "Z-Test (AUC - Independent Samples, Variance Error)", diffAUC: auc1 - auc2 };
        if (varDiff <= 1e-18) { // Treat very small variance as zero
            const pVal = (Math.abs(auc1 - auc2) < 1e-9) ? 1.0 : NaN;
            return { pValue: pVal, Z: (pVal === 1.0 ? 0 : NaN), method: "Z-Test (AUC - Independent Samples, Near Zero/Zero Variance)", diffAUC: auc1 - auc2 };
        }

        const seDiff = Math.sqrt(varDiff);
        const z = (auc1 - auc2) / seDiff;
        if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, method: "Z-Test (AUC - Independent Samples, Z Calculation Error)", diffAUC: auc1 - auc2 };

        const pValue = 2.0 * (1.0 - normalCDF(Math.abs(z)));
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), Z: z, method: "Z-Test (AUC - Independent Samples)", diffAUC: auc1 - auc2 };
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

    function calculatePhi(a, b, c, d) {
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return NaN;
        const n = a + b + c + d;
        if (n === 0) return NaN;

        const row1 = a + b;
        const row2 = c + d;
        const col1 = a + c;
        const col2 = b + d;

        const denominator = Math.sqrt(row1 * row2 * col1 * col2);
        if (denominator === 0 || isNaN(denominator)) return NaN;

        const phi = (a * d - b * c) / denominator;
        return isFinite(phi) ? phi : NaN;
    }

    function calculateDiagnosticPerformance(data, predictionKey, referenceKey) {
        if (!Array.isArray(data) || data.length === 0) {
             return null;
        }
        const matrix = calculateConfusionMatrix(data, predictionKey, referenceKey);
        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        const nullMetric = { value: NaN, ci: null, method: null, se: NaN, n_success: NaN, n_trials: NaN, matrix_components: null };

        if (total === 0) return { matrix, sens: nullMetric, spez: nullMetric, ppv: nullMetric, npv: nullMetric, acc: nullMetric, balAcc: nullMetric, f1: nullMetric, auc: nullMetric };

        const sens_val = (rp + fn) > 0 ? rp / (rp + fn) : ((rp === 0 && fn === 0) ? 0 : NaN) ;
        const spez_val = (fp + rn) > 0 ? rn / (fp + rn) : ((fp === 0 && rn === 0) ? 0 : NaN) ;
        const ppv_val = (rp + fp) > 0 ? rp / (rp + fp) : ((rp === 0 && fp === 0) ? 0 : NaN) ;
        const npv_val = (fn + rn) > 0 ? rn / (fn + rn) : ((fn === 0 && rn === 0) ? 0 : NaN) ;
        const acc_val = total > 0 ? (rp + rn) / total : NaN;
        const balAcc_val = (!isNaN(sens_val) && !isNaN(spez_val)) ? (sens_val + spez_val) / 2.0 : NaN;
        const f1_val = (!isNaN(ppv_val) && !isNaN(sens_val) && (ppv_val + sens_val) > 1e-9) ? 2.0 * (ppv_val * sens_val) / (ppv_val + sens_val) : ((ppv_val === 0 && sens_val === 0) ? 0 : NaN);
        const auc_val = balAcc_val; // For binary classification tests, AUC is equivalent to Balanced Accuracy

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
            const se_boot = (m.rp + m.fn) > 0 ? m.rp / (m.rp + m.fn) : ((m.rp === 0 && m.fn === 0) ? 0 : NaN);
            const sp_boot = (m.fp + m.rn) > 0 ? m.rn / (m.fp + m.rn) : ((m.fp === 0 && m.rn === 0) ? 0 : NaN);

            if (isNaN(se_boot) || isNaN(sp_boot)) return NaN;

            if (metric === 'balAcc' || metric === 'auc') return (se_boot + sp_boot) / 2.0;
            if (metric === 'f1') {
                const pv_boot = (m.rp + m.fp) > 0 ? m.rp / (m.rp + m.fp) : ((m.rp === 0 && m.fp === 0) ? 0 : NaN);
                return (isNaN(pv_boot) || (pv_boot + se_boot) <= 1e-9) ? ((pv_boot === 0 && se_boot === 0) ? 0 : NaN) : 2.0 * (pv_boot * se_boot) / (pv_boot + se_boot);
            }
            return NaN;
        };
        
        const matrixComponentsForBootstrap = { rp, fp, fn, rn, total };

        const balAccBootCIResult = !isNaN(balAcc_val) ? bootstrapCI(data, bootstrapStatFnFactory(predictionKey, referenceKey, 'balAcc')) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        const f1BootCIResult = !isNaN(f1_val) ? bootstrapCI(data, bootstrapStatFnFactory(predictionKey, referenceKey, 'f1')) : { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        const aucBootCIResult = balAccBootCIResult; // AUC is equivalent to Balanced Accuracy for this type of test


        return {
            matrix,
            sens: { value: sens_val, ci: sensCIResult, method: sensCIResult.method, se: NaN, n_success: rp, n_trials: n_sens, matrix_components: null },
            spez: { value: spez_val, ci: spezCIResult, method: spezCIResult.method, se: NaN, n_success: rn, n_trials: n_spez, matrix_components: null },
            ppv: { value: ppv_val, ci: ppvCIResult, method: ppvCIResult.method, se: NaN, n_success: rp, n_trials: n_ppv, matrix_components: null },
            npv: { value: npv_val, ci: npvCIResult, method: npvCIResult.method, se: NaN, n_success: rn, n_trials: n_npv, matrix_components: null },
            acc: { value: acc_val, ci: accCIResult, method: accCIResult.method, se: NaN, n_success: rp + rn, n_trials: n_acc, matrix_components: null },
            balAcc: { value: balAcc_val, ci: balAccBootCIResult, method: balAccBootCIResult.method, se: balAccBootCIResult.se, n_success: NaN, n_trials: NaN, matrix_components: matrixComponentsForBootstrap },
            f1: { value: f1_val, ci: f1BootCIResult, method: f1BootCIResult.method, se: f1BootCIResult.se, n_success: NaN, n_trials: NaN, matrix_components: matrixComponentsForBootstrap },
            auc: { value: auc_val, ci: aucBootCIResult, method: aucBootCIResult.method, se: aucBootCIResult.se, n_success: NaN, n_trials: NaN, matrix_components: matrixComponentsForBootstrap }
        };
    }

    function compareDiagnosticMethods(data, key1, key2, referenceKey) {
        const nullReturn = { mcnemar: { pValue: NaN, statistic: NaN, df: NaN, method: "McNemar Test (Not Calculated)" }, delong: { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Not Calculated)" } };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return nullReturn;

        let b = 0, c = 0; // b: key1+/key2-, c: key1-/key2+
        data.forEach(p => {
            if (p && typeof p === 'object') {
                const p1_is_plus = p[key1] === '+';
                const p2_is_plus = p[key2] === '+';
                const valid_p1 = p[key1] === '+' || p[key1] === '-';
                const valid_p2 = p[key2] === '+' || p[key2] === '-';
                const actual_ref = p[referenceKey] === '+' || p[referenceKey] === '-'; // Reference must be valid for both

                if (valid_p1 && valid_p2 && actual_ref) {
                    // McNemar's test looks at discordances across *all* patients, not just those with the reference
                    // BUT it's typically used when comparing diagnostic accuracy *to a reference*.
                    // So we only count if the reference is also valid.
                    if (p1_is_plus && !p2_is_plus) b++; // Method 1 identified, Method 2 missed
                    if (!p1_is_plus && p2_is_plus) c++; // Method 1 missed, Method 2 identified
                }
            }
        });
        const mcnemarResult = manualMcNemarTest(b, c);
        const delongResult = manualDeLongTest(data, key1, key2, referenceKey);
        return { mcnemar: mcnemarResult, delong: delongResult };
    }

    function calculateAssociations(data, t2Criteria) {
        const nullReturn = { testName: "N/A", pValue: NaN, statistic: NaN, or: { value: NaN, ci: null }, rd: { value: NaN, ci: null }, phi: { value: NaN, ci: null }, matrix: null, featureName: "N/A" };
        if (!Array.isArray(data) || data.length === 0 || !t2Criteria) return {};

        const results = {};
        const referenceKey = 'n';

        // AS Association
        const matrixAS = calculateConfusionMatrix(data, 'as', referenceKey);
        const n_as_total = matrixAS.rp + matrixAS.fp + matrixAS.fn + matrixAS.rn;
        if (n_as_total > 0) {
            const fisherAS = manualFisherExactTest(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn);
            results.as = {
                matrix: matrixAS,
                testName: fisherAS.method,
                pValue: fisherAS.pValue,
                statistic: NaN, // Fisher's statistic is not a chi-square value in this context
                or: calculateORCI(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn),
                rd: calculateRDCI(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn),
                phi: { value: calculatePhi(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn), ci: null, method: 'Phi Coefficient' },
                featureName: 'AS Positiv'
            };
        } else {
            results.as = {...nullReturn, testName: "Fisher's Exact Test (No Data)", featureName: 'AS Positiv', pValue: 1.0, matrix: matrixAS};
        }

        // Lymph Node Size (Mann-Whitney U Test)
        const sizesNplus = [];
        const sizesNminus = [];
        data.forEach(p => {
            if (p && Array.isArray(p.lymphknoten_t2)) {
                const validN = p[referenceKey] === '+' || p[referenceKey] === '-';
                if (!validN) return;
                const isNPos = p[referenceKey] === '+';
                p.lymphknoten_t2.forEach(lk => {
                    if (lk && typeof lk.groesse === 'number' && !isNaN(lk.groesse) && isFinite(lk.groesse)) {
                        if (isNPos) sizesNplus.push(lk.groesse); else sizesNminus.push(lk.groesse);
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
                featureName: 'LK Größe (Median Vergleich)'
            };
        } else {
            results.size_mwu = { ...nullReturn, testName: "Mann-Whitney U (Not enough data)", featureName: 'LK Größe (Median Vergleich)', pValue: 1.0 };
        }

        // Individual T2 Features Associations (Fisher's Exact Test)
        const t2Features = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        t2Features.forEach(featureKey => {
            let featureValue = null, threshold = null, condition = '>=';
            let featureNameForDisplay = `T2: ${featureKey}`;

            // Determine the specific criterion value/threshold from t2Criteria if active
            if (t2Criteria[featureKey]?.active) {
                if (featureKey === 'size') {
                    threshold = t2Criteria[featureKey].threshold;
                    condition = t2Criteria[featureKey].condition || '>=';
                    if (threshold !== null && !isNaN(threshold)) {
                        featureNameForDisplay = `T2 Größe ${condition} ${formatNumber(threshold, 1)}`;
                    }
                } else {
                    featureValue = t2Criteria[featureKey].value;
                    if (featureValue) {
                         featureNameForDisplay = `T2 ${featureKey}=${featureValue}`;
                    }
                }
            } else {
                // If criterion is inactive, set a default name, but don't prevent calculation if some data exists
                featureNameForDisplay = `T2 ${featureKey} (inaktiv)`;
            }

            let a = 0, b = 0, c = 0, d = 0; // 2x2 matrix cells
            let patientsWithFeature = 0;
            let patientsWithoutFeature = 0;
            let patientsWithFeatureNPos = 0;
            let patientsWithFeatureNNeg = 0;
            let patientsWithoutFeatureNPos = 0;
            let patientsWithoutFeatureNNeg = 0;


            data.forEach(p => {
                const validN = p?.[referenceKey] === '+' || p?.[referenceKey] === '-';
                if (!validN || !Array.isArray(p.lymphknoten_t2)) return; // Only process if N-status and T2 nodes are valid
                const actualN_is_Positive = p[referenceKey] === '+';
                let patientHasFeature = false;

                // Check if any lymph node in the patient matches the criterion
                if (featureKey === 'size') {
                    // Only apply if threshold is defined and is active in t2Criteria
                    if (t2Criteria[featureKey]?.active && threshold !== null && !isNaN(threshold)) {
                        patientHasFeature = p.lymphknoten_t2.some(lk => {
                            if (lk && typeof lk.groesse === 'number' && !isNaN(lk.groesse)) {
                                switch(condition) {
                                    case '>=': return lk.groesse >= threshold;
                                    case '>': return lk.groesse > threshold;
                                    case '<=': return lk.groesse <= threshold;
                                    case '<': return lk.groesse < threshold;
                                    case '==': return lk.groesse === threshold;
                                    default: return false; // Ungültige Bedingung
                                }
                            }
                            return false;
                        });
                    } else {
                        // If size criterion is inactive or threshold not set, the patient doesn't "have" this feature by criterion
                        patientHasFeature = false;
                    }
                } else {
                    // Only apply if featureValue is defined and is active in t2Criteria
                    if (t2Criteria[featureKey]?.active && featureValue !== null) {
                        patientHasFeature = p.lymphknoten_t2.some(lk => lk && lk[featureKey] === featureValue);
                    } else {
                        patientHasFeature = false;
                    }
                }

                // Populate 2x2 matrix
                if (patientHasFeature) {
                    patientsWithFeature++;
                    if (actualN_is_Positive) patientsWithFeatureNPos++; else patientsWithFeatureNNeg++;
                } else {
                    patientsWithoutFeature++;
                    if (actualN_is_Positive) patientsWithoutFeatureNPos++; else patientsWithoutFeatureNNeg++;
                }
            });

            // Re-assign for Fisher's Exact Test
            a = patientsWithFeatureNPos;
            b = patientsWithFeatureNNeg;
            c = patientsWithoutFeatureNPos;
            d = patientsWithoutFeatureNNeg;
            
            const n_feature_total = a + b + c + d;

            if (n_feature_total > 0 && (a+b)>0 && (c+d)>0 && (a+c)>0 && (b+d)>0) { // Check for non-zero marginals
                const fisherFeature = manualFisherExactTest(a, b, c, d);
                results[featureKey] = {
                    matrix: { rp: a, fp: b, fn: c, rn: d },
                    testName: fisherFeature.method,
                    pValue: fisherFeature.pValue,
                    statistic: NaN,
                    or: calculateORCI(a, b, c, d),
                    rd: calculateRDCI(a, b, c, d),
                    phi: { value: calculatePhi(a, b, c, d), ci: null, method: 'Phi Coefficient' },
                    featureName: featureNameForDisplay
                };
            } else {
                // If no data or zero marginals for this feature, return nullReturn
                results[featureKey] = { ...nullReturn, testName: `Fisher's Exact Test (No/Insufficient Data for T2-${featureKey})`, featureName: featureNameForDisplay, pValue: 1.0, matrix: {rp:a, fp:b, fn:c, rn:d} };
            }
        });
        return results;
    }

    function compareCohorts(data1, data2, t2Criteria, t2Logic) {
        const nullComp = { pValue: NaN, testName: "N/A", Z: NaN, statistic: NaN, diffAUC: NaN };
        const defaultReturn = {
            accuracyComparison: { as: { ...nullComp }, t2: { ...nullComp } },
            aucComparison: { as: { ...nullComp }, t2: { ...nullComp } }
        };
        if (!Array.isArray(data1) || !Array.isArray(data2) || data1.length === 0 || data2.length === 0) return defaultReturn;

        let evaluatedData1 = cloneDeep(data1);
        let evaluatedData2 = cloneDeep(data2);
        
        // Ensure t2 evaluation is done if criteria/logic provided
        if (t2Criteria && t2Logic && typeof t2CriteriaManager !== 'undefined') {
            evaluatedData1 = t2CriteriaManager.evaluateDataset(evaluatedData1, t2Criteria, t2Logic);
            evaluatedData2 = t2CriteriaManager.evaluateDataset(evaluatedData2, t2Criteria, t2Logic);
        } else {
            // If T2 criteria are not valid/provided, set T2 comparison to nullComp with a specific message
            defaultReturn.accuracyComparison.t2 = { ...nullComp, testName: "T2 not evaluated or invalid criteria" };
            defaultReturn.aucComparison.t2 = { ...nullComp, testName: "T2 not evaluated or invalid criteria" };
        }

        // Accuracy Comparison (Fisher's Exact Test on correct/incorrect counts)
        const matrix1AS = calculateConfusionMatrix(data1, 'as', 'n');
        const matrix2AS = calculateConfusionMatrix(data2, 'as', 'n');
        
        const correct1AS = matrix1AS.rp + matrix1AS.rn;
        const incorrect1AS = matrix1AS.fp + matrix1AS.fn;
        const correct2AS = matrix2AS.rp + matrix2AS.rn;
        const incorrect2AS = matrix2AS.fp + matrix2AS.fn;

        const accCompASResult = manualFisherExactTest(correct1AS, incorrect1AS, correct2AS, incorrect2AS);

        let accCompT2Result = { pValue: NaN, method: "Fisher's Exact Test (T2 not evaluated or invalid criteria)"};
        const matrix1T2 = calculateConfusionMatrix(evaluatedData1, 't2', 'n');
        const matrix2T2 = calculateConfusionMatrix(evaluatedData2, 't2', 'n');
        const correct1T2 = matrix1T2.rp + matrix1T2.rn;
        const incorrect1T2 = matrix1T2.fp + matrix1T2.fn;
        const correct2T2 = matrix2T2.rp + matrix2T2.rn;
        const incorrect2T2 = matrix2T2.fp + matrix2T2.fn;

        accCompT2Result = manualFisherExactTest(correct1T2, incorrect1T2, correct2T2, incorrect2T2);
        
        // AUC Comparison (Z-Test for independent samples)
        const guete1AS = calculateDiagnosticPerformance(data1, 'as', 'n');
        const guete2AS = calculateDiagnosticPerformance(data2, 'as', 'n');
        const aucCompASResult = calculateZTestForAUCComparison(guete1AS?.auc?.value, guete1AS?.auc?.se, data1.length,
                                                               guete2AS?.auc?.value, guete2AS?.auc?.se, data2.length);
        
        let aucCompT2Result = { pValue: NaN, Z: NaN, method: "Z-Test (AUC - T2 not evaluated or invalid criteria)", diffAUC: NaN };
        const guete1T2 = calculateDiagnosticPerformance(evaluatedData1, 't2', 'n');
        const guete2T2 = calculateDiagnosticPerformance(evaluatedData2, 't2', 'n');
        aucCompT2Result = calculateZTestForAUCComparison(guete1T2?.auc?.value, guete1T2?.auc?.se, evaluatedData1.length,
                                                          guete2T2?.auc?.value, guete2T2?.auc?.se, evaluatedData2.length);

        return {
            accuracyComparison: {
                as: { pValue: accCompASResult.pValue, testName: accCompASResult.method, Z: NaN, statistic: NaN },
                t2: { pValue: accCompT2Result.pValue, testName: accCompT2Result.method, Z: NaN, statistic: NaN }
            },
            aucComparison: {
                as: { ...aucCompASResult, diffAUC: (guete1AS?.auc?.value ?? NaN) - (guete2AS?.auc?.value ?? NaN), statistic: NaN },
                t2: { ...aucCompT2Result, diffAUC: (guete1T2?.auc?.value ?? NaN) - (guete2T2?.auc?.value ?? NaN), statistic: NaN }
            }
        };
    }

    function calculateDescriptiveStats(data) {
        const n = data?.length ?? 0;
        const nullMetric = { median: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN, n: 0, q1: NaN, q3: NaN };
        const nullReturn = { anzahlPatienten: 0, alter: nullMetric, geschlecht: { m: 0, f: 0, unbekannt: 0 }, therapie: { 'direkt OP': 0, 'nRCT': 0, unbekannt: 0 }, nStatus: { plus: 0, minus: 0, unbekannt: 0 }, asStatus: { plus: 0, minus: 0, unbekannt: 0 }, t2Status: { plus: 0, minus: 0, unbekannt: 0 }, lkAnzahlen: null, alterData: [] };

        if (!Array.isArray(data) || n === 0) return nullReturn;

        const alterData = data.map(p => p?.alter).filter(a => a !== null && a !== undefined && !isNaN(a) && isFinite(a)).sort((a, b) => a - b);
        const geschlecht = data.reduce((acc, p) => { const key = (p?.geschlecht === 'm' || p?.geschlecht === 'f') ? p.geschlecht : 'unbekannt'; acc[key] = (acc[key] || 0) + 1; return acc; }, { m: 0, f: 0, unbekannt: 0 });
        const therapie = data.reduce((acc, p) => { const key = p?.therapie === 'direkt OP' ? 'direkt OP' : (p?.therapie === 'nRCT' ? 'nRCT' : 'unbekannt'); acc[key] = (acc[key] || 0) + 1; return acc; }, { 'direkt OP': 0, 'nRCT': 0, unbekannt: 0 });

        const statusReducer = (key) => data.reduce((acc, p) => { const status = p?.[key]; if (status === '+') acc.plus++; else if (status === '-') acc.minus++; else acc.unbekannt++; return acc; }, { plus: 0, minus: 0, unbekannt: 0 });
        const nStatus = statusReducer('n');
        const asStatus = statusReducer('as');
        const t2Status = statusReducer('t2');

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
            t2: getLKStats('anzahl_t2_lk', 'anzahl_t2_plus_lk', 't2')
        };
        const alterStats = alterData.length > 0 ? { median: getMedian(alterData), mean: getMean(alterData), sd: getStdDev(alterData), min: alterData[0], max: alterData[alterData.length - 1], n: alterData.length, q1: getQuartile(alterData, 0.25), q3: getQuartile(alterData, 0.75) } : nullMetric;

        return { anzahlPatienten: n, alter: alterStats, geschlecht: geschlecht, therapie: therapie, nStatus: nStatus, asStatus: asStatus, t2Status: t2Status, lkAnzahlen: lkAnzahlen, alterData: alterData };
    }

     function calculateAllStatsForPublication(data, appliedT2Criteria, appliedT2Logic, bruteForceResultsPerKollektiv) {
        if (!data || !Array.isArray(data)) return null;
        const results = {
            Gesamt: null,
            'direkt OP': null,
            nRCT: null
        };
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];

        kollektive.forEach(kollektivId => {
            const filteredData = dataProcessor.filterDataByKollektiv(data, kollektivId);
            if (filteredData.length === 0) {
                results[kollektivId] = null;
                return;
            }

            // Deep clone before evaluating to ensure original data is not modified for other calculations
            const dataForAppliedT2Evaluation = cloneDeep(filteredData);
            const evaluatedDataApplied = t2CriteriaManager.evaluateDataset(dataForAppliedT2Evaluation, appliedT2Criteria, appliedT2Logic);

            results[kollektivId] = {};
            results[kollektivId].deskriptiv = calculateDescriptiveStats(filteredData); // Use original filtered data for descriptive stats
            results[kollektivId].gueteAS = calculateDiagnosticPerformance(evaluatedDataApplied, 'as', 'n'); // AS is on evaluated data
            results[kollektivId].gueteT2_angewandt = calculateDiagnosticPerformance(evaluatedDataApplied, 't2', 'n');
            results[kollektivId].vergleichASvsT2_angewandt = compareDiagnosticMethods(evaluatedDataApplied, 'as', 't2', 'n');
            results[kollektivId].assoziation_angewandt = calculateAssociations(evaluatedDataApplied, appliedT2Criteria);

            results[kollektivId].gueteT2_literatur = {};
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySetConf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studySetConf.id);
                if (studySet) {
                    let isApplicable = true;
                    // Apply study criteria only to their explicitly defined applicableKollektiv
                    // If studySet.applicableKollektiv is defined and it's not 'Gesamt' AND it's not the current kollektivId, then skip
                    if (studySet.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt' && studySet.applicableKollektiv !== kollektivId) {
                        isApplicable = false;
                    }
                    
                    const dataForStudyEvaluation = dataProcessor.filterDataByKollektiv(data, studySet.applicableKollektiv || 'Gesamt');
                    // Ensure the study criteria are applied to the correct subset of the full dataset
                    const evaluatedDataStudy = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForStudyEvaluation), studySet);
                    
                    // Only store results if applicable to avoid cluttering with "not applicable" for a specific kollektiv
                    if (isApplicable) {
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
        });
        return results;
     }


    return Object.freeze({
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateAssociations,
        compareCohorts,
        calculateDescriptiveStats,
        calculateAllStatsForPublication
    });

})();
