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
        if (trials === 0) return { lower: 0, upper: 1 };
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
        const f1 = (ppv + sens) > 1e-9 ? 2 * (ppv * sens) / (ppv + sens) : 0;

        return {
            matrix,
            sens: { value: sens, ci: calculateWilsonScoreCI(rp, pos), matrix_components: matrix },
            spez: { value: spez, ci: calculateWilsonScoreCI(rn, neg), matrix_components: matrix },
            ppv: { value: ppv, ci: calculateWilsonScoreCI(rp, predPos), matrix_components: matrix },
            npv: { value: npv, ci: calculateWilsonScoreCI(rn, predNeg), matrix_components: matrix },
            acc: { value: acc, ci: calculateWilsonScoreCI(rp + rn, total), matrix_components: matrix },
            balAcc: { value: balAcc, ci: null, matrix_components: matrix },
            f1: { value: f1, ci: null, matrix_components: matrix },
            auc: { value: balAcc, ci: null, matrix_components: matrix }
        };
    }

    function manualMcNemarTest(b, c) {
        const n = b + c;
        if (n === 0) return { pValue: 1.0, statistic: 0 };
        const statistic = Math.pow(Math.abs(b - c) - 1, 2) / n;
        const pValue = 2 * (1.0 - normalCDF(Math.sqrt(statistic)));
        return { pValue: pValue, statistic };
    }

    function manualDeLongTest(data, key1, key2, referenceKey) {
        const positives = data.filter(p => p && p[referenceKey] === '+');
        const negatives = data.filter(p => p && p[referenceKey] === '-');
        if (positives.length === 0 || negatives.length === 0) return { pValue: NaN, Z: NaN };

        const scores_method1 = data.map(p => p[key1] === '+' ? 1 : 0);
        const scores_method2 = data.map(p => p[key2] === '+' ? 1 : 0);
        const ref_status = data.map(p => p[referenceKey] === '+' ? 1 : 0);

        const getV_delong = (methodScores, referenceStatus) => {
            const positives_scores = [];
            const negatives_scores = [];
            for (let i = 0; i < methodScores.length; i++) {
                if (referenceStatus[i] === 1) {
                    positives_scores.push(methodScores[i]);
                } else {
                    negatives_scores.push(methodScores[i]);
                }
            }

            const m = positives_scores.length;
            const n = negatives_scores.length;
            if (m === 0 || n === 0) return { V10: [], V01: [] };

            const V10 = new Array(m).fill(0);
            const V01 = new Array(n).fill(0);

            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    const score_diff = positives_scores[i] - negatives_scores[j];
                    const val = score_diff > 0 ? 1 : (score_diff === 0 ? 0.5 : 0);
                    V10[i] += val;
                    V01[j] += val;
                }
            }
            return {
                V10: V10.map(v => v / n),
                V01: V01.map(v => v / m)
            };
        };

        const v1 = getV_delong(scores_method1, ref_status);
        const v2 = getV_delong(scores_method2, ref_status);

        if (v1.V10.length === 0 || v2.V10.length === 0) return { pValue: NaN, Z: NaN };
        
        const auc1 = getMean(v1.V10);
        const auc2 = getMean(v2.V10);

        if (isNaN(auc1) || isNaN(auc2)) return { pValue: NaN, Z: NaN };

        const S10_1 = getStdDev(v1.V10) ** 2;
        const S01_1 = getStdDev(v1.V01) ** 2;
        const S10_2 = getStdDev(v2.V10) ** 2;
        const S01_2 = getStdDev(v2.V01) ** 2;

        let S10_12 = 0;
        const mean_v10_1 = getMean(v1.V10);
        const mean_v10_2 = getMean(v2.V10);
        for(let i=0; i < v1.V10.length; i++){
            S10_12 += (v1.V10[i] - mean_v10_1) * (v2.V10[i] - mean_v10_2);
        }
        S10_12 /= (v1.V10.length-1);

        let S01_12 = 0;
        const mean_v01_1 = getMean(v1.V01);
        const mean_v01_2 = getMean(v2.V01);
        for(let i=0; i < v1.V01.length; i++){
            S01_12 += (v1.V01[i] - mean_v01_1) * (v2.V01[i] - mean_v01_2);
        }
        S01_12 /= (v1.V01.length-1);

        const var_diff = (S10_1 / v1.V10.length) + (S01_1 / v1.V01.length) +
                         (S10_2 / v2.V10.length) + (S01_2 / v2.V01.length) -
                         2 * (S10_12 / v1.V10.length + S01_12 / v1.V01.length);
        
        if (var_diff <= 0) return { pValue: 1.0, Z: 0 };
        
        const Z = (auc1 - auc2) / Math.sqrt(var_diff);
        const pValue = 2 * (1 - normalCDF(Math.abs(Z)));

        return { pValue, Z };
    }

    function compareDiagnosticMethods(data, key1, key2, referenceKey) {
        let b = 0, c = 0;
        data.forEach(p => {
            if ((p[key1] === '+' || p[key1] === '-') && (p[key2] === '+' || p[key2] === '-') && (p[referenceKey] === '+' || p[referenceKey] === '-')) {
                const pred1_pos = p[key1] === '+';
                const pred2_pos = p[key2] === '+';
                if (pred1_pos && !pred2_pos) b++;
                if (!pred1_pos && pred2_pos) c++;
            }
        });
        const mcnemarResult = manualMcNemarTest(b, c);
        const delongResult = manualDeLongTest(data, key1, key2, referenceKey);

        return {
            mcnemar: mcnemarResult,
            delong: delongResult
        };
    }

    function calculateDescriptiveStats(data) {
        if (!data || data.length === 0) return null;
        const n = data.length;
        const ages = data.map(p => p.alter).filter(a => typeof a === 'number' && !isNaN(a));
        const ageQuartiles = getQuartiles(ages);
        const ageMean = getMean(ages);
        const ageStdDev = getStdDev(ages);

        const gender = data.reduce((acc, p) => { acc[p.geschlecht] = (acc[p.geschlecht] || 0) + 1; return acc; }, {m: 0, f: 0, unbekannt: 0});
        const therapy = data.reduce((acc, p) => { acc[p.therapie] = (acc[p.therapie] || 0) + 1; return acc; }, {'direkt OP': 0, nRCT: 0, unbekannt: 0});
        const nStatus = data.reduce((acc, p) => { acc[p.n === '+' ? 'positive' : (p.n === '-' ? 'negative' : 'unbekannt')] = (acc[p.n === '+' ? 'positive' : (p.n === '-' ? 'negative' : 'unbekannt')] || 0) + 1; return acc; }, {positive: 0, negative: 0, unbekannt: 0});

        return {
            count: n,
            age: { median: ageQuartiles.median, q1: ageQuartiles.q1, q3: ageQuartiles.q3, mean: ageMean, sd: ageStdDev },
            gender,
            therapy,
            nStatus,
            ageData: ages
        };
    }

    function calculateFisherExact(a, b, c, d) {
        const total = a + b + c + d;
        if (total === 0) return { pValue: NaN };

        const logFactorial = (n) => {
            if (n <= 1) return 0;
            let sum = 0;
            for (let i = 2; i <= n; i++) {
                sum += Math.log(i);
            }
            return sum;
        };

        const logHypergeometricProb = (a, b, c, d) => {
            return logFactorial(a + b) + logFactorial(c + d) + logFactorial(a + c) + logFactorial(b + d) - logFactorial(a + b + c + d) - logFactorial(a) - logFactorial(b) - logFactorial(c) - logFactorial(d);
        };

        const p_observed = Math.exp(logHypergeometricProb(a, b, c, d));
        let p_value = 0;

        for (let i = 0; i <= Math.min(a + b, a + c); i++) {
            const current_a = i;
            const current_b = (a + b) - i;
            const current_c = (a + c) - i;
            const current_d = (c + d) - current_c;
            if(current_b < 0 || current_c < 0 || current_d < 0) continue;

            const p_current = Math.exp(logHypergeometricProb(current_a, current_b, current_c, current_d));
            if (p_current <= p_observed * (1 + 1e-8)) {
                p_value += p_current;
            }
        }
        return { pValue: p_value };
    }

    function calculateOddsRatioAndRiskDifference(a, b, c, d) {
        const or = (b > 0 && c > 0) ? (a * d) / (b * c) : NaN;
        const p_exposed = (a + b) > 0 ? a / (a + b) : 0;
        const p_unexposed = (c + d) > 0 ? c / (c + d) : 0;
        const rd = p_exposed - p_unexposed;
        const log_or = Math.log(or);
        const se_log_or = Math.sqrt(1/a + 1/b + 1/c + 1/d);
        
        const ci_or_lower = isNaN(or) ? NaN : Math.exp(log_or - 1.96 * se_log_or);
        const ci_or_upper = isNaN(or) ? NaN : Math.exp(log_or + 1.96 * se_log_or);

        const se_rd = Math.sqrt( (p_exposed * (1 - p_exposed) / (a + b)) + (p_unexposed * (1 - p_unexposed) / (c + d)) );
        const ci_rd_lower = rd - 1.96 * se_rd;
        const ci_rd_upper = rd + 1.96 * se_rd;

        return {
            or: { value: or, ci: { lower: ci_or_lower, upper: ci_or_upper } },
            rd: { value: rd, ci: { lower: ci_rd_lower, upper: ci_rd_upper } }
        };
    }

    function calculatePhiCoefficient(a, b, c, d) {
        const numerator = (a * d) - (b * c);
        const denominator = Math.sqrt((a + b) * (c + d) * (a + c) * (b + d));
        return denominator === 0 ? 0 : numerator / denominator;
    }

    function mannWhitneyU(dataNplus, dataNminus) {
        if (!dataNplus || dataNplus.length === 0 || !dataNminus || dataNminus.length === 0) {
            return { pValue: NaN };
        }

        const combined = [
            ...dataNplus.map(value => ({ value, group: 'A' })),
            ...dataNminus.map(value => ({ value, group: 'B' }))
        ];
        combined.sort((a, b) => a.value - b.value);

        let ranks = [];
        for (let i = 0; i < combined.length;) {
            let j = i;
            while (j < combined.length && combined[j].value === combined[i].value) {
                j++;
            }
            const rank = (i + 1 + j) / 2;
            for (let k = i; k < j; k++) {
                ranks.push({ ...combined[k], rank: rank });
            }
            i = j;
        }

        const R1 = ranks.filter(r => r.group === 'A').reduce((sum, r) => sum + r.rank, 0);
        const n1 = dataNplus.length;
        const n2 = dataNminus.length;
        
        const U1 = R1 - (n1 * (n1 + 1)) / 2;
        const U2 = n1 * n2 - U1;
        const U = Math.min(U1, U2);

        const meanU = n1 * n2 / 2;
        const tieCorrection = Object.values(ranks.reduce((acc, r) => { acc[r.value] = (acc[r.value] || 0) + 1; return acc; }, {}))
                                     .reduce((sum, t) => sum + (Math.pow(t, 3) - t), 0);
        const sdU = Math.sqrt( (n1 * n2 * (n1 + n2 + 1) / 12) - (n1 * n2 * tieCorrection / (12 * (n1 + n2) * (n1 + n2 - 1))) );

        if (sdU === 0) return { pValue: 1.0 };
        
        const z = (U - meanU) / sdU;
        const pValue = 2 * normalCDF(z);
        
        return { pValue: pValue };
    }

    function calculateAssociations(data, t2Criteria) {
        const associations = {};
        const featureKeys = ['form', 'kontur', 'homogenitaet', 'signal'];
        const featureNames = { size: 'Lymphknotengröße', form: 'Form', kontur: 'Kontur', homogenitaet: 'Homogenität', signal: 'Signalintensität' };

        const patientNStatusMap = new Map(data.map(p => [p.nr, p.n]));

        const allLymphNodesWithPatientData = data.flatMap(p => 
            (p.lymphknoten_t2_bewertet || []).map(lkb => ({
                ...lkb,
                n_status: p.n 
            }))
        ).filter(l => l && l.lk && typeof l.lk.groesse === 'number' && (l.n_status === '+' || l.n_status === '-'));

        const lkSizesNplus = allLymphNodesWithPatientData.filter(l => l.n_status === '+').map(l => l.lk.groesse);
        const lkSizesNminus = allLymphNodesWithPatientData.filter(l => l.n_status === '-').map(l => l.lk.groesse);
        associations.size_mwu = { featureName: featureNames.size, ...mannWhitneyU(lkSizesNplus, lkSizesNminus) };

        featureKeys.forEach(key => {
            const featureConfig = t2Criteria[key];
            if (featureConfig?.active && featureConfig?.value) {
                let a = 0, b = 0, c = 0, d = 0;
                data.forEach(patient => {
                    if (patient.n === null || !patient.lymphknoten_t2_bewertet) return;
                    const hasPositiveFeature = patient.lymphknoten_t2_bewertet.some(lkb => lkb && lkb.lk && lkb.lk[key] === featureConfig.value);
                    if (patient.n === '+') {
                        if (hasPositiveFeature) a++; else c++;
                    } else {
                        if (hasPositiveFeature) b++; else d++;
                    }
                });

                const fisherResult = calculateFisherExact(a, b, c, d);
                const orRdResult = calculateOddsRatioAndRiskDifference(a, b, c, d);
                const phiCoefficient = calculatePhiCoefficient(a, b, c, d);

                associations[key] = {
                    featureName: featureNames[key], pValue: fisherResult.pValue,
                    or: orRdResult.or, rd: orRdResult.rd, phi: { value: phiCoefficient },
                    contingencyTable: { a, b, c, d }
                };
            }
        });
        return associations;
    }

    function calculateAllStats(data, t2Criteria, t2Logic) {
        if (!data) return {};
        const evaluatedData = t2CriteriaManager.evaluateDatasetWithCriteria(data, t2Criteria, t2Logic);
        
        const enrichedData = evaluatedData.map(p => {
            if(p.lymphknoten_t2_bewertet) {
                 p.lymphknoten_t2_bewertet.forEach(lkb => {
                     if(lkb && lkb.lk) lkb.lk.patient_nr = p.nr;
                 });
            }
            return p;
        });

        return {
            descriptive: calculateDescriptiveStats(enrichedData),
            avocadoSign: calculateDiagnosticPerformance(enrichedData, 'as', 'n'),
            t2: calculateDiagnosticPerformance(enrichedData, 't2', 'n'),
            comparison: compareDiagnosticMethods(enrichedData, 'as', 't2', 'n'),
            associations: calculateAssociations(enrichedData, t2Criteria),
        };
    }

    return Object.freeze({
        calculateAllStats,
        calculateDescriptiveStats,
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateAssociations,
        getMedian,
        getMean,
        getStdDev,
        getQuartiles,
        calculateWilsonScoreCI
    });

})();
