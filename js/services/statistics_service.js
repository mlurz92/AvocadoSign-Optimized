const statisticsService = (() => {

    function calculateConfusionMatrix(data, referenceKey = 'n', testKeyPrefix = '', positiveValue = '+') {
        let rp = 0, fp = 0, fn = 0, rn = 0;
        data.forEach(item => {
            const referencePositive = item[referenceKey] === positiveValue;
            const testKey = `${testKeyPrefix}${item.id || item.nr || ''}`;
            const testPositive = item[testKey] === positiveValue || item[testKeyPrefix] === positiveValue;

            if (testPositive && referencePositive) rp++;
            else if (testPositive && !referencePositive) fp++;
            else if (!testPositive && referencePositive) fn++;
            else if (!testPositive && !referencePositive) rn++;
        });
        return { rp, fp, fn, rn, total: rp + fp + fn + rn };
    }

    function calculateDiagnosticMetricsFromMatrix(matrix) {
        if (!matrix || matrix.rp === undefined) return {};
        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        if (total === 0) return { matrix_components: { ...matrix, total }, n_trials_total: total };

        const metrics = {
            sens: { value: (rp + fn) > 0 ? rp / (rp + fn) : 0, n_trials: rp + fn },
            spez: { value: (rn + fp) > 0 ? rn / (rn + fp) : 0, n_trials: rn + fp },
            ppv:  { value: (rp + fp) > 0 ? rp / (rp + fp) : 0, n_trials: rp + fp },
            npv:  { value: (rn + fn) > 0 ? rn / (rn + fn) : 0, n_trials: rn + fn },
            acc:  { value: total > 0 ? (rp + rn) / total : 0, n_trials: total }
        };

        const assignCI = (metricName, x, n) => {
            if (n > 0) {
                metrics[metricName].ci = calculateWilsonScoreInterval(x, n);
                metrics[metricName].method = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
            } else {
                metrics[metricName].ci = { lower: NaN, upper: NaN };
                metrics[metricName].method = 'N/A (N=0)';
            }
        };
        
        assignCI('sens', rp, rp + fn);
        assignCI('spez', rn, rn + fp);
        assignCI('ppv', rp, rp + fp);
        assignCI('npv', rn, rn + fn);
        assignCI('acc', rp + rn, total);

        metrics.balAcc = { value: (metrics.sens.value + metrics.spez.value) / 2 };
        metrics.f1 = { value: (2 * metrics.ppv.value * metrics.sens.value) / (metrics.ppv.value + metrics.sens.value) || 0 };
        metrics.auc = { value: metrics.balAcc.value }; 
        metrics.mcc = { value: ((rp * rn) - (fp * fn)) / Math.sqrt((rp + fp) * (rp + fn) * (rn + fp) * (rn + fn)) || 0 };

        metrics.matrix_components = { ...matrix, total };
        
        if (total >= APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD) {
             const bootstrapAuc = calculateBootstrapCI(matrix, (m) => (m.rp + m.fn > 0 ? m.rp / (m.rp + m.fn) : 0 + m.rn + m.fp > 0 ? m.rn / (m.rn + m.fp) : 0) / 2);
             metrics.balAcc.ci = bootstrapAuc.ci;
             metrics.auc.ci = bootstrapAuc.ci;
             metrics.balAcc.method = bootstrapAuc.method;
             metrics.auc.method = bootstrapAuc.method;

             const bootstrapF1 = calculateBootstrapCI(matrix, (m) => {
                 const sens = (m.rp + m.fn > 0 ? m.rp / (m.rp + m.fn) : 0);
                 const ppv = (m.rp + m.fp > 0 ? m.rp / (m.rp + m.fp) : 0);
                 return (2 * ppv * sens) / (ppv + sens) || 0;
             });
             metrics.f1.ci = bootstrapF1.ci;
             metrics.f1.method = bootstrapF1.method;
        } else {
            const naCI = { lower: NaN, upper: NaN };
            const naMethod = `Bootstrap N < ${APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD}`;
            metrics.balAcc.ci = naCI; metrics.auc.ci = naCI; metrics.f1.ci = naCI;
            metrics.balAcc.method = naMethod; metrics.auc.method = naMethod; metrics.f1.method = naMethod;
        }

        return metrics;
    }

    function calculateWilsonScoreInterval(successes, trials, confidence = 0.95) {
        if (trials === 0) return { lower: NaN, upper: NaN };
        const z = 1.96; 
        const p_hat = successes / trials;
        const term1 = p_hat + (z * z) / (2 * trials);
        const term2 = z * Math.sqrt((p_hat * (1 - p_hat) / trials) + (z * z) / (4 * trials * trials));
        const denominator = 1 + (z * z) / trials;
        const lower = Math.max(0, (term1 - term2) / denominator);
        const upper = Math.min(1, (term1 + term2) / denominator);
        return { lower: isNaN(lower) ? 0 : lower, upper: isNaN(upper) ? 1 : upper };
    }

    function calculateBootstrapCI(matrix, metricFn, replications = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS, alpha = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA) {
        if (!matrix || matrix.total < APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD) {
            return { value: metricFn(matrix), ci: { lower: NaN, upper: NaN }, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE + ` (N=${matrix?.total || 0})`};
        }

        const originalData = [];
        for (let i = 0; i < matrix.rp; i++) originalData.push({ truth: 1, pred: 1 });
        for (let i = 0; i < matrix.fp; i++) originalData.push({ truth: 0, pred: 1 });
        for (let i = 0; i < matrix.fn; i++) originalData.push({ truth: 1, pred: 0 });
        for (let i = 0; i < matrix.rn; i++) originalData.push({ truth: 0, pred: 0 });

        if (originalData.length === 0) {
             return { value: metricFn(matrix), ci: { lower: NaN, upper: NaN }, method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE + ` (N=0)`};
        }

        const metricValues = [];
        for (let i = 0; i < replications; i++) {
            const bootstrapSample = [];
            for (let j = 0; j < originalData.length; j++) {
                bootstrapSample.push(originalData[Math.floor(Math.random() * originalData.length)]);
            }
            
            let bs_rp = 0, bs_fp = 0, bs_fn = 0, bs_rn = 0;
            bootstrapSample.forEach(item => {
                if (item.pred === 1 && item.truth === 1) bs_rp++;
                else if (item.pred === 1 && item.truth === 0) bs_fp++;
                else if (item.pred === 0 && item.truth === 1) bs_fn++;
                else if (item.pred === 0 && item.truth === 0) bs_rn++;
            });
            const bootstrapMatrix = { rp: bs_rp, fp: bs_fp, fn: bs_fn, rn: bs_rn, total: bootstrapSample.length };
            metricValues.push(metricFn(bootstrapMatrix));
        }

        metricValues.sort((a, b) => a - b);
        const lowerIndex = Math.floor(replications * (alpha / 2));
        const upperIndex = Math.ceil(replications * (1 - alpha / 2)) -1;
        
        const lowerBound = metricValues[lowerIndex];
        const upperBound = metricValues[upperIndex];

        return { 
            value: metricFn(matrix), 
            ci: { lower: isNaN(lowerBound) ? NaN : lowerBound, upper: isNaN(upperBound) ? NaN : upperBound },
            method: APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE
        };
    }

    function calculateOddsRatio(matrix) {
        const { rp, fp, fn, rn } = matrix;
        if (fp === 0 || fn === 0 || rn === 0 || rp === 0) { 
            return { value: NaN, ci: { lower: NaN, upper: NaN }, pValue: NaN, method: 'OR (N/A)' };
        }
        const or = (rp * rn) / (fp * fn);
        const logOr = Math.log(or);
        const seLogOr = Math.sqrt(1/rp + 1/fp + 1/fn + 1/rn);
        const z = 1.96;
        const ciLower = Math.exp(logOr - z * seLogOr);
        const upper = Math.exp(logOr + z * seLogOr);
        const zStatP = logOr / seLogOr;
        const pValue = 2 * (1 - normalCDF(Math.abs(zStatP))); 

        return { value: or, ci: { lower: ciLower, upper: upper }, pValue: pValue, method: 'Logit (Woolf)', matrix_components: { ...matrix, total: rp+fp+fn+rn } };
    }

    function calculateRiskDifference(matrix) {
        const { rp, fp, fn, rn } = matrix;
        const n1 = rp + fp; 
        const n0 = fn + rn; 
        if (n1 === 0 || n0 === 0) {
            return { value: NaN, ci: { lower: NaN, upper: NaN }, method: 'RD (N/A)' };
        }
        const p1 = rp / n1; 
        const p0 = fn / n0; 
        const risk_test_pos = (rp + fp) > 0 ? rp / (rp + fp) : 0;
        const risk_test_neg = (fn + rn) > 0 ? fn / (fn + rn) : 0;
        const rd = risk_test_pos - risk_test_neg;

        const seRd = Math.sqrt( (risk_test_pos * (1 - risk_test_pos) / (rp+fp)) + (risk_test_neg * (1 - risk_test_neg) / (fn+rn)) );
        const z = 1.96;
        const lower = rd - z * seRd;
        const upper = rd + z * seRd;
        return { value: rd, ci: { lower: lower, upper: upper }, method: 'Wald', matrix_components: { ...matrix, total: rp+fp+fn+rn } };
    }

    function calculatePhiCoefficient(matrix) {
        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        if (total === 0) return { value: NaN, matrix_components: { ...matrix, total }};
        const phi = ((rp * rn) - (fp * fn)) / Math.sqrt((rp + fp) * (rp + fn) * (rn + fp) * (rn + fn));
        return { value: isNaN(phi) ? 0 : phi, matrix_components: { ...matrix, total }};
    }

    function performMcNemarTest(matrix) {
        const { fp, fn } = matrix; 
        if ((fp + fn) === 0) return { pValue: 1.0, chiSquared: 0, df: 1, testStat: 'N/A', method: 'McNemar (keine diskordanten Paare)'};
        
        const chiSquared = Math.pow(Math.abs(fp - fn) -1 , 2) / (fp + fn); 
        const pValue = 1 - chiSquareCDF(chiSquared, 1);
        return { pValue: pValue, chiSquared: chiSquared, df: 1, testStat: `χ²=${formatNumber(chiSquared,2,'N/A',true)}`, method: 'McNemar Test (mit Kontinuitätskorrektur)'};
    }

    function performDeLongTest(trueLabels, scores1, scores2) {
        if (trueLabels.length !== scores1.length || trueLabels.length !== scores2.length || trueLabels.length === 0) {
            return { pValue: NaN, diffAUC: NaN, zStat: NaN, method: 'DeLong (Datengrößen stimmen nicht überein oder leer)'};
        }

        const n = trueLabels.length;
        const n_pos = trueLabels.filter(x => x === 1).length;
        const n_neg = n - n_pos;

        if (n_pos === 0 || n_neg === 0) {
            return { pValue: NaN, diffAUC: NaN, zStat: NaN, method: 'DeLong (keine positiven oder negativen Fälle)'};
        }

        const auc = (labels, scores) => {
            let sumRanks = 0;
            let numPairs = 0;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (labels[i] === 1 && labels[j] === 0) {
                        numPairs++;
                        if (scores[i] > scores[j]) sumRanks += 1;
                        else if (scores[i] === scores[j]) sumRanks += 0.5;
                    }
                }
            }
            return numPairs > 0 ? sumRanks / numPairs : 0.5;
        };

        const auc1 = auc(trueLabels, scores1);
        const auc2 = auc(trueLabels, scores2);
        const diffAUC = auc1 - auc2;

        const V = (labels, scores, caseType) => {
            const V_values = new Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                if (labels[i] === caseType) {
                    for (let j = 0; j < n; j++) {
                        if (labels[j] !== caseType) {
                             if (scores[i] > scores[j]) V_values[i] += 1 / (caseType === 1 ? n_neg : n_pos);
                             else if (scores[i] === scores[j]) V_values[i] += 0.5 / (caseType === 1 ? n_neg : n_pos);
                        }
                    }
                }
            }
            return V_values;
        };
        
        const V10_1 = V(trueLabels, scores1, 1); 
        const V01_1 = V(trueLabels, scores1, 0); 
        const V10_2 = V(trueLabels, scores2, 1); 
        const V01_2 = V(trueLabels, scores2, 0); 

        const S10 = V10_1.map((v,i) => v - V10_2[i]).reduce((s,v,i) => s + Math.pow(v - (auc1 - auc2),2) * (trueLabels[i]===1?1:0), 0) / (n_pos -1);
        const S01 = V01_1.map((v,i) => v - V01_2[i]).reduce((s,v,i) => s + Math.pow(v - (auc1 - auc2),2) * (trueLabels[i]===0?1:0), 0) / (n_neg -1);

        const varDiff = S10/n_pos + S01/n_neg;
        if (varDiff <= 0) { 
            return { pValue: NaN, diffAUC: diffAUC, auc1: auc1, auc2: auc2, zStat: NaN, method: 'DeLong (Varianz nicht positiv)'};
        }

        const zStat = diffAUC / Math.sqrt(varDiff);
        const pValue = 2 * (1 - normalCDF(Math.abs(zStat)));

        return { pValue: pValue, diffAUC: diffAUC, auc1: auc1, auc2: auc2, zStat: zStat, method: 'DeLong Test'};
    }
    
    function chiSquareCDF(x, df) {
        if (x < 0 || df < 1) return 0;
        if (df === 1) return normalCDF(Math.sqrt(x)); 
        return 1 - Math.exp(-x/2); 
    }
    
    function normalCDF(z) { 
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989423 * Math.exp(-z * z / 2);
        const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return z > 0 ? 1 - prob : prob;
    }


    function performFisherExactTest(matrix) {
        const { rp, fp, fn, rn } = matrix;
        const n = rp + fp + fn + rn;
        if (n === 0) return { pValue: NaN, method: 'Fisher (N=0)' };
        
        const chiSquared = Math.pow((rp*rn - fp*fn), 2) * n / ((rp+fp)*(fn+rn)*(rp+fn)*(fp+rn));
        const pApprox = 1 - chiSquareCDF(chiSquared, 1);

        return { pValue: pApprox, method: `Fisher's Exact Test (Approximation: χ²=${formatNumber(chiSquared,2,'N/A', true)})`};
    }
    
    function performMannWhitneyUTest(sample1, sample2) {
        if (!Array.isArray(sample1) || !Array.isArray(sample2) || sample1.length === 0 || sample2.length === 0) {
             return { uValue: NaN, pValue: NaN, zValue: NaN, method: 'Mann-Whitney U (leere Stichprobe)' };
        }
        const n1 = sample1.length;
        const n2 = sample2.length;
        const combined = sample1.map(v => ({ value: v, group: 1 })).concat(sample2.map(v => ({ value: v, group: 2 })));
        combined.sort((a, b) => a.value - b.value);

        let ranks = [];
        for (let i = 0; i < combined.length; ) {
            let j = i;
            while (j < combined.length && combined[j].value === combined[i].value) {
                j++;
            }
            const rank = (i + 1 + j) / 2;
            for (let k = i; k < j; k++) {
                combined[k].rank = rank;
            }
            i = j;
        }

        const R1 = combined.filter(d => d.group === 1).reduce((sum, d) => sum + d.rank, 0);
        const U1 = R1 - (n1 * (n1 + 1)) / 2;
        const U2 = n1 * n2 - U1;
        const U = Math.min(U1, U2);

        const meanU = (n1 * n2) / 2;
        let sigmaU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12); 
        
        let tieCorrection = 0;
        let i = 0;
        while (i < combined.length) {
            let j = i;
            while (j < combined.length && combined[j].value === combined[i].value) {
                j++;
            }
            const tieCount = j - i;
            if (tieCount > 1) {
                tieCorrection += (Math.pow(tieCount, 3) - tieCount);
            }
            i = j;
        }
        if (tieCorrection > 0) {
            sigmaU = Math.sqrt((n1 * n2 / 12) * (((n1 + n2 + 1) - (tieCorrection / ((n1 + n2) * (n1 + n2 - 1))))));
        }


        const z = (U - meanU) / sigmaU; 
        const pValue = 2 * (1 - normalCDF(Math.abs(z)));

        return { uValue: U, pValue: pValue, zValue: z, method: 'Mann-Whitney U Test (Normal-Approximation mit Tie-Korrektur)' };
    }

    function calculateDescriptiveStats(dataArray, key, kollektivId) {
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return { anzahlPatienten: 0 };
        }
        const values = dataArray.map(p => p[key]).filter(v => v !== null && v !== undefined && !isNaN(parseFloat(v)));
        if (values.length === 0 && key !== 'geschlecht' && key !== 'nStatus' && key !== 'therapie') { 
            return {
                anzahlPatienten: dataArray.length,
                [key]: { n: 0, mean: NaN, median: NaN, stdDev: NaN, min: NaN, max: NaN, range: NaN }
            };
        }

        let stats = { anzahlPatienten: dataArray.length, [key]: {} };

        if (key === 'alter') {
            values.sort((a, b) => a - b);
            const sum = values.reduce((acc, val) => acc + val, 0);
            stats[key].n = values.length;
            stats[key].mean = values.length > 0 ? sum / values.length : NaN;
            stats[key].median = values.length > 0 ? (values.length % 2 === 1 ? values[Math.floor(values.length / 2)] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2) : NaN;
            const variance = values.length > 1 ? values.reduce((acc, val) => acc + Math.pow(val - stats[key].mean, 2), 0) / (values.length -1) : NaN;
            stats[key].sd = Math.sqrt(variance);
            stats[key].min = values.length > 0 ? values[0] : NaN;
            stats[key].max = values.length > 0 ? values[values.length - 1] : NaN;
            stats[key].range = stats[key].max - stats[key].min;
            stats.alterData = values; 
        } else if (key === 'geschlecht') {
            stats[key].m = dataArray.filter(p => p.geschlecht === 'm').length;
            stats[key].f = dataArray.filter(p => p.geschlecht === 'f').length;
            stats[key].unbekannt = dataArray.length - (stats[key].m + stats[key].f);
        } else if (key === 'nStatus') {
            stats[key].plus = dataArray.filter(p => p.n === '+').length;
            stats[key].minus = dataArray.filter(p => p.n === '-').length;
        } else if (key === 'asStatus') {
            stats[key].plus = dataArray.filter(p => p.as === '+').length;
            stats[key].minus = dataArray.filter(p => p.as === '-').length;
        } else if (key === 't2Status') {
            stats[key].plus = dataArray.filter(p => p.t2 === '+').length;
            stats[key].minus = dataArray.filter(p => p.t2 === '-').length;
        } else if (key === 'therapie') {
            stats[key]['direkt OP'] = dataArray.filter(p => p.therapie === 'direkt OP').length;
            stats[key]['nRCT'] = dataArray.filter(p => p.therapie === 'nRCT').length;
        } else if (key.startsWith('lkAnzahlen')) {
            const lkCounts = {
                n: { total: [], plus: [] },
                as: { total: [], plus: [] },
                t2: { total: [], plus: [] }
            };

            dataArray.forEach(p => {
                if (p.anzahl_patho_lk !== null) lkCounts.n.total.push(p.anzahl_patho_lk);
                if (p.anzahl_patho_n_plus_lk !== null && p.n === '+') lkCounts.n.plus.push(p.anzahl_patho_n_plus_lk);
                
                if (p.anzahl_as_lk !== null) lkCounts.as.total.push(p.anzahl_as_lk);
                if (p.anzahl_as_plus_lk !== null && p.as === '+') lkCounts.as.plus.push(p.anzahl_as_plus_lk);

                if (p.anzahl_t2_lk !== null) lkCounts.t2.total.push(p.anzahl_t2_lk);
                if (p.anzahl_t2_plus_lk !== null && p.t2 === '+') lkCounts.t2.plus.push(p.anzahl_t2_plus_lk);
            });

            const calculateArrayStats = (arr) => {
                if (arr.length === 0) return { median: NaN, min: NaN, max: NaN, mean: NaN, sd: NaN };
                arr.sort((a, b) => a - b);
                const sum = arr.reduce((a, b) => a + b, 0);
                const mean = sum / arr.length;
                const median = arr.length % 2 === 1 ? arr[Math.floor(arr.length / 2)] : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2;
                const variance = arr.length > 1 ? arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (arr.length - 1) : NaN;
                const sd = Math.sqrt(variance);
                return { median, min: arr[0], max: arr[arr.length - 1], mean, sd };
            };
            stats.lkAnzahlen = {
                n: { total: calculateArrayStats(lkCounts.n.total), plus: calculateArrayStats(lkCounts.n.plus) },
                as: { total: calculateArrayStats(lkCounts.as.total), plus: calculateArrayStats(lkCounts.as.plus) },
                t2: { total: calculateArrayStats(lkCounts.t2.total), plus: calculateArrayStats(lkCounts.t2.plus) }
            };
        }
        return stats;
    }
    
    function calculateSingleKollektivStats(data, kollektivId, appliedT2Criteria, appliedT2Logic, studyT2Sets, bfResultsForThisKollektiv) {
        let patientData = data;
        if (kollektivId !== 'Gesamt') {
            patientData = data.filter(p => p.therapie === kollektivId);
        }
        if (patientData.length === 0) return { deskriptiv: { anzahlPatienten: 0, kollektivId: kollektivId }, gueteAS: {}, gueteT2_angewandt: {}, gueteT2_literatur: {}, gueteT2_bruteforce: {} };

        let results = { deskriptiv: {}, gueteAS: {}, gueteT2_angewandt: {}, gueteT2_literatur: {}, gueteT2_bruteforce: {}};
        results.deskriptiv = {
            anzahlPatienten: patientData.length,
            kollektivId: kollektivId,
            ...calculateDescriptiveStats(patientData, 'alter', kollektivId),
            ...calculateDescriptiveStats(patientData, 'geschlecht', kollektivId),
            ...calculateDescriptiveStats(patientData, 'therapie', kollektivId),
            ...calculateDescriptiveStats(patientData, 'nStatus', kollektivId),
            ...calculateDescriptiveStats(patientData, 'asStatus', kollektivId),
            ...calculateDescriptiveStats(patientData, 't2Status', kollektivId),
            ...calculateDescriptiveStats(patientData, 'lkAnzahlen', kollektivId)
        };

        const dataForAS = patientData.map(p => ({ ...p, test_as: p.as }));
        const matrixAS = calculateConfusionMatrix(dataForAS, 'n', 'test_as');
        results.gueteAS = calculateDiagnosticMetricsFromMatrix(matrixAS);

        const dataWithT2Applied = t2CriteriaManager.evaluateCriteriaForAllPatients(patientData, appliedT2Criteria, appliedT2Logic, 't2');
        const matrixT2Applied = calculateConfusionMatrix(dataWithT2Applied, 'n', 't2');
        results.gueteT2_angewandt = calculateDiagnosticMetricsFromMatrix(matrixT2Applied);
        results.gueteT2_angewandt.criteria = cloneDeep(appliedT2Criteria);
        results.gueteT2_angewandt.logic = appliedT2Logic;

        results.gueteT2_literatur = {};
        studyT2Sets.forEach(set => {
            if(set.applicableKollektiv && set.applicableKollektiv !== 'Gesamt' && set.applicableKollektiv !== kollektivId) return;
            let dataForEvaluation = patientData;
            if (set.isESGAR2016) {
                dataForEvaluation = patientData.filter(p => p.therapie === 'direkt OP');
                if (kollektivId === 'Gesamt' && dataForEvaluation.length === 0) return; 
            }
            if (set.id === 'barbaro_2024_restaging') {
                dataForEvaluation = patientData.filter(p => p.therapie === 'nRCT');
                 if (kollektivId === 'Gesamt' && dataForEvaluation.length === 0) return; 
            }


            const evaluatedPatients = dataForEvaluation.map(p => {
                let t2StatusLit;
                if (set.isESGAR2016) {
                    t2StatusLit = studyT2CriteriaManager.evaluatePatientForESGAR(p, set);
                } else {
                    t2StatusLit = t2CriteriaManager.evaluatePatient(p, set.criteria, set.logic);
                }
                return { ...p, [`test_t2_lit_${set.id}`]: t2StatusLit };
            });

            const matrixT2Lit = calculateConfusionMatrix(evaluatedPatients, 'n', `test_t2_lit_${set.id}`);
            results.gueteT2_literatur[set.id] = calculateDiagnosticMetricsFromMatrix(matrixT2Lit);
            results.gueteT2_literatur[set.id].criteria = cloneDeep(set.criteria);
            results.gueteT2_literatur[set.id].logic = set.logic;
            results.gueteT2_literatur[set.id].studyInfo = cloneDeep(set);
            results.gueteT2_literatur[set.id].applicableKollektiv = set.applicableKollektiv;
            results.gueteT2_literatur[set.id].totalPatientsEvaluated = evaluatedPatients.length;
        });

        if (bfResultsForThisKollektiv && bfResultsForThisKollektiv.bestResult && bfResultsForThisKollektiv.bestResult.criteria) {
            const bfBest = bfResultsForThisKollektiv.bestResult;
            const dataWithT2BF = t2CriteriaManager.evaluateCriteriaForAllPatients(patientData, bfBest.criteria, bfBest.logic, 'test_t2_bf');
            const matrixT2BF = calculateConfusionMatrix(dataWithT2BF, 'n', 'test_t2_bf');
            results.gueteT2_bruteforce = calculateDiagnosticMetricsFromMatrix(matrixT2BF);
            results.bruteforce_definition = {
                criteria: cloneDeep(bfBest.criteria),
                logic: bfBest.logic,
                metricName: bfResultsForThisKollektiv.metric,
                metricValue: bfBest.metricValue
            };
        } else {
             results.bruteforce_definition = { metricName: bfResultsForThisKollektiv?.metric || state.getCurrentPublikationBruteForceMetric(), metricValue: NaN };
        }
        return results;
    }

    function calculateComparisonStats(statsKollektiv, kollektivId, studyT2Sets, bfResultsForThisKollektiv) {
        const dataForKollektiv = dataProcessor.getProcessedData(kollektivId);
        if (!dataForKollektiv || dataForKollektiv.length === 0) return {};
        
        let comparisonResults = {};
        const trueLabels = dataForKollektiv.map(p => p.n === '+' ? 1 : 0);

        const getScores = (data, criteria, logic, testKey) => {
            const evaluatedData = t2CriteriaManager.evaluateCriteriaForAllPatients(data, criteria, logic, testKey);
            return evaluatedData.map(p => p[testKey] === '+' ? 1 : 0);
        };
        
        const scoresAS = dataForKollektiv.map(p => p.as === '+' ? 1 : 0);
        
        studyT2Sets.forEach(set => {
            if(set.applicableKollektiv && set.applicableKollektiv !== 'Gesamt' && set.applicableKollektiv !== kollektivId) return;
            let evaluatedPatientsForComparison = dataForKollektiv;
            if (set.isESGAR2016) {
                evaluatedPatientsForComparison = dataForKollektiv.filter(p => p.therapie === 'direkt OP');
                if (kollektivId === 'Gesamt' && evaluatedPatientsForComparison.length === 0) return; 
            }
            if (set.id === 'barbaro_2024_restaging') {
                evaluatedPatientsForComparison = dataForKollektiv.filter(p => p.therapie === 'nRCT');
                if (kollektivId === 'Gesamt' && evaluatedPatientsForComparison.length === 0) return; 
            }

            const scoresT2Lit = evaluatedPatientsForComparison.map(p => {
                if (set.isESGAR2016) {
                    return studyT2CriteriaManager.evaluatePatientForESGAR(p, set) === '+' ? 1 : 0;
                } else {
                    return t2CriteriaManager.evaluatePatient(p, set.criteria, set.logic) === '+' ? 1 : 0;
                }
            });
            const trueLabelsForComparison = evaluatedPatientsForComparison.map(p => p.n === '+' ? 1 : 0);

            const matrixAS = statsKollektiv.gueteAS.matrix_components;
            const matrixT2Lit = statsKollektiv.gueteT2_literatur[set.id]?.matrix_components;
            
            if (matrixAS && matrixT2Lit && trueLabelsForComparison.length > 0) {
                const mcnemarMatrix = { 
                    b: evaluatedPatientsForComparison.filter(p => p.as === '+' && ((set.isESGAR2016 ? studyT2CriteriaManager.evaluatePatientForESGAR(p, set) : t2CriteriaManager.evaluatePatient(p, set.criteria, set.logic)) === '-')).length, 
                    c: evaluatedPatientsForComparison.filter(p => p.as === '-' && ((set.isESGAR2016 ? studyT2CriteriaManager.evaluatePatientForESGAR(p, set) : t2CriteriaManager.evaluatePatient(p, set.criteria, set.logic)) === '+')).length 
                };
                 comparisonResults[`vergleichASvsT2_literatur_${set.id}`] = {
                    mcnemar: performMcNemarTest({ rp:0, fp: mcnemarMatrix.b, fn: mcnemarMatrix.c, rn:0 }), 
                    delong: performDeLongTest(trueLabelsForComparison, scoresAS.filter((s,idx) => evaluatedPatientsForComparison.includes(dataForKollektiv[idx])), scoresT2Lit)
                 };
            }
        });

        if (bfResultsForThisKollektiv && bfResultsForThisKollektiv.bestResult && statsKollektiv.gueteT2_bruteforce.matrix_components) {
            const bfBest = bfResultsForThisKollektiv.bestResult;
            const scoresT2BF = getScores(dataForKollektiv, bfBest.criteria, bfBest.logic, 'test_t2_bf');
            const matrixAS = statsKollektiv.gueteAS.matrix_components;
            const matrixT2BF = statsKollektiv.gueteT2_bruteforce.matrix_components;

            if (matrixAS && matrixT2BF) {
                const mcnemarMatrixBF = {
                    b: dataForKollektiv.filter(p => p.as === '+' && p.test_t2_bf === '-').length,
                    c: dataForKollektiv.filter(p => p.as === '-' && p.test_t2_bf === '+').length
                };
                 comparisonResults.vergleichASvsT2_bruteforce = {
                    mcnemar: performMcNemarTest({ rp:0, fp: mcnemarMatrixBF.b, fn: mcnemarMatrixBF.c, rn:0 }),
                    delong: performDeLongTest(trueLabels, scoresAS, scoresT2BF)
                 };
            }
        }

        const asPatients = dataForKollektiv.filter(p => p.as === '+' || p.as === '-');
        const asTrueLabels = asPatients.map(p => p.n === '+' ? 1 : 0);
        const asScores = asPatients.map(p => p.as === '+' ? 1 : 0);

        const t2Patients = dataForKollektiv.filter(p => p.t2 === '+' || p.t2 === '-');
        const t2TrueLabels = t2Patients.map(p => p.n === '+' ? 1 : 0);
        const t2Scores = t2Patients.map(p => p.t2 === '+' ? 1 : 0);

        comparisonResults.accuracyComparison = {
            as: {
                pValue: performMcNemarTest({ rp:0, fp: dataForKollektiv.filter(p => p.as === '+' && p.n === '-').length, fn: dataForKollektiv.filter(p => p.as === '-' && p.n === '+').length, rn:0 }).pValue,
                testName: 'McNemar Test'
            },
            t2: {
                pValue: performMcNemarTest({ rp:0, fp: dataForKollektiv.filter(p => p.t2 === '+' && p.n === '-').length, fn: dataForKollektiv.filter(p => p.t2 === '-' && p.n === '+').length, rn:0 }).pValue,
                testName: 'McNemar Test'
            }
        };

        comparisonResults.aucComparison = {
            as: performDeLongTest(asTrueLabels, asScores, asScores), 
            t2: performDeLongTest(t2TrueLabels, t2Scores, t2Scores) 
        };

        return comparisonResults;
    }


    function calculateAllStatsForPublication(rawData, appliedT2Criteria, appliedT2Logic, bfResultsPerKollektiv) {
        const kollektivIds = ['Gesamt', 'direkt OP', 'nRCT'];
        const allStats = {};
        const studySetsForEval = studyT2CriteriaManager.getAllStudyCriteriaSets();
        const currentPublikationBfMetric = state.getCurrentPublikationBruteForceMetric();

        kollektivIds.forEach(kolId => {
            const bfResultsForThisKollektivAndMetric = bfResultsPerKollektiv[kolId]?.[currentPublikationBfMetric] || 
                                                      bfResultsPerKollektiv[kolId]?.[PUBLICATION_CONFIG.defaultBruteForceMetricForPublication];

            allStats[kolId] = calculateSingleKollektivStats(
                rawData, 
                kolId, 
                appliedT2Criteria, 
                appliedT2Logic, 
                studySetsForEval,
                bfResultsForThisKollektivAndMetric
            );
            const comparisonStats = calculateComparisonStats(allStats[kolId], kolId, studySetsForEval, bfResultsForThisKollektivAndMetric);
            allStats[kolId] = deepMerge(allStats[kolId], comparisonStats);

            const allPatientsInKollektiv = dataProcessor.getProcessedData(kollektivId);
            const nPlusPatients = allPatientsInKollektiv.filter(p => p.n === '+');
            const nMinusPatients = allPatientsInKollektiv.filter(p => p.n === '-');

            const associations = {};
            const binaryFeatures = ['geschlecht', 'form', 'kontur', 'homogenitaet', 'signal']; 
            binaryFeatures.forEach(featureKey => {
                const values = APP_CONFIG.T2_CRITERIA_SETTINGS[`${featureKey.toUpperCase()}_VALUES`];
                if (featureKey === 'geschlecht') {
                    const matrix = {
                        rp: allPatientsInKollektiv.filter(p => p.geschlecht === 'm' && p.n === '+').length,
                        fp: allPatientsInKollektiv.filter(p => p.geschlecht === 'm' && p.n === '-').length,
                        fn: allPatientsInKollektiv.filter(p => p.geschlecht === 'f' && p.n === '+').length,
                        rn: allPatientsInKollektiv.filter(p => p.geschlecht === 'f' && p.n === '-').length
                    };
                    if (matrix.total > 0) {
                        associations[featureKey] = {
                            featureName: UI_TEXTS.statistikTab.filterMerkmalLabelMapping[featureKey] || featureKey,
                            or: calculateOddsRatio(matrix),
                            rd: calculateRiskDifference(matrix),
                            phi: calculatePhiCoefficient(matrix),
                            pValue: performFisherExactTest(matrix).pValue,
                            testName: 'Fisher\'s Exact Test',
                            matrix: matrix
                        };
                    }
                } else if (values && values.length > 0) {
                    values.forEach(value => {
                        const matrix = {
                            rp: allPatientsInKollektiv.filter(p => p.lymphknoten_t2.some(lk => lk[featureKey] === value) && p.n === '+').length,
                            fp: allPatientsInKollektiv.filter(p => p.lymphknoten_t2.some(lk => lk[featureKey] === value) && p.n === '-').length,
                            fn: allPatientsInKollektiv.filter(p => !p.lymphknoten_t2.some(lk => lk[featureKey] === value) && p.n === '+').length,
                            rn: allPatientsInKollektiv.filter(p => !p.lymphknoten_t2.some(lk => lk[featureKey] === value) && p.n === '-').length
                        };
                        if (matrix.total > 0) {
                            associations[`${featureKey}_${value}`] = {
                                featureName: `${UI_TEXTS.statistikTab.filterMerkmalLabelMapping[featureKey] || featureKey}: ${value}`,
                                or: calculateOddsRatio(matrix),
                                rd: calculateRiskDifference(matrix),
                                phi: calculatePhiCoefficient(matrix),
                                pValue: performFisherExactTest(matrix).pValue,
                                testName: 'Fisher\'s Exact Test',
                                matrix: matrix
                            };
                        }
                    });
                }
            });

            const asMatrix = {
                rp: allPatientsInKollektiv.filter(p => p.as === '+' && p.n === '+').length,
                fp: allPatientsInKollektiv.filter(p => p.as === '+' && p.n === '-').length,
                fn: allPatientsInKollektiv.filter(p => p.as === '-' && p.n === '+').length,
                rn: allPatientsInKollektiv.filter(p => p.as === '-' && p.n === '-').length
            };
            if (asMatrix.total > 0) {
                associations.as = {
                    featureName: 'Avocado Sign',
                    or: calculateOddsRatio(asMatrix),
                    rd: calculateRiskDifference(asMatrix),
                    phi: calculatePhiCoefficient(asMatrix),
                    pValue: performFisherExactTest(asMatrix).pValue,
                    testName: 'Fisher\'s Exact Test',
                    matrix: asMatrix
                };
            }

            const sizeNPlus = nPlusPatients.flatMap(p => (p.lymphknoten_t2 || []).map(lk => lk.groesse)).filter(s => s !== null && !isNaN(s));
            const sizeNMinus = nMinusPatients.flatMap(p => (p.lymphknoten_t2 || []).map(lk => lk.groesse)).filter(s => s !== null && !isNaN(s));
            if (sizeNPlus.length > 0 && sizeNMinus.length > 0) {
                associations.size_mwu = {
                    featureName: 'LK Größe',
                    pValue: performMannWhitneyUTest(sizeNPlus, sizeNMinus).pValue,
                    testName: performMannWhitneyUTest(sizeNPlus, sizeNMinus).method,
                    uValue: performMannWhitneyUTest(sizeNPlus, sizeNMinus).uValue,
                    zValue: performMannWhitneyUTest(sizeNPlus, sizeNMinus).zValue
                };
            }

            allStats[kolId].assoziationen = associations;

            const criteriaComparisonResults = [];
            const allStudySets = studyT2CriteriaManager.getAllStudyCriteriaSets();
            
            criteriaComparisonResults.push({
                id: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID,
                name: APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME,
                sens: allStats[kolId].gueteAS.sens?.value,
                spez: allStats[kolId].gueteAS.spez?.value,
                ppv: allStats[kolId].gueteAS.ppv?.value,
                npv: allStats[kolId].gueteAS.npv?.value,
                acc: allStats[kolId].gueteAS.acc?.value,
                auc: allStats[kolId].gueteAS.auc?.value,
                globalN: allStats[kolId].deskriptiv.anzahlPatienten,
                specificKollektivName: kollektivId,
                specificKollektivN: allStats[kolId].deskriptiv.anzahlPatienten
            });

            criteriaComparisonResults.push({
                id: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                sens: allStats[kolId].gueteT2_angewandt.sens?.value,
                spez: allStats[kolId].gueteT2_angewandt.spez?.value,
                ppv: allStats[kolId].gueteT2_angewandt.ppv?.value,
                npv: allStats[kolId].gueteT2_angewandt.npv?.value,
                acc: allStats[kolId].gueteT2_angewandt.acc?.value,
                auc: allStats[kolId].gueteT2_angewandt.auc?.value,
                globalN: allStats[kolId].deskriptiv.anzahlPatienten,
                specificKollektivName: kollektivId,
                specificKollektivN: allStats[kolId].deskriptiv.anzahlPatienten
            });

            allStudySets.forEach(set => {
                const applicableKollektiv = set.applicableKollektiv || 'Gesamt';
                let statsForSet = allStats[kolId].gueteT2_literatur[set.id];
                let evaluatedN = allStats[kolId].deskriptiv.anzahlPatienten;

                if (set.isESGAR2016 && applicableKollektiv === 'direkt OP') {
                    evaluatedN = allStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
                    if (kollektivId !== 'direkt OP') {
                         statsForSet = allStats['direkt OP']?.gueteT2_literatur[set.id];
                    }
                } else if (set.id === 'barbaro_2024_restaging' && applicableKollektiv === 'nRCT') {
                    evaluatedN = allStats['nRCT']?.deskriptiv?.anzahlPatienten || 0;
                    if (kollektivId !== 'nRCT') {
                        statsForSet = allStats['nRCT']?.gueteT2_literatur[set.id];
                    }
                }

                if (statsForSet) {
                    criteriaComparisonResults.push({
                        id: set.id,
                        name: set.name,
                        sens: statsForSet.sens?.value,
                        spez: statsForSet.spez?.value,
                        ppv: statsForSet.ppv?.value,
                        npv: statsForSet.npv?.value,
                        acc: statsForSet.acc?.value,
                        auc: statsForSet.auc?.value,
                        globalN: allStats[kolId].deskriptiv.anzahlPatienten,
                        specificKollektivName: applicableKollektiv,
                        specificKollektivN: evaluatedN
                    });
                }
            });
            allStats[kolId].kriterienVergleich = criteriaComparisonResults;
        });
        return allStats;
    }

    return Object.freeze({
        calculateConfusionMatrix,
        calculateDiagnosticMetricsFromMatrix,
        calculateWilsonScoreInterval,
        calculateBootstrapCI,
        calculateOddsRatio,
        calculateRiskDifference,
        calculatePhiCoefficient,
        performMcNemarTest,
        performDeLongTest,
        performFisherExactTest,
        performMannWhitneyUTest,
        calculateDescriptiveStats,
        calculateSingleKollektivStats,
        calculateComparisonStats,
        calculateAllStatsForPublication
    });

})();

window.statisticsService = statisticsService;
