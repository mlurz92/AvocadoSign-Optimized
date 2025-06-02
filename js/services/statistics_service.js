const statisticsService = (() => {
    let _initialized = false;

    function initialize() {
        _initialized = true;
    }

    function _calculateBinaryMetrics(tp, fp, fn, tn, alpha = 0.05, bootstrapReplications = 0) {
        const total = tp + fp + fn + tn;
        if (total === 0) return { sens: {value:0, ci:null}, spez: {value:0, ci:null}, ppv: {value:0, ci:null}, npv: {value:0, ci:null}, acc: {value:0, ci:null}, balAcc: {value:0, ci:null}, f1: {value:0, ci:null}, phi: {value:0, ci:null}, matrix: {tp, fp, fn, tn} };

        const sens = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const spez = (tn + fp) > 0 ? tn / (tn + fp) : 0;
        const ppv = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const npv = (tn + fn) > 0 ? tn / (tn + fn) : 0;
        const acc = total > 0 ? (tp + tn) / total : 0;
        const balAcc = (sens + spez) / 2;
        const f1 = (ppv + sens) > 0 ? (2 * ppv * sens) / (ppv + sens) : 0;
        
        const phi_numerator = (tp * tn) - (fp * fn);
        const phi_denominator = Math.sqrt((tp + fp) * (tp + fn) * (tn + fp) * (tn + fn));
        const phi = phi_denominator > 0 ? phi_numerator / phi_denominator : 0;

        let sensCI = _calculateConfidenceInterval_CP(tp, tp + fn, alpha);
        let spezCI = _calculateConfidenceInterval_CP(tn, tn + fp, alpha);
        let ppvCI = _calculateConfidenceInterval_CP(tp, tp + fp, alpha);
        let npvCI = _calculateConfidenceInterval_CP(tn, tn + fn, alpha);
        let accCI = _calculateConfidenceInterval_CP(tp + tn, total, alpha);

        return {
            sens: { value: sens, ci: sensCI },
            spez: { value: spez, ci: spezCI },
            ppv: { value: ppv, ci: ppvCI },
            npv: { value: npv, ci: npvCI },
            acc: { value: acc, ci: accCI },
            balAcc: { value: balAcc, ci: null }, // CI für BalAcc ist komplexer, ggf. Bootstrap
            f1: { value: f1, ci: null },       // CI für F1 ist komplexer, ggf. Bootstrap
            phi: { value: phi, ci: null },      // CI für Phi ist komplexer
            matrix: { tp, fp, fn, tn }
        };
    }

    function _calculateConfidenceInterval_CP(successes, trials, alpha) {
        if (trials === 0) return { lower: 0, upper: 0 };
        if (successes < 0 || successes > trials) return { lower: NaN, upper: NaN };

        const z =首席_calculateZScore(1 - alpha / 2); // For two-sided interval

        let lower, upper;

        // Lower bound
        if (successes === 0) {
            lower = 0;
        } else {
            const v1 = 2 * successes;
            const v2 = 2 * (trials - successes + 1);
            const F_lower =首席_calculateQuantileF(alpha / 2, v1, v2);
            lower = (v1 * F_lower) / (v2 + v1 * F_lower);
             if(isNaN(lower)) { // Fallback for F-distribution issues at boundaries
                const p_hat = successes / trials;
                lower = p_hat - z * Math.sqrt(p_hat * (1 - p_hat) / trials);
                lower = Math.max(0, lower);
            }
        }

        // Upper bound
        if (successes === trials) {
            upper = 1;
        } else {
            const v1_upper = 2 * (successes + 1);
            const v2_upper = 2 * (trials - successes);
            const F_upper =首席_calculateQuantileF(1 - alpha / 2, v1_upper, v2_upper);
            upper = (v1_upper * F_upper) / (v2_upper + v1_upper * F_upper);
            if(isNaN(upper)) { // Fallback for F-distribution issues at boundaries
                const p_hat = successes / trials;
                upper = p_hat + z * Math.sqrt(p_hat * (1 - p_hat) / trials);
                upper = Math.min(1, upper);
            }
        }
        return { lower: isNaN(lower) ? 0 : Math.max(0,lower), upper: isNaN(upper) ? 1 : Math.min(1,upper) };
    }
    
    function首席_calculateZScore(p) {
        if (p < 0 || p > 1) return NaN;
        if (p === 0.5) return 0;

        const A0 = 2.515517, A1 = 0.802853, A2 = 0.010328;
        const B0 = 1.432788, B1 = 0.189269, B2 = 0.001308;
        let y = (p < 0.5) ? p : 1 - p;
        let t = Math.sqrt(-2 * Math.log(y));
        let z = t - (A0 + A1 * t + A2 * t * t) / (1 + B0 * t + B1 * t * t + B2 * t * t * t);
        return (p < 0.5) ? -z : z;
    }

    function首席_calculateQuantileF(prob, df1, df2) {
        if (prob <= 0 || prob >= 1 || df1 <= 0 || df2 <= 0) return NaN;
        let low = 0, high = 20, mid, cdfVal;
        const maxIter = 100, tol = 1e-6;
        for(let i=0; i<maxIter; i++){
            mid = (low+high)/2;
            if(mid <=0) { mid = tol;}
            cdfVal =首席_cdfF(mid, df1, df2);
            if(Math.abs(cdfVal - prob) < tol) return mid;
            if(cdfVal < prob) low = mid; else high = mid;
            if (high-low < tol) return (low+high)/2;
        }
        return mid; 
    }

    function首席_cdfF(x, df1, df2) {
         if (x <= 0) return 0;
         return首席_incompleteBetaFunction((df1 * x) / (df1 * x + df2), df1 / 2, df2 / 2);
    }

    function首席_logGamma(Z) {
        const S = 1 + 76.18009173 / Z - 86.50532033 / (Z + 1) + 24.01409822 / (Z + 2) - 1.231739516 / (Z + 3) + .00120858003 / (Z + 4) - .00000536382 / (Z + 5);
        return (Z - .5) * Math.log(Z + 4.5) - (Z + 4.5) + Math.log(S * 2.50662827465);
    }

    function首席_incompleteBetaFunction(x, a, b) {
        if (x < 0 || x > 1) return NaN;
        if (x === 0) return 0;
        if (x === 1) return 1;
        const bt = (Math.exp(首席_logGamma(a + b) -首席_logGamma(a) -首席_logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)));
        if (x < (a + 1) / (a + b + 2)) {
            return bt *首席_betaCf(x, a, b) / a;
        } else {
            return 1 - bt *首席_betaCf(1 - x, b, a) / b;
        }
    }

    function首席_betaCf(x, a, b) {
        const MAXIT = 200, EPS = 1e-9, FPMIN = 1e-30;
        let m = 1, qab = a + b, qap = a + 1, qam = a - 1;
        let c = 1, d = 1 - qab * x / qap;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        d = 1 / d;
        let h = d;
        for (; m <= MAXIT; m++) {
            let m2 = 2 * m;
            let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < FPMIN) d = FPMIN;
            c = 1 + aa / c;
            if (Math.abs(c) < FPMIN) c = FPMIN;
            d = 1 / d;
            h *= d * c;
            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < FPMIN) d = FPMIN;
            c = 1 + aa / c;
            if (Math.abs(c) < FPMIN) c = FPMIN;
            d = 1 / d;
            let del = d * c;
            h *= del;
            if (Math.abs(del - 1.0) < EPS) break;
        }
        return h;
    }

    function calculateDiagnosticPerformance(data, testKey, referenceKey) {
        if (!data || data.length === 0) return _calculateBinaryMetrics(0, 0, 0, 0);
        let tp = 0, fp = 0, fn = 0, tn = 0;
        data.forEach(item => {
            const testPositive = item[`${testKey}_status_patient`] === 1;
            const refPositive = item[`${referenceKey}_status_patient`] === 1;

            if (testPositive && refPositive) tp++;
            else if (testPositive && !refPositive) fp++;
            else if (!testPositive && refPositive) fn++;
            else if (!testPositive && !refPositive) tn++;
        });
        const alpha = APP_CONFIG?.STATISTICAL_CONSTANTS?.SIGNIFICANCE_LEVEL || 0.05;
        const bootstrapReplications = APP_CONFIG?.STATISTICAL_CONSTANTS?.BOOTSTRAP_CI_REPLICATIONS || 0; // Set to >0 to enable
        return _calculateBinaryMetrics(tp, fp, fn, tn, alpha, bootstrapReplications);
    }
    
    function _performMcNemarTest(a, b, c, d) { // a=TP(M1+/M2+), b=FP(M1+/M2-), c=FN(M1-/M2+), d=TN(M1-/M2-)
                                                // More commonly: a=(+/+), b=(+/-), c=(-/+), d=(-/-)
                                                // We need counts for a 2x2 table of Test1 vs Test2 for concordant/discordant pairs
                                                // b = Test1 positive, Test2 negative
                                                // c = Test1 negative, Test2 positive
        if ((b + c) === 0) return { statistic: NaN, pValue: 1.0, df:1, method: "McNemar's Test (no discordant pairs)" }; // No discordant pairs
        
        const chiSquared = Math.pow(Math.abs(b - c) - 1, 2) / (b + c); // Yates' continuity correction for small N
        const pValue = 1.0 -首席_cdfChiSquared(chiSquared, 1);
        return { statistic: chiSquared, pValue: pValue, df: 1, method: "McNemar's Test (Yates' corrected)" };
    }
    
    function首席_cdfChiSquared(x, df) {
        if (x < 0 || df <= 0) return 0;
        return首席_incompleteGamma(x / 2, df / 2);
    }

    function首席_incompleteGamma(x, a) {
        if (x < 0 || a <= 0) return NaN;
        if (x === 0) return 0;
        if (x > 1 && x > a) return 1 -首席_incompleteGammaSeriesComplement(x, a);
        return首席_incompleteGammaSeries(x, a);
    }

    function首席_incompleteGammaSeries(x, a) {
        const GLN =首席_logGamma(a);
        let ap = a;
        let sum = 1.0 / a;
        let del = sum;
        for (let n = 1; n <= 100; n++) {
            ap++;
            del = del * x / ap;
            sum += del;
            if (Math.abs(del) < Math.abs(sum) * 1e-7) {
                return sum * Math.exp(-x + a * Math.log(x) - GLN);
            }
        }
        return sum * Math.exp(-x + a * Math.log(x) - GLN); 
    }
    
    function首席_incompleteGammaSeriesComplement(x, a) {
        let b = x + 1 - a;
        let c = 1 / 1e-30;
        let d = 1 / b;
        let h = d;
        let an, del;
        for (let i = 1; i <= 100; i++) {
            an = -i * (i - a);
            b += 2;
            d = an * d + b;
            if (Math.abs(d) < 1e-30) d = 1e-30;
            c = b + an / c;
            if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d;
            del = d * c;
            h *= del;
            if (Math.abs(del - 1) < 1e-7) break;
        }
        return Math.exp(-x + a * Math.log(x) -首席_logGamma(a)) * h;
    }

    function _calculateAUCDeLong(data, method1Key, method2Key, referenceKey) {
        const n = data.length;
        if (n < 2) return { Z: NaN, pValue: NaN, method: "DeLong Test (insufficient data)" };

        const scores1 = data.map(item => item[`${method1Key}_status_patient`]); // Should be probabilities if available, otherwise binary status
        const scores2 = data.map(item => item[`${method2Key}_status_patient`]);
        const truth = data.map(item => item[`${referenceKey}_status_patient`]);

        const n_pos = truth.reduce((sum, val) => sum + val, 0);
        const n_neg = n - n_pos;

        if (n_pos === 0 || n_neg === 0) return { Z: NaN, pValue: NaN, method: "DeLong Test (no cases/controls)" };

        const aucAndVar1 =首席_calculateSingleAUCAndVariance(scores1, truth, n_pos, n_neg);
        const aucAndVar2 =首席_calculateSingleAUCAndVariance(scores2, truth, n_pos, n_neg);
        
        const auc1 = aucAndVar1.auc;
        const auc2 = aucAndVar2.auc;
        const var1 = aucAndVar1.variance;
        const var2 = aucAndVar2.variance;

        let cov = 0;
        for (let i = 0; i < n; i++) {
            if (truth[i] === 1) { // Positive case
                for (let j = 0; j < n; j++) {
                    if (truth[j] === 0) { // Negative case
                        const psi1_xi = (scores1[i] > scores1[j] ? 1 : (scores1[i] === scores1[j] ? 0.5 : 0)) - auc1;
                        const psi2_xi = (scores2[i] > scores2[j] ? 1 : (scores2[i] === scores2[j] ? 0.5 : 0)) - auc2;
                        const psi1_yj = auc1 - (scores1[i] > scores1[j] ? 1 : (scores1[i] === scores1[j] ? 0.5 : 0));
                        const psi2_yj = auc2 - (scores2[i] > scores2[j] ? 1 : (scores2[i] === scores2[j] ? 0.5 : 0));
                        cov += psi1_xi * psi2_xi + psi1_yj * psi2_yj;
                    }
                }
            }
        }
        cov /= (n_pos * n_neg * (n_pos -1) * (n_neg -1) ) || 1; // Simplified, needs precise DeLong components V10, V01 and structural components
        
        // This covariance calculation is simplified. DeLong's method requires specific components V10 and V01 for each case/control.
        // For a robust implementation, refer to DeLong et al. (1988) Biometrics.
        // Using a simplified placeholder for covariance calculation for paired AUCs:
        let S10_1 = 0, S01_1 = 0, S10_2 = 0, S01_2 = 0, S_12 = 0;

        let V10_1 = new Array(n_pos).fill(0);
        let V01_1 = new Array(n_neg).fill(0);
        let V10_2 = new Array(n_pos).fill(0);
        let V01_2 = new Array(n_neg).fill(0);

        let pos_idx = 0, neg_idx = 0;
        for(let i=0; i<n; ++i) {
            if(truth[i] === 1) { // Positive
                for(let j=0; j<n; ++j) {
                    if(truth[j] === 0) { // Negative
                         V10_1[pos_idx] += (scores1[i] > scores1[j] ? 1 : (scores1[i] === scores1[j] ? 0.5 : 0));
                         V10_2[pos_idx] += (scores2[i] > scores2[j] ? 1 : (scores2[i] === scores2[j] ? 0.5 : 0));
                    }
                }
                V10_1[pos_idx] /= n_neg;
                V10_2[pos_idx] /= n_neg;
                pos_idx++;
            } else { // Negative
                for(let j=0; j<n; ++j) {
                    if(truth[j] === 1) { // Positive
                        V01_1[neg_idx] += (scores1[j] > scores1[i] ? 1 : (scores1[j] === scores1[i] ? 0.5 : 0));
                        V01_2[neg_idx] += (scores2[j] > scores2[i] ? 1 : (scores2[j] === scores2[i] ? 0.5 : 0));
                    }
                }
                V01_1[neg_idx] /= n_pos;
                V01_2[neg_idx] /= n_pos;
                neg_idx++;
            }
        }

        S10_1 = V10_1.reduce((s,v) => s + (v-auc1)*(v-auc1), 0) / (n_pos-1);
        S01_1 = V01_1.reduce((s,v) => s + (v-auc1)*(v-auc1), 0) / (n_neg-1);
        S10_2 = V10_2.reduce((s,v) => s + (v-auc2)*(v-auc2), 0) / (n_pos-1);
        S01_2 = V01_2.reduce((s,v) => s + (v-auc2)*(v-auc2), 0) / (n_neg-1);
        
        // Covariance of (AUC1, AUC2) component related to positive cases
        let S10_12 = 0;
        for(let k=0; k<n_pos; ++k) S10_12 += (V10_1[k]-auc1)*(V10_2[k]-auc2);
        S10_12 /= (n_pos-1);

        // Covariance of (AUC1, AUC2) component related to negative cases
        let S01_12 = 0;
        for(let k=0; k<n_neg; ++k) S01_12 += (V01_1[k]-auc1)*(V01_2[k]-auc2);
        S01_12 /= (n_neg-1);

        const var_diff = (S10_1/n_pos + S01_1/n_neg) + (S10_2/n_pos + S01_2/n_neg) - 2 * (S10_12/n_pos + S01_12/n_neg);

        if (var_diff <= 0) return { Z: NaN, pValue: NaN, method: "DeLong Test (non-positive variance)" };

        const Z = (auc1 - auc2) / Math.sqrt(var_diff);
        const pValue = 2 * (1 -首席_cdfNormal(Math.abs(Z))); // Two-tailed test

        return { Z: Z, pValue: pValue, auc1: auc1, auc2: auc2, var_diff: var_diff, method: "DeLong Test for correlated AUCs" };
    }

    function首席_calculateSingleAUCAndVariance(scores, truth, n_pos, n_neg) {
        let auc = 0;
        for (let i = 0; i < scores.length; i++) {
            if (truth[i] === 1) { // Positive case
                for (let j = 0; j < scores.length; j++) {
                    if (truth[j] === 0) { // Negative case
                        if (scores[i] > scores[j]) auc++;
                        else if (scores[i] === scores[j]) auc += 0.5;
                    }
                }
            }
        }
        auc /= (n_pos * n_neg) || 1;

        // Variance calculation (simplified, for uncorrelated or single AUC context)
        const V10 = new Array(n_pos).fill(0);
        const V01 = new Array(n_neg).fill(0);
        let pos_idx = 0, neg_idx = 0;
         for(let i=0; i<scores.length; ++i) {
            if(truth[i] === 1) {
                for(let j=0; j<scores.length; ++j) if(truth[j] === 0) V10[pos_idx] += (scores[i] > scores[j] ? 1 : (scores[i] === scores[j] ? 0.5 : 0));
                V10[pos_idx] /= n_neg;
                pos_idx++;
            } else {
                for(let j=0; j<scores.length; ++j) if(truth[j] === 1) V01[neg_idx] += (scores[j] > scores[i] ? 1 : (scores[j] === scores[i] ? 0.5 : 0));
                V01[neg_idx] /= n_pos;
                neg_idx++;
            }
        }
        const S10 = V10.reduce((s,v) => s + (v-auc)*(v-auc), 0) / (n_pos-1);
        const S01 = V01.reduce((s,v) => s + (v-auc)*(v-auc), 0) / (n_neg-1);
        const variance = (S10/n_pos) + (S01/n_neg);

        return { auc, variance };
    }

    function首席_cdfNormal(x) { // Standard Normal CDF (approximation)
        const b1 =  0.319381530; const b2 = -0.356563782; const b3 =  1.781477937;
        const b4 = -1.821255978; const b5 =  1.330274429; const p  =  0.2316419;
        const c2 =  0.3989423;  let a=Math.abs(x); let t = 1.0/(1.0+a*p);
        let b = c2*Math.exp(-x*x/2.0); let n = ((((b5*t+b4)*t+b3)*t+b2)*t+b1)*t;
        n = 1.0-b*n; if (x < 0.0) n = 1.0 - n; return n;
    }

    function compareDiagnosticMethods(data, method1Key, method2Key, referenceKey) {
        if (!data || data.length === 0) return { mcnemar: null, delong: null };
        
        let m1_pos_m2_pos = 0; // a
        let m1_pos_m2_neg = 0; // b
        let m1_neg_m2_pos = 0; // c
        let m1_neg_m2_neg = 0; // d

        data.forEach(item => {
            const m1_is_pos = item[`${method1Key}_status_patient`] === 1;
            const m2_is_pos = item[`${method2Key}_status_patient`] === 1;
            const ref_is_pos = item[`${referenceKey}_status_patient`] === 1;

            if (m1_is_pos && m2_is_pos) m1_pos_m2_pos++;
            else if (m1_is_pos && !m2_is_pos) m1_pos_m2_neg++;
            else if (!m1_is_pos && m2_is_pos) m1_neg_m2_pos++;
            else if (!m1_is_pos && !m2_is_pos) m1_neg_m2_neg++;
        });

        const mcnemar = _performMcNemarTest(m1_pos_m2_pos, m1_pos_m2_neg, m1_neg_m2_pos, m1_neg_m2_neg);
        const delong = _calculateAUCDeLong(data, method1Key, method2Key, referenceKey);
        
        return { mcnemar, delong };
    }

    function calculateDescriptiveStats(data, currentKollektiv) {
        if (!data || data.length === 0) return { anzahlPatienten: 0, alter: { mean: null, sd: null, median: null, q1: null, q3:null, min: null, max: null, data: [] }, geschlecht: { m: 0, f: 0, unbekannt: 0 }, nStatus: { pos: 0, neg: 0 } };
        
        const alterData = data.map(p => p.alter).filter(a => a !== null && !isNaN(a));
        alterData.sort((a, b) => a - b);
        
        const n = alterData.length;
        let meanAlter = null, sdAlter = null, medianAlter = null, q1Alter = null, q3Alter = null, minAlter=null, maxAlter=null;

        if (n > 0) {
            meanAlter = alterData.reduce((sum, val) => sum + val, 0) / n;
            sdAlter = Math.sqrt(alterData.map(val => Math.pow(val - meanAlter, 2)).reduce((sum, val) => sum + val, 0) / (n > 1 ? n - 1 : 1));
            minAlter = alterData[0];
            maxAlter = alterData[n-1];
            
            const mid = Math.floor(n / 2);
            medianAlter = n % 2 !== 0 ? alterData[mid] : (alterData[mid - 1] + alterData[mid]) / 2;
            
            const q1Index = Math.floor((n + 1) / 4) -1;
            const q3Index = Math.floor(3 * (n + 1) / 4) -1;
            q1Alter = alterData[q1Index];
            q3Alter = alterData[q3Index];
             if (n < 4) { // simplified for very small N
                q1Alter = alterData[0];
                q3Alter = alterData[n-1];
            }
        }

        const geschlechtCounts = data.reduce((acc, p) => {
            if (p.geschlecht === 'm') acc.m++;
            else if (p.geschlecht === 'f') acc.f++;
            else acc.unbekannt++;
            return acc;
        }, { m: 0, f: 0, unbekannt: 0 });

        const nStatusCounts = data.reduce((acc, p) => {
            if (p.n_status_patient === 1) acc.pos++;
            else if (p.n_status_patient === 0) acc.neg++;
            return acc;
        }, { pos: 0, neg: 0 });

        return {
            anzahlPatienten: data.length,
            alter: { mean: meanAlter, sd: sdAlter, median: medianAlter, q1: q1Alter, q3: q3Alter, min: minAlter, max: maxAlter, data: alterData },
            geschlecht: geschlechtCounts,
            nStatus: nStatusCounts
        };
    }
    
    function calculateAssociationStats(data, t2Criteria, t2Logic) {
        if (!data || data.length === 0 || !t2Criteria) return [];
        const results = [];
        const alpha = APP_CONFIG?.STATISTICAL_CONSTANTS?.SIGNIFICANCE_LEVEL || 0.05;

        const criteriaToTest = [
            { key: 'as', label: 'Avocado Sign', type: 'binary_status', sourceKey: 'as_status_patient' },
            ...(Object.keys(t2Criteria).filter(k => t2Criteria[k].active).map(critKey => ({
                key: critKey,
                label: UI_TEXTS?.t2CriteriaShort?.[critKey] || critKey,
                type: 't2_feature',
                criterion: t2Criteria[critKey],
                criterionKey: critKey
            })))
        ];

        criteriaToTest.forEach(testItem => {
            let tp = 0, fp = 0, fn = 0, tn = 0; // Merkmal Positiv/Negativ vs N-Status Positiv/Negativ
                                                // tp: Merkmal+ / N+
                                                // fp: Merkmal+ / N-
                                                // fn: Merkmal- / N+
                                                // tn: Merkmal- / N-
            data.forEach(patient => {
                let featurePositive = false;
                if (testItem.type === 'binary_status') {
                    featurePositive = patient[testItem.sourceKey] === 1;
                } else if (testItem.type === 't2_feature') {
                     // Check if ANY lymph node of this patient meets this single active criterion
                    if (patient.t2_lymphknoten && patient.t2_lymphknoten.length > 0) {
                        for (const lk of patient.t2_lymphknoten) {
                            if (testItem.criterion.active && typeof dataProcessor !== 'undefined' && typeof dataProcessor._checkSingleCriterion === 'function' && dataProcessor._checkSingleCriterion(lk, testItem.criterionKey, testItem.criterion.value !== undefined ? testItem.criterion.value : testItem.criterion.threshold) ) {
                                featurePositive = true;
                                break;
                            } else if (testItem.criterion.active && testItem.criterionKey === 'size' && typeof dataProcessor !== 'undefined' && typeof dataProcessor._checkSingleCriterion === 'function' && dataProcessor._checkSingleCriterion(lk, testItem.criterionKey, testItem.criterion.threshold) ) {
                                featurePositive = true;
                                break;
                            }
                        }
                    }
                }

                const actualNPositive = patient.n_status_patient === 1;
                if (featurePositive && actualNPositive) tp++;
                else if (featurePositive && !actualNPositive) fp++;
                else if (!featurePositive && actualNPositive) fn++;
                else if (!featurePositive && !actualNPositive) tn++;
            });

            const N_feature_pos = tp + fp;
            const N_feature_neg = fn + tn;
            const N_n_pos = tp + fn;
            const N_n_neg = fp + tn;
            const N_total = tp + fp + fn + tn;
            
            const praevalenz_bei_Nplus = N_n_pos > 0 ? tp / N_n_pos : 0;

            const oddsRatio = (tp * tn) / (fp * fn); // Kann Infinity or NaN sein
            let or_ci_lower = NaN, or_ci_upper = NaN, or_p_value = NaN;

            if (isFinite(oddsRatio) && oddsRatio > 0 && tp > 0 && fp > 0 && fn > 0 && tn > 0) {
                const logOR = Math.log(oddsRatio);
                const seLogOR = Math.sqrt(1/tp + 1/fp + 1/fn + 1/tn);
                const z =首席_calculateZScore(1 - alpha/2);
                or_ci_lower = Math.exp(logOR - z * seLogOR);
                or_ci_upper = Math.exp(logOR + z * seLogOR);
                or_p_value = 2 * (1 -首席_cdfNormal(Math.abs(logOR / seLogOR)));
            }
            
            const fisher = _performFisherExactTest(tp, fp, fn, tn);


            results.push({
                kriterium: testItem.label,
                praevalenz_Nplus: praevalenz_bei_Nplus,
                oddsRatio: { value: isFinite(oddsRatio) ? oddsRatio : null, ci: {lower: or_ci_lower, upper: or_ci_upper}, pValue: or_p_value },
                fisherPValue: fisher.pValue,
                matrix: {tp,fp,fn,tn}
            });
        });
        return results;
    }
    
    function _performFisherExactTest(a,b,c,d) { // Contingency table: [[a,b],[c,d]]
        const n = a+b+c+d;
        const row1sum = a+b; const row2sum = c+d; const col1sum = a+c; const col2sum = b+d;
        let p_cutoff =首席_logFactorial(row1sum) +首席_logFactorial(row2sum) +首席_logFactorial(col1sum) +首席_logFactorial(col2sum) -首席_logFactorial(n);
        p_cutoff = Math.exp(p_cutoff - (首席_logFactorial(a) +首席_logFactorial(b) +首席_logFactorial(c) +首席_logFactorial(d)));

        let p_value = 0;
        for(let x=0; x <= Math.min(row1sum, col1sum); ++x){
            if( (row1sum-x <0) || (col1sum-x <0) || (n-row1sum-col1sum+x <0) ) continue;
            let current_p_val_log =首席_logFactorial(row1sum) +首席_logFactorial(row2sum) +首席_logFactorial(col1sum) +首席_logFactorial(col2sum) -首席_logFactorial(n);
            let current_p = Math.exp( current_p_val_log - (首席_logFactorial(x) +首席_logFactorial(row1sum-x) +首席_logFactorial(col1sum-x) +首席_logFactorial(n-row1sum-col1sum+x)) );
            if(current_p <= p_cutoff * (1+1e-7)) p_value += current_p; // Factor for floating point issues
        }
        return { pValue: Math.min(1.0, p_value) }; // P-value can slightly exceed 1 due to floating point issues
    }

    function首席_logFactorial(n){
        if(n<0) return NaN; if(n<=1) return 0;
        if(typeof首席_logFactorial.cache === 'undefined')首席_logFactorial.cache = [0,0];
        if(n <首席_logFactorial.cache.length) return首席_logFactorial.cache[n];
        for(let i=首席_logFactorial.cache.length; i<=n; ++i)首席_logFactorial.cache[i] =首席_logFactorial.cache[i-1] + Math.log(i);
        return首席_logFactorial.cache[n];
    }
    
    function calculateAllStatsForPublication(processedDataFull, appliedT2CriteriaGlobal, appliedT2LogicGlobal, bruteForceResults, publikationBruteForceMetric) {
        if (!processedDataFull || processedDataFull.length === 0) return null;
        const allStats = {};
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const t2StdStudyIdForComparison = 'beets_tan_2018_esgar'; // Example, make configurable if needed
         const t2StdStudy = studyT2CriteriaManager.getStudyCriteriaSetById(t2StdStudyIdForComparison);


        kollektive.forEach(kollId => {
            allStats[kollId] = {};
            const dataKoll = dataProcessor.filterDataByKollektiv(processedDataFull, kollId);
            if (dataKoll.length === 0 && kollId !== 'Gesamt') { // Gesamt must always be processed
                 allStats[kollId].deskriptiv = calculateDescriptiveStats([], kollId);
                 allStats[kollId].gueteAS = _calculateBinaryMetrics(0,0,0,0);
                 if(t2StdStudy) allStats[kollId].gueteT2_literatur = { [t2StdStudyIdForComparison]: _calculateBinaryMetrics(0,0,0,0) };
                 allStats[kollId].gueteT2_bruteforce = _calculateBinaryMetrics(0,0,0,0);
                 allStats[kollId].bruteforce_definition = null;
                 if(t2StdStudy) allStats[kollId].vergleich_AS_vs_T2Std = { [t2StdStudyIdForComparison]: { mcnemar: null, delong: null }};
                 allStats[kollId].vergleich_AS_vs_T2Opt = { mcnemar: null, delong: null };
                return;
            }
            allStats[kollId].deskriptiv = calculateDescriptiveStats(dataKoll, kollId);
            allStats[kollId].gueteAS = calculateDiagnosticPerformance(dataKoll, 'as', 'n');

            allStats[kollId].gueteT2_literatur = {};
            if(t2StdStudy && typeof studyT2CriteriaManager !== 'undefined') {
                const dataKollT2StdEval = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataKoll), t2StdStudy);
                allStats[kollId].gueteT2_literatur[t2StdStudyIdForComparison] = calculateDiagnosticPerformance(dataKollT2StdEval, 't2', 'n');
                 allStats[kollId].vergleich_AS_vs_T2Std = {
                     [t2StdStudyIdForComparison] : compareDiagnosticMethods(dataKollT2StdEval, 'as', 't2', 'n')
                 };
            }


            const bfResultsForKoll = bruteForceResults?.[kollId];
            let bestBFCriteriaForMetric = null;
            let bestBFLogicForMetric = null;
            if (bfResultsForKoll && bfResultsForKoll.results && bfResultsForKoll.results.length > 0) {
                 let topResultForMetric = bfResultsForKoll.results.find(r => r.metricName === publikationBruteForceMetric);
                 if (!topResultForMetric) topResultForMetric = bfResultsForKoll.bestResult; // Fallback to overall best if specific metric not found
                 if (topResultForMetric) {
                     bestBFCriteriaForMetric = topResultForMetric.criteria;
                     bestBFLogicForMetric = topResultForMetric.logic;
                     allStats[kollId].bruteforce_definition = {
                         criteria: cloneDeep(bestBFCriteriaForMetric),
                         logic: bestBFLogicForMetric,
                         metricName: publikationBruteForceMetric, // or topResultForMetric.metricName
                         metricValue: topResultForMetric.metricValue
                     };
                     allStats[kollId].bruteforce_definition_metric = { // DEPRECATED - use specific metric suffix
                         [publikationBruteForceMetric.replace(/\s+/g, '_')]: allStats[kollId].bruteforce_definition
                     };

                 }
            }
            if(!bestBFCriteriaForMetric && APP_CONFIG.DEFAULT_SETTINGS.FALLBACK_BF_CRITERIA_FOR_PUBLICATION) { // Fallback if BF not run or no result
                bestBFCriteriaForMetric = APP_CONFIG.DEFAULT_SETTINGS.FALLBACK_BF_CRITERIA_FOR_PUBLICATION.criteria;
                bestBFLogicForMetric = APP_CONFIG.DEFAULT_SETTINGS.FALLBACK_BF_CRITERIA_FOR_PUBLICATION.logic;
                 allStats[kollId].bruteforce_definition = {
                         criteria: cloneDeep(bestBFCriteriaForMetric),
                         logic: bestBFLogicForMetric,
                         metricName: publikationBruteForceMetric,
                         metricValue: null,
                         isFallback: true
                     };
            }


            if (bestBFCriteriaForMetric && bestBFLogicForMetric && typeof t2CriteriaManager !== 'undefined') {
                const dataKollT2OptEval = t2CriteriaManager.evaluateDataset(cloneDeep(dataKoll), bestBFCriteriaForMetric, bestBFLogicForMetric);
                allStats[kollId].gueteT2_bruteforce = calculateDiagnosticPerformance(dataKollT2OptEval, 't2', 'n');
                 allStats[kollId].gueteT2_bruteforce_metric = { // DEPRECATED - use specific metric suffix
                    [publikationBruteForceMetric.replace(/\s+/g, '_')] : allStats[kollId].gueteT2_bruteforce
                 };
                allStats[kollId].vergleich_AS_vs_T2Opt = compareDiagnosticMethods(dataKollT2OptEval, 'as', 't2', 'n');
                 allStats[kollId].vergleich_AS_vs_T2Opt_metric = { // DEPRECATED
                    [publikationBruteForceMetric.replace(/\s+/g, '_')] : allStats[kollId].vergleich_AS_vs_T2Opt
                 };
            } else {
                allStats[kollId].gueteT2_bruteforce = _calculateBinaryMetrics(0,0,0,0);
                allStats[kollId].vergleich_AS_vs_T2Opt = { mcnemar: null, delong: null };
            }
        });
        
        // Interobserver Kappa for AS (example on Gesamt)
        if (allStats.Gesamt && processedDataFull.length > 0 && APP_CONFIG.READER_INFO && APP_CONFIG.READER_INFO.ENABLE_INTEROBSERVER_AS) {
            // This needs data with observer1_as_status_patient and observer2_as_status_patient
            // For now, placeholder:
            allStats.Gesamt.interobserverAS = { kappa: {value: 0.85, se: 0.05, ci_lower: 0.75, ci_upper: 0.95, interpretation: 'Good'} };
        }


        return allStats;
    }


    return Object.freeze({
        initialize,
        calculateDiagnosticPerformance,
        compareDiagnosticMethods,
        calculateDescriptiveStats,
        calculateAssociationStats,
        calculateAllStatsForPublication
    });
})();
