let isRunning = false;
let currentData = [];
let targetMetric = 'Accuracy';
let kollektivName = '';
let bestResult = null;
let allResults = [];
let combinationsTested = 0;
let totalCombinations = 0;
let startTime = 0;
let t2SizeRange = { min: 0.1, max: 15.0, step: 0.1 };
const reportIntervalFactor = 200;

function cloneDeepWorker(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try {
        if (typeof self !== 'undefined' && self.structuredClone) {
            return self.structuredClone(obj);
        } else {
            return JSON.parse(JSON.stringify(obj));
        }
    } catch(e) {
        if (Array.isArray(obj)) {
            const arrCopy = [];
            for(let i = 0; i < obj.length; i++){
                arrCopy[i] = cloneDeepWorker(obj[i]);
            }
            return arrCopy;
        }
        if (typeof obj === 'object') {
            const objCopy = {};
            for(const key in obj) {
                if(Object.prototype.hasOwnProperty.call(obj, key)) {
                    objCopy[key] = cloneDeepWorker(obj[key]);
                }
            }
            return objCopy;
        }
        return obj;
    }
}

function checkSingleLymphNodeWorker(lymphNode, criteria) {
    const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
    if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

    if (criteria.size?.active) {
        const threshold = criteria.size.threshold;
        const nodeSize = lymphNode.groesse;
        const condition = criteria.size.condition || '>=';
        if (typeof nodeSize === 'number' && !isNaN(nodeSize) && typeof threshold === 'number' && !isNaN(threshold)) {
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
    if (criteria.form?.active) checkResult.form = (lymphNode.form === criteria.form.value);
    if (criteria.kontur?.active) checkResult.kontur = (lymphNode.kontur === criteria.kontur.value);
    if (criteria.homogenitaet?.active) checkResult.homogenitaet = (lymphNode.homogenitaet === criteria.homogenitaet.value);
    if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

    return checkResult;
}

function applyT2CriteriaToPatientWorker(patient, criteria, logic) {
     if (!patient || !criteria || (logic !== 'UND' && logic !== 'ODER')) return null;
     const lymphNodes = patient.lymphknoten_t2;
     if (!Array.isArray(lymphNodes)) return null;

     const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

     if (activeKeys.length === 0) return null;
     if (lymphNodes.length === 0) return '-';

     for (let k = 0; k < lymphNodes.length; k++) {
         const lk = lymphNodes[k];
         if (!lk) continue;
         const checkResult = checkSingleLymphNodeWorker(lk, criteria);
         let lkIsPositive = false;
         if (logic === 'UND') {
             lkIsPositive = activeKeys.every(key => checkResult[key] === true);
         } else {
             lkIsPositive = activeKeys.some(key => checkResult[key] === true);
         }
         if (lkIsPositive) return '+';
     }
     return '-';
}

function calculateMetric(data, criteria, logic, metricName) {
    let rp = 0, fp = 0, fn = 0, rn = 0;
    if (!Array.isArray(data)) return NaN;

    data.forEach(p => {
        if(!p || typeof p !== 'object') return;
        const predictedT2 = applyT2CriteriaToPatientWorker(p, criteria, logic);
        const actualN = p.n === '+';
        const validN = p.n === '+' || p.n === '-';
        const validT2 = predictedT2 === '+' || predictedT2 === '-';

        if (validN && validT2) {
            const predicted = predictedT2 === '+';
            if (predicted && actualN) rp++;
            else if (predicted && !actualN) fp++;
            else if (!predicted && actualN) fn++;
            else if (!predicted && !actualN) rn++;
        }
    });

    const total = rp + fp + fn + rn;
    if (total === 0) return NaN;

    const sens = (rp + fn) > 0 ? rp / (rp + fn) : 0;
    const spez = (fp + rn) > 0 ? rn / (fp + rn) : 0;
    const ppv = (rp + fp) > 0 ? rp / (rp + fp) : 0;
    const npv = (fn + rn) > 0 ? rn / (fn + rn) : 0;
    let result;

    switch (metricName) {
        case 'Accuracy':
            result = (rp + rn) / total;
            break;
        case 'Balanced Accuracy':
            result = (isNaN(sens) || isNaN(spez)) ? NaN : (sens + spez) / 2.0;
            break;
        case 'F1-Score':
            result = (isNaN(ppv) || isNaN(sens) || (ppv + sens) <= 1e-9) ? ((ppv === 0 && sens === 0) ? 0 : NaN) : 2.0 * (ppv * sens) / (ppv + sens);
            break;
        case 'PPV':
            result = ppv;
            break;
        case 'NPV':
            result = npv;
            break;
        default:
            result = (isNaN(sens) || isNaN(spez)) ? NaN : (sens + spez) / 2.0;
            break;
    }
    return isNaN(result) ? -Infinity : result;
}

function generateCriteriaCombinations() {
    const CRITERIA_KEYS = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
    const VALUE_OPTIONS = {
        size: [],
        form: ['rund', 'oval'],
        kontur: ['scharf', 'irregulär'],
        homogenitaet: ['homogen', 'heterogen'],
        signal: ['signalarm', 'intermediär', 'signalreich']
    };
    const LOGICS = ['UND', 'ODER'];

    const { min, max, step } = t2SizeRange;
    if (typeof min === 'number' && typeof max === 'number' && typeof step === 'number' && step > 0 && min <= max) {
        for (let s = Math.round(min * 10); s <= Math.round(max * 10); s += Math.round(step * 10)) {
             VALUE_OPTIONS.size.push(parseFloat((s / 10).toFixed(1)));
        }
        if (!VALUE_OPTIONS.size.includes(min)) VALUE_OPTIONS.size.unshift(min);
        if (!VALUE_OPTIONS.size.includes(max) && max > VALUE_OPTIONS.size[VALUE_OPTIONS.size.length-1]) VALUE_OPTIONS.size.push(max);
        VALUE_OPTIONS.size = [...new Set(VALUE_OPTIONS.size)].sort((a, b) => a - b);
         if (VALUE_OPTIONS.size.length === 0) {
             VALUE_OPTIONS.size = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
         }
    } else {
        VALUE_OPTIONS.size = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    }


    const combinations = [];
    let calculatedTotal = 0;
    const numCriteria = CRITERIA_KEYS.length;

    for (let i = 1; i < (1 << numCriteria); i++) {
        const baseTemplate = {};
        const currentActive = [];
        CRITERIA_KEYS.forEach((key, index) => {
            const isActive = ((i >> index) & 1) === 1;
            baseTemplate[key] = { active: isActive };
            if (isActive) currentActive.push(key);
        });

        function generateValues(keyIndex, currentCombo) {
            if (keyIndex === currentActive.length) {
                LOGICS.forEach(logic => {
                    const finalCombo = cloneDeepWorker(currentCombo);
                    CRITERIA_KEYS.forEach(k => {
                        if (!finalCombo[k]) finalCombo[k] = { active: false };
                    });
                    combinations.push({ logic: logic, criteria: finalCombo });
                });
                calculatedTotal += LOGICS.length;
                return;
            }

            const currentKey = currentActive[keyIndex];
            const options = VALUE_OPTIONS[currentKey];
            if (!options || options.length === 0) {
                generateValues(keyIndex + 1, currentCombo);
                return;
            }

            options.forEach(value => {
                const nextCombo = cloneDeepWorker(currentCombo);
                if (currentKey === 'size') {
                    nextCombo[currentKey].threshold = value;
                    nextCombo[currentKey].condition = '>=';
                } else {
                    nextCombo[currentKey].value = value;
                }
                generateValues(keyIndex + 1, nextCombo);
            });
        }
        generateValues(0, baseTemplate);
    }
    totalCombinations = calculatedTotal;
    return combinations;
}

function runBruteForce() {
    if (!isRunning) return;
    if (!currentData || currentData.length === 0) {
        self.postMessage({ type: 'error', payload: { message: "Keine Daten im Worker für Brute-Force." } });
        isRunning = false;
        return;
    }
    startTime = performance.now();
    combinationsTested = 0;
    allResults = [];
    bestResult = { metricValue: -Infinity, criteria: null, logic: null };

    const allCombinations = generateCriteriaCombinations();
    if (totalCombinations === 0 || allCombinations.length === 0) {
        self.postMessage({ type: 'error', payload: { message: "Keine Kriterienkombinationen generiert. Überprüfen Sie die t2SizeRange Konfiguration." } });
        isRunning = false;
        return;
    }

    self.postMessage({ type: 'started', payload: { totalCombinations: totalCombinations, kollektiv: kollektivName } });

    const reportInterval = Math.max(50, Math.floor(totalCombinations / reportIntervalFactor));
    let lastReportTime = performance.now();

    for (let i = 0; i < allCombinations.length; i++) {
        if (!isRunning) break;

        const combo = allCombinations[i];
        let metricValue = -Infinity;

        try {
            metricValue = calculateMetric(currentData, combo.criteria, combo.logic, targetMetric);
        } catch (error) {
            metricValue = -Infinity;
        }

        const result = { logic: combo.logic, criteria: combo.criteria, metricValue: metricValue };
        allResults.push(result);

        if (result.metricValue > bestResult.metricValue && isFinite(result.metricValue)) {
            bestResult = result;
        }
        combinationsTested++;
        const now = performance.now();

        if (combinationsTested % reportInterval === 0 || combinationsTested === totalCombinations || (now - lastReportTime > 1000)) {
            self.postMessage({
                type: 'progress',
                payload: {
                    tested: combinationsTested,
                    total: totalCombinations,
                    currentBest: bestResult.criteria ? cloneDeepWorker(bestResult) : null,
                    metric: targetMetric,
                    kollektiv: kollektivName
                }
            });
            lastReportTime = now;
        }
    }
    const endTime = performance.now();

    if(isRunning) {
        const validResults = allResults.filter(r => r && isFinite(r.metricValue));
        validResults.sort((a, b) => b.metricValue - a.metricValue);

        const topResults = [];
        const precision = 1e-8;
        let rank = 0;
        let countAtRank = 0;
        let lastScore = Infinity;

        for(let i = 0; i < validResults.length; i++) {
            const currentScore = validResults[i].metricValue;
            const isNewRank = Math.abs(currentScore - lastScore) > precision;

            if(isNewRank) {
                rank = i + 1;
                countAtRank = 1;
            } else {
                countAtRank++;
            }
            lastScore = currentScore;

            if (rank <= 10) {
                topResults.push(validResults[i]);
            } else {
                if(rank === 11 && Math.abs(currentScore - (topResults[topResults.length - 1]?.metricValue ?? -Infinity)) < precision) {
                    topResults.push(validResults[i]);
                } else {
                    break;
                }
            }
        }
        const finalBest = bestResult.criteria ? cloneDeepWorker(bestResult) : (topResults[0] ? cloneDeepWorker(topResults[0]) : null);

        let nGesamt = 0;
        let nPlus = 0;
        let nMinus = 0;
        if (Array.isArray(currentData)) {
            nGesamt = currentData.length;
            currentData.forEach(p => {
                if (p && p.n === '+') nPlus++;
                else if (p && p.n === '-') nMinus++;
            });
        }


        self.postMessage({
            type: 'result',
            payload: {
                results: topResults.map(r => ({
                    logic: r.logic,
                    criteria: r.criteria,
                    metricValue: r.metricValue,
                    sens: r.sens,
                    spez: r.spez,
                    ppv: r.ppv,
                    npv: r.npv
                })),
                bestResult: finalBest,
                metric: targetMetric,
                kollektiv: kollektivName,
                duration: endTime - startTime,
                totalTested: combinationsTested,
                nGesamt: nGesamt,
                nPlus: nPlus,
                nMinus: nMinus
            }
        });
    }
    isRunning = false;
    currentData = [];
    allResults = [];
}

self.onmessage = function(event) {
    if (!event || !event.data) {
        self.postMessage({ type: 'error', payload: { message: "Ungültige Nachricht vom Hauptthread empfangen." } });
        return;
    }
    const { action, payload } = event.data;

    if (action === 'start') {
        if (isRunning) {
            self.postMessage({ type: 'error', payload: { message: "Worker läuft bereits." } });
            return;
        }
        try {
            if (!payload || !Array.isArray(payload.data) || !payload.metric || !payload.kollektiv || !payload.t2SizeRange) {
                throw new Error("Unvollständige Startdaten für Brute-Force. Benötigt: data, metric, kollektiv, t2SizeRange.");
            }
            if (typeof payload.t2SizeRange.min !== 'number' || typeof payload.t2SizeRange.max !== 'number' || typeof payload.t2SizeRange.step !== 'number' || payload.t2SizeRange.step <= 0) {
                 throw new Error("Ungültige t2SizeRange Konfiguration: min, max, step müssen Zahlen sein und step > 0.");
            }

            currentData = payload.data;
            targetMetric = payload.metric;
            kollektivName = payload.kollektiv;
            t2SizeRange = payload.t2SizeRange;

            if (currentData.length === 0) {
                throw new Error("Leeres Datenset für Brute-Force erhalten.");
            }
            isRunning = true;
            runBruteForce();
        }
        catch (error) {
            self.postMessage({ type: 'error', payload: { message: `Initialisierungsfehler im Worker: ${error.message}` } });
            isRunning = false;
        }
    } else if (action === 'cancel') {
        if (isRunning) {
            isRunning = false;
            self.postMessage({ type: 'cancelled', payload: { kollektiv: kollektivName } });
        }
    } else {
        self.postMessage({ type: 'error', payload: { message: `Unbekannte Aktion vom Hauptthread: ${action}` } });
    }
};

self.onerror = function(error) {
    self.postMessage({ type: 'error', payload: { message: `Globaler Worker Fehler: ${error.message || 'Unbekannter Fehler im Worker'}` } });
    isRunning = false;
};
