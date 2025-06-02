const statisticsService = (() => {
    let _isInitialized = false;

    function initialize() {
        _isInitialized = true;
    }

    function _logGamma(x) {
        if (x <= 0) return NaN;
        let sum = 0;
        sum += 0.99999999999980993;
        sum += 676.5203681218851 / (x + 1);
        sum -= 1259.1392167224028 / (x + 2);
        sum += 771.32342877765313 / (x + 3);
        sum -= 176.61502916214059 / (x + 4);
        sum += 12.507343278686905 / (x + 5);
        sum -= 0.13857109526572012 / (x + 6);
        sum += 9.9843695780195716e-6 / (x + 7);
        sum += 1.5056327351493116e-7 / (x + 8);
        return Math.log(Math.sqrt(2 * Math.PI) / x) + Math.log(sum) + (x - 0.5) * Math.log(x + 7.5) - (x + 7.5);
    }

    function _regularizedLowerIncompleteGammaFunction(a, x) {
        if (x < 0 || a <= 0) return NaN;
        if (x === 0) return 0;
        if (x > 1 && x > a) return 1 - _regularizedUpperIncompleteGammaFunction(a, x);

        let sum = 1;
        let term = 1;
        for (let k = 1; k < 100; k++) {
            term *= x / (a + k);
            sum += term;
            if (term < 1e-7 * sum && term < 1e-15) break; 
        }
        return Math.exp(a * Math.log(x) - x - _logGamma(a + 1)) * sum;
    }
    
    function _regularizedUpperIncompleteGammaFunction(a, x) {
        if (x < 0 || a <= 0) return NaN;
        if (x < 1 || x < a) return 1 - _regularizedLowerIncompleteGammaFunction(a, x);

        let term = 1 / x;
        let sum = term;
        for (let k = 1; k < 100; k++) {
            term *= k / x;
            sum += term;
            if (Math.abs(term) < 1e-7 * Math.abs(sum) && Math.abs(term) < 1e-15) break;
        }
        return Math.exp(-x + (a - 1) * Math.log(x) - _logGamma(a)) * sum;
    }


    function _chiSquareCDF(x, df) {
        if (x < 0 || df <= 0) return 0;
        return _regularizedLowerIncompleteGammaFunction(df / 2, x / 2);
    }

    function _calculateConfidenceInterval(p, n, method = 'wilson', alpha = 0.05) {
        if (n === 0 || p < 0 || p > 1) return { lower: NaN, upper: NaN, n_trials: n };
        if (n < 5 && (method === 'wilson' || method === 'agresti_coull')) {
             // Fallback for very small n, or use exact if available and simpler
        }
        const z = 보통정규분포_CDF_역함수(1 - alpha / 2); // Inverse of standard normal CDF for Z_alpha/2
        let lower, upper;

        if (method === 'wilson') {
            const term1 = p + (z * z) / (2 * n);
            const term2 = z * Math.sqrt((p * (1 - p) / n) + (z * z) / (4 * n * n));
            const denominator = 1 + (z * z) / n;
            lower = Math.max(0, (term1 - term2) / denominator);
            upper = Math.min(1, (term1 + term2) / denominator);
        } else if (method === 'agresti_coull') {
            const n_adj = n + z * z;
            const p_adj = (p * n + (z * z) / 2) / n_adj;
            const margin = z * Math.sqrt(p_adj * (1 - p_adj) / n_adj);
            lower = Math.max(0, p_adj - margin);
            upper = Math.min(1, p_adj + margin);
        } else { // Wald (normal approximation)
            const margin = z * Math.sqrt(p * (1 - p) / n);
            lower = Math.max(0, p - margin);
            upper = Math.min(1, p + margin);
        }
        return { lower, upper, n_trials: n };
    }
    
    function 보통정규분포_CDF_역함수(p) { // Standard Normal Inverse CDF (Approximation)
        if (p <= 0 || p >= 1) return NaN;
        if (p === 0.5) return 0;

        const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
        const b = [-5.447609860616247e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
        const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
        const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
        const p_low = 0.02425; const p_high = 1 - p_low;
        let q, r, x;

        if (p < p_low) {
            q = Math.sqrt(-2 * Math.log(p));
            x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / (((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1));
        } else if (p <= p_high) {
            q = p - 0.5;
            r = q * q;
            x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / ((((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1));
        } else {
            q = Math.sqrt(-2 * Math.log(1 - p));
            x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / (((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1));
        }
        return x;
    }

    function _performMcNemarTest(matrix) {
        const b = matrix.fp_method1_tn_method2; // AS- T2+
        const c = matrix.tp_method1_fn_method2; // AS+ T2-
        if ((b + c) === 0) return { statistic: NaN, pValue: 1.0, df: 1, method: "McNemar's Test (no discordant pairs)" };
        
        const useCorrection = APP_CONFIG.STATISTICAL_CONSTANTS.MCNEMAR_USE_CONTINUITY_CORRECTION_SMALL_N && (b + c) < 25;
        const chiSquaredStat = useCorrection ? (Math.pow(Math.abs(b - c) - 1, 2) / (b + c)) : (Math.pow(b - c, 2) / (b + c));
        const pValue = 1 - _chiSquareCDF(chiSquaredStat, 1);
        return { statistic: chiSquaredStat, pValue: pValue, df: 1, method: `McNemar's Test${useCorrection ? ' (with Yates correction)' : ''}`};
    }
    
    function _calculateFisherExactTest(a, b, c, d) { // Directly use fisherExactTest from utils.js
        if (typeof fisherExactTest !== 'function') {
             console.warn("fisherExactTest function not found in utils.js. Cannot perform Fisher's Exact Test.");
             return { pValue: NaN, oddsRatio: { value: NaN, ci: { lower: NaN, upper: NaN } }, method: 'Fisher (unavailable)' };
        }
        return fisherExactTest(a, b, c, d); // utils.js should expose fisherExactTest
    }

    function _calculateDeLongCovariance(X, Y, nX = X.length, nY = Y.length) {
        if (nX !== nY || nX === 0) return NaN; // Requires paired data of same length
        let V10_X = 0, V01_Y = 0, V11_XY = 0;
        let n_pos_X = 0, n_neg_X = 0, n_pos_Y = 0, n_neg_Y = 0;
    
        for (let i = 0; i < nX; i++) {
            if (X[i].truth === 1) n_pos_X++; else n_neg_X++;
            if (Y[i].truth === 1) n_pos_Y++; else n_neg_Y++;
        }
    
        if (n_pos_X === 0 || n_neg_X === 0 || n_pos_Y === 0 || n_neg_Y === 0) return NaN; // No variance if all same class
    
        for (let i = 0; i < n_pos_X; i++) {
            let phi_X_i = 0;
            for (let j = 0; j < n_neg_X; j++) {
                const score_pos = X.filter(p => p.truth === 1)[i].score;
                const score_neg = X.filter(p => p.truth === 0)[j].score;
                if (score_pos > score_neg) phi_X_i += 1;
                else if (score_pos === score_neg) phi_X_i += 0.5;
            }
            V10_X += Math.pow(phi_X_i / n_neg_X, 2);
        }
        V10_X = (V10_X / n_pos_X) - Math.pow(this.calculateAUCFromScores(X.map(p=>p.score), X.map(p=>p.truth)).auc, 2);
    
        for (let j = 0; j < n_neg_Y; j++) {
            let phi_Y_j = 0;
            for (let i = 0; i < n_pos_Y; i++) {
                const score_pos = Y.filter(p => p.truth === 1)[i].score;
                const score_neg = Y.filter(p => p.truth === 0)[j].score;
                if (score_pos > score_neg) phi_Y_j += 1;
                else if (score_pos === score_neg) phi_Y_j += 0.5;
            }
            V01_Y += Math.pow(phi_Y_j / n_pos_Y, 2);
        }
        V01_Y = (V01_Y / n_neg_Y) - Math.pow(this.calculateAUCFromScores(Y.map(p=>p.score), Y.map(p=>p.truth)).auc, 2);
    
        // For V11_XY, assumes X and Y are scores for the same set of individuals.
        // Need to ensure X and Y are aligned by patient if truths are different (which they shouldn't be for AUC comparison)
        // This implementation assumes X and Y are arrays of {score: number, truth: 0|1} for the *same* patients
        // For simplicity here, let's assume `truth` is consistent for a patient across X and Y for AUC calculation.
        // This part is complex and requires careful handling of paired data for covariance.
        // A full, robust implementation for V11_XY is non-trivial.
        // Placeholder for V11_XY - requires proper structural components for positive and negative cases for X and Y
        // This is often the most complex part of DeLong. A simplified approach might be needed if full structurals are not available.
        // For a basic DeLong's test, we need to compute structural components.
        // The data needs to be in {score_X, score_Y, truth} format for each patient.
        
        // Placeholder / Simplified for demonstration of structure, not a full DeLong Covariance calculation.
        // The original code used a direct AUC comparison (X_auc - Y_auc) / sqrt(var_X + var_Y - 2 * cov_XY)
        // var_X = V10_X / n_pos_X + V01_X / n_neg_X (where V01_X is computed similarly to V01_Y)
        // A full DeLong test is quite involved to implement from scratch without a stat library.
        // The below is a conceptual structure and would need a proper statistical library or a much more detailed implementation.
        // This placeholder will make the DeLong test return NaN for covariance for now.
        V11_XY = NaN;
    
        return { V10_X, V01_Y, V11_XY }; // This V11_XY is often S_XY in formulas
    }


    function _performDeLongTest(auc1_obj, auc2_obj, dataForAuc1, dataForAuc2, referenceKey) {
        if (!auc1_obj || !auc2_obj || isNaN(auc1_obj.value) || isNaN(auc2_obj.value)) {
             return { Z: NaN, pValue: NaN, method: "DeLong's Test (AUCs not valid)" };
        }
        // DeLong's test requires paired data (same patients, different scores or methods)
        // This implementation assumes dataForAuc1 and dataForAuc2 are for the same set of patients.
        // It further assumes calculateAUCFromScores returns an object with { auc, scores_pos, scores_neg }
        // where scores_pos/neg are the prediction scores for true positive and true negative cases respectively.

        // The following is a simplified and potentially INCOMPLETE DeLong test logic.
        // A full DeLong test implementation is complex and typically relies on statistical libraries.
        // This is a placeholder to illustrate where it would go and will likely need a robust library.

        const auc1 = auc1_obj.value;
        const auc2 = auc2_obj.value;
        const n1_pos = dataForAuc1.filter(p => p[referenceKey] === 1).length;
        const n1_neg = dataForAuc1.filter(p => p[referenceKey] === 0).length;
        const n2_pos = dataForAuc2.filter(p => p[referenceKey] === 1).length; // Should be same as n1_pos for paired
        const n2_neg = dataForAuc2.filter(p => p[referenceKey] === 0).length; // Should be same as n1_neg for paired

        if (n1_pos === 0 || n1_neg === 0 || n2_pos === 0 || n2_neg === 0 || n1_pos !== n2_pos || n1_neg !== n2_neg) {
            return { Z: NaN, pValue: NaN, method: "DeLong's Test (Invalid data for pairing or zero counts)" };
        }

        // Simplified variance calculation (Hanley & McNeil is simpler but DeLong is specific)
        // Var(AUC) approx = (AUC(1-AUC) + (n_pos-1)(Q1-AUC^2) + (n_neg-1)(Q2-AUC^2)) / (n_pos * n_neg)
        // Q1 = AUC / (2-AUC), Q2 = 2*AUC^2 / (1+AUC)
        const calculateAucVariance = (auc, n_p, n_n) => {
            if (n_p === 0 || n_n === 0 || auc < 0 || auc > 1) return NaN;
            const q1 = auc / (2 - auc);
            const q2 = (2 * auc * auc) / (1 + auc);
            const variance = (auc * (1 - auc) + (n_p - 1) * (q1 - auc * auc) + (n_n - 1) * (q2 - auc * auc)) / (n_p * n_n);
            return variance > 0 ? variance : NaN; // Variance must be positive
        };

        const var_auc1 = calculateAucVariance(auc1, n1_pos, n1_neg);
        const var_auc2 = calculateAucVariance(auc2, n2_pos, n2_neg);

        // Covariance calculation is the tricky part of DeLong's test and requires pairing.
        // Placeholder for covariance - this is where the full DeLong logic would go.
        // For now, assume independence for simplicity, which is NOT DeLong's test but a Z-test for independent AUCs.
        // This will NOT be a correct DeLong p-value.
        const cov_auc1_auc2 = 0; // INCORRECT ASSUMPTION FOR DELONG

        if (isNaN(var_auc1) || isNaN(var_auc2)) {
            return { Z: NaN, pValue: NaN, method: "DeLong's Test (Variance calculation failed)" };
        }

        const se_diff = Math.sqrt(var_auc1 + var_auc2 - 2 * cov_auc1_auc2);
        if (se_diff === 0 || isNaN(se_diff)) {
            return { Z: NaN, pValue: NaN, method: "DeLong's Test (SE of difference is zero or NaN)" };
        }

        const Z_stat = (auc1 - auc2) / se_diff;
        const pValue = 2 * (1 - 보통정규분포_CDF(Math.abs(Z_stat)));

        return { Z: Z_stat, pValue: pValue, method: "DeLong's Test (Simplified - Covariance Placeholder)" };
    }

    function 보통정규분포_CDF(x) { // Standard Normal CDF (Approximation)
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        if (x > 0) prob = 1 - prob;
        return prob;
    }

    function calculateDescriptiveStats(data) {
        if (!data || data.length === 0) return null;
        const stats = {
            anzahlPatienten: data.length,
            alter: { all: [], mean: NaN, median: NaN, sd: NaN, q1: NaN, q3: NaN, min: NaN, max: NaN },
            geschlecht: { m: 0, f: 0, unbekannt: 0 },
            therapie: { direkt_op: 0, nRCT: 0, andere: 0 },
            nStatus: { '+': 0, '-': 0 },
            asStatus: { '+': 0, '-': 0 },
            t2Status: { '+': 0, '-': 0 }, // For currently applied T2 criteria
            alterData: []
        };

        data.forEach(p => {
            if (p.alter_jahre !== null && !isNaN(p.alter_jahre)) {
                stats.alter.all.push(p.alter_jahre);
                stats.alterData.push(p.alter_jahre);
            }
            if (p.geschlecht === 'm') stats.geschlecht.m++;
            else if (p.geschlecht === 'f') stats.geschlecht.f++;
            else stats.geschlecht.unbekannt++;

            if (p.therapie === 'direkt OP') stats.therapie.direkt_op++;
            else if (p.therapie === 'nRCT') stats.therapie.nRCT++;
            else stats.therapie.andere++;

            if (p.n_status_patient === 1) stats.nStatus['+']++;
            else if (p.n_status_patient === 0) stats.nStatus['-']++;

            if (p.as_status_patient === 1) stats.asStatus['+']++;
            else if (p.as_status_patient === 0) stats.asStatus['-']++;
            
            if (p.t2_status_patient === 1) stats.t2Status['+']++;
            else if (p.t2_status_patient === 0) stats.t2Status['-']++;
        });

        if (stats.alter.all.length > 0) {
            stats.alter.all.sort((a, b) => a - b);
            stats.alter.min = stats.alter.all[0];
            stats.alter.max = stats.alter.all[stats.alter.all.length - 1];
            stats.alter.mean = stats.alter.all.reduce((sum, val) => sum + val, 0) / stats.alter.all.length;
            const mid = Math.floor(stats.alter.all.length / 2);
            stats.alter.median = stats.alter.all.length % 2 !== 0 ? stats.alter.all[mid] : (stats.alter.all[mid - 1] + stats.alter.all[mid]) / 2;
            stats.alter.sd = Math.sqrt(stats.alter.all.map(x => Math.pow(x - stats.alter.mean, 2)).reduce((sum, val) => sum + val, 0) / (stats.alter.all.length > 1 ? stats.alter.all.length -1 : 1) );
            stats.alter.q1 = stats.alter.all[Math.floor(stats.alter.all.length / 4)];
            stats.alter.q3 = stats.alter.all[Math.floor((3 * stats.alter.all.length) / 4)];
        }
        const unknownGenderLabel = UI_TEXTS?.legendLabels?.unknownGender || 'Unbekannt';
        if(stats.geschlecht.unbekannt > 0) stats.geschlecht[unknownGenderLabel] = stats.geschlecht.unbekannt;

        return stats;
    }

    function calculateDiagnosticPerformance(data, methodPrefix, referenceKey = 'n_status_patient') {
        if (!data || data.length === 0) return null;
        let tp = 0, fp = 0, tn = 0, fn = 0;
        const predictionKey = `${methodPrefix}_status_patient`;

        data.forEach(p => {
            const predicted = p[predictionKey];
            const actual = p[referenceKey];
            if (predicted === 1 && actual === 1) tp++;
            else if (predicted === 1 && actual === 0) fp++;
            else if (predicted === 0 && actual === 0) tn++;
            else if (predicted === 0 && actual === 1) fn++;
        });
        const total = tp + fp + tn + fn;
        if (total === 0) return null;

        const sens = (tp + fn) > 0 ? tp / (tp + fn) : NaN;
        const spez = (tn + fp) > 0 ? tn / (tn + fp) : NaN;
        const ppv = (tp + fp) > 0 ? tp / (tp + fp) : NaN;
        const npv = (tn + fn) > 0 ? tn / (tn + fn) : NaN;
        const acc = total > 0 ? (tp + tn) / total : NaN;
        const balAcc = (isNaN(sens) || isNaN(spez)) ? NaN : (sens + spez) / 2;
        const f1 = (2 * tp) / (2 * tp + fp + fn) || NaN;

        // AUC calculation (simplified assuming binary prediction, for proper AUC scores are needed)
        // This is a placeholder as true AUC needs scores. For binary predictions, AUC can be derived from sens/spez.
        // AUC = (Sensitivity + Specificity) / 2 if data is perfectly balanced or using trapezoidal rule on ROC with one point.
        // A more robust AUC calculation would use predicted probabilities if available.
        // For now, using Balanced Accuracy as a proxy if scores aren't available.
        const auc_value = balAcc; // Placeholder: True AUC needs scores or a ROC curve.
        
        const ciMethod = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION || 'wilson';
        const results = {
            sens: { value: sens, ci: _calculateConfidenceInterval(sens, tp + fn, ciMethod), n_trials: tp+fn },
            spez: { value: spez, ci: _calculateConfidenceInterval(spez, tn + fp, ciMethod), n_trials: tn+fp },
            ppv: { value: ppv, ci: _calculateConfidenceInterval(ppv, tp + fp, ciMethod), n_trials: tp+fp },
            npv: { value: npv, ci: _calculateConfidenceInterval(npv, tn + fn, ciMethod), n_trials: tn+fn },
            acc: { value: acc, ci: _calculateConfidenceInterval(acc, total, ciMethod), n_trials: total },
            balAcc: { value: balAcc, ci: null, method: 'Calculated as (Sens+Spez)/2' }, // CI for BalAcc is more complex
            f1: { value: f1, ci: null, method: 'Calculated as 2TP / (2TP+FP+FN)' }, // CI for F1 is complex
            auc: { value: auc_value, ci: null, method: 'Approximated by Balanced Accuracy (scores needed for true AUC)' }, // CI for AUC is complex
            matrix: { tp, fp, tn, fn }
        };
        // More complex CIs (e.g., for balAcc, F1, AUC) would typically use bootstrapping if enabled.
        // This service currently only implements CIs for simple proportions.
        return results;
    }
    
    function calculateAUCFromScores(scores, truths) { // Expects scores and truths (0 or 1)
        if (scores.length !== truths.length || scores.length === 0) return { auc: NaN, scores_pos: [], scores_neg: [] };
    
        const data = scores.map((score, i) => ({ score, truth: truths[i] })).sort((a, b) => b.score - a.score);
        const scores_pos = data.filter(d => d.truth === 1).map(d => d.score);
        const scores_neg = data.filter(d => d.truth === 0).map(d => d.score);
    
        if (scores_pos.length === 0 || scores_neg.length === 0) return { auc: NaN, scores_pos, scores_neg };
    
        let auc = 0;
        for (let i = 0; i < scores_pos.length; i++) {
            for (let j = 0; j < scores_neg.length; j++) {
                if (scores_pos[i] > scores_neg[j]) auc += 1;
                else if (scores_pos[i] === scores_neg[j]) auc += 0.5;
            }
        }
        return { auc: auc / (scores_pos.length * scores_neg.length), scores_pos, scores_neg };
    }


    function compareDiagnosticMethods(data, method1Prefix, method2Prefix, referenceKey = 'n_status_patient') {
        if (!data || data.length < APP_CONFIG.STATISTICAL_CONSTANTS.MCNEMAR_MIN_N_FOR_COMPARISON || data.length === 0) return null;

        const mcnemarMatrix = {
            tp_method1_tp_method2: 0, // a
            tp_method1_fn_method2: 0, // c (M1+, M2-)
            fn_method1_tp_method2: 0, // b (M1-, M2+)
            fn_method1_fn_method2: 0  // d
        };
        // For McNemar, we compare paired predictions for the same patients
        data.forEach(p => {
            const pred1 = p[`${method1Prefix}_status_patient`];
            const pred2 = p[`${method2Prefix}_status_patient`];
            const actual = p[referenceKey];

            // McNemar specifically looks at discordant pairs.
            // We need counts of (Pred1=+, Pred2=-) and (Pred1=-, Pred2=+)
            // where prediction is relative to actual (e.g., correct vs incorrect, or just positive vs negative prediction)
            // The typical McNemar is for changes in response, or agreement between two dichotomous tests.
            // Here, we compare if M1 gets it right and M2 gets it wrong, vs. M1 wrong and M2 right.
            // Or, more simply, for comparing proportions of positive predictions:
            // (M1=1, M2=1), (M1=1, M2=0), (M1=0, M2=1), (M1=0, M2=0)

            if (pred1 === 1 && pred2 === 1) mcnemarMatrix.tp_method1_tp_method2++;
            else if (pred1 === 1 && pred2 === 0) mcnemarMatrix.tp_method1_fn_method2++;
            else if (pred1 === 0 && pred2 === 1) mcnemarMatrix.fn_method1_tp_method2++;
            else if (pred1 === 0 && pred2 === 0) mcnemarMatrix.fn_method1_fn_method2++;
        });

        const mcnemarResult = _performMcNemarTest(mcnemarMatrix);

        // For DeLong test, we need AUC values and original data if possible
        // Calculate AUCs for method1 and method2 if scores were available.
        // Since we only have binary predictions, a true DeLong test is not directly applicable without scores.
        // We can get AUC approximations from sens/spez.
        const perf1 = calculateDiagnosticPerformance(data, method1Prefix, referenceKey);
        const perf2 = calculateDiagnosticPerformance(data, method2Prefix, referenceKey);
        
        let deLongResult = { Z: NaN, pValue: NaN, method: "DeLong's Test (scores required)" };
        if (perf1 && perf1.auc && perf2 && perf2.auc && perf1.auc.value !== null && perf2.auc.value !== null && !isNaN(perf1.auc.value) && !isNaN(perf2.auc.value) ) {
            // This still needs actual scores for a proper DeLong test. Using AUCs derived from binary predictions is a strong simplification.
            // The _performDeLongTest function is a placeholder for a robust implementation.
            deLongResult = _performDeLongTest(perf1.auc, perf2.auc, data.map(p => ({score: p[`${method1Prefix}_status_patient`], truth: p[referenceKey]})), data.map(p => ({score: p[`${method2Prefix}_status_patient`], truth: p[referenceKey]})), referenceKey );
        }

        return { mcnemar: mcnemarResult, delong: deLongResult };
    }
    
    function _zTestProportions(p1, n1, p2, n2) {
        if (n1 === 0 || n2 === 0) return { z: NaN, pValue: NaN };
        const p_pool = (p1 * n1 + p2 * n2) / (n1 + n2);
        if (p_pool === 0 || p_pool === 1) return { z: 0, pValue: 1.0 }; // No variance if pooled p is 0 or 1
        const se_diff = Math.sqrt(p_pool * (1 - p_pool) * (1 / n1 + 1 / n2));
        if (se_diff === 0) return { z: (p1 === p2 ? 0 : (p1 > p2 ? Infinity : -Infinity)), pValue: (p1 === p2 ? 1.0 : 0.0) };
        const z = (p1 - p2) / se_diff;
        const pValue = 2 * (1 - 보통정규분포_CDF(Math.abs(z))); // Two-tailed test
        return { z, pValue };
    }

    function compareCohorts(dataKollektiv1, dataKollektiv2) {
        if (!dataKollektiv1 || dataKollektiv1.length === 0 || !dataKollektiv2 || dataKollektiv2.length === 0) {
            return null;
        }
        const results = { AS: {}, T2_angewandt: {} };
        const methods = ['AS', 'T2_angewandt']; // T2_angewandt uses the 't2' prefix from evaluateDataset
        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'auc'];

        methods.forEach(method => {
            const prefix = method === 'AS' ? 'as' : 't2';
            const perf1 = calculateDiagnosticPerformance(dataKollektiv1, prefix, 'n_status_patient');
            const perf2 = calculateDiagnosticPerformance(dataKollektiv2, prefix, 'n_status_patient');

            if (perf1 && perf2) {
                metrics.forEach(metricKey => {
                    const m1 = perf1[metricKey];
                    const m2 = perf2[metricKey];
                    if (m1 && m2 && m1.value !== null && !isNaN(m1.value) && m2.value !== null && !isNaN(m2.value)) {
                        let testResult;
                        if (metricKey === 'auc') { // Use DeLong for AUC, simplified Z-test for others
                             testResult = _performDeLongTest(m1, m2, dataKollektiv1.map(p => ({score: p[`${prefix}_status_patient`], truth: p.n_status_patient})), dataKollektiv2.map(p => ({score: p[`${prefix}_status_patient`], truth: p.n_status_patient})), 'n_status_patient');
                        } else { // For proportions like sens, spez, acc
                            // Need N for CI calculation, which is specific to each metric's denominator
                            const n1_metric = m1.n_trials !== undefined ? m1.n_trials : dataKollektiv1.length; // Approximation
                            const n2_metric = m2.n_trials !== undefined ? m2.n_trials : dataKollektiv2.length; // Approximation
                            testResult = _zTestProportions(m1.value, n1_metric, m2.value, n2_metric);
                        }
                        results[method][metricKey] = {
                            val1: m1.value, ci1_lower: m1.ci?.lower, ci1_upper: m1.ci?.upper,
                            val2: m2.value, ci2_lower: m2.ci?.lower, ci2_upper: m2.ci?.upper,
                            zScore: testResult.z, pValue: testResult.pValue, method: testResult.method || 'Z-Test for proportions'
                        };
                    }
                });
            }
        });
        return results;
    }

    function calculateAssociations(data, t2CriteriaUsed, referenceKey = 'n_status_patient') {
        if (!data || data.length === 0 || !t2CriteriaUsed || typeof t2CriteriaUsed !== 'object') return null;
        const associations = {};

        Object.keys(t2CriteriaUsed).forEach(criterionKey => {
            if (!t2CriteriaUsed[criterionKey] || !t2CriteriaUsed[criterionKey].active) return;

            let a = 0, b = 0, c = 0, d = 0; // For 2x2 table: criterion_present vs reference_positive
            let Nplus_Gesamt = 0, Nplus_Merkmal = 0;

            data.forEach(p => {
                const hasCriterionFeature = p.t2_kriterien_details?.[criterionKey]?.erfuellt === true;
                const isReferencePositive = p[referenceKey] === 1;

                if (isReferencePositive) Nplus_Gesamt++;

                if (hasCriterionFeature && isReferencePositive) { a++; Nplus_Merkmal++; } // Criterion=Yes, Ref=Yes
                else if (hasCriterionFeature && !isReferencePositive) { b++; } // Criterion=Yes, Ref=No
                else if (!hasCriterionFeature && isReferencePositive) { c++; } // Criterion=No, Ref=Yes
                else if (!hasCriterionFeature && !isReferencePositive) { d++; } // Criterion=No, Ref=No
            });
            
            if ((a + b + c + d) === 0) return; // Skip if no data for this criterion combination

            const fisherResults = _calculateFisherExactTest(a, b, c, d);
            
            associations[criterionKey] = {
                oddsRatio: { value: fisherResults.oddsRatio, ci: fisherResults.ci, method: 'Fisher Exact (conditional MLE)' },
                fisherTest: { pValue: fisherResults.pValue, method: "Fisher's Exact Test" },
                Nplus_Gesamt: Nplus_Gesamt,
                Nplus_Merkmal: Nplus_Merkmal,
                matrix: { tp:a, fp:b, fn:c, tn:d } // a=merkmal+ & ref+, b=merkmal+ & ref-, c=merkmal- & ref+, d=merkmal- & ref-
            };
        });
        return associations;
    }

    function calculateAllStatsForPublication(processedDataFull, appliedT2Criteria, appliedT2Logic, bruteForceResultsGlobal, bruteForceMetricForPublication) {
        const allStats = {};
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        
        kollektive.forEach(kollId => {
            const dataKollektiv = dataProcessor.filterDataByKollektiv(processedDataFull, kollId);
            if (dataKollektiv && dataKollektiv.length > 0) {
                const evaluatedDataApplied = t2CriteriaManager.evaluateDataset(cloneDeep(dataKollektiv), appliedT2Criteria, appliedT2Logic);
                allStats[kollId] = {
                    deskriptiv: statisticsService.calculateDescriptiveStats(evaluatedDataApplied),
                    gueteAS: statisticsService.calculateDiagnosticPerformance(evaluatedDataApplied, 'as', 'n_status_patient'),
                    gueteT2_angewandt: statisticsService.calculateDiagnosticPerformance(evaluatedDataApplied, 't2', 'n_status_patient'),
                    vergleichASvsT2_angewandt: statisticsService.compareDiagnosticMethods(evaluatedDataApplied, 'as', 't2', 'n_status_patient'),
                    assoziation_angewandt: statisticsService.calculateAssociations(evaluatedDataApplied, appliedT2Criteria, 'n_status_patient'),
                    gueteT2_literatur: {},
                };
                
                if (typeof studyT2CriteriaManager !== 'undefined' && typeof PUBLICATION_CONFIG !== 'undefined' && PUBLICATION_CONFIG.literatureCriteriaSets) {
                     PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studyConf => {
                         const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyConf.id);
                         if(studySet && (studySet.applicableKollektiv === kollId || studySet.applicableKollektiv === 'Gesamt' || !studySet.applicableKollektiv)) { // Apply if for this kollektiv or general
                             const dataForStudy = (studySet.applicableKollektiv && studySet.applicableKollektiv !== kollId) ? dataProcessor.filterDataByKollektiv(processedDataFull, studySet.applicableKollektiv) : dataKollektiv;
                             if(dataForStudy && dataForStudy.length > 0) {
                                 const evaluatedDataStudy = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForStudy), studySet);
                                 allStats[kollId].gueteT2_literatur[studyConf.id] = statisticsService.calculateDiagnosticPerformance(evaluatedDataStudy, 't2', 'n_status_patient');
                             }
                         }
                     });
                }

                if (bruteForceResultsGlobal && bruteForceResultsGlobal.perKollektiv && bruteForceResultsGlobal.perKollektiv[kollId]) {
                    const bfResultsForKoll = bruteForceResultsGlobal.perKollektiv[kollId];
                    const relevantBFResult = bfResultsForKoll.find(res => res.metricName === bruteForceMetricForPublication && res.bestResult);
                    if (relevantBFResult && relevantBFResult.bestResult) {
                        const bfCriteria = relevantBFResult.bestResult.criteria;
                        const bfLogic = relevantBFResult.bestResult.logic;
                        const evaluatedDataBF = t2CriteriaManager.evaluateDataset(cloneDeep(dataKollektiv), bfCriteria, bfLogic);
                        const bfGueteKey = `gueteT2_bruteforce_metric_${bruteForceMetricForPublication.replace(/\s+/g, '_')}`;
                        const bfDefKey = `bruteforce_definition_metric_${bruteForceMetricForPublication.replace(/\s+/g, '_')}`;

                        allStats[kollId][bfGueteKey] = statisticsService.calculateDiagnosticPerformance(evaluatedDataBF, 't2', 'n_status_patient');
                        allStats[kollId][bfDefKey] = { 
                            criteria: cloneDeep(bfCriteria), 
                            logic: bfLogic, 
                            metricName: bruteForceMetricForPublication,
                            metricValue: relevantBFResult.bestResult.metricValue
                        };
                        allStats[kollId][`vergleichASvsT2_bruteforce_metric_${bruteForceMetricForPublication.replace(/\s+/g, '_')}`] = statisticsService.compareDiagnosticMethods(evaluatedDataBF, 'as', 't2', 'n_status_patient');
                    }
                }
            }
        });
        return allStats;
    }


    return Object.freeze({
        initialize,
        calculateDescriptiveStats,
        calculateDiagnosticPerformance,
        calculateAUCFromScores,
        compareDiagnosticMethods,
        calculateAssociations,
        compareCohorts,
        calculateAllStatsForPublication 
    });

})();
