self.onmessage = function(e) {
    const { command, data, kollektiv, targetMetric, t2CriteriaOptions, allCriteriaKeys } = e.data;

    const evaluateCriteriaForPatient = (patient, criteria, logic) => {
        let overallMatch = logic === 'ODER' ? false : true;
        let criteriaMetCount = 0;
        let activeCriteriaCount = 0;

        for (const key of allCriteriaKeys) {
            const criterionSetting = criteria[key];
            if (criterionSetting && criterionSetting.active) {
                activeCriteriaCount++;
                let patientCriterionMet = false;
                const patientLymphknoten = patient.lymphknoten_t2 || [];

                for (const lk of patientLymphknoten) {
                    let lkMatchesThisCriterion = true;
                    if (key === 'size') {
                        const lkSize = parseFloat(lk.groesse);
                        if (isNaN(lkSize) || !(lkSize >= criterionSetting.threshold)) {
                            lkMatchesThisCriterion = false;
                        }
                    } else {
                        if (lk[key] !== criterionSetting.value) {
                            lkMatchesThisCriterion = false;
                        }
                    }
                    if (lkMatchesThisCriterion) {
                        patientCriterionMet = true;
                        break; 
                    }
                }
                
                if (logic === 'ODER' && patientCriterionMet) {
                    overallMatch = true;
                    break; 
                }
                if (logic === 'UND' && !patientCriterionMet) {
                    overallMatch = false;
                    break; 
                }
                if (patientCriterionMet) {
                    criteriaMetCount++;
                }
            }
        }
        if (activeCriteriaCount === 0) return false;
        return overallMatch;
    };

    const calculateConfusionMatrix = (patientData, criteria, logic, referenceKey = 'n', positiveValue = '+') => {
        let rp = 0, fp = 0, fn = 0, rn = 0;
        patientData.forEach(patient => {
            const referencePositive = patient[referenceKey] === positiveValue;
            const testPositive = evaluateCriteriaForPatient(patient, criteria, logic);

            if (testPositive && referencePositive) rp++;
            else if (testPositive && !referencePositive) fp++;
            else if (!testPositive && referencePositive) fn++;
            else if (!testPositive && !referencePositive) rn++;
        });
        return { rp, fp, fn, rn, total: rp + fp + fn + rn };
    };
    
    const _calculateBasicMetricsFromMatrix = (matrix) => {
        if (!matrix || matrix.rp === undefined) return { sens: NaN, spez: NaN, ppv: NaN, npv: NaN, acc: NaN, balAcc: NaN, f1: NaN };
        const { rp, fp, fn, rn } = matrix;
        const total = rp + fp + fn + rn;
        if (total === 0) return { sens: 0, spez: 0, ppv: 0, npv: 0, acc: 0, balAcc: 0, f1: 0 };

        const sens = (rp + fn) > 0 ? rp / (rp + fn) : 0;
        const spez = (rn + fp) > 0 ? rn / (rn + fp) : 0;
        const ppv  = (rp + fp) > 0 ? rp / (rp + fp) : 0;
        const npv  = (rn + fn) > 0 ? rn / (rn + fn) : 0;
        const acc  = total > 0 ? (rp + rn) / total : 0;
        const balAcc = (sens + spez) / 2;
        const f1 = (2 * ppv * sens) / (ppv + sens) || 0;
        
        return { sens, spez, ppv, npv, acc, balAcc, f1 };
    };


    const calculateMetric = (matrix, metricName) => {
        const basicMetrics = _calculateBasicMetricsFromMatrix(matrix);
        switch (metricName) {
            case 'Accuracy': return basicMetrics.acc;
            case 'Balanced Accuracy': return basicMetrics.balAcc;
            case 'F1-Score': return basicMetrics.f1;
            case 'Sensitivität': return basicMetrics.sens;
            case 'Spezifität': return basicMetrics.spez;
            case 'PPV': return basicMetrics.ppv;
            case 'NPV': return basicMetrics.npv;
            default: return basicMetrics.balAcc; 
        }
    };

    if (command === 'start') {
        const criteriaToTest = [];
        const fixedThresholdValue = 5.0; 

        const generateCombinationsRecursive = (index, currentCombination) => {
            if (index === allCriteriaKeys.length) {
                let activeCount = 0;
                for (const key of allCriteriaKeys) {
                    if (currentCombination[key] && currentCombination[key].active) {
                        activeCount++;
                    }
                }
                if (activeCount > 0) {
                    criteriaToTest.push(JSON.parse(JSON.stringify(currentCombination)));
                }
                return;
            }

            const key = allCriteriaKeys[index];
            currentCombination[key] = { active: false };
            generateCombinationsRecursive(index + 1, currentCombination);

            currentCombination[key].active = true;
            if (key === 'size') {
                currentCombination[key].threshold = fixedThresholdValue;
                currentCombination[key].condition = '>=';
                generateCombinationsRecursive(index + 1, currentCombination);
            } else {
                const values = t2CriteriaOptions[key.toUpperCase() + '_VALUES'] || [];
                if (values.length > 0) {
                    for (const value of values) {
                        currentCombination[key].value = value;
                        generateCombinationsRecursive(index + 1, currentCombination);
                    }
                } else {
                     generateCombinationsRecursive(index + 1, currentCombination);
                }
            }
        };
        
        generateCombinationsRecursive(0, {});

        const logicsToTest = ['UND', 'ODER'];
        let totalCombinations = criteriaToTest.length * logicsToTest.length;
        let testedCount = 0;
        let currentBestResults = [];
        const maxTopResults = 10;
        let startTime = performance.now();

        self.postMessage({ type: 'started', totalCombinations: totalCombinations, kollektiv: kollektiv, metric: targetMetric });

        for (const logic of logicsToTest) {
            for (const criteria of criteriaToTest) {
                const matrix = calculateConfusionMatrix(data, criteria, logic);
                const metricValue = calculateMetric(matrix, targetMetric);
                const basicMetrics = _calculateBasicMetricsFromMatrix(matrix);

                if (isFinite(metricValue)) {
                    const resultEntry = {
                        metricValue: metricValue,
                        criteria: criteria,
                        logic: logic,
                        sens: basicMetrics.sens,
                        spez: basicMetrics.spez,
                        ppv: basicMetrics.ppv,
                        npv: basicMetrics.npv,
                        acc: basicMetrics.acc,
                        balAcc: basicMetrics.balAcc,
                        f1: basicMetrics.f1,
                        matrix: matrix
                    };

                    if (currentBestResults.length < maxTopResults) {
                        currentBestResults.push(resultEntry);
                        currentBestResults.sort((a, b) => b.metricValue - a.metricValue);
                    } else if (metricValue > currentBestResults[maxTopResults - 1].metricValue) {
                        currentBestResults.pop();
                        currentBestResults.push(resultEntry);
                        currentBestResults.sort((a, b) => b.metricValue - a.metricValue);
                    }
                }

                testedCount++;
                if (testedCount % 100 === 0 || testedCount === totalCombinations) {
                    self.postMessage({
                        type: 'progress',
                        tested: testedCount,
                        total: totalCombinations,
                        currentBest: currentBestResults.length > 0 ? currentBestResults[0] : null,
                        metric: targetMetric
                    });
                }
            }
        }
        
        let endTime = performance.now();
        const durationMs = endTime - startTime;
        const nGesamt = data.length;
        const nPlus = data.filter(p => p.n === '+').length;
        const nMinus = nGesamt - nPlus;

        self.postMessage({
            type: 'result',
            results: currentBestResults,
            metric: targetMetric,
            kollektiv: kollektiv,
            duration: durationMs,
            totalTested: testedCount,
            nGesamt: nGesamt,
            nPlus: nPlus,
            nMinus: nMinus,
            bestResult: currentBestResults.length > 0 ? currentBestResults[0] : null
        });
    }
};
