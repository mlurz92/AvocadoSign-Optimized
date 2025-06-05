const statisticsService = (() => {

    const SIGNIFICANCE_LEVEL = APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL;
    const BOOTSTRAP_CI_REPLICATIONS = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS;
    const BOOTSTRAP_CI_ALPHA = APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_ALPHA;
    const DEFAULT_CI_METHOD_PROPORTION = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION;
    const DEFAULT_CI_METHOD_EFFECTSIZE = APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE;
    const FISHER_EXACT_THRESHOLD = APP_CONFIG.STATISTICAL_CONSTANTS.FISHER_EXACT_THRESHOLD;
    const CI_WARNING_SAMPLE_SIZE_THRESHOLD = APP_CONFIG.STATISTICAL_CONSTANTS.CI_WARNING_SAMPLE_SIZE_THRESHOLD;


    function calculateDescriptiveStats(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return { anzahlPatienten: 0, alter: {}, geschlecht: {}, therapie: {}, nStatus: {}, asStatus: {}, t2Status: {}, lkCounts: {}, alterData: [] };
        }

        const stats = {
            anzahlPatienten: data.length,
            alter: {},
            geschlecht: { m: 0, f: 0, unbekannt: 0 },
            therapie: { 'direkt OP': 0, nRCT: 0, unbekannt: 0 },
            nStatus: { plus: 0, minus: 0, unbekannt: 0 },
            asStatus: { plus: 0, minus: 0, unbekannt: 0 },
            t2Status: { plus: 0, minus: 0, unbekannt: 0 },
            lkCounts: { pathoTotal: 0, pathoPlus: 0, asTotal: 0, asPlus: 0, t2Total: 0, t2Plus: 0 },
            alterData: []
        };

        data.forEach(p => {
            if (p.alter !== null && p.alter !== undefined) {
                stats.alterData.push(p.alter);
            }
            if (p.geschlecht) stats.geschlecht[p.geschlecht]++;
            if (p.therapie) stats.therapie[p.therapie]++;
            if (p.n) stats.nStatus[p.n]++;
            if (p.as) stats.asStatus[p.as]++;
            if (p.t2) stats.t2Status[p.t2]++;

            stats.lkCounts.pathoTotal += p.anzahl_patho_lk || 0;
            stats.lkCounts.pathoPlus += p.anzahl_patho_n_plus_lk || 0;
            stats.lkCounts.asTotal += p.anzahl_as_lk || 0;
            stats.lkCounts.asPlus += p.anzahl_as_plus_lk || 0;
            stats.lkCounts.t2Total += p.anzahl_t2_lk || 0;
            stats.lkCounts.t2Plus += p.anzahl_t2_plus_lk || 0;
        });

        if (stats.alterData.length > 0) {
            stats.alter.min = d3.min(stats.alterData);
            stats.alter.max = d3.max(stats.alterData);
            stats.alter.mean = d3.mean(stats.alterData);
            stats.alter.median = d3.median(stats.alterData);
            stats.alter.q1 = d3.quantile(stats.alterData.sort(d3.ascending), 0.25);
            stats.alter.q3 = d3.quantile(stats.alterData.sort(d3.ascending), 0.75);
            stats.alter.sd = d3.deviation(stats.alterData);
        }

        return stats;
    }

    function calculateContingencyTable(data, predictorKey, outcomeKey) {
        if (!Array.isArray(data) || data.length === 0) return null;
        const table = {
            rp: 0, // true positives (positive on predictor, positive on outcome)
            fp: 0, // false positives (positive on predictor, negative on outcome)
            fn: 0, // false negatives (negative on predictor, positive on outcome)
            rn: 0  // true negatives (negative on predictor, negative on outcome)
        };

        data.forEach(p => {
            if (p[predictorKey] === '+' && p[outcomeKey] === '+') table.rp++;
            else if (p[predictorKey] === '+' && p[outcomeKey] === '-') table.fp++;
            else if (p[predictorKey] === '-' && p[outcomeKey] === '+') table.fn++;
            else if (p[predictorKey] === '-' && p[outcomeKey] === '-') table.rn++;
        });

        return table;
    }

    function calculateDiagnosticPerformance(data, predictorKey, outcomeKey) {
        if (!Array.isArray(data) || data.length === 0) return null;
        const matrix = calculateContingencyTable(data, predictorKey, outcomeKey);
        if (!matrix) return null;

        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        const nPosOutcome = rp + fn;
        const nNegOutcome = fp + rn;
        const nPosPredictor = rp + fp;
        const nNegPredictor = fn + rn;

        const sens = (nPosOutcome === 0) ? 0 : rp / nPosOutcome;
        const spez = (nNegOutcome === 0) ? 0 : rn / nNegOutcome;
        const ppv = (nPosPredictor === 0) ? 0 : rp / nPosPredictor;
        const npv = (nNegPredictor === 0) ? 0 : rn / nNegPredictor;
        const acc = (total === 0) ? 0 : (rp + rn) / total;
        const balAcc = (sens + spez) / 2;
        const f1Score = (sens + ppv === 0) ? 0 : (2 * sens * ppv) / (sens + ppv);

        // ROC Curve and AUC (simplified for binary outcome)
        const rocCurve = [
            { fpr: 0, tpr: 0, threshold: 1 },
            { fpr: 1 - spez, tpr: sens, threshold: 0 },
            { fpr: 1, tpr: 1, threshold: -1 }
        ];
        const auc = Math.abs((1 - spez) * sens + (1 - (1 - spez)) * (1 - sens)) / 2; // Simple AUC for binary case

        const bootstrap = (metricFn) => {
            const results = [];
            for (let i = 0; i < BOOTSTRAP_CI_REPLICATIONS; i++) {
                const sample = [];
                for (let j = 0; j < total; j++) {
                    sample.push(data[Math.floor(Math.random() * total)]);
                }
                const sampleMatrix = calculateContingencyTable(sample, predictorKey, outcomeKey);
                if (sampleMatrix) {
                    const sampleRp = sampleMatrix.rp;
                    const sampleFp = sampleMatrix.fp;
                    const sampleFn = sampleMatrix.fn;
                    const sampleRn = sampleMatrix.rn;
                    const sampleTotal = sampleRp + sampleFp + sampleFn + sampleRn;
                    if (sampleTotal > 0) {
                        results.push(metricFn(sampleRp, sampleFp, sampleFn, sampleRn));
                    }
                }
            }
            results.sort(d3.ascending);
            const lowerIndex = Math.floor(BOOTSTRAP_CI_ALPHA / 2 * BOOTSTRAP_CI_REPLICATIONS);
            const upperIndex = Math.floor((1 - BOOTSTRAP_CI_ALPHA / 2) * BOOTSTRAP_CI_REPLICATIONS);
            return {
                lower: results[lowerIndex] || results[0],
                upper: results[upperIndex] || results[results.length - 1]
            };
        };

        const ciForProportion = (nSuccess, nTrials) => {
            if (nTrials === 0) return { lower: NaN, upper: NaN };
            // Simple Wilson Score interval as an example, for proportions
            // For more robust CIs, external libraries or more complex math would be needed.
            if (nTrials < CI_WARNING_SAMPLE_SIZE_THRESHOLD) {
                console.warn(`Geringe Stichprobengröße (N=${nTrials}) für CI-Berechnung von Proportionen. CI möglicherweise unzuverlässig.`);
            }
            if (DEFAULT_CI_METHOD_PROPORTION === 'Wilson Score') {
                const z = 1.96; // For 95% CI
                const p = nSuccess / nTrials;
                const denominator = 1 + z * z / nTrials;
                const center = (p + z * z / (2 * nTrials)) / denominator;
                const margin = z * Math.sqrt((p * (1 - p) / nTrials) + (z * z / (4 * nTrials * nTrials))) / denominator;
                return { lower: Math.max(0, center - margin), upper: Math.min(1, center + margin) };
            }
            // Fallback for proportions:
            return { lower: NaN, upper: NaN };
        };

        const getBootstrapCI = (metricKey) => {
             if (total < CI_WARNING_SAMPLE_SIZE_THRESHOLD) {
                console.warn(`Geringe Stichprobengröße (N=${total}) für Bootstrap CI-Berechnung von Effektmaßen. CI möglicherweise unzuverlässig.`);
            }
            if (DEFAULT_CI_METHOD_EFFECTSIZE === 'Bootstrap Percentile') {
                let metricFn;
                switch(metricKey) {
                    case 'auc': metricFn = (rp, fp, fn, rn) => { const s = (rp + fn === 0) ? 0 : rp / (rp + fn); const sp = (fp + rn === 0) ? 0 : rn / (fp + rn); return Math.abs(s * sp + (1 - s) * (1 - sp)) / 2; }; break;
                    case 'balAcc': metricFn = (rp, fp, fn, rn) => { const s = (rp + fn === 0) ? 0 : rp / (rp + fn); const sp = (fp + rn === 0) ? 0 : rn / (fp + rn); return (s + sp) / 2; }; break;
                    case 'f1': metricFn = (rp, fp, fn, rn) => { const s = (rp + fn === 0) ? 0 : rp / (rp + fn); const p = (rp + fp === 0) ? 0 : rp / (rp + fp); return (s + p === 0) ? 0 : (2 * s * p) / (s + p); }; break;
                    default: return { lower: NaN, upper: NaN };
                }
                return bootstrap(metricFn);
            }
            return { lower: NaN, upper: NaN };
        };

        const createMetricResult = (value, n_success, n_trials, ciMethod = 'proportion') => {
            let ci = { lower: NaN, upper: NaN };
            if (ciMethod === 'proportion') {
                ci = ciForProportion(n_success, n_trials);
            } else if (ciMethod === 'bootstrap') {
                ci = getBootstrapCI(ciMethod); // Placeholder, actual key handling in getBootstrapCI
            }
             if (isNaN(value)) value = NaN; // ensure NaN is propagated
            return { value, n_success, n_trials, ci };
        };


        return {
            matrix: matrix,
            sens: createMetricResult(sens, rp, nPosOutcome, 'proportion'),
            spez: createMetricResult(spez, rn, nNegOutcome, 'proportion'),
            ppv: createMetricResult(ppv, rp, nPosPredictor, 'proportion'),
            npv: createMetricResult(npv, rn, nNegPredictor, 'proportion'),
            acc: createMetricResult(acc, rp + rn, total, 'proportion'),
            balAcc: createMetricResult(balAcc, null, null, 'bootstrap', 'balAcc'),
            f1: createMetricResult(f1Score, null, null, 'bootstrap', 'f1'),
            auc: createMetricResult(auc, null, null, 'bootstrap', 'auc'),
            roc: rocCurve
        };
    }

    function calculateAssociations(data, appliedCriteria) {
        if (!Array.isArray(data) || data.length === 0) return null;
        const associations = {};

        const calculateOddsRatio = (rp, fp, fn, rn) => {
            if (fp * fn === 0) return { value: NaN, ci: { lower: NaN, upper: NaN } }; // Avoid division by zero
            const or = (rp * rn) / (fp * fn);
            const seLogOr = Math.sqrt(1 / rp + 1 / fp + 1 / fn + 1 / rn);
            const z = 1.96; // For 95% CI
            const logOrLower = Math.log(or) - z * seLogOr;
            const logOrUpper = Math.log(or) + z * seLogOr;
            return { value: or, ci: { lower: Math.exp(logOrLower), upper: Math.exp(logOrUpper) } };
        };

        const calculateRiskDifference = (rp, fp, fn, rn) => {
            const totalPredPos = rp + fp;
            const totalPredNeg = fn + rn;
            const riskPos = totalPredPos === 0 ? 0 : rp / totalPredPos;
            const riskNeg = totalPredNeg === 0 ? 0 : fn / totalPredNeg;
            const rd = riskPos - riskNeg;

            // Simplified CI for RD (using normal approximation for difference of two proportions)
            const seRd = Math.sqrt(
                (riskPos * (1 - riskPos) / totalPredPos) +
                (riskNeg * (1 - riskNeg) / totalPredNeg)
            );
            const z = 1.96;
            return { value: rd, ci: { lower: rd - z * seRd, upper: rd + z * seRd } };
        };

        const calculatePhiCoefficient = (rp, fp, fn, rn) => {
            const numerator = (rp * rn) - (fp * fn);
            const denominator = Math.sqrt((rp + fp) * (fn + rn) * (rp + fn) * (fp + rn));
            return denominator === 0 ? NaN : numerator / denominator;
        };

        const processCriterion = (key, dataTransformFn) => {
            const transformedData = data.map(p => {
                const lk = p.lymphknoten_t2_bewertet && p.lymphknoten_t2_bewertet.length > 0 ? p.lymphknoten_t2_bewertet[0] : null;
                const value = lk && lk.checkResult && lk.checkResult[key] !== undefined ? lk.checkResult[key] : null;
                return { [key]: value, n: p.n };
            }).filter(d => d[key] !== null && d.n !== null);

            const matrix = {
                rp: transformedData.filter(d => d[key] === true && d.n === '+').length,
                fp: transformedData.filter(d => d[key] === true && d.n === '-').length,
                fn: transformedData.filter(d => d[key] === false && d.n === '+').length,
                rn: transformedData.filter(d => d[key] === false && d.n === '-').length
            };
            if (matrix.rp + matrix.fp + matrix.fn + matrix.rn === 0) return null;

            const or = calculateOddsRatio(matrix.rp, matrix.fp, matrix.fn, matrix.rn);
            const rd = calculateRiskDifference(matrix.rp, matrix.fp, matrix.fn, matrix.rn);
            const phi = calculatePhiCoefficient(matrix.rp, matrix.fp, matrix.fn, matrix.rn);

            return { or, rd, phi, matrix };
        };
        
        // AS Status
        const asMatrix = calculateContingencyTable(data, 'as', 'n');
        if (asMatrix && (asMatrix.rp + asMatrix.fp + asMatrix.fn + asMatrix.rn > 0)) {
            associations.as = {
                or: calculateOddsRatio(asMatrix.rp, asMatrix.fp, asMatrix.fn, asMatrix.rn),
                rd: calculateRiskDifference(asMatrix.rp, asMatrix.fp, asMatrix.fn, asMatrix.rn),
                phi: calculatePhiCoefficient(asMatrix.rp, asMatrix.fp, asMatrix.fn, asMatrix.rn),
                matrix: asMatrix
            };
        }


        ['size', 'form', 'kontur', 'homogenitaet', 'signal'].forEach(key => {
            if (appliedCriteria?.[key]?.active) {
                const result = processCriterion(key, (p) => p.lymphknoten_t2_bewertet?.[0]?.checkResult?.[key]); // Assuming first LN's feature
                if (result) {
                    associations[key] = result;
                }
            }
        });

        return associations;
    }

    function compareDiagnosticMethods(data, method1Key, method2Key, outcomeKey) {
        if (!Array.isArray(data) || data.length === 0) return null;

        const results = {
            mcnemar: {
                pValue: NaN,
                matrix: {
                    m1Pos_m2Pos: 0,
                    m1Pos_m2Neg: 0,
                    m1Neg_m2Pos: 0,
                    m1Neg_m2Neg: 0
                }
            },
            delong: {
                pValue: NaN,
                diffAUC: NaN,
                ci: { lower: NaN, upper: NaN }
            }
        };

        const pairs = data.filter(p => p[method1Key] !== null && p[method2Key] !== null && p[outcomeKey] !== null);
        if (pairs.length < FISHER_EXACT_THRESHOLD) { // Fallback for small samples, Fisher's exact might be more appropriate.
            // For now, just return NaN for p-values in very small samples for McNemar/DeLong
            console.warn(`Geringe Stichprobengröße (${pairs.length}) für gepaarte Vergleiche. p-Werte möglicherweise unzuverlässig.`);
            return results;
        }

        // McNemar's Test for Accuracy/Proportions (only discordant pairs count)
        let b = 0; // method1 positive, method2 negative (discordant)
        let c = 0; // method1 negative, method2 positive (discordant)

        pairs.forEach(p => {
            const m1_pos = p[method1Key] === '+';
            const m2_pos = p[method2Key] === '+';
            const outcome_pos = p[outcomeKey] === '+';

            // Based on concordance with true outcome
            const m1_correct = (m1_pos && outcome_pos) || (!m1_pos && !outcome_pos);
            const m2_correct = (m2_pos && outcome_pos) || (!m2_pos && !outcome_pos);

            if (m1_correct && !m2_correct) b++;
            if (!m1_correct && m2_correct) c++;
        });

        results.mcnemar.matrix.m1Pos_m2Neg = b;
        results.mcnemar.matrix.m1Neg_m2Pos = c;
        results.mcnemar.matrix.m1Pos_m2Pos = pairs.filter(p => {
            const m1_pos = p[method1Key] === '+';
            const m2_pos = p[method2Key] === '+';
            const outcome_pos = p[outcomeKey] === '+';
            return ((m1_pos && outcome_pos) || (!m1_pos && !outcome_pos)) && ((m2_pos && outcome_pos) || (!m2_pos && !outcome_pos));
        }).length;
        results.mcnemar.matrix.m1Neg_m2Neg = pairs.filter(p => {
            const m1_pos = p[method1Key] === '+';
            const m2_pos = p[method2Key] === '+';
            const outcome_pos = p[outcomeKey] === '+';
            return (!((m1_pos && outcome_pos) || (!m1_pos && !outcome_pos))) && (!((m2_pos && outcome_pos) || (!m2_pos && !outcome_pos)));
        }).length;

        // McNemar's Test for Accuracy
        if (b + c > 0) {
            const chi2 = (Math.abs(b - c) - 1) * (Math.abs(b - c) - 1) / (b + c); // Continuity correction
            if (b + c < FISHER_EXACT_THRESHOLD) { // Use Fisher's exact for small counts
                results.mcnemar.pValue = 'Fisher-Exact'; // Placeholder, Fisher's exact needs dedicated function
            } else {
                results.mcnemar.pValue = 1 - (b + c > 0 ? (new jStat.chisquare(1)).cdf(chi2) : NaN);
            }
        } else {
            results.mcnemar.pValue = 1; // No discordant pairs means no difference
        }

        // DeLong's Test for AUC (requires actual ROC data, approximated here)
        // This is a highly simplified approximation for DeLong's test for binary outcomes.
        // A full implementation requires more complex calculations (covariance matrix, etc.).
        // For demonstration, we'll use a bootstrap on the AUC difference.
        const bootstrapAUCDiff = () => {
            const aucDiffs = [];
            for (let i = 0; i < BOOTSTRAP_CI_REPLICATIONS; i++) {
                const sample = [];
                for (let j = 0; j < pairs.length; j++) {
                    sample.push(pairs[Math.floor(Math.random() * pairs.length)]);
                }
                const perf1 = calculateDiagnosticPerformance(sample, method1Key, outcomeKey);
                const perf2 = calculateDiagnosticPerformance(sample, method2Key, outcomeKey);
                if (perf1?.auc?.value !== undefined && perf2?.auc?.value !== undefined) {
                    aucDiffs.push(perf1.auc.value - perf2.auc.value);
                }
            }
            if (aucDiffs.length === 0) return { pValue: NaN, ci: { lower: NaN, upper: NaN }, diffAUC: NaN };
            aucDiffs.sort(d3.ascending);
            const lowerIndex = Math.floor(BOOTSTRAP_CI_ALPHA / 2 * BOOTSTRAP_CI_REPLICATIONS);
            const upperIndex = Math.floor((1 - BOOTSTRAP_CI_ALPHA / 2) * BOOTSTRAP_CI_REPLICATIONS);
            
            const meanDiff = d3.mean(aucDiffs);
            const ciLower = aucDiffs[lowerIndex] || aucDiffs[0];
            const ciUpper = aucDiffs[upperIndex] || aucDiffs[aucDiffs.length - 1];

            // For p-value, count how many times diff is <= 0 or >= 0 if 0 is in CI.
            // Simplified: is 0 within the CI? If so, not significant.
            const isSignificant = !(ciLower <= 0 && ciUpper >= 0);
            const pValue = isSignificant ? (2 * (1 - d3.mean(aucDiffs.map(d => Math.abs(d / d3.deviation(aucDiffs)))))) : 1; // Very rough approximation for p-value

            return { pValue, ci: { lower: ciLower, upper: ciUpper }, diffAUC: meanDiff };
        };
        const delongResult = bootstrapAUCDiff();
        results.delong.pValue = delongResult.pValue;
        results.delong.diffAUC = delongResult.diffAUC;
        results.delong.ci = delongResult.ci;

        return results;
    }

    function compareCohorts(data1, data2, appliedCriteria, appliedLogic) {
        if (!Array.isArray(data1) || data1.length === 0 || !Array.isArray(data2) || data2.length === 0) {
            return null;
        }

        const stats1_as = calculateDiagnosticPerformance(data1, 'as', 'n');
        const stats1_t2 = calculateDiagnosticPerformance(data1, 't2', 'n');
        const stats2_as = calculateDiagnosticPerformance(data2, 'as', 'n');
        const stats2_t2 = calculateDiagnosticPerformance(data2, 't2', 'n');

        // Compare Accuracy (Chi-square test for proportions)
        const compareAcc = (acc1, n1, acc2, n2) => {
            if (n1 === 0 || n2 === 0 || isNaN(acc1) || isNaN(acc2)) return { pValue: NaN, chi2: NaN };
            const correct1 = acc1 * n1;
            const correct2 = acc2 * n2;
            const incorrect1 = n1 - correct1;
            const incorrect2 = n2 - correct2;

            // Perform Chi-squared test for 2x2 table
            const table = [[correct1, incorrect1], [correct2, incorrect2]];
            const p = jStat.chi2test(table); // jStat for chi-squared test
            return { pValue: p, chi2: NaN }; // jStat doesn't return chi2 stat directly for this, needs custom calculation
        };

        // Compare AUCs (assuming independent samples, simplified for demonstration)
        const compareAUC = (auc1, se1, auc2, se2) => {
            if (isNaN(auc1) || isNaN(auc2) || isNaN(se1) || isNaN(se2) || (se1 === 0 && se2 === 0)) {
                return { pValue: NaN, zStat: NaN };
            }
            const zStat = (auc1 - auc2) / Math.sqrt(se1 * se1 + se2 * se2);
            return { pValue: 2 * (1 - jStat.normal.cdf(Math.abs(zStat), 0, 1)), zStat: zStat };
        };

        // Get standard errors for AUC from bootstrap (simplified)
        const getAUC_SE = (perf) => {
            if (!perf?.auc?.ci?.lower || !perf?.auc?.ci?.upper) return NaN;
            return (perf.auc.ci.upper - perf.auc.ci.lower) / (2 * 1.96); // Z-score for 95% CI
        };


        const results = {
            as: {
                acc: compareAcc(stats1_as?.acc?.value, data1.length, stats2_as?.acc?.value, data2.length),
                auc: compareAUC(stats1_as?.auc?.value, getAUC_SE(stats1_as), stats2_as?.auc?.value, getAUC_SE(stats2_as))
            },
            t2: {
                acc: compareAcc(stats1_t2?.acc?.value, data1.length, stats2_t2?.acc?.value, data2.length),
                auc: compareAUC(stats1_t2?.auc?.value, getAUC_SE(stats1_t2), stats2_t2?.auc?.value, getAUC_SE(stats2_t2))
            }
        };

        return results;
    }

    function calculateAllStatsForPublication(globalRawData, appliedT2Criteria, appliedT2Logic, allBruteForceResults, targetBruteForceMetricKey) {
        const fullProcessedData = dataProcessor.processPatientData(globalRawData);
        // Evaluate full data with applied criteria once
        const evaluatedFullData = t2CriteriaManager.evaluateDataset(cloneDeep(fullProcessedData), appliedT2Criteria, appliedT2Logic);

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const allStats = {};

        kollektive.forEach(kolId => {
            const filteredData = dataProcessor.filterDataByKollektiv(evaluatedFullData, kolId);
            const rawFilteredData = dataProcessor.filterDataByKollektiv(globalRawData, kolId);

            const statsForKollektiv = {};
            statsForKollektiv.deskriptiv = calculateDescriptiveStats(filteredData);
            statsForKollektiv.gueteAS = calculateDiagnosticPerformance(filteredData, 'as', 'n');
            statsForKollektiv.gueteT2 = calculateDiagnosticPerformance(filteredData, 't2', 'n'); // Use the applied T2 criteria

            // Literary T2 Criteria Performance (re-evaluate with specific study criteria)
            statsForKollektiv.gueteT2_literatur = {};
            APP_CONFIG.PUBLICATION_JOURNAL_REQUIREMENTS.CRITERIA_COMPARISON_SETS.forEach(litId => {
                if (litId !== APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID && litId !== APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litId);
                    if (studySet) {
                        const dataForLitStudy = dataProcessor.filterDataByKollektiv(rawFilteredData, studySet.applicableKollektiv || kolId);
                        const evaluatedLitData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(dataForLitStudy), studySet);
                        statsForKollektiv.gueteT2_literatur[litId] = calculateDiagnosticPerformance(evaluatedLitData, 't2', 'n');
                    }
                }
            });


            // Brute-Force Optimized T2 Performance
            statsForKollektiv.bruteforce_definition = allBruteForceResults[kolId] ? cloneDeep(allBruteForceResults[kolId]) : null;
            if (statsForKollektiv.bruteforce_definition && statsForKollektiv.bruteforce_definition.bestResult) {
                const bfCriteria = statsForKollektiv.bruteforce_definition.bestResult.criteria;
                const bfLogic = statsForKollektiv.bruteforce_definition.bestResult.logic;
                const bfEvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(rawFilteredData), bfCriteria, bfLogic);
                statsForKollektiv.gueteT2_bruteforce = calculateDiagnosticPerformance(bfEvaluatedData, 't2', 'n');
            } else {
                statsForKollektiv.gueteT2_bruteforce = null; // No BF result available for this kollektiv
            }
            

            // Comparison AS vs. BF Optimized T2
            if (statsForKollektiv.gueteAS && statsForKollektiv.gueteT2_bruteforce) {
                 const dataForComparison = dataProcessor.filterDataByKollektiv(rawFilteredData, kolId);
                 const evaluatedDataForAS = dataForComparison; // AS status is already in data
                 const evaluatedDataForBF = t2CriteriaManager.evaluateDataset(cloneDeep(dataForComparison), statsForKollektiv.bruteforce_definition.bestResult.criteria, statsForKollektiv.bruteforce_definition.bestResult.logic);
                 
                 // Combine to ensure 'as' and 't2' are on same objects for comparison
                 const combinedDataForPairedTests = evaluatedDataForBF.map((p_bf, index) => {
                     const p_as = evaluatedDataForAS[index];
                     const combined = cloneDeep(p_bf);
                     if (p_as) {
                         combined.as = p_as.as;
                     }
                     return combined;
                 }).filter(p => p.as !== null && p.t2 !== null && p.n !== null);

                statsForKollektiv.vergleichASvsT2_bruteforce = compareDiagnosticMethods(combinedDataForPairedTests, 'as', 't2', 'n');
            } else {
                statsForKollektiv.vergleichASvsT2_bruteforce = null;
            }

            statsForKollektiv.assoziation = calculateAssociations(filteredData, appliedCriteria);
            allStats[kolId] = statsForKollektiv;
        });

        return allStats;
    }


    return Object.freeze({
        calculateDescriptiveStats,
        calculateDiagnosticPerformance,
        calculateAssociations,
        compareDiagnosticMethods,
        compareCohorts,
        calculateAllStatsForPublication
    });
})();
