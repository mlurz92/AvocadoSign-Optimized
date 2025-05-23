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
const reportIntervalFactor = 200; // Report progress roughly this many times

function formatNumberWorker(num, digits = 1, placeholder = '--') {
    const number = parseFloat(num);
    if (num === null || num === undefined || isNaN(number) || !isFinite(number)) {
        return placeholder;
    }
    return number.toFixed(digits);
}

function formatCriteriaForDisplayWorker(criteria, logic = null) {
    if (!criteria || typeof criteria !== 'object') return 'N/A';
    const parts = [];
    const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active);
    if (activeKeys.length === 0) return 'Keine aktiven Kriterien';

    const effectiveLogic = logic || criteria.logic || 'ODER';
    const separator = (effectiveLogic === 'UND') ? ' UND ' : ' ODER ';

    const formatValue = (key, criterion) => {
        if (!criterion) return '?';
        if (key === 'size') return `${criterion.condition || '>='}${formatNumberWorker(criterion.threshold, 1)}mm`;
        return criterion.value || '?';
    };

    const priorityOrder = ['size', 'kontur', 'homogenitaet', 'form', 'signal'];
    const sortedActiveKeys = [...activeKeys].sort((a, b) => {
        const indexA = priorityOrder.indexOf(a);
        const indexB = priorityOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    sortedActiveKeys.forEach(key => {
        const criterion = criteria[key];
        let prefix = '';
        switch(key) {
            case 'size': prefix = 'Größe '; break;
            case 'form': prefix = 'Form='; break;
            case 'kontur': prefix = 'Kontur='; break;
            case 'homogenitaet': prefix = 'Homog.='; break;
            case 'signal': prefix = 'Signal='; break;
            default: prefix = key + '=';
        }
        parts.push(`${prefix}${formatValue(key, criterion)}`);
    });
    return parts.join(separator);
}

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
    if (criteria.form?.active) checkResult.form = (lymphNode.form !== null && lymphNode.form === criteria.form.value);
    if (criteria.kontur?.active) checkResult.kontur = (lymphNode.kontur !== null && lymphNode.kontur === criteria.kontur.value);
    if (criteria.homogenitaet?.active) checkResult.homogenitaet = (lymphNode.homogenitaet !== null && lymphNode.homogenitaet === criteria.homogenitaet.value);
    if (criteria.signal?.active) checkResult.signal = (lymphNode.signal !== null && lymphNode.signal === criteria.signal.value);

    return checkResult;
}

function applyT2CriteriaToPatientWorker(patient, criteria, logic) {
     if (!patient || !criteria || (logic !== 'UND' && logic !== 'ODER')) return null;
     const lymphNodes = patient.lymphknoten_t2;
     if (!Array.isArray(lymphNodes)) return null;

     const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

     if (activeKeys.length === 0) return null; // No active criteria means no T2 prediction based on them
     if (lymphNodes.length === 0) return '-'; // No LNs to evaluate, but criteria are active, so considered negative

     for (let k = 0; k < lymphNodes.length; k++) {
         const lk = lymphNodes[k];
         if (!lk) continue;
         const checkResult = checkSingleLymphNodeWorker(lk, criteria);
         let lkIsPositive = false;
         if (logic === 'UND') {
             lkIsPositive = activeKeys.every(key => checkResult[key] === true);
         } else { // OR logic
             lkIsPositive = activeKeys.some(key => checkResult[key] === true);
         }
         if (lkIsPositive) return '+'; // If any LN is positive, patient is positive
     }
     return '-'; // No LN met the criteria
}

