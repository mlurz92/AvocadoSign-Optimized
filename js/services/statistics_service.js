const statisticsService = (() => {

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
        return sign * y;
    }

    function normalCDF(x, mean = 0, stdDev = 1) {
        if (isNaN(x) || isNaN(mean) || isNaN(stdDev) || stdDev <= 0) return NaN;
        const z = (x - mean) / (stdDev * Math.sqrt(2));
        return 0.5 * (1 + erf(z));
    }

    function inverseNormalCDF(p, mean = 0, stdDev = 1) {
        if (isNaN(p) || p < 0 || p > 1) return NaN;
        if (p === 0) return -Infinity; if (p === 1) return Infinity; if (p === 0.5) return mean;
        
        let low = -100.0, high = 100.0, mid;
        for (let i = 0; i < 100; i++) {
            mid = (low + high) / 2.0;
            if (normalCDF(mid) < p) low = mid;
            else high = mid;
        }
        return mean + stdDev * mid;
    }

    function logGamma(n) {
        const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
        let x = n, y = n, tmp = n + 5.5;
        tmp -= (n + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
        return -tmp + Math.log(2.5066282746310005 * ser / x);
    }

    function chiSquareCDF(x, df) {
        if (x < 0 || df <= 0) return 0;
        return regularizedGammaIncomplete(df / 2.0, x / 2.0);
    }

    function regularizedGammaIncomplete(a, x) {
        const maxIterations = 100, epsilon = 3e-7;
        if (x < a + 1) {
            let sum = 1 / a, term = sum;
            for (let k = 1; k < maxIterations; k++) {
                term *= x / (a + k);
                sum += term;
            }
            return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
        } else {
            let term = 1 / x, sum = term;
            for (let k = 1; k < maxIterations; k++) {
                term *= (k - a) / x;
                sum += term;
            }
            return 1 - (sum * Math.exp(-x + a * Math.log(x) - logGamma(a)));
        }
    }
    
    function calculateWilsonScoreCI(successes, trials, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        if (trials <= 0) return { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION };
        const p_hat = successes / trials;
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        const z2 = z * z;
        const center = p_hat + z2 / (2 * trials);
        const width = z * Math.sqrt((p_hat * (1 - p_hat) / trials) + (z2 / (4 * trials * trials)));
        const denominator = 1 + z2 / trials;
        return {
            lower: Math.max(0, (center - width) / denominator),
            upper: Math.min(1, (center + width) / denominator),
            method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION
        };
    }

    function bootstrapCI(data, statisticFn, nBoot = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const n = data.length;
        if (n < 2) return { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        const bootStats = [];
        for (let i = 0; i < nBoot; i++) {
            const bootSample = Array.from({ length: n }, () => data[Math.floor(Math.random() * n)]);
            const stat = statisticFn(bootSample);
            if (isFinite(stat)) bootStats.push(stat);
        }
        if (bootStats.length < nBoot * 0.8) return { lower: NaN, upper: NaN, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE, se: NaN };
        bootStats.sort((a, b) => a - b);
        const lowerIndex = Math.floor(bootStats.length * (alpha / 2));
        const upperIndex = Math.ceil(bootStats.length * (1 - alpha / 2)) - 1;
        return {
            lower: bootStats[lowerIndex],
            upper: bootStats[upperIndex],
            method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE,
            se: getStdDev(bootStats)
        };
    }

    function manualMcNemarTest(b, c) {
        const n = b + c;
        if (n === 0) return { pValue: 1.0, statistic: 0, df: 1, method: "McNemar's Test" };
        const statistic = Math.pow(Math.abs(b - c) - 1, 2) / n;
        const pValue = 1.0 - chiSquareCDF(statistic, 1);
        return { pValue, statistic, df: 1, method: "McNemar's Test (continuity corrected)" };
    }
    
    function manualDeLongTest(data, key1, key2, referenceKey) {
        const positives = data.filter(p => p[referenceKey] === '+');
        const negatives = data.filter(p => p[referenceKey] === '-');
        if (positives.length === 0 || negatives.length === 0) return { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test" };
        const getAUCComps = (key) => {
            let structuralPairs = 0;
            positives.forEach(p => {
                negatives.forEach(n => {
                    const v_p = p[key] === '+' ? 1 : 0;
                    const v_n = n[key] === '+' ? 1 : 0;
                    if (v_p > v_n) structuralPairs += 1;
                    else if (v_p === v_n) structuralPairs += 0.5;
                });
            });
            return structuralPairs / (positives.length * negatives.length);
        };
        const auc1 = getAUCComps(key1);
        const auc2 = getAUCComps(key2);
        return { pValue: 0.999, Z: 0.0, diffAUC: auc1 - auc2, method: "DeLong Test (Placeholder)" };
    }

    function calculateConfusionMatrix(data, predictionKey, referenceKey) {
        let rp = 0, fp = 0, fn = 0, rn = 0;
        data.forEach(p => {
            const predicted = p[predictionKey] === '+';
            const actual = p[referenceKey] === '+';
            if (p[predictionKey] && p[referenceKey]) {
                if (predicted && actual) rp++;
                else if (predicted && !actual) fp++;
                else if (!predicted && actual) fn++;
                else if (!predicted && !actual) rn++;
            }
        });
        return { rp, fp, fn, rn };
    }

    function calculateDiagnosticPerformance(data, predictionKey, referenceKey) {
        const matrix = calculateConfusionMatrix(data, predictionKey, referenceKey);
        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        if (total === 0) return null;

        const sens = (rp + fn) > 0 ? rp / (rp + fn) : NaN;
        const spez = (fp + rn) > 0 ? rn / (fp + rn) : NaN;
        const ppv = (rp + fp) > 0 ? rp / (rp + fp) : NaN;
        const npv = (fn + rn) > 0 ? rn / (fn + rn) : NaN;
        const acc = total > 0 ? (rp + rn) / total : NaN;
        const balAcc = (isNaN(sens) || isNaN(spez)) ? NaN : (sens + spez) / 2.0;
        const f1 = (isNaN(ppv) || isNaN(sens) || (ppv + sens) === 0) ? NaN : 2 * (ppv * sens) / (ppv + sens);
        
        const bootstrapFnFactory = (metric) => (sample) => {
            const m = calculateConfusionMatrix(sample, predictionKey, referenceKey);
            const t = m.rp + m.fp + m.fn + m.rn; if(t===0) return NaN;
            const se = (m.rp + m.fn) > 0 ? m.rp / (m.rp + m.fn) : NaN;
            const sp = (m.fp + m.rn) > 0 ? m.rn / (m.fp + m.rn) : NaN;
            if(metric === 'balAcc' || metric === 'auc') return (isNaN(se) || isNaN(sp)) ? NaN : (se+sp)/2;
            if(metric === 'f1') {
                const pv = (m.rp + m.fp) > 0 ? m.rp / (m.rp + m.fp) : NaN;
                return (isNaN(pv) || isNaN(se) || (pv + se) === 0) ? NaN : 2 * (pv * se) / (pv + se);
            }
            return NaN;
        };

        return {
            matrix,
            sens: { value: sens, ci: calculateWilsonScoreCI(rp, rp + fn), n_trials: rp + fn },
            spez: { value: spez, ci: calculateWilsonScoreCI(rn, fp + rn), n_trials: fp + rn },
            ppv: { value: ppv, ci: calculateWilsonScoreCI(rp, rp + fp), n_trials: rp + fp },
            npv: { value: npv, ci: calculateWilsonScoreCI(rn, fn + rn), n_trials: fn + rn },
            acc: { value: acc, ci: calculateWilsonScoreCI(rp + rn, total), n_trials: total },
            balAcc: { value: balAcc, ...bootstrapCI(data, bootstrapFnFactory('balAcc')) },
            f1: { value: f1, ...bootstrapCI(data, bootstrapFnFactory('f1')) },
            auc: { value: balAcc, ...bootstrapCI(data, bootstrapFnFactory('auc')) }
        };
    }
    
    function compareDiagnosticMethods(data, key1, key2, referenceKey) {
        if (data.length === 0) return null;
        let b = 0, c = 0;
        data.forEach(p => {
            if (p[key1] === '+' && p[key2] === '-') b++;
            if (p[key1] === '-' && p[key2] === '+') c++;
        });
        const mcnemar = manualMcNemarTest(b, c);
        const delong = manualDeLongTest(data, key1, key2, referenceKey);
        return { mcnemar, delong };
    }
    
    function calculateAllStatsForPublication(processedData, appliedT2Criteria, appliedT2Logic, bruteForceResults) {
        const results = {};
        const kollektive = [CONSTANTS.KOLEKTIV.GESAMT, CONSTANTS.KOLEKTIV.DIREKT_OP, CONSTANTS.KOLEKTIV.NRCT];
        
        kollektive.forEach(kolId => {
            const data = dataManager.filterDataByKollektiv(processedData, kolId);
            const evaluatedData = t2CriteriaManager.evaluateDataset(data, appliedT2Criteria, appliedT2Logic);
            
            results[kolId] = {
                deskriptiv: statisticsService.calculateDescriptiveStats(evaluatedData),
                gueteAS: statisticsService.calculateDiagnosticPerformance(evaluatedData, 'as', 'n'),
                gueteT2_angewandt: statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n'),
                vergleichASvsT2_angewandt: statisticsService.compareDiagnosticMethods(evaluatedData, 'as', 't2', 'n'),
                assoziation_angewandt: statisticsService.calculateAssociations(evaluatedData, appliedT2Criteria)
            };

            results[kolId].gueteT2_literatur = {};
            const studySets = studyT2CriteriaManager.getAllStudyCriteriaSets();
            studySets.forEach(studySet => {
                const evaluatedStudyData = studyT2CriteriaManager.applyStudyCriteriaToDataset(data, studySet.id);
                results[kolId].gueteT2_literatur[studySet.id] = statisticsService.calculateDiagnosticPerformance(evaluatedStudyData, 't2', 'n');
                results[kolId][`vergleichASvsT2_literatur_${studySet.id}`] = statisticsService.compareDiagnosticMethods(evaluatedStudyData, 'as', 't2', 'n');
            });

            const bfResult = bruteForceResults ? bruteForceResults[kolId] : null;
            if(bfResult && bfResult.bestResult){
                const bfEvaluatedData = t2CriteriaManager.evaluateDataset(data, bfResult.bestResult.criteria, bfResult.bestResult.logic);
                results[kolId].gueteT2_bruteforce = statisticsService.calculateDiagnosticPerformance(bfEvaluatedData, 't2', 'n');
                results[kolId].vergleichASvsT2_bruteforce = statisticsService.compareDiagnosticMethods(bfEvaluatedData, 'as', 't2', 'n');
                results[kolId].bruteforce_definition = bfResult.bestResult;
            }
        });
        return results;
    }
    
    return Object.freeze({
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateAssociations: () => ({}),
        compareCohorts: () => ({}),
        calculateDescriptiveStats: () => ({}),
        calculateAllStatsForPublication
    });
})();
