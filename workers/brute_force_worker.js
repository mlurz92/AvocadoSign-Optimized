let isCancelled = false;
let currentKollektivData = [];
let APP_CONFIG_WORKER = {};
let T2_CRITERIA_SETTINGS_WORKER = {};
let OPTIMIZATION_METRIC = 'Balanced Accuracy';
let ALL_T2_LITERATURES_WORKER = [];

function _initializeConfig(config) {
    APP_CONFIG_WORKER = config.appConfig || {
        PERFORMANCE_SETTINGS: { PROGRESS_REPORT_INTERVAL: 100 },
        STATISTICAL_CONSTANTS: {}
    };
    T2_CRITERIA_SETTINGS_WORKER = config.t2CriteriaSettings || {
        SIZE_RANGE: { min: 3, max: 15, step: 0.5, default: 5.0 },
        FORM_VALUES: ['rund', 'oval'],
        KONTUR_VALUES: ['scharf', 'irregulär'],
        HOMOGENITAET_VALUES: ['homogen', 'heterogen'],
        SIGNAL_VALUES: ['signalarm', 'intermediär', 'signalreich']
    };
}

self.onmessage = function(e) {
    const { type, payload } = e.data;

    switch (type) {
        case 'initialize':
            _initializeConfig(payload || {});
            self.postMessage({ type: 'initialized' });
            break;
        case 'start':
            isCancelled = false;
            if (!payload || !payload.rawData || !payload.kollektiv || !payload.metric || !payload.t2CriteriaSettings) {
                self.postMessage({ type: 'error', error: 'Ungültige Startparameter für Brute-Force-Worker.', payload: payload });
                return;
            }
            OPTIMIZATION_METRIC = payload.metric;
            _initializeConfig({ t2CriteriaSettings: payload.t2CriteriaSettings, appConfig: payload.appConfig });
            ALL_T2_LITERATURES_WORKER = payload.allT2Literatures || [];


            currentKollektivData = payload.rawData.filter(p => {
                if (payload.kollektiv === 'Gesamt') return true;
                return p.therapie === payload.kollektiv;
            });
            
            if (currentKollektivData.length === 0) {
                self.postMessage({ type: 'error', error: `Keine Daten für Kollektiv '${payload.kollektiv}' gefunden.`, payload: { kollektiv: payload.kollektiv } });
                return;
            }
            _performBruteForceOptimization(payload.kollektiv, payload.metric);
            break;
        case 'cancel':
            isCancelled = true;
            break;
        default:
            console.warn('Brute-Force Worker: Unbekannter Nachrichtentyp:', type);
    }
};

self.onerror = function(event) {
    console.error('Globaler Fehler im Brute-Force Worker:', event.message, event.filename, event.lineno, event);
    self.postMessage({ type: 'error', error: 'Globaler Worker-Fehler: ' + event.message, payload: { details: event.message } });
};


function _generateSizeThresholds() {
    const thresholds = [];
    const { min, max, step } = T2_CRITERIA_SETTINGS_WORKER.SIZE_RANGE;
    for (let val = min; val <= max; val += step) {
        thresholds.push(parseFloat(val.toFixed(2)));
    }
    return thresholds;
}

