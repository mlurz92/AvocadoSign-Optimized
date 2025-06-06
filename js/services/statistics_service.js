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
        const numericArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x));
        if (numericArr.length < 2) return NaN;
        const mean = getMean(numericArr);
        if (isNaN(mean)) return NaN;
        const variance = numericArr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (numericArr.length - 1);
        return Math.sqrt(variance);
    }

    function getQuartiles(arr) {
        const sortedArr = arr.map(x => parseFloat(x)).filter(x => !isNaN(x) && isFinite(x)).sort((a, b) => a - b);
        if (sortedArr.length === 0) return { q1: NaN, median: NaN, q3: NaN };

        const pos = (p) => {
            const index = p * (sortedArr.length - 1);
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            if (lower === upper) return sortedArr[lower];
            return sortedArr[lower] * (upper - index) + sortedArr[upper] * (index - lower);
        };
        return { q1: pos(0.25), median: pos(0.5), q3: pos(0.75) };
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
        if (stdDev <= 0) return x < mean ? 0.0 : 1.0;
        return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
    }

    function inverseNormalCDF(p) {
        if (p <= 0) return -Infinity;
        if (p >= 1) return Infinity;
        let low = -10, high = 10;
        while (high - low > 1e-9) {
            const mid = (low + high) / 2;
            if (normalCDF(mid) < p) low = mid;
            else high = mid;
        }
        return (low + high) / 2;
    }

    function calculateWilsonScoreCI(successes, trials, alpha = 0.05) {
        const z = Math.abs(inverseNormalCDF(1 - alpha / 2.0));
        const p_hat = successes / trials;
        const term1 = p_hat + (z * z) / (2 * trials);
        const term2 = z * Math.sqrt((p_hat * (1 - p_hat) / trials) + (z * z) / (4 * trials * trials));
        const denominator = 1 + (z * z) / trials;
        const lower = (term1 - term2) / denominator;
        const upper = (term1 + term2) / denominator;
        return { lower: Math.max(0, lower), upper: Math.min(1, upper) };
    }
    
    function calculateConfusionMatrix(data, predictionKey, referenceKey) {
        let rp = 0, fp = 0, fn = 0, rn = 0;
        data.forEach(p => {
            if (p && (p[predictionKey] === '+' || p[predictionKey] === '-') && (p[referenceKey] === '+' || p[referenceKey] === '-')) {
                const predictedPositive = p[predictionKey] === '+';
                const actualPositive = p[referenceKey] === '+';
                if (predictedPositive && actualPositive) rp++;
                else if (predictedPositive && !actualPositive) fp++;
                else if (!predictedPositive && actualPositive) fn++;
                else if (!predictedPositive && !actualPositive) rn++;
            }
        });
        return { rp, fp, fn, rn };
    }

    function calculateDiagnosticPerformance(data, predictionKey, referenceKey) {
        const matrix = calculateConfusionMatrix(data, predictionKey, referenceKey);
        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        const pos = rp + fn;
        const neg = fp + rn;
        const predPos = rp + fp;
        const predNeg = rn + fn;

        const sens = pos > 0 ? rp / pos : 0;
        const spez = neg > 0 ? rn / neg : 0;
        const ppv = predPos > 0 ? rp / predPos : 0;
        const npv = predNeg > 0 ? rn / predNeg : 0;
        const acc = total > 0 ? (rp + rn) / total : 0;
        const balAcc = (sens + spez) / 2;
        const f1 = (ppv + sens) > 0 ? 2 * (ppv * sens) / (ppv + sens) : 0;

        return {
            matrix,
            sens: { value: sens, ci: pos > 0 ? calculateWilsonScoreCI(rp, pos) : null },
            spez: { value: spez, ci: neg > 0 ? calculateWilsonScoreCI(rn, neg) : null },
            ppv: { value: ppv, ci: predPos > 0 ? calculateWilsonScoreCI(rp, predPos) : null },
            npv: { value: npv, ci: predNeg > 0 ? calculateWilsonScoreCI(rn, predNeg) : null },
            acc: { value: acc, ci: total > 0 ? calculateWilsonScoreCI(rp + rn, total) : null },
            balAcc: { value: balAcc, ci: null },
            f1: { value: f1, ci: null },
            auc: { value: balAcc, ci: null }
        };
    }

    function manualMcNemarTest(b, c) {
        const n = b + c;
        if (n === 0) return { pValue: 1.0, statistic: 0 };
        const statistic = Math.pow(Math.abs(b - c) - 1, 2) / n;
        const pValue = 1.0 - normalCDF(Math.sqrt(statistic));
        return { pValue: 2 * pValue, statistic };
    }
    
    function manualDeLongTest(data, key1, key2, referenceKey) {
        const positives = data.filter(p => p && p[referenceKey] === '+');
        const negatives = data.filter(p => p && p[referenceKey] === '-');
        if (positives.length === 0 || negatives.length === 0) return { pValue: NaN, Z: NaN };

        const getV = (scores) => {
            const V10 = new Array(positives.length).fill(0);
            const V01 = new Array(negatives.length).fill(0);
            for (let i = 0; i < positives.length; i++) {
                for (let j = 0; j < negatives.length; j++) {
                    const score = (scores[i] > scores[j]) ? 1 : (scores[i] === scores[j]) ? 0.5 : 0;
                    V10[i] += score;
                    V01[j] += score;
                }
            }
            return { V10: V10.map(v => v / negatives.length), V01: V01.map(v => v / positives.length) };
        };
        
        const scores1 = data.map(p => p[key1] === '+' ? 1 : 0);
        const scores2 = data.map(p => p[key2] === '+' ? 1 : 0);
        const { V10: V10_1, V01: V01_1 } = getV(scores1.filter((s, i) => data[i][referenceKey] === '+').concat(scores1.filter((s, i) => data[i][referenceKey] === '-')));
        const { V10: V10_2, V01: V01_2 } = getV(scores2.filter((s, i) => data[i][referenceKey] === '+').concat(scores2.filter((s, i) => data[i][referenceKey] === '-')));
        
        const auc1 = V10_1.reduce((a, b) => a + b, 0) / V10_1.length;
        const auc2 = V10_2.reduce((a, b) => a + b, 0) / V10_2.length;
        const aucDiff = auc1 - auc2;

        const S10 = getStdDev(V10_1.map((v, i) => v - V10_2[i]));
        const S01 = getStdDev(V01_1.map((v, i) => v - V01_2[i]));
        const S = (S10 / positives.length) + (S01 / negatives.length);
        const Z = aucDiff / Math.sqrt(S);
        const pValue = 2 * (1 - normalCDF(Math.abs(Z)));
        
        return { pValue, Z };
    }

    function compareDiagnosticMethods(data, key1, key2, referenceKey) {
        const matrix1 = calculateConfusionMatrix(data, key1, referenceKey);
        const matrix2 = calculateConfusionMatrix(data, key2, referenceKey);
        
        let b = 0, c = 0;
        data.forEach(p => {
            const pred1 = p[key1] === '+';
            const pred2 = p[key2] === '+';
            const actual = p[referenceKey] === '+';
            if (pred1 && !pred2) b++;
            if (!pred1 && pred2) c++;
        });

        return {
            mcnemar: manualMcNemarTest(b, c),
            delong: manualDeLongTest(data, key1, key2, referenceKey)
        };
    }
    
    function calculateAllStats(data, t2Criteria, t2Logic) {
        const evaluatedData = t2CriteriaManager.evaluateDatasetWithCriteria(data, t2Criteria, t2Logic);
        
        return {
            descriptive: calculateDescriptiveStats(evaluatedData),
            avocadoSign: calculateDiagnosticPerformance(evaluatedData, 'as', 'n'),
            t2: calculateDiagnosticPerformance(evaluatedData, 't2', 'n'),
            comparison: compareDiagnosticMethods(evaluatedData, 'as', 't2', 'n'),
            associations: calculateAssociations(evaluatedData, t2Criteria),
        };
    }
    
    function calculateDescriptiveStats(data) {
        if (!data || data.length === 0) return null;
        const n = data.length;
        const ages = data.map(p => p.alter).filter(a => a !== null);
        const ageQuartiles = getQuartiles(ages);
        
        const gender = data.reduce((acc, p) => { acc[p.geschlecht] = (acc[p.geschlecht] || 0) + 1; return acc; }, {m: 0, f: 0});
        const therapy = data.reduce((acc, p) => { acc[p.therapie] = (acc[p.therapie] || 0) + 1; return acc; }, {'direkt OP': 0, nRCT: 0});
        
        const nStatus = data.reduce((acc, p) => { acc[p.n === '+' ? 'positive' : 'negative'] = (acc[p.n === '+' ? 'positive' : 'negative'] || 0) + 1; return acc; }, {positive: 0, negative: 0});
        
        return {
            count: n,
            age: { median: ageQuartiles.median, q1: ageQuartiles.q1, q3: ageQuartiles.q3 },
            gender,
            therapy,
            nStatus,
            ageData: ages
        };
    }

    function calculateAssociations(data, t2Criteria) {
        // Placeholder for association logic
        return {};
    }

    return Object.freeze({
        calculateAllStats,
        calculateDescriptiveStats,
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateAssociations,
    });

})();
