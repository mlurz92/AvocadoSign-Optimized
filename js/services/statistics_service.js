const statisticsService = (() => {

    function calculateWilsonScoreCI(successes, trials, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        if (isNaN(successes) || isNaN(trials) || isNaN(alpha) || trials <= 0 || successes < 0 || successes > trials || alpha <= 0 || alpha >= 1) return defaultReturn;
        const p_hat = successes / trials;
        const n = trials;
        const z = Math.abs(statisticsHelpers.inverseNormalCDF(alpha / 2.0));
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
            } catch (e) { /* silent fail for single iteration */ }
        }

        if (validCount < Math.max(10, nBoot * 0.1)) return defaultReturn;
        bootStats.sort((a, b) => a - b);

        const lowerIndex = Math.max(0, Math.min(validCount - 1, Math.floor(validCount * (alpha / 2.0))));
        const upperIndex = Math.max(0, Math.min(validCount - 1, Math.ceil(validCount * (1.0 - alpha / 2.0)) -1));

        if (lowerIndex > upperIndex || lowerIndex < 0 || upperIndex >= validCount) return defaultReturn;

        const meanStat = sum / validCount;
        const variance = (validCount > 1) ? (sumSq - (sum * sum / validCount)) / (validCount -1) : NaN;
        const se = (variance > 0 && !isNaN(variance)) ? Math.sqrt(variance) : NaN;

        return { lower: bootStats[lowerIndex], upper: bootStats[upperIndex], method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: se };
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
        const z = Math.abs(statisticsHelpers.inverseNormalCDF(alpha / 2.0));

        if (!isFinite(z) || isNaN(seLogOR) || seLogOR <= 0 || !isFinite(seLogOR)) return { ...defaultReturn, value: or_raw };
        const lowerCI = Math.exp(logOR - z * seLogOR);
        const upperCI = Math.exp(logOR + z * seLogOR);

        if (!isFinite(lowerCI) || !isFinite(upperCI)) return { ...defaultReturn, value: or_raw };
        return { value: or_raw, ci: { lower: lowerCI, upper: upperCI }, method: 'Woolf Logit (Haldane-Anscombe correction)' };
    }

    function calculateRDCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const defaultReturn = { value: NaN, ci: null, method: 'Wald' };
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return defaultReturn;
        const n1 = a + b, n2 = c + d;
        if (n1 === 0 || n2 === 0) return defaultReturn;
        const p1 = a / n1, p2 = c / n2; const rd = p1 - p2;

        const varP1 = (p1 * (1.0 - p1)) / n1;
        const varP2 = (p2 * (1.0 - p2)) / n2;
        if (isNaN(varP1) || isNaN(varP2) || varP1 < 0 || varP2 < 0) return { ...defaultReturn, value: rd };

        const seRD = Math.sqrt(varP1 + varP2);
        const z = Math.abs(statisticsHelpers.inverseNormalCDF(alpha / 2.0));

        if (!isFinite(z) || isNaN(seRD) || seRD <= 0 || !isFinite(seRD)) return { ...defaultReturn, value: rd };
        const lower = rd - z * seRD;
        const upper = rd + z * seRD;
        return { value: rd, ci: { lower: Math.max(-1.0, lower), upper: Math.min(1.0, upper) }, method: 'Wald' };
    }

    function manualMcNemarTest(b, c) {
        if (isNaN(b) || isNaN(c) || b < 0 || c < 0) return { pValue: NaN, statistic: NaN, df: 1, method: "McNemar's Test (Invalid Input)" };
        const n = b + c;
        if (n === 0) return { pValue: 1.0, statistic: 0, df: 1, method: "McNemar's Test (No Discordance)" };

        const continuityCorrection = (n < APP_CONFIG.STATISTICAL_CONSTANTS.FISHER_EXACT_THRESHOLD * 4) ? 1 : 0;
        let statistic = Math.pow(Math.abs(b - c) - continuityCorrection, 2) / n;
        if (isNaN(statistic) || !isFinite(statistic)) statistic = 0;

        const pValue = 1.0 - statisticsHelpers.chiSquareCDF(statistic, 1);
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), statistic: statistic, df: 1, method: `McNemar's Test${continuityCorrection > 0 ? ' (continuity corrected)' : ''}` };
    }

    function logProbHypergeometric(k, N_pop, K_success, n_draw) {
        if (k < 0 || n_draw < 0 || K_success < 0 || N_pop < 0 || k > n_draw || k > K_success || (n_draw - k) > (N_pop - K_success) || n_draw > N_pop) return -Infinity;
        try {
            const logC_K_k = statisticsHelpers.logFactorial(K_success) - statisticsHelpers.logFactorial(k) - statisticsHelpers.logFactorial(K_success - k);
            const logC_NK_nk = statisticsHelpers.logFactorial(N_pop - K_success) - statisticsHelpers.logFactorial(n_draw - k) - statisticsHelpers.logFactorial((N_pop - K_success) - (n_draw - k));
            const logC_N_n = statisticsHelpers.logFactorial(N_pop) - statisticsHelpers.logFactorial(n_draw) - statisticsHelpers.logFactorial(N_pop - n_draw);
            if (isNaN(logC_K_k) || isNaN(logC_NK_nk) || isNaN(logC_N_n)) return -Infinity;
            const result = logC_K_k + logC_NK_nk - logC_N_n;
            return isFinite(result) ? result : -Infinity;
        } catch (e) { return -Infinity; }
    }

    function manualFisherExactTest(a, b, c, d) {
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return { pValue: NaN, method: "Fisher's Exact Test (Invalid Input)" };
        const n1 = a + b, n2 = c + d;
        const k1 = a + c;
        const N = a + b + c + d;
        if (N === 0) return { pValue: 1.0, method: "Fisher's Exact Test (No Data)" };

        const pObservedLog = logProbHypergeometric(a, N, k1, n1);
        if (!isFinite(pObservedLog)) return { pValue: NaN, method: "Fisher's Exact Test (Numerical Issue)" };

        let pValue = 0.0;
        const minVal = Math.max(0, k1 - n2);
        const maxVal = Math.min(k1, n1);
        const tolerance = 1e-9;

        for (let i = minVal; i <= maxVal; i++) {
            const pCurrentLog = logProbHypergeometric(i, N, k1, n1);
            if (isFinite(pCurrentLog) && pCurrentLog <= pObservedLog + tolerance) {
                pValue += Math.exp(pCurrentLog);
            }
        }
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), method: "Fisher's Exact Test" };
    }

    function manualMannWhitneyUTest(sample1, sample2) {
        const defaultReturn = { pValue: NaN, U: NaN, Z: NaN, testName: "Mann-Whitney U (Invalid Input)" };
        if (!Array.isArray(sample1) || !Array.isArray(sample2)) return defaultReturn;

        const filteredSample1 = sample1.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        const filteredSample2 = sample2.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        const n1 = filteredSample1.length, n2 = filteredSample2.length;

        if (n1 === 0 || n2 === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No Data in one/both samples)" };

        const combined = [...filteredSample1, ...filteredSample2];
        const ranks = statisticsHelpers.rankData(combined);
        const ranks1 = ranks.slice(0, n1).filter(r => !isNaN(r));
        if(ranks1.length === 0) return { ...defaultReturn, testName: "Mann-Whitney U (No valid ranks)" };

        const R1 = ranks1.reduce((sum, r) => sum + r, 0);
        const U1 = n1 * n2 + (n1 * (n1 + 1)) / 2.0 - R1;
        const U = Math.min(U1, n1 * n2 - U1);

        const meanU = (n1 * n2) / 2.0;
        const N = n1 + n2;

        const tieGroups = {};
        const validRanks = ranks.filter(r => !isNaN(r));
        validRanks.forEach(r => { tieGroups[r] = (tieGroups[r] || 0) + 1; });
        const tieCorrectionFactor = Object.values(tieGroups).reduce((sum, t) => t > 1 ? sum + (t * t * t - t) : sum, 0);
        const varU_numerator = n1 * n2 * ((N * N * N - N) - tieCorrectionFactor);
        const varU_denominator = 12.0 * N * (N - 1);

        if (varU_denominator <= 0 || N <= 1) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (No Variance)" };
        const varU = varU_numerator / varU_denominator;
        if (varU < 0 || isNaN(varU)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Variance Error)" };
        if (varU === 0) return { pValue: 1.0, U: U, Z: 0, testName: "Mann-Whitney U (Zero Variance)" };

        const stdDevU = Math.sqrt(varU);
        const correction = (U < meanU) ? 0.5 : (U > meanU) ? -0.5 : 0;
        const z = (U - meanU + correction) / stdDevU;
        if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, U: U, testName: "Mann-Whitney U (Z Calculation Error)" };

        const pValue = 2.0 * statisticsHelpers.normalCDF(-Math.abs(z));
        return { pValue: Math.max(0.0, Math.min(1.0, pValue)), U: U, Z: z, testName: "Mann-Whitney U (Normal Approx. with Tie Correction)" };
    }

    function manualDeLongTest(data, key1, key2, referenceKey) {
        const defaultReturn = { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test (Invalid Input)" };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return defaultReturn;

        const positives = data.filter(p => p && p[referenceKey] === '+');
        const negatives = data.filter(p => p && p[referenceKey] === '-');
        const n_pos = positives.length, n_neg = negatives.length;

        if (n_pos === 0 || n_neg === 0) return { ...defaultReturn, method: "DeLong Test (No positive or negative cases)" };

        const getAUCAndComponents = (testKey) => {
            let structuralPairs = 0;
            const V10 = new Array(n_pos).fill(0);
            const V01 = new Array(n_neg).fill(0);

            for (let i = 0; i < n_pos; i++) {
                for (let j = 0; j < n_neg; j++) {
                    const val_pos = (positives[i]?.[testKey] === '+') ? 1.0 : (positives[i]?.[testKey] === '-') ? 0.0 : 0.5;
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

            if (!components1 || !components2) return { ...defaultReturn, method: "DeLong Test (AUC Calculation Failed)" };
            const { auc: auc1, V10: V10_1, V01: V01_1 } = components1;
            const { auc: auc2, V10: V10_2, V01: V01_2 } = components2;
            if (isNaN(auc1) || isNaN(auc2)) return { ...defaultReturn, method: "DeLong Test (Invalid AUCs)" };

            const calculateVarianceComponent = (V_arr, mean_auc) => {
                if (V_arr.some(isNaN)) return NaN;
                let sumSqDiff = 0;
                for(let val of V_arr) sumSqDiff += Math.pow(val - mean_auc, 2);
                return sumSqDiff / (V_arr.length -1);
            };
            const S10_1 = calculateVarianceComponent(V10_1, auc1);
            const S01_1 = calculateVarianceComponent(V01_1, auc1);
            const S10_2 = calculateVarianceComponent(V10_2, auc2);
            const S01_2 = calculateVarianceComponent(V01_2, auc2);

            const calculateCovarianceComponent = (V_X_arr, V_Y_arr, meanX, meanY) => {
                if (V_X_arr.some(isNaN) || V_Y_arr.some(isNaN)) return NaN;
                 let sumProdDiff = 0;
                 for (let i = 0; i < V_X_arr.length; i++) sumProdDiff += (V_X_arr[i] - meanX) * (V_Y_arr[i] - meanY);
                 return sumProdDiff / (V_X_arr.length - 1);
            };
            const Cov10 = calculateCovarianceComponent(V10_1, V10_2, auc1, auc2);
            const Cov01 = calculateCovarianceComponent(V01_1, V01_2, auc1, auc2);

            if ([S10_1, S01_1, S10_2, S01_2, Cov10, Cov01].some(isNaN)) {
                return { ...defaultReturn, diffAUC: auc1 - auc2, method: "DeLong Test (Variance/Covariance NaN)" };
            }

            const varDiff = (S10_1 / n_pos) + (S01_1 / n_neg) + (S10_2 / n_pos) + (S01_2 / n_neg) - 2 * ((Cov10 / n_pos) + (Cov01 / n_neg));

            if (isNaN(varDiff) || varDiff <= 1e-12) {
                const pVal = (Math.abs(auc1 - auc2) < 1e-9) ? 1.0 : NaN;
                return { pValue: pVal, Z: (pVal === 1.0 ? 0 : NaN), diffAUC: auc1 - auc2, method: "DeLong Test (Near Zero Variance)" };
            }
            const seDiff = Math.sqrt(varDiff);
            const z = (auc1 - auc2) / seDiff;
            if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, diffAUC: auc1 - auc2, method: "DeLong Test (Z Calculation Error)" };

            const pValue = 2.0 * statisticsHelpers.normalCDF(-Math.abs(z));
            return { pValue: Math.max(0.0, Math.min(1.0, pValue)), Z: z, diffAUC: auc1 - auc2, method: "DeLong Test" };
        } catch (error) {
            return { ...defaultReturn, method: "DeLong Test (Execution Error)" };
        }
    }

    function calculateZTestForAUCComparison(auc1, se1, n1, auc2, se2, n2) {
        const defaultReturn = { pValue: NaN, Z: NaN, method: "Z-Test (AUC - Independent Samples, Invalid Input)" };
        if (auc1 === null || auc2 === null || se1 === null || se2 === null || isNaN(auc1) || isNaN(auc2) || isNaN(se1) || isNaN(se2) || isNaN(n1) || isNaN(n2) || se1 < 0 || se2 < 0 || n1 < 2 || n2 < 2) return defaultReturn;

        const var1 = se1 * se1;
        const var2 = se2 * se2;
        const varDiff = var1 + var2;

        if (isNaN(varDiff) || varDiff < 0) return { ...defaultReturn, method: "Z-Test (AUC - Independent Samples, Variance Error)" };
        if (varDiff <= 1e-12) {
            const pVal = (Math.abs(auc1 - auc2) < 1e-9) ? 1.0 : NaN;
            return { pValue: pVal, Z: (pVal === 1.0 ? 0 : NaN), method: "Z-Test (AUC - Independent Samples, Near Zero Variance)" };
        }

        const seDiff = Math.sqrt(varDiff);
        const z = (auc1 - auc2) / seDiff;
        if (isNaN(z) || !isFinite(z)) return { ...defaultReturn, method: "Z-Test (AUC - Independent Samples, Z Calculation Error)" };

        const pValue = 2.0 * (1.0 - statisticsHelpers.normalCDF(Math.abs(z)));
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

    function calculatePhi(a, b, c, d) {
        if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a < 0 || b < 0 || c < 0 || d < 0) return NaN;
        const n = a + b + c + d;
        if (n === 0) return NaN;

        const row1 = a + b, row2 = c + d, col1 = a + c, col2 = b + d;
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

        const sens_val = (rp + fn) > 0 ? rp / (rp + fn) : ((rp === 0 && fn === 0) ? NaN : 0) ;
        const spez_val = (fp + rn) > 0 ? rn / (fp + rn) : ((fp === 0 && rn === 0) ? NaN : 0) ;
        const ppv_val = (rp + fp) > 0 ? rp / (rp + fp) : ((rp === 0 && fp === 0) ? NaN : 0) ;
        const npv_val = (fn + rn) > 0 ? rn / (fn + rn) : ((fn === 0 && rn === 0) ? NaN : 0) ;
        const acc_val = total > 0 ? (rp + rn) / total : NaN;
        const balAcc_val = (!isNaN(sens_val) && !isNaN(spez_val)) ? (sens_val + spez_val) / 2.0 : NaN;
        const f1_val = (!isNaN(ppv_val) && !isNaN(sens_val) && (ppv_val + sens_val) > 1e-9) ? 2.0 * (ppv_val * sens_val) / (ppv_val + sens_val) : ((ppv_val === 0 && sens_val === 0) ? 0 : NaN);
        const auc_val = balAcc_val;

        const bootstrapStatFnFactory = (pKey, rKey, metric) => (sample) => {
            const m = calculateConfusionMatrix(sample, pKey, rKey);
            const se_boot = (m.rp + m.fn) > 0 ? m.rp / (m.rp + m.fn) : NaN;
            const sp_boot = (m.fp + m.rn) > 0 ? m.rn / (m.fp + m.rn) : NaN;
            if (isNaN(se_boot) || isNaN(sp_boot)) return NaN;
            if (metric === 'balAcc' || metric === 'auc') return (se_boot + sp_boot) / 2.0;
            if (metric === 'f1') {
                const pv_boot = (m.rp + m.fp) > 0 ? m.rp / (m.rp + m.fp) : NaN;
                return (isNaN(pv_boot) || (pv_boot + se_boot) <= 1e-9) ? NaN : 2.0 * (pv_boot * se_boot) / (pv_boot + se_boot);
            }
            return NaN;
        };

        const balAccBootCIResult = !isNaN(balAcc_val) ? bootstrapCI(data, bootstrapStatFnFactory(predictionKey, referenceKey, 'balAcc')) : { lower: NaN, upper: NaN, se: NaN };
        const f1BootCIResult = !isNaN(f1_val) ? bootstrapCI(data, bootstrapStatFnFactory(predictionKey, referenceKey, 'f1')) : { lower: NaN, upper: NaN, se: NaN };

        return {
            matrix,
            sens: { value: sens_val, ci: calculateWilsonScoreCI(rp, rp + fn), method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION, n_trials: rp + fn },
            spez: { value: spez_val, ci: calculateWilsonScoreCI(rn, fp + rn), method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION, n_trials: fp + rn },
            ppv: { value: ppv_val, ci: calculateWilsonScoreCI(rp, rp + fp), method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION, n_trials: rp + fp },
            npv: { value: npv_val, ci: calculateWilsonScoreCI(rn, fn + rn), method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION, n_trials: fn + rn },
            acc: { value: acc_val, ci: calculateWilsonScoreCI(rp + rn, total), method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION, n_trials: total },
            balAcc: { value: balAcc_val, ci: balAccBootCIResult, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: balAccBootCIResult.se, matrix_components: { rp, fp, fn, rn, total } },
            f1: { value: f1_val, ci: f1BootCIResult, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: f1BootCIResult.se, matrix_components: { rp, fp, fn, rn, total } },
            auc: { value: auc_val, ci: balAccBootCIResult, method: "Equivalent to Balanced Accuracy", se: balAccBootCIResult.se, matrix_components: { rp, fp, fn, rn, total } }
        };
    }

    function compareDiagnosticMethods(data, key1, key2, referenceKey) {
        const nullReturn = { mcnemar: null, delong: null };
        if (!Array.isArray(data) || data.length === 0 || !key1 || !key2 || !referenceKey) return nullReturn;
        let b = 0, c = 0;
        data.forEach(p => {
            if (p && typeof p === 'object' && (p[key1] === '+' || p[key1] === '-') && (p[key2] === '+' || p[key2] === '-')) {
                if (p[key1] === '+' && p[key2] === '-') b++;
                if (p[key1] === '-' && p[key2] === '+') c++;
            }
        });
        return { mcnemar: manualMcNemarTest(b, c), delong: manualDeLongTest(data, key1, key2, referenceKey) };
    }

    function calculateAssociations(data, t2Criteria) {
        if (!Array.isArray(data) || data.length === 0 || !t2Criteria) return {};
        const results = {};
        const referenceKey = 'n';

        const matrixAS = calculateConfusionMatrix(data, 'as', referenceKey);
        results.as = {
            matrix: matrixAS,
            testName: manualFisherExactTest(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn).method,
            pValue: manualFisherExactTest(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn).pValue,
            or: calculateORCI(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn),
            rd: calculateRDCI(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn),
            phi: { value: calculatePhi(matrixAS.rp, matrixAS.fp, matrixAS.fn, matrixAS.rn) },
            featureName: 'AS Positiv'
        };

        const sizesNplus = [], sizesNminus = [];
        data.forEach(p => {
            if (p && Array.isArray(p.lymphknoten_t2) && (p[referenceKey] === '+' || p[referenceKey] === '-')) {
                const targetArray = p[referenceKey] === '+' ? sizesNplus : sizesNminus;
                p.lymphknoten_t2.forEach(lk => { if (lk && typeof lk.groesse === 'number') targetArray.push(lk.groesse); });
            }
        });
        if (sizesNplus.length > 0 && sizesNminus.length > 0) {
            results.size_mwu = { ...manualMannWhitneyUTest(sizesNplus, sizesNminus), featureName: 'LK Größe (Median Vgl.)' };
        }

        Object.keys(t2Criteria).filter(k => k !== 'logic').forEach(featureKey => {
            let a = 0, b = 0, c = 0, d = 0;
            data.forEach(p => {
                if (p?.[referenceKey] === '+' || p?.[referenceKey] === '-') {
                    const actualN_is_Positive = p[referenceKey] === '+';
                    const patientHasFeature = (p.lymphknoten_t2 || []).some(lk => {
                        if (!lk) return false;
                        if (featureKey === 'size') return (lk.groesse >= t2Criteria.size.threshold);
                        return lk[featureKey] === t2Criteria[featureKey].value;
                    });
                    if (patientHasFeature && actualN_is_Positive) a++; else if (patientHasFeature && !actualN_is_Positive) b++;
                    else if (!patientHasFeature && actualN_is_Positive) c++; else if (!patientHasFeature && !actualN_is_Positive) d++;
                }
            });
            const fisher = manualFisherExactTest(a,b,c,d);
            results[featureKey] = {
                matrix: {rp: a, fp: b, fn: c, rn: d},
                testName: fisher.method, pValue: fisher.pValue,
                or: calculateORCI(a,b,c,d), rd: calculateRDCI(a,b,c,d), phi: { value: calculatePhi(a,b,c,d) },
                featureName: featureKey === 'size' ? `T2 Größe ≥ ${utils.formatNumber(t2Criteria.size.threshold, 1)}mm` : `T2 ${featureKey}=${t2Criteria[featureKey].value}`
            };
        });
        return results;
    }

    function compareCohorts(data1, data2, t2Criteria, t2Logic) {
        const nullComp = { pValue: NaN, testName: "N/A", Z: NaN };
        if (!data1 || !data2 || data1.length === 0 || data2.length === 0) return { accuracyComparison: { as: nullComp, t2: nullComp }, aucComparison: { as: { ...nullComp, diffAUC: NaN }, t2: { ...nullComp, diffAUC: NaN } }};
        
        let d1 = cloneDeep(data1), d2 = cloneDeep(data2);
        if(t2Criteria && t2Logic){
             d1 = t2CriteriaManager.evaluateDataset(d1, t2Criteria, t2Logic);
             d2 = t2CriteriaManager.evaluateDataset(d2, t2Criteria, t2Logic);
        }

        const m1AS = calculateConfusionMatrix(d1, 'as', 'n');
        const m2AS = calculateConfusionMatrix(d2, 'as', 'n');
        const accCompAS = manualFisherExactTest(m1AS.rp + m1AS.rn, m1AS.fp + m1AS.fn, m2AS.rp + m2AS.rn, m2AS.fp + m2AS.fn);
        const g1AS = calculateDiagnosticPerformance(d1, 'as', 'n');
        const g2AS = calculateDiagnosticPerformance(d2, 'as', 'n');
        const aucCompAS = calculateZTestForAUCComparison(g1AS?.auc?.value, g1AS?.auc?.se, d1.length, g2AS?.auc?.value, g2AS?.auc?.se, d2.length);
        
        const m1T2 = calculateConfusionMatrix(d1, 't2', 'n');
        const m2T2 = calculateConfusionMatrix(d2, 't2', 'n');
        const accCompT2 = manualFisherExactTest(m1T2.rp + m1T2.rn, m1T2.fp + m1T2.fn, m2T2.rp + m2T2.rn, m2T2.fp + m2T2.fn);
        const g1T2 = calculateDiagnosticPerformance(d1, 't2', 'n');
        const g2T2 = calculateDiagnosticPerformance(d2, 't2', 'n');
        const aucCompT2 = calculateZTestForAUCComparison(g1T2?.auc?.value, g1T2?.auc?.se, d1.length, g2T2?.auc?.value, g2T2?.auc?.se, d2.length);

        return {
            accuracyComparison: { as: { ...accCompAS, testName: accCompAS.method + " (Accuracy)" }, t2: { ...accCompT2, testName: accCompT2.method + " (Accuracy)" } },
            aucComparison: { as: { ...aucCompAS, diffAUC: (g1AS?.auc?.value ?? NaN) - (g2AS?.auc?.value ?? NaN) }, t2: { ...aucCompT2, diffAUC: (g1T2?.auc?.value ?? NaN) - (g2T2?.auc?.value ?? NaN) } }
        };
    }

    function calculateDescriptiveStats(data) {
        if (!data || data.length === 0) return null;
        const n = data.length;
        const alterData = data.map(p => p?.alter).filter(a => a !== null && !isNaN(a)).sort((a,b) => a-b);
        const lkStats = (keyTotal, keyPlus, statusKey) => {
            const getCounts = (d, k) => d.map(p => p?.[k]).filter(c => c !== null && !isNaN(c));
            const total = getCounts(data, keyTotal);
            const plus = getCounts(data.filter(p => p?.[statusKey] === '+'), keyPlus);
            const getStats = (arr) => arr.length === 0 ? { median: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN, n: 0, q1: NaN, q3: NaN } : { median: statisticsHelpers.getMedian(arr), min: arr[0], max: arr[arr.length - 1], mean: statisticsHelpers.getMean(arr), sd: statisticsHelpers.getStdDev(arr), n: arr.length, q1: statisticsHelpers.getMedian(arr.slice(0, Math.floor(arr.length / 2))), q3: statisticsHelpers.getMedian(arr.slice(Math.ceil(arr.length/2))) };
            return { total: getStats(total), plus: getStats(plus) };
        };
        return {
            anzahlPatienten: n,
            alter: alterData.length > 0 ? { median: statisticsHelpers.getMedian(alterData), mean: statisticsHelpers.getMean(alterData), sd: statisticsHelpers.getStdDev(alterData), min: alterData[0], max: alterData[alterData.length - 1], n: alterData.length, q1: statisticsHelpers.getMedian(alterData.slice(0, Math.floor(alterData.length / 2))), q3: statisticsHelpers.getMedian(alterData.slice(Math.ceil(alterData.length/2))) } : { median: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN, n: 0, q1: NaN, q3: NaN },
            geschlecht: data.reduce((acc, p) => { acc[p?.geschlecht || 'unbekannt'] = (acc[p?.geschlecht || 'unbekannt'] || 0) + 1; return acc; }, {}),
            therapie: data.reduce((acc, p) => { acc[p?.therapie || 'unbekannt'] = (acc[p?.therapie || 'unbekannt'] || 0) + 1; return acc; }, {}),
            nStatus: data.reduce((acc, p) => { acc[p?.n === '+' ? 'plus' : 'minus'] = (acc[p?.n === '+' ? 'plus' : 'minus'] || 0) + 1; return acc; }, {plus:0, minus:0}),
            asStatus: data.reduce((acc, p) => { acc[p?.as === '+' ? 'plus' : 'minus'] = (acc[p?.as === '+' ? 'plus' : 'minus'] || 0) + 1; return acc; }, {plus:0, minus:0}),
            t2Status: data.reduce((acc, p) => { acc[p?.t2 === '+' ? 'plus' : 'minus'] = (acc[p?.t2 === '+' ? 'plus' : 'minus'] || 0) + 1; return acc; }, {plus:0, minus:0}),
            lkAnzahlen: { n: lkStats('anzahl_patho_lk', 'anzahl_patho_n_plus_lk', 'n'), as: lkStats('anzahl_as_lk', 'anzahl_as_plus_lk', 'as'), t2: lkStats('anzahl_t2_lk', 'anzahl_t2_plus_lk', 't2') },
            alterData: alterData
        };
    }

    function calculateAllStatsForPublication(data, appliedT2Criteria, appliedT2Logic, bruteForceResultsPerKollektiv) {
        if (!data || !Array.isArray(data)) return null;
        const results = { Gesamt: {}, 'direkt OP': {}, nRCT: {} };
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];

        kollektive.forEach(kollektivId => {
            const filteredData = dataProcessor.filterDataByKollektiv(data, kollektivId);
            if (filteredData.length === 0) { results[kollektivId] = null; return; }
            const evaluatedDataApplied = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), appliedT2Criteria, appliedT2Logic);
            results[kollektivId].deskriptiv = calculateDescriptiveStats(evaluatedDataApplied);
            results[kollektivId].gueteAS = calculateDiagnosticPerformance(evaluatedDataApplied, 'as', 'n');
            results[kollektivId].gueteT2_angewandt = calculateDiagnosticPerformance(evaluatedDataApplied, 't2', 'n');
            results[kollektivId].vergleichASvsT2_angewandt = compareDiagnosticMethods(evaluatedDataApplied, 'as', 't2', 'n');
            results[kollektivId].assoziation_angewandt = calculateAssociations(evaluatedDataApplied, appliedT2Criteria);

            results[kollektivId].gueteT2_literatur = {};
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySetConf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studySetConf.id);
                if (studySet && (!studySet.applicableKollektiv || studySet.applicableKollektiv === 'Gesamt' || studySet.applicableKollektiv === kollektivId)) {
                    const dataForEval = studySet.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt' ? dataProcessor.filterDataByKollektiv(data, studySet.applicableKollektiv) : filteredData;
                    if(dataForEval.length > 0) {
                        const evaluatedDataStudy = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForEval), studySet);
                        results[kollektivId].gueteT2_literatur[studySetConf.id] = calculateDiagnosticPerformance(evaluatedDataStudy, 't2', 'n');
                        results[kollektivId][`vergleichASvsT2_literatur_${studySetConf.id}`] = compareDiagnosticMethods(evaluatedDataStudy, 'as', 't2', 'n');
                    }
                }
            });

            const bfResultForKollektiv = bruteForceResultsPerKollektiv?.[kollektivId];
            if (bfResultForKollektiv?.bestResult?.criteria) {
                const evaluatedDataBF = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), bfResultForKollektiv.bestResult.criteria, bfResultForKollektiv.bestResult.logic);
                results[kollektivId].gueteT2_bruteforce = calculateDiagnosticPerformance(evaluatedDataBF, 't2', 'n');
                results[kollektivId].vergleichASvsT2_bruteforce = compareDiagnosticMethods(evaluatedDataBF, 'as', 't2', 'n');
                results[kollektivId].bruteforce_definition = { criteria: bfResultForKollektiv.bestResult.criteria, logic: bfResultForKollektiv.bestResult.logic, metricValue: bfResultForKollektiv.bestResult.metricValue, metricName: bfResultForKollektiv.metric };
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