function _performBruteForceOptimization(kollektivName, optimizationMetricName) {
    let bestResult = { metricValue: -Infinity, criteria: null, logic: null, sens: 0, spez: 0, ppv: 0, npv: 0, acc: 0 };
    let topResults = [];
    const MAX_TOP_RESULTS = APP_CONFIG_WORKER.PERFORMANCE_SETTINGS?.BRUTE_FORCE_MAX_TOP_RESULTS || 10;

    const criteriaDefinitions = {
        size: { values: [true, false], thresholds: _generateSizeThresholds() },
        form: { values: [true, false], options: T2_CRITERIA_SETTINGS_WORKER.FORM_VALUES || ['rund', 'oval'] },
        kontur: { values: [true, false], options: T2_CRITERIA_SETTINGS_WORKER.KONTUR_VALUES || ['scharf', 'irregulär'] },
        homogenitaet: { values: [true, false], options: T2_CRITERIA_SETTINGS_WORKER.HOMOGENITAET_VALUES || ['homogen', 'heterogen'] },
        signal: { values: [true, false], options: T2_CRITERIA_SETTINGS_WORKER.SIGNAL_VALUES || ['signalarm', 'intermediär', 'signalreich'] }
    };

    const logics = ['UND', 'ODER'];
    let testedCount = 0;
    let totalCombinations = 0;

    function countCombinations() {
        let count = 0;
        for (const sizeActive of criteriaDefinitions.size.values) {
            const sizeThresholdsCount = sizeActive ? criteriaDefinitions.size.thresholds.length : 1;
            for (let s_idx = 0; s_idx < sizeThresholdsCount; s_idx++) {
                for (const formActive of criteriaDefinitions.form.values) {
                    const formOptionsCount = formActive ? criteriaDefinitions.form.options.length : 1;
                    for (let f_idx = 0; f_idx < formOptionsCount; f_idx++) {
                        for (const konturActive of criteriaDefinitions.kontur.values) {
                            const konturOptionsCount = konturActive ? criteriaDefinitions.kontur.options.length : 1;
                            for (let k_idx = 0; k_idx < konturOptionsCount; k_idx++) {
                                for (const homoActive of criteriaDefinitions.homogenitaet.values) {
                                    const homoOptionsCount = homoActive ? criteriaDefinitions.homogenitaet.options.length : 1;
                                    for (let h_idx = 0; h_idx < homoOptionsCount; h_idx++) {
                                        for (const signalActive of criteriaDefinitions.signal.values) {
                                            const signalOptionsCount = signalActive ? criteriaDefinitions.signal.options.length : 1;
                                            for (let sig_idx = 0; sig_idx < signalOptionsCount; sig_idx++) {
                                                if (!sizeActive && !formActive && !konturActive && !homoActive && !signalActive) continue; 
                                                count += logics.length;
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
        return count;
    }
    totalCombinations = countCombinations();
    self.postMessage({ type: 'started', payload: { totalCombinations: totalCombinations } });

    const startTime = Date.now();

    try {
        for (const sizeActive of criteriaDefinitions.size.values) {
            const sizeThresholdsToIterate = sizeActive ? criteriaDefinitions.size.thresholds : [null];
            for (const sizeThreshold of sizeThresholdsToIterate) {
                for (const formActive of criteriaDefinitions.form.values) {
                    const formOptionsToIterate = formActive ? criteriaDefinitions.form.options : [null];
                    for (const formValue of formOptionsToIterate) {
                        for (const konturActive of criteriaDefinitions.kontur.values) {
                            const konturOptionsToIterate = konturActive ? criteriaDefinitions.kontur.options : [null];
                            for (const konturValue of konturOptionsToIterate) {
                                for (const homoActive of criteriaDefinitions.homogenitaet.values) {
                                    const homoOptionsToIterate = homoActive ? criteriaDefinitions.homogenitaet.options : [null];
                                    for (const homoValue of homoOptionsToIterate) {
                                        for (const signalActive of criteriaDefinitions.signal.values) {
                                            const signalOptionsToIterate = signalActive ? criteriaDefinitions.signal.options : [null];
                                            for (const signalValue of signalOptionsToIterate) {
                                                if (isCancelled) {
                                                    self.postMessage({ type: 'cancelled', payload: { testedCount, totalCombinations } });
                                                    return;
                                                }
                                                if (!sizeActive && !formActive && !konturActive && !homoActive && !signalActive) {
                                                    continue; 
                                                }

                                                for (const logic of logics) {
                                                    testedCount++;
                                                    const criteriaSet = {};
                                                    if (sizeActive) criteriaSet.size = { active: true, threshold: sizeThreshold }; else criteriaSet.size = { active: false };
                                                    if (formActive) criteriaSet.form = { active: true, value: formValue }; else criteriaSet.form = { active: false };
                                                    if (konturActive) criteriaSet.kontur = { active: true, value: konturValue }; else criteriaSet.kontur = { active: false };
                                                    if (homoActive) criteriaSet.homogenitaet = { active: true, value: homoValue }; else criteriaSet.homogenitaet = { active: false };
                                                    if (signalActive) criteriaSet.signal = { active: true, value: signalValue }; else criteriaSet.signal = { active: false };

                                                    const metrics = _evaluateCriteriaCombination(currentKollektivData, criteriaSet, logic);
                                                    let currentMetricValue;
                                                    switch (optimizationMetricName) {
                                                        case 'Accuracy': currentMetricValue = metrics.acc; break;
                                                        case 'Balanced Accuracy': currentMetricValue = metrics.balAcc; break;
                                                        case 'F1-Score': currentMetricValue = metrics.f1; break;
                                                        case 'PPV': currentMetricValue = metrics.ppv; break;
                                                        case 'NPV': currentMetricValue = metrics.npv; break;
                                                        default: currentMetricValue = metrics.balAcc; 
                                                    }
                                                    currentMetricValue = currentMetricValue || 0;


                                                    const resultEntry = {
                                                        metricValue: currentMetricValue,
                                                        criteria: JSON.parse(JSON.stringify(criteriaSet)), 
                                                        logic: logic,
                                                        sens: metrics.sens, spez: metrics.spez, ppv: metrics.ppv, npv: metrics.npv, acc: metrics.acc, balAcc: metrics.balAcc, f1: metrics.f1
                                                    };

                                                    if (topResults.length < MAX_TOP_RESULTS || currentMetricValue >= topResults[topResults.length - 1].metricValue) {
                                                        topResults.push(resultEntry);
                                                        topResults.sort((a, b) => b.metricValue - a.metricValue);
                                                        if (topResults.length > MAX_TOP_RESULTS) {
                                                            topResults.pop();
                                                        }
                                                        bestResult = topResults[0];
                                                    }
                                                    
                                                    if (testedCount % (APP_CONFIG_WORKER.PERFORMANCE_SETTINGS?.PROGRESS_REPORT_INTERVAL || 100) === 0 || testedCount === totalCombinations) {
                                                        self.postMessage({
                                                            type: 'progress',
                                                            payload: {
                                                                testedCount: testedCount,
                                                                totalCombinations: totalCombinations,
                                                                currentBestResult: bestResult 
                                                            }
                                                        });
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
        const duration = Date.now() - startTime;
        self.postMessage({ type: 'completed', payload: { results: topResults, bestResult: bestResult, kollektiv: kollektivName, metric: optimizationMetricName, duration: duration, totalTested: testedCount, nGesamt: currentKollektivData.length, nPlus: currentKollektivData.filter(p=>p.n_status_patient === 1).length, nMinus: currentKollektivData.filter(p=>p.n_status_patient === 0).length } });

    } catch (err) {
        console.error("Fehler in _performBruteForceOptimization:", err.message, err.stack);
        self.postMessage({ type: 'error', error: 'Fehler während der Brute-Force Optimierung: ' + err.message, payload: { details: err.stack } });
    }
}

function _evaluateCriteriaCombination(data, criteriaSet, logic) {
    let tp = 0, fp = 0, fn = 0, tn = 0;

    data.forEach(patient => {
        let patientT2Positive = false;
        if (logic === 'UND') {
            patientT2Positive = _applyCriteriaToPatient_UND(patient, criteriaSet);
        } else { 
            patientT2Positive = _applyCriteriaToPatient_ODER(patient, criteriaSet);
        }

        const actualPositive = patient.n_status_patient === 1;

        if (patientT2Positive && actualPositive) tp++;
        else if (patientT2Positive && !actualPositive) fp++;
        else if (!patientT2Positive && actualPositive) fn++;
        else if (!patientT2Positive && !actualPositive) tn++;
    });
    return _calculateMetrics(tp, fp, fn, tn);
}

function _applyCriteriaToPatient_UND(patient, criteriaSet) {
    if (!patient.t2_lymphknoten || patient.t2_lymphknoten.length === 0) return false;
    for (const lk of patient.t2_lymphknoten) {
        let allCriteriaMetForLK = true;
        let activeCriteriaCount = 0;

        if (criteriaSet.size.active) { activeCriteriaCount++; if (!_checkSingleCriterion(lk, 'size', criteriaSet.size.threshold)) { allCriteriaMetForLK = false; break; } }
        if (criteriaSet.form.active) { activeCriteriaCount++; if (!_checkSingleCriterion(lk, 'form', criteriaSet.form.value)) { allCriteriaMetForLK = false; break; } }
        if (criteriaSet.kontur.active) { activeCriteriaCount++; if (!_checkSingleCriterion(lk, 'kontur', criteriaSet.kontur.value)) { allCriteriaMetForLK = false; break; } }
        if (criteriaSet.homogenitaet.active) { activeCriteriaCount++; if (!_checkSingleCriterion(lk, 'homogenitaet', criteriaSet.homogenitaet.value)) { allCriteriaMetForLK = false; break; } }
        if (criteriaSet.signal.active) { activeCriteriaCount++; if (!_checkSingleCriterion(lk, 'signal', criteriaSet.signal.value)) { allCriteriaMetForLK = false; break; } }
        
        if (activeCriteriaCount === 0) return false; 
        if (allCriteriaMetForLK) return true; 
    }
    return false; 
}

function _applyCriteriaToPatient_ODER(patient, criteriaSet) {
    if (!patient.t2_lymphknoten || patient.t2_lymphknoten.length === 0) return false;
    let activeCriteriaPresent = false;
    if(criteriaSet.size.active) activeCriteriaPresent = true;
    if(criteriaSet.form.active) activeCriteriaPresent = true;
    if(criteriaSet.kontur.active) activeCriteriaPresent = true;
    if(criteriaSet.homogenitaet.active) activeCriteriaPresent = true;
    if(criteriaSet.signal.active) activeCriteriaPresent = true;
    if(!activeCriteriaPresent) return false;

    for (const lk of patient.t2_lymphknoten) {
        if (criteriaSet.size.active && _checkSingleCriterion(lk, 'size', criteriaSet.size.threshold)) return true;
        if (criteriaSet.form.active && _checkSingleCriterion(lk, 'form', criteriaSet.form.value)) return true;
        if (criteriaSet.kontur.active && _checkSingleCriterion(lk, 'kontur', criteriaSet.kontur.value)) return true;
        if (criteriaSet.homogenitaet.active && _checkSingleCriterion(lk, 'homogenitaet', criteriaSet.homogenitaet.value)) return true;
        if (criteriaSet.signal.active && _checkSingleCriterion(lk, 'signal', criteriaSet.signal.value)) return true;
    }
    return false;
}

function _checkSingleCriterion(lk, key, value) {
    if (lk[key] === undefined || lk[key] === null) return false;
    switch (key) {
        case 'size': return lk.kurzachse_mm >= value;
        case 'form': return lk.form === value;
        case 'kontur': return lk.kontur === value;
        case 'homogenitaet': return lk.homogenitaet === value;
        case 'signal': return lk.signal === value;
        default: return false;
    }
}

function _calculateMetrics(tp, fp, fn, tn) {
    const sens = tp / (tp + fn) || 0;
    const spez = tn / (tn + fp) || 0;
    const ppv = tp / (tp + fp) || 0;
    const npv = tn / (tn + fn) || 0;
    const acc = (tp + tn) / (tp + fp + fn + tn) || 0;
    const balAcc = (sens + spez) / 2 || 0;
    const f1 = (2 * ppv * sens) / (ppv + sens) || 0;
    return { sens, spez, ppv, npv, acc, balAcc, f1, matrix: {tp, fp, fn, tn} };
}
