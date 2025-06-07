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

    function getQuartiles(arr) {
        if (!Array.isArray(arr) || arr.length < 4) return { q1: NaN, q3: NaN };
        const sortedArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x)).sort((a, b) => a - b);
        if (sortedArr.length < 4) return { q1: NaN, q3: NaN };
        const q1_pos = 0.25 * (sortedArr.length + 1);
        const q3_pos = 0.75 * (sortedArr.length + 1);
        const getQuartileValue = (pos) => {
            const base = Math.floor(pos) - 1;
            const rest = pos - Math.floor(pos);
            if (sortedArr[base + 1] !== undefined) {
                return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
            }
            return sortedArr[base];
        };
        return { q1: getQuartileValue(q1_pos), q3: getQuartileValue(q3_pos) };
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

    const _logGammaCache = {};
    function logGamma(xx) {
        if (xx <= 0) return NaN;
        if (_logGammaCache[xx]) return _logGammaCache[xx];
        const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
        let x = xx, y = x, tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let j = 0; j < 6; j++) ser += cof[j] / ++y;
        const result = -tmp + Math.log(2.5066282746310005 * ser / x);
        if (Object.keys(_logGammaCache).length < 1000) _logGammaCache[xx] = result;
        return result;
    }

    function chiSquareCDF(x, df) {
        if (x < 0 || df <= 0) return 0;
        return regularizedGammaIncomplete(df / 2.0, x / 2.0);
    }

    function regularizedGammaIncomplete(a, x) {
        const maxIterations = 200, epsilon = 1e-15;
        if (x < a + 1.0) {
            let sum = 1.0 / a, term = sum;
            for (let k = 1; k <= maxIterations; k++) {
                term *= x / (a + k); sum += term;
                if (Math.abs(term) < Math.abs(sum) * epsilon) break;
            }
            return Math.exp(a * Math.log(x) - x - logGamma(a)) * sum;
        } else {
            let b = x + 1.0 - a, c = 1.0 / epsilon, d = 1.0 / b, h = d;
            for (let k = 1; k <= maxIterations; k++) {
                const an = -k * (k - a); b += 2.0; d = an * d + b;
                if (Math.abs(d) < epsilon) d = epsilon;
                c = b + an / c; if (Math.abs(c) < epsilon) c = epsilon;
                d = 1.0 / d; const del = d * c; h *= del;
                if (Math.abs(del - 1.0) < epsilon) break;
            }
            return 1.0 - (Math.exp(a * Math.log(x) - x - logGamma(a)) * h);
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
        const correction = (b + c) < 25 ? 1 : 0;
        const statistic = Math.pow(Math.abs(b - c) - correction, 2) / n;
        const pValue = 1.0 - chiSquareCDF(statistic, 1);
        return { pValue, statistic, df: 1, method: `McNemar's Test${correction ? ' (Yates correction)' : ''}` };
    }
    
    function manualDeLongTest(data, key1, key2, referenceKey) {
        const positives = data.filter(p => p?.[referenceKey] === '+');
        const negatives = data.filter(p => p?.[referenceKey] === '-');
        const n_pos = positives.length;
        const n_neg = negatives.length;
        if (n_pos === 0 || n_neg === 0) return { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test" };
        
        const getAUCAndComponents = (key) => {
            const V10 = new Array(n_pos).fill(0);
            const V01 = new Array(n_neg).fill(0);
            for (let i = 0; i < n_pos; i++) {
                for (let j = 0; j < n_neg; j++) {
                    const val_p = positives[i]?.[key] === '+' ? 1.0 : (positives[i]?.[key] === '-' ? 0.0 : 0.5);
                    const val_n = negatives[j]?.[key] === '+' ? 1.0 : (negatives[j]?.[key] === '-' ? 0.0 : 0.5);
                    const score = val_p > val_n ? 1.0 : (val_p === val_n ? 0.5 : 0.0);
                    V10[i] += score;
                    V01[j] += score;
                }
            }
            V10.forEach((_, i) => V10[i] /= n_neg);
            V01.forEach((_, j) => V01[j] /= n_pos);
            const auc = getMean(V10);
            return { auc, V10, V01 };
        };

        const comps1 = getAUCAndComponents(key1);
        const comps2 = getAUCAndComponents(key2);
        if (!comps1 || !comps2) return { pValue: NaN, Z: NaN, diffAUC: NaN, method: "DeLong Test" };

        const S10_1 = getStdDev(comps1.V10)**2;
        const S01_1 = getStdDev(comps1.V01)**2;
        const S10_2 = getStdDev(comps2.V10)**2;
        const S01_2 = getStdDev(comps2.V01)**2;
        
        const cov = (arr1, arr2) => {
            const mean1 = getMean(arr1), mean2 = getMean(arr2);
            let sum = 0;
            for(let i=0; i<arr1.length; i++) sum += (arr1[i] - mean1) * (arr2[i] - mean2);
            return sum / (arr1.length - 1);
        };

        const Cov10 = cov(comps1.V10, comps2.V10);
        const Cov01 = cov(comps1.V01, comps2.V01);

        const varDiff = (S10_1 / n_pos) + (S01_1 / n_neg) + (S10_2 / n_pos) + (S01_2 / n_neg) - 2 * ((Cov10 / n_pos) + (Cov01 / n_neg));
        if (varDiff <= 0) return { pValue: 1.0, Z: 0, diffAUC: comps1.auc - comps2.auc, method: "DeLong Test" };
        const Z = (comps1.auc - comps2.auc) / Math.sqrt(varDiff);
        const pValue = 2 * (1 - normalCDF(Math.abs(Z)));

        return { pValue, Z, diffAUC: comps1.auc - comps2.auc, method: "DeLong Test" };
    }

    function calculateConfusionMatrix(data, predictionKey, referenceKey) {
        let rp = 0, fp = 0, fn = 0, rn = 0;
        data.forEach(p => {
            if (p && p[predictionKey] && p[referenceKey]) {
                const predicted = p[predictionKey] === '+';
                const actual = p[referenceKey] === '+';
                if (predicted && actual) rp++;
                else if (predicted && !actual) fp++;
                else if (!predicted && actual) fn++;
                else if (!predicted && !actual) rn++;
            }
        });
        return { rp, fp, fn, rn };
    }

    function calculatePhi(a, b, c, d) {
        const denominator = Math.sqrt((a + b) * (c + d) * (a + c) * (b + d));
        return denominator === 0 ? NaN : (a * d - b * c) / denominator;
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
    
    function calculateORCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const or_raw = (b * c) > 0 ? (a * d) / (b * c) : NaN;
        const a_adj = a + 0.5, b_adj = b + 0.5, c_adj = c + 0.5, d_adj = d + 0.5;
        const or_adj = (a_adj * d_adj) / (b_adj * c_adj);
        if (or_adj <= 0) return { value: or_raw, ci: null, method: 'Woolf Logit (Adjusted)' };

        const logOR = Math.log(or_adj);
        const seLogOR = Math.sqrt(1/a_adj + 1/b_adj + 1/c_adj + 1/d_adj);
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        return { value: or_raw, ci: { lower: Math.exp(logOR - z * seLogOR), upper: Math.exp(logOR + z * seLogOR) }, method: 'Woolf Logit (Haldane-Anscombe correction)' };
    }

    function calculateRDCI(a, b, c, d, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        const n1 = a + b, n2 = c + d;
        if(n1 === 0 || n2 === 0) return { value: NaN, ci: null, method: 'Wald' };
        const p1 = a / n1, p2 = c / n2;
        const rd = p1 - p2;
        const seRD = Math.sqrt((p1 * (1 - p1) / n1) + (p2 * (1 - p2) / n2));
        const z = Math.abs(inverseNormalCDF(alpha / 2.0));
        return { value: rd, ci: { lower: rd - z * seRD, upper: rd + z * seRD }, method: 'Wald' };
    }

    function manualFisherExactTest(a, b, c, d) {
        const n = a + b + c + d;
        let p = 0;
        for (let i = 0; i <= n; i++) {
            const j = a + b - i;
            const k = a + c - i;
            const l = d - a + i;
            if (j >= 0 && k >= 0 && l >= 0) {
                 const num = logGamma(a + b + 1) + logGamma(c + d + 1) + logGamma(a + c + 1) + logGamma(b + d + 1);
                 const den = logGamma(i + 1) + logGamma(j + 1) + logGamma(k + 1) + logGamma(l + 1) + logGamma(n + 1);
                 if (Math.exp(num - den) <= Math.exp(logGamma(a + b + 1) + logGamma(c + d + 1) + logGamma(a + c + 1) + logGamma(b + d + 1) - (logGamma(a + 1) + logGamma(b + 1) + logGamma(c + 1) + logGamma(d + 1) + logGamma(n + 1)))) {
                     p += Math.exp(num - den);
                 }
            }
        }
        return { pValue: p, method: "Fisher's Exact Test" };
    }

    function calculateAssociations(data, t2Criteria) {
        const results = {};
        const { rp: rpAS, fp: fpAS, fn: fnAS, rn: rnAS } = calculateConfusionMatrix(data, 'as', 'n');
        results.as = {
            matrix: { rp: rpAS, fp: fpAS, fn: fnAS, rn: rnAS },
            or: calculateORCI(rpAS, fpAS, fnAS, rnAS),
            rd: calculateRDCI(rpAS, fpAS, fnAS, rnAS),
            phi: { value: calculatePhi(rpAS, fpAS, fnAS, rnAS) },
            pValue: manualFisherExactTest(rpAS, fpAS, fnAS, rnAS).pValue,
            testName: "Fisher's Exact Test",
            featureName: "AS Positiv"
        };
        return results;
    }
    
    function compareCohorts(data1, data2, t2Criteria, t2Logic) { return null; }

    function calculateDescriptiveStats(data) {
        if (!data || data.length === 0) return null;
        const alterData = data.map(p => p.alter).filter(a => a != null);
        const lkData = data.map(p => p.lymphknoten_t2?.length || 0);
        return {
            anzahlPatienten: data.length,
            alter: { median: getMedian(alterData), mean: getMean(alterData), sd: getStdDev(alterData), min: Math.min(...alterData), max: Math.max(...alterData), q1: getQuartiles(alterData).q1, q3: getQuartiles(alterData).q3, alterData: alterData },
            geschlecht: data.reduce((acc, p) => { acc[p.geschlecht] = (acc[p.geschlecht] || 0) + 1; return acc; }, {}),
            therapie: data.reduce((acc, p) => { acc[p.therapie] = (acc[p.therapie] || 0) + 1; return acc; }, {}),
            nStatus: data.reduce((acc, p) => { acc[p.n === '+' ? 'plus' : 'minus'] = (acc[p.n === '+' ? 'plus' : 'minus'] || 0) + 1; return acc; }, {}),
            asStatus: data.reduce((acc, p) => { acc[p.as === '+' ? 'plus' : 'minus'] = (acc[p.as === '+' ? 'plus' : 'minus'] || 0) + 1; return acc; }, {}),
            t2Status: data.reduce((acc, p) => { acc[p.t2 === '+' ? 'plus' : 'minus'] = (acc[p.t2 === '+' ? 'plus' : 'minus'] || 0) + 1; return acc; }, {}),
            lkAnzahlen: {
                n: { total: { median: getMedian(data.map(p => p.anzahl_patho_lk)) } },
                as: { total: { median: getMedian(data.map(p => p.anzahl_as_lk)) } },
                t2: { total: { median: getMedian(data.map(p => p.anzahl_t2_lk)) } }
            }
        };
    }
    
    function calculateAllStatsForPublication(processedData, appliedT2Criteria, appliedT2Logic, bruteForceResults) {
        const results = {};
        const kollektive = [CONSTANTS.KOLEKTIV.GESAMT, CONSTANTS.KOLEKTIV.DIREKT_OP, CONSTANTS.KOLEKTIV.NRCT];
        
        kollektive.forEach(kolId => {
            const data = dataManager.filterDataByKollektiv(processedData, kolId);
            const evaluatedData = t2CriteriaManager.evaluateDataset(data, appliedT2Criteria, appliedT2Logic);
            
            results[kolId] = {
                deskriptiv: calculateDescriptiveStats(evaluatedData),
                gueteAS: calculateDiagnosticPerformance(evaluatedData, 'as', 'n'),
                gueteT2_angewandt: calculateDiagnosticPerformance(evaluatedData, 't2', 'n'),
                vergleichASvsT2_angewandt: compareDiagnosticMethods(evaluatedData, 'as', 't2', 'n'),
                assoziation_angewandt: calculateAssociations(evaluatedData, appliedT2Criteria)
            };

            results[kolId].gueteT2_literatur = {};
            const studySets = studyT2CriteriaManager.getAllStudyCriteriaSets();
            studySets.forEach(studySet => {
                const evaluatedStudyData = studyT2CriteriaManager.applyStudyCriteriaToDataset(data, studySet.id);
                results[kolId].gueteT2_literatur[studySet.id] = calculateDiagnosticPerformance(evaluatedStudyData, 't2', 'n');
                results[kolId][`vergleichASvsT2_literatur_${studySet.id}`] = compareDiagnosticMethods(evaluatedStudyData, 'as', 't2', 'n');
            });

            const bfResult = bruteForceResults ? bruteForceResults[kolId] : null;
            if(bfResult && bfResult.bestResult){
                const bfEvaluatedData = t2CriteriaManager.evaluateDataset(data, bfResult.bestResult.criteria, bfResult.bestResult.logic);
                results[kolId].gueteT2_bruteforce = calculateDiagnosticPerformance(bfEvaluatedData, 't2', 'n');
                results[kolId].vergleichASvsT2_bruteforce = compareDiagnosticMethods(bfEvaluatedData, 'as', 't2', 'n');
                results[kolId].bruteforce_definition = bfResult.bestResult;
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
