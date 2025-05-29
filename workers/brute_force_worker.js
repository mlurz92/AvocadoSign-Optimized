self.onmessage = function(event) {
    if (event.data.type === 'start') {
        const { data, t2CriteriaSettings, metric, kollektivName, defaultT2Logic } = event.data.payload;
        if (!data || !t2CriteriaSettings || !metric || !kollektivName) {
            postMessage({ type: 'error', payload: { message: 'Fehlende Parameter für Brute-Force Start.', kollektiv: kollektivName, metric: metric } });
            return;
        }

        const criteriaOptions = {
            size: generateSizeThresholds(t2CriteriaSettings.SIZE_RANGE),
            form: t2CriteriaSettings.FORM_VALUES,
            kontur: t2CriteriaSettings.KONTUR_VALUES,
            homogenitaet: t2CriteriaSettings.HOMOGENITAET_VALUES,
            signal: t2CriteriaSettings.SIGNAL_VALUES
        };
        const logics = ['UND', 'ODER'];
        const referenceKey = 'n';
        const predictionKey = 't2_bf';

        let bestResults = [];
        const topN = 20;
        let currentBestMetricValue = -Infinity;
        let testedCombinations = 0;
        const totalCombinations = calculateTotalCombinations(criteriaOptions, logics);

        postMessage({ type: 'started', payload: { totalCombinations, kollektiv: kollektivName, metric: metric, nGesamt: data.length, nPlus: data.filter(p=>p.n === '+').length, nMinus: data.filter(p=>p.n === '-').length } });

        const criteriaKeys = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
        const activeStates = [true, false];
        let lastProgressUpdate = Date.now();

        function* generateCriteriaCombinations() {
            for (const logic of logics) {
                for (const sizeActive of activeStates) {
                    const sizeThresholdsToTest = sizeActive ? criteriaOptions.size : [null];
                    for (const sizeThreshold of sizeThresholdsToTest) {
                        for (const formActive of activeStates) {
                            const formValuesToTest = formActive ? criteriaOptions.form : [null];
                            for (const formValue of formValuesToTest) {
                                for (const konturActive of activeStates) {
                                    const konturValuesToTest = konturActive ? criteriaOptions.kontur : [null];
                                    for (const konturValue of konturValuesToTest) {
                                        for (const homogenitaetActive of activeStates) {
                                            const homogenitaetValuesToTest = homogenitaetActive ? criteriaOptions.homogenitaet : [null];
                                            for (const homogenitaetValue of homogenitaetValuesToTest) {
                                                for (const signalActive of activeStates) {
                                                    const signalValuesToTest = signalActive ? criteriaOptions.signal : [null];
                                                    for (const signalValue of signalValuesToTest) {
                                                        const currentCriteria = {
                                                            size: { active: sizeActive, threshold: sizeThreshold, condition: '>=' },
                                                            form: { active: formActive, value: formValue },
                                                            kontur: { active: konturActive, value: konturValue },
                                                            homogenitaet: { active: homogenitaetActive, value: homogenitaetValue },
                                                            signal: { active: signalActive, value: signalValue }
                                                        };
                                                        if (!isValidCombination(currentCriteria)) continue;
                                                        yield { criteria: currentCriteria, logic: logic };
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


        try {
            for (const combination of generateCriteriaCombinations()) {
                testedCombinations++;
                const evaluatedData = _applyCriteriaToDatasetForWorker(data, combination.criteria, combination.logic, predictionKey);
                const performance = _calculateMetric(evaluatedData, predictionKey, referenceKey, metric);

                if (performance && typeof performance.metricValue === 'number' && isFinite(performance.metricValue)) {
                    if (bestResults.length < topN || performance.metricValue > bestResults[topN - 1].metricValue) {
                        bestResults.push({ ...combination, ...performance });
                        bestResults.sort((a, b) => b.metricValue - a.metricValue);
                        if (bestResults.length > topN) {
                            bestResults.length = topN;
                        }
                        currentBestMetricValue = bestResults[0].metricValue;
                    }
                }

                if (Date.now() - lastProgressUpdate > 500 || testedCombinations % 500 === 0 || testedCombinations === totalCombinations) {
                    postMessage({
                        type: 'progress',
                        payload: {
                            tested: testedCombinations,
                            total: totalCombinations,
                            currentBest: bestResults[0] || { metricValue: -Infinity, criteria: null, logic: defaultT2Logic },
                            kollektiv: kollektivName,
                            metric: metric
                        }
                    });
                    lastProgressUpdate = Date.now();
                }
            }

            postMessage({
                type: 'complete',
                payload: {
                    results: bestResults,
                    bestResult: bestResults[0] || null,
                    totalTested: testedCombinations,
                    kollektiv: kollektivName,
                    metric: metric,
                    nGesamt: data.length,
                    nPlus: data.filter(p=>p.n === '+').length,
                    nMinus: data.filter(p=>p.n === '-').length,
                    duration: Date.now() - (lastProgressUpdate - 500)
                }
            });

        } catch (e) {
            postMessage({ type: 'error', payload: { message: e.message || 'Unbekannter Fehler im Worker.', kollektiv: kollektivName, metric: metric } });
        }
    }
};

function isValidCombination(criteria) {
    let activeCount = 0;
    if(criteria.size.active) activeCount++;
    if(criteria.form.active) activeCount++;
    if(criteria.kontur.active) activeCount++;
    if(criteria.homogenitaet.active) activeCount++;
    if(criteria.signal.active) activeCount++;
    return activeCount > 0;
}

function generateSizeThresholds(sizeRangeConfig) {
    const thresholds = [];
    const min = 2.0; const max = 15.0; const count = 15;
    if (count <= 1) return [ (min + max) / 2 ];
    const step = (max - min) / (count -1);
    for (let i = 0; i < count; i++) {
        thresholds.push(parseFloat((min + i * step).toFixed(1)));
    }
    const uniqueThresholds = [...new Set(thresholds)];
    if (!uniqueThresholds.includes(5.0)) uniqueThresholds.push(5.0);
    if (!uniqueThresholds.includes(8.0)) uniqueThresholds.push(8.0);
    if (!uniqueThresholds.includes(10.0)) uniqueThresholds.push(10.0);
    return uniqueThresholds.sort((a,b)=>a-b);
}

function calculateTotalCombinations(criteriaOptions, logics) {
    let total = 0;
    const activeStates = [true, false];
    const criteriaKeys = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];

    for (const logic of logics) {
        for (const sizeActive of activeStates) {
            const sizeThresholdsToTest = sizeActive ? criteriaOptions.size.length : 1;
            for (let s_idx = 0; s_idx < sizeThresholdsToTest; s_idx++) {
                for (const formActive of activeStates) {
                    const formValuesToTest = formActive ? criteriaOptions.form.length : 1;
                    for (let f_idx = 0; f_idx < formValuesToTest; f_idx++) {
                        for (const konturActive of activeStates) {
                            const konturValuesToTest = konturActive ? criteriaOptions.kontur.length : 1;
                            for (let k_idx = 0; k_idx < konturValuesToTest; k_idx++) {
                                for (const homogenitaetActive of activeStates) {
                                    const homogenitaetValuesToTest = homogenitaetActive ? criteriaOptions.homogenitaet.length : 1;
                                    for (let h_idx = 0; h_idx < homogenitaetValuesToTest; h_idx++) {
                                        for (const signalActive of activeStates) {
                                            const signalValuesToTest = signalActive ? criteriaOptions.signal.length : 1;
                                            for (let si_idx = 0; si_idx < signalValuesToTest; si_idx++) {
                                                 const currentCriteria = {
                                                    size: { active: sizeActive }, form: { active: formActive },
                                                    kontur: { active: konturActive }, homogenitaet: { active: homogenitaetActive },
                                                    signal: { active: signalActive }
                                                };
                                                if (isValidCombination(currentCriteria)) total++;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return total;
}


function _checkSingleNodeForWorker(lymphNode, criteria) {
    const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
    if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

    if (criteria.size?.active) {
        const threshold = criteria.size.threshold;
        const nodeSize = lymphNode.groesse;
        const condition = criteria.size.condition || '>=';
        if (typeof nodeSize === 'number' && !isNaN(nodeSize) && isFinite(nodeSize) && threshold !== null && typeof threshold === 'number' && !isNaN(threshold) && isFinite(threshold)) {
            switch(condition) {
                case '>=': checkResult.size = nodeSize >= threshold; break;
                case '>': checkResult.size = nodeSize > threshold; break;
                case '<=': checkResult.size = nodeSize <= threshold; break;
                case '<': checkResult.size = nodeSize < threshold; break;
                case '==': checkResult.size = nodeSize === threshold; break;
                default: checkResult.size = false;
            }
        } else { checkResult.size = false; }
    }
    if (criteria.form?.active) checkResult.form = (typeof lymphNode.form === 'string' && lymphNode.form === criteria.form.value);
    if (criteria.kontur?.active) checkResult.kontur = (typeof lymphNode.kontur === 'string' && lymphNode.kontur === criteria.kontur.value);
    if (criteria.homogenitaet?.active) checkResult.homogenitaet = (typeof lymphNode.homogenitaet === 'string' && lymphNode.homogenitaet === criteria.homogenitaet.value);
    if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && typeof lymphNode.signal === 'string' && lymphNode.signal === criteria.signal.value);
    return checkResult;
}

function _applyCriteriaToPatientForWorker(patient, criteria, logic, predictionKey) {
    const patientCopy = { ...patient };
    patientCopy[predictionKey] = null;
    if (!patientCopy.lymphknoten_t2 || !Array.isArray(patientCopy.lymphknoten_t2)) {
        const activeCriteriaKeys = Object.keys(criteria).filter(key => criteria[key]?.active === true);
        patientCopy[predictionKey] = activeCriteriaKeys.length > 0 ? '-' : null;
        return patientCopy;
    }

    let patientIsPositive = false;
    const activeCriteriaKeys = Object.keys(criteria).filter(key => criteria[key]?.active === true);

    if (patientCopy.lymphknoten_t2.length === 0) {
        if (activeCriteriaKeys.length > 0) patientCopy[predictionKey] = '-';
        return patientCopy;
    }

    for (const lk of patientCopy.lymphknoten_t2) {
        if (!lk || typeof lk !== 'object') continue;
        const checkResult = _checkSingleNodeForWorker(lk, criteria);
        let lkIsPositive = false;
        if (activeCriteriaKeys.length > 0) {
            if (logic === 'UND') {
                lkIsPositive = activeCriteriaKeys.every(key => checkResult[key] === true);
            } else { /* ODOR */
                lkIsPositive = activeCriteriaKeys.some(key => checkResult[key] === true);
            }
        }
        if (lkIsPositive) {
            patientIsPositive = true;
            break;
        }
    }
    if (activeCriteriaKeys.length > 0) {
        patientCopy[predictionKey] = patientIsPositive ? '+' : '-';
    }
    return patientCopy;
}

function _applyCriteriaToDatasetForWorker(dataset, criteria, logic, predictionKey) {
    return dataset.map(patient => _applyCriteriaToPatientForWorker(patient, criteria, logic, predictionKey));
}

function _calculateMetric(data, predictionKey, referenceKey, metricName) {
    let rp = 0, fp = 0, fn = 0, rn = 0;
    data.forEach(p => {
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
    });

    const total = rp + fp + fn + rn;
    if (total === 0) return { metricValue: -Infinity, sens: NaN, spez: NaN, ppv: NaN, npv: NaN, acc: NaN, balAcc: NaN, f1: NaN };

    const sens = (rp + fn) > 0 ? rp / (rp + fn) : NaN;
    const spez = (fp + rn) > 0 ? rn / (fp + rn) : NaN;
    const ppv = (rp + fp) > 0 ? rp / (rp + fp) : NaN;
    const npv = (fn + rn) > 0 ? rn / (fn + rn) : NaN;
    const acc = total > 0 ? (rp + rn) / total : NaN;
    const balAcc = (!isNaN(sens) && !isNaN(spez)) ? (sens + spez) / 2.0 : NaN;
    const f1 = (!isNaN(ppv) && !isNaN(sens) && (ppv + sens) > 1e-9) ? 2.0 * (ppv * sens) / (ppv + sens) : ((ppv === 0 && sens === 0) ? 0 : NaN);

    let metricValue;
    switch (metricName) {
        case 'Accuracy': metricValue = acc; break;
        case 'Balanced Accuracy': metricValue = balAcc; break;
        case 'F1-Score': metricValue = f1; break;
        case 'PPV': metricValue = ppv; break;
        case 'NPV': metricValue = npv; break;
        case 'Sensitivity': metricValue = sens; break;
        case 'Specificity': metricValue = spez; break;
        default: metricValue = -Infinity;
    }
    return { metricValue: (isNaN(metricValue) ? -Infinity : metricValue), sens, spez, ppv, npv, acc, balAcc, f1 };
}