function calculateMetric(data, criteria, logic, metricName) {
    let rp = 0, fp = 0, fn = 0, rn = 0;
    if (!Array.isArray(data)) return NaN;

    data.forEach(p => {
        if(!p || typeof p !== 'object') return;
        const predictedT2 = applyT2CriteriaToPatientWorker(p, criteria, logic);
        const actualN = p.n === '+'; // Assuming p.n is the gold standard ('+' or '-')
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
    if (total === 0) return NaN; // Avoid division by zero if no valid comparisons

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
            result = (isNaN(sens) || isNaN(spez) || !isFinite(sens) || !isFinite(spez)) ? NaN : (sens + spez) / 2.0;
            break;
        case 'F1-Score':
            result = (isNaN(ppv) || isNaN(sens) || !isFinite(ppv) || !isFinite(sens) || (ppv + sens) <= 1e-9) ? ((ppv === 0 && sens === 0) ? 0 : NaN) : 2.0 * (ppv * sens) / (ppv + sens);
            break;
        case 'PPV':
            result = ppv;
            break;
        case 'NPV':
            result = npv;
            break;
        default: // Default to Balanced Accuracy if metricName is unknown
            result = (isNaN(sens) || isNaN(spez) || !isFinite(sens) || !isFinite(spez)) ? NaN : (sens + spez) / 2.0;
            break;
    }
    return isNaN(result) || !isFinite(result) ? -Infinity : result; // Return -Infinity for sorting purposes if calculation fails
}

function generateCriteriaCombinations() {
    const CRITERIA_KEYS = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
    const VALUE_OPTIONS = {
        size: [], // To be populated from t2SizeRange
        form: ['rund', 'oval'],
        kontur: ['scharf', 'irregulär'],
        homogenitaet: ['homogen', 'heterogen'],
        signal: ['signalarm', 'intermediär', 'signalreich']
    };
    const LOGICS = ['UND', 'ODER'];

    const { min, max, step } = t2SizeRange;
    if (min !== undefined && max !== undefined && step !== undefined && step > 0) {
        for (let s = Math.round(min * 10); s <= Math.round(max * 10); s += Math.round(step * 10)) {
            VALUE_OPTIONS.size.push(parseFloat((s / 10).toFixed(1)));
        }
        // Ensure min and max are included if they are not multiples of step from each other
        if (!VALUE_OPTIONS.size.includes(min)) VALUE_OPTIONS.size.unshift(min);
        if (!VALUE_OPTIONS.size.includes(max) && max > (VALUE_OPTIONS.size[VALUE_OPTIONS.size.length-1] || 0) ) VALUE_OPTIONS.size.push(max);
        VALUE_OPTIONS.size = [...new Set(VALUE_OPTIONS.size)].sort((a, b) => a - b); // Remove duplicates and sort
    } else {
        // Fallback if t2SizeRange is not provided correctly
        VALUE_OPTIONS.size = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    }


    const combinations = [];
    let calculatedTotal = 0;
    const numCriteria = CRITERIA_KEYS.length;

    // Iterate through all possible subsets of criteria (power set, excluding empty set)
    for (let i = 1; i < (1 << numCriteria); i++) {
        const baseTemplate = {};
        const currentActiveKeys = [];
        CRITERIA_KEYS.forEach((key, index) => {
            const isActive = ((i >> index) & 1) === 1;
            baseTemplate[key] = { active: isActive };
            if (isActive) currentActiveKeys.push(key);
        });

        // Recursive function to generate value combinations for the current set of active keys
        function generateValues(keyIndex, currentComboInProgress) {
            if (keyIndex === currentActiveKeys.length) {
                // All active keys have values, now add logic combinations
                LOGICS.forEach(logic => {
                    const finalCombo = cloneDeepWorker(currentComboInProgress);
                    // Ensure all keys are present, even inactive ones
                    CRITERIA_KEYS.forEach(k => {
                        if (!finalCombo[k]) finalCombo[k] = { active: false };
                    });
                    combinations.push({ logic: logic, criteria: finalCombo });
                });
                calculatedTotal += LOGICS.length;
                return;
            }

            const currentKey = currentActiveKeys[keyIndex];
            const optionsForKey = VALUE_OPTIONS[currentKey];

            if (!optionsForKey || optionsForKey.length === 0) { // Should not happen for defined keys other than size if t2SizeRange is bad
                generateValues(keyIndex + 1, currentComboInProgress);
                return;
            }

            optionsForKey.forEach(value => {
                const nextCombo = cloneDeepWorker(currentComboInProgress);
                if (currentKey === 'size') {
                    nextCombo[currentKey].threshold = value;
                    nextCombo[currentKey].condition = '>='; // Default condition for brute force
                } else {
                    nextCombo[currentKey].value = value;
                }
                generateValues(keyIndex + 1, nextCombo);
            });
        }
        generateValues(0, baseTemplate);
    }
    totalCombinations = calculatedTotal; // Update global total
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
        self.postMessage({ type: 'error', payload: { message: "Keine Kriterienkombinationen generiert." } });
        isRunning = false;
        return;
    }

    self.postMessage({ type: 'started', payload: { totalCombinations: totalCombinations } });

    const reportInterval = Math.max(50, Math.floor(totalCombinations / reportIntervalFactor));
    let lastReportTime = performance.now();

    for (let i = 0; i < allCombinations.length; i++) {
        if (!isRunning) break; // Allow cancellation

        const combo = allCombinations[i];
        let metricValue = -Infinity;

        try {
            metricValue = calculateMetric(currentData, combo.criteria, combo.logic, targetMetric);
        } catch (error) {
            // Log error or handle as needed, ensure metricValue remains -Infinity or NaN
            metricValue = -Infinity; // Or NaN, depending on how you want to treat errors
        }

        const result = { logic: combo.logic, criteria: combo.criteria, metricValue: metricValue };
        allResults.push(result);

        if (result.metricValue > bestResult.metricValue && isFinite(result.metricValue)) {
            bestResult = result;
        }
        combinationsTested++;
        const now = performance.now();

        if (combinationsTested % reportInterval === 0 || combinationsTested === totalCombinations || (now - lastReportTime > 1000)) { // Report every second if interval is too large
            self.postMessage({
                type: 'progress',
                payload: {
                    tested: combinationsTested,
                    total: totalCombinations,
                    currentBest: bestResult.criteria ? cloneDeepWorker(bestResult) : null,
                    metric: targetMetric
                }
            });
            lastReportTime = now;
        }
    }
    const endTime = performance.now();

    if(isRunning) { // Only post results if not cancelled
        const validResults = allResults.filter(r => r && isFinite(r.metricValue) && r.metricValue !== null && r.metricValue !== undefined);
        validResults.sort((a, b) => b.metricValue - a.metricValue); // Sort descending by metricValue

        const topResults = [];
        const precision = 1e-8; // For comparing float metric values
        let rank = 0;
        let lastScore = Infinity;

        for(let i = 0; i < validResults.length; i++) {
            const currentScore = validResults[i].metricValue;
            const isNewRank = Math.abs(currentScore - lastScore) > precision;

            if(isNewRank) {
                rank = i + 1; // Assign new rank (1-based)
            }
            lastScore = currentScore;

            if (rank <= 10) { // Take top 10 ranks
                topResults.push(validResults[i]);
            } else {
                // If the 11th rank has the same score as the 10th, include it as well (and any subsequent ones with the same score)
                if(rank === 11 && topResults.length > 0 && Math.abs(currentScore - (topResults[topResults.length - 1]?.metricValue ?? -Infinity)) < precision) {
                    topResults.push(validResults[i]);
                } else {
                    break; // Stop if rank is beyond 10 and score is different
                }
            }
        }
        const finalBest = bestResult.criteria ? cloneDeepWorker(bestResult) : (topResults[0] ? cloneDeepWorker(topResults[0]) : null);

        self.postMessage({
            type: 'result',
            payload: {
                results: topResults.map(r => ({ // Send only necessary fields
                    logic: r.logic,
                    criteria: r.criteria,
                    metricValue: r.metricValue
                })),
                bestResult: finalBest,
                metric: targetMetric,
                kollektiv: kollektivName,
                duration: endTime - startTime,
                totalTested: combinationsTested
            }
        });
    }
    isRunning = false;
    currentData = []; // Clear data after run
    allResults = [];
}

self.onmessage = function(event) {
    if (!event || !event.data) {
        return;
    }
    const { action, payload } = event.data;

    if (action === 'start') {
        if (isRunning) {
            // Optionally send a message backทอง the main thread that it's already running
            return;
        }
        try {
            if (!payload || !Array.isArray(payload.data) || !payload.metric || !payload.kollektiv || !payload.t2SizeRange) {
                throw new Error("Unvollständige Startdaten für Brute-Force.");
            }
            currentData = payload.data;
            targetMetric = payload.metric;
            kollektivName = payload.kollektiv;
            t2SizeRange = payload.t2SizeRange; // Make sure this is passed from main

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
            isRunning = false; // Signal to stop the loop in runBruteForce
            self.postMessage({ type: 'cancelled' });
            // Reset worker state variables here if needed, or at the end of runBruteForce
        }
    }
};

self.onerror = function(error) {
    self.postMessage({ type: 'error', payload: { message: `Worker Error: ${error.message || 'Unbekannter Fehler im Worker'}` } });
    isRunning = false; // Ensure isRunning is reset on error
};
