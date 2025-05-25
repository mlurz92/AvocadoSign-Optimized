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
const reportIntervalFactor = 200; // Report progress roughly 200 times or every second

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
     // StructuredClone is preferred if available (in modern workers)
     try {
         if (typeof self !== 'undefined' && self.structuredClone) {
             return self.structuredClone(obj);
         } else {
             // Fallback to JSON stringify/parse (loses functions, undefined, etc.)
             return JSON.parse(JSON.stringify(obj));
         }
     } catch(e) {
         // Deeper fallback for complex objects or if JSON methods fail (e.g. circular refs, though unlikely here)
         if (Array.isArray(obj)) {
             const arrCopy = [];
             for(let i = 0; i < obj.length; i++){
                 arrCopy[i] = cloneDeepWorker(obj[i]); // Recursive call
             }
             return arrCopy;
         }
         if (typeof obj === 'object') {
             const objCopy = {};
             for(const key in obj) {
                 if(Object.prototype.hasOwnProperty.call(obj, key)) {
                     objCopy[key] = cloneDeepWorker(obj[key]); // Recursive call
                 }
             }
             return objCopy;
         }
         // Primitive types or uncloneable
         return obj;
     }
}

function checkSingleLymphNodeWorker(lymphNode, criteria) {
    const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
    if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

    if (criteria.size?.active) {
        const threshold = criteria.size.threshold;
        const nodeSize = lymphNode.groesse; // Assuming 'groesse' is the correct property name from data
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
     const lymphNodes = patient.lymphknoten_t2; // Assuming this is the correct property name
     if (!Array.isArray(lymphNodes)) return null; // Or handle as no lymph nodes evaluated

     const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

     if (activeKeys.length === 0) return null; // No active criteria, no prediction
     if (lymphNodes.length === 0) return '-'; // No lymph nodes to evaluate, so considered negative

     for (let k = 0; k < lymphNodes.length; k++) {
         const lk = lymphNodes[k];
         if (!lk) continue; // Skip if lymph node data is sparse/null
         const checkResult = checkSingleLymphNodeWorker(lk, criteria);
         let lkIsPositive = false;
         if (logic === 'UND') {
             lkIsPositive = activeKeys.every(key => checkResult[key] === true);
         } else { // ODER logic
             lkIsPositive = activeKeys.some(key => checkResult[key] === true);
         }
         if (lkIsPositive) return '+'; // If any lymph node is positive, patient is positive
     }
     return '-'; // No lymph node met the criteria for positive
}

function calculateMetric(data, criteria, logic, metricName) {
    let rp = 0, fp = 0, fn = 0, rn = 0;
    if (!Array.isArray(data)) return NaN;

    data.forEach(p => {
        if(!p || typeof p !== 'object') return; // Skip invalid patient data
        const predictedT2 = applyT2CriteriaToPatientWorker(p, criteria, logic);
        const actualN = p.n === '+'; // Assuming 'n' is the gold standard property
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
    if (total === 0) return NaN; // Avoid division by zero if no valid cases

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
        default: // Default to Balanced Accuracy if metricName is unknown
            result = (isNaN(sens) || isNaN(spez)) ? NaN : (sens + spez) / 2.0;
            break;
    }
    return isNaN(result) ? -Infinity : result; // Return -Infinity for sorting purposes if calculation fails
}

function generateCriteriaCombinations() {
    const CRITERIA_KEYS = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
    const VALUE_OPTIONS = {
        size: [], // Will be populated from t2SizeRange
        form: ['rund', 'oval'],
        kontur: ['scharf', 'irregulär'],
        homogenitaet: ['homogen', 'heterogen'],
        signal: ['signalarm', 'intermediär', 'signalreich']
    };
    const LOGICS = ['UND', 'ODER'];

    // Populate size options from t2SizeRange passed by main thread
    const { min, max, step } = t2SizeRange;
    if (min !== undefined && max !== undefined && step !== undefined && step > 0) {
        // Ensure multiplication by 10 and division by 10 to handle floating point inaccuracies for steps like 0.1
        for (let s = Math.round(min * 10); s <= Math.round(max * 10); s += Math.round(step * 10)) {
            VALUE_OPTIONS.size.push(parseFloat((s / 10).toFixed(1)));
        }
        // Ensure min and max are included if step doesn't hit them exactly
        if (!VALUE_OPTIONS.size.includes(min)) VALUE_OPTIONS.size.unshift(min);
        if (!VALUE_OPTIONS.size.includes(max)) VALUE_OPTIONS.size.push(max);
        // Remove duplicates and sort
        VALUE_OPTIONS.size = [...new Set(VALUE_OPTIONS.size)].sort((a, b) => a - b);
    } else {
        // Fallback default if t2SizeRange is not properly defined
        VALUE_OPTIONS.size = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        console.warn("BruteForceWorker: t2SizeRange not properly defined, using default size range.");
    }


    const combinations = [];
    let calculatedTotal = 0; // This will be more accurate than a pre-calculated totalCombinations
    const numCriteria = CRITERIA_KEYS.length;

    // Iterate through all possible subsets of criteria (1 to 2^numCriteria - 1)
    for (let i = 1; i < (1 << numCriteria); i++) {
        const baseTemplate = {};
        const currentActiveKeys = [];
        CRITERIA_KEYS.forEach((key, index) => {
            const isActive = ((i >> index) & 1) === 1;
            baseTemplate[key] = { active: isActive }; // Set active status based on bitmask
            if (isActive) {
                currentActiveKeys.push(key);
            }
        });

        // Recursive function to generate value combinations for active criteria
        function generateValues(keyIndex, currentComboInProgress) {
            if (keyIndex === currentActiveKeys.length) {
                // All active criteria have values, now add logic combinations
                LOGICS.forEach(logic => {
                    const finalCombo = cloneDeepWorker(currentComboInProgress);
                    // Ensure all criteria keys are present, even inactive ones
                    CRITERIA_KEYS.forEach(k => {
                        if (!finalCombo[k]) finalCombo[k] = { active: false };
                    });
                    combinations.push({ logic: logic, criteria: finalCombo });
                });
                calculatedTotal += LOGICS.length; // Each set of values for active criteria results in LOGICS.length combinations
                return;
            }

            const currentKey = currentActiveKeys[keyIndex];
            const optionsForKey = VALUE_OPTIONS[currentKey];

            if (!optionsForKey || optionsForKey.length === 0) { // Should not happen for defined keys
                generateValues(keyIndex + 1, currentComboInProgress);
                return;
            }

            optionsForKey.forEach(value => {
                const nextCombo = cloneDeepWorker(currentComboInProgress);
                if (currentKey === 'size') {
                    nextCombo[currentKey].threshold = value;
                    nextCombo[currentKey].condition = '>='; // Default condition for size
                } else {
                    nextCombo[currentKey].value = value;
                }
                generateValues(keyIndex + 1, nextCombo);
            });
        }
        generateValues(0, baseTemplate);
    }
    totalCombinations = calculatedTotal; // Set global total based on actual generation
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

    const allCombinations = generateCriteriaCombinations(); // totalCombinations is set inside this function

    if (totalCombinations === 0 || allCombinations.length === 0) {
        self.postMessage({ type: 'error', payload: { message: "Keine Kriterienkombinationen generiert." } });
        isRunning = false;
        return;
    }

    self.postMessage({ type: 'started', payload: { totalCombinations: totalCombinations } });

    const reportInterval = Math.max(50, Math.floor(totalCombinations / reportIntervalFactor));
    let lastReportTime = performance.now();

    for (let i = 0; i < allCombinations.length; i++) {
        if (!isRunning) break; // Check for cancellation

        const combo = allCombinations[i];
        let metricValue = -Infinity;

        try {
            metricValue = calculateMetric(currentData, combo.criteria, combo.logic, targetMetric);
        } catch (error) {
            // console.error("Error in calculateMetric:", error, combo); // Keep for debugging
            metricValue = -Infinity; // Treat errors as worst possible score
        }

        const result = { logic: combo.logic, criteria: combo.criteria, metricValue: metricValue };
        allResults.push(result);

        if (result.metricValue > bestResult.metricValue && isFinite(result.metricValue)) {
            bestResult = result;
        }
        combinationsTested++;
        const now = performance.now();

        // Report progress at intervals or if more than 1 second has passed
        if (combinationsTested % reportInterval === 0 || combinationsTested === totalCombinations || (now - lastReportTime > 1000)) {
            self.postMessage({
                type: 'progress',
                payload: {
                    tested: combinationsTested,
                    total: totalCombinations,
                    currentBest: bestResult.criteria ? cloneDeepWorker(bestResult) : null,
                    metric: targetMetric // Send the target metric for context in UI
                }
            });
            lastReportTime = now;
        }
    }
    const endTime = performance.now();

    if(isRunning) { // Only send results if not cancelled
        const validResults = allResults.filter(r => r && isFinite(r.metricValue));
        validResults.sort((a, b) => b.metricValue - a.metricValue); // Sort descending by metricValue

        // Logic to get top N results, including ties for the Nth rank
        const topResults = [];
        const precision = 1e-8; // For comparing floating point metric values
        let rank = 0;
        let countAtRank = 0; // Unused, but could be useful
        let lastScore = Infinity;

        for(let i = 0; i < validResults.length; i++) {
            const currentScore = validResults[i].metricValue;
            const isNewRank = Math.abs(currentScore - lastScore) > precision;

            if(isNewRank) {
                rank = i + 1; // Rank based on position after sorting
            }
            lastScore = currentScore;

            if (rank <= 10) { // Get top 10 ranks
                topResults.push(validResults[i]);
            } else {
                // If the 11th item has the same score as the 10th, include it (tie)
                if(rank === 11 && topResults.length > 0 && Math.abs(currentScore - (topResults[topResults.length - 1]?.metricValue ?? -Infinity)) < precision) {
                    topResults.push(validResults[i]);
                } else {
                    break; // Stop if rank is > 10 and not a tie with the 10th
                }
            }
        }
        
        // Ensure bestResult is indeed the top one from sorted list if it exists, or the first valid one
        const finalBest = bestResult.criteria ? cloneDeepWorker(bestResult) : (topResults[0] ? cloneDeepWorker(topResults[0]) : null);
        
        self.postMessage({
            type: 'result',
            payload: {
                results: topResults.map(r => ({ // Send only essential data for top results
                    logic: r.logic,
                    criteria: r.criteria,
                    metricValue: r.metricValue
                })),
                bestResult: finalBest,
                metric: targetMetric,
                kollektiv: kollektivName, // Send back kollektiv for context
                duration: endTime - startTime,
                totalTested: combinationsTested
            }
        });
    }
    isRunning = false; // Reset state after completion or cancellation
    currentData = []; // Clear data to free memory
    allResults = [];  // Clear results
}

self.onmessage = function(event) {
    if (!event || !event.data) {
        console.error("Worker: Ungültige Nachricht empfangen.");
        return;
    }
    const { action, payload } = event.data;

    if (action === 'start') {
        if (isRunning) {
            console.warn("Worker läuft bereits. Startanfrage ignoriert.");
            // Optionally send a message back to main thread if needed
            // self.postMessage({ type: 'error', payload: { message: "Worker is already running." } });
            return;
        }
        try {
            if (!payload || !Array.isArray(payload.data) || !payload.metric || !payload.kollektiv || !payload.t2SizeRange) {
                throw new Error("Unvollständige Startdaten für Brute-Force.");
            }
            currentData = payload.data;
            targetMetric = payload.metric;
            kollektivName = payload.kollektiv;
            t2SizeRange = payload.t2SizeRange; // Get t2SizeRange from main thread

            if (currentData.length === 0) {
                throw new Error("Leeres Datenset für Brute-Force erhalten.");
            }
            isRunning = true;
            runBruteForce();
        }
        catch (error) {
            self.postMessage({ type: 'error', payload: { message: `Initialisierungsfehler im Worker: ${error.message}` } });
            isRunning = false; // Ensure isRunning is reset on error
        }
    } else if (action === 'cancel') {
        if (isRunning) {
            isRunning = false; // Signal to stop the loop in runBruteForce
            self.postMessage({ type: 'cancelled' }); // Inform main thread
        }
    }
};

// Global error handler for the worker
self.onerror = function(error) {
    // This can catch errors not caught by try-catch blocks within onmessage or runBruteForce
    self.postMessage({ type: 'error', payload: { message: `Worker Error: ${error.message || 'Unbekannter Fehler im Worker'}` } });
    isRunning = false; // Ensure worker state is reset
};
