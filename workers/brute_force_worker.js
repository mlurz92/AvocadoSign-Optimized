let isRunning = false;
let currentData = [];
let targetMetric = 'Accuracy';
let kollektivName = '';
let bestResult = null;
let allResults = [];
let combinationsTested = 0;
let totalCombinations = 0;
let startTime = 0;
let t2SizeRange = { min: 0.1, max: 15.0, step: 0.1 }; // Default, will be overwritten by payload
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

    const effectiveLogic = logic || criteria.logic || 'ODER'; // Default to ODER if not specified
    const separator = (effectiveLogic === 'UND') ? ' UND ' : ' ODER ';

    const formatValue = (key, criterion) => {
        if (!criterion) return '?';
        if (key === 'size') return `${criterion.condition || '>='}${formatNumberWorker(criterion.threshold, 1)}mm`;
        return criterion.value || '?';
    };

    // Ensure a consistent order for display
    const priorityOrder = ['size', 'kontur', 'homogenitaet', 'form', 'signal'];
    const sortedActiveKeys = [...activeKeys].sort((a, b) => {
        const indexA = priorityOrder.indexOf(a);
        const indexB = priorityOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b); // Fallback for unknown keys
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
     // Simplified deep clone for worker context, assuming JSON-serializable objects
     // structuredClone is preferred if available
     if (obj === null || typeof obj !== 'object') return obj;
     try {
         if (typeof self !== 'undefined' && self.structuredClone) {
             return self.structuredClone(obj);
         } else {
             // Fallback for environments without structuredClone (like older Node.js for testing, though this is a Web Worker)
             return JSON.parse(JSON.stringify(obj));
         }
     } catch(e) {
         // More robust manual fallback if structuredClone and JSON.parse fail (e.g., for complex objects not in this app's data)
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
         return obj; // Should not reach here for primitive types
     }
}

function checkSingleLymphNodeWorker(lymphNode, criteria) {
    const checkResult = { size: null, form: null, kontur: null, homogenitaet: null, signal: null };
    if (!lymphNode || typeof lymphNode !== 'object' || !criteria || typeof criteria !== 'object') return checkResult;

    if (criteria.size?.active) {
        const threshold = criteria.size.threshold;
        const nodeSize = lymphNode.groesse; // Assuming 'groesse' is the correct property name from data.js
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
     if (!patient || !criteria || (logic !== 'UND' && logic !== 'ODER')) return null; // Patient T2 status is null if input invalid
     const lymphNodes = patient.lymphknoten_t2; // Assuming 'lymphknoten_t2' is the correct property
     if (!Array.isArray(lymphNodes)) return null;

     const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

     if (activeKeys.length === 0) return null; // If no criteria active, T2 status is undetermined (null)
     if (lymphNodes.length === 0) return '-'; // If criteria active but no nodes, patient is T2 negative

     for (let k = 0; k < lymphNodes.length; k++) {
         const lk = lymphNodes[k];
         if (!lk) continue; // Skip if a lymph node entry is somehow null/undefined
         const checkResult = checkSingleLymphNodeWorker(lk, criteria);
         let lkIsPositive = false;
         if (logic === 'UND') {
             lkIsPositive = activeKeys.every(key => checkResult[key] === true);
         } else { // ODER
             lkIsPositive = activeKeys.some(key => checkResult[key] === true);
         }
         if (lkIsPositive) return '+'; // Patient is positive if any lymph node is positive
     }
     return '-'; // Patient is negative if no lymph node met the criteria
}

function calculateMetric(data, criteria, logic, metricName) {
    let rp = 0, fp = 0, fn = 0, rn = 0;
    if (!Array.isArray(data)) return NaN;

    data.forEach(p => {
        if(!p || typeof p !== 'object') return;
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
    if (total === 0) return NaN; // Or -Infinity depending on preference for "no data"

    const sens = (rp + fn) > 0 ? rp / (rp + fn) : 0; // Default to 0 if denominator is 0
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
        default: // Default to Balanced Accuracy as a robust metric
            result = (isNaN(sens) || isNaN(spez)) ? NaN : (sens + spez) / 2.0;
            break;
    }
    return isNaN(result) ? -Infinity : result; // Return -Infinity for sorting purposes if NaN
}

function generateCriteriaCombinations() {
    const CRITERIA_KEYS = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
    // These values should align with APP_CONFIG.T2_CRITERIA_SETTINGS in the main app for consistency
    const VALUE_OPTIONS = {
        size: [], // Will be populated by t2SizeRange
        form: ['rund', 'oval'],
        kontur: ['scharf', 'irregulär'],
        homogenitaet: ['homogen', 'heterogen'],
        signal: ['signalarm', 'intermediär', 'signalreich']
    };
    const LOGICS = ['UND', 'ODER'];

    // Populate size options from t2SizeRange received in payload
    const { min, max, step } = t2SizeRange;
    if (min !== undefined && max !== undefined && step !== undefined && step > 0) {
        for (let s = min * 10; s <= max * 10; s += step * 10) { VALUE_OPTIONS.size.push(parseFloat((s / 10).toFixed(1))); }
        if (!VALUE_OPTIONS.size.includes(min)) VALUE_OPTIONS.size.unshift(min); // Ensure min/max are included
        if (!VALUE_OPTIONS.size.includes(max)) VALUE_OPTIONS.size.push(max);
        VALUE_OPTIONS.size = [...new Set(VALUE_OPTIONS.size)].sort((a, b) => a - b); // Deduplicate and sort
    } else {
        // Fallback if t2SizeRange is not properly defined (should not happen)
        VALUE_OPTIONS.size = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        console.warn("BruteForceWorker: t2SizeRange not properly defined, using default size range.");
    }


    const combinations = [];
    let calculatedTotal = 0;
    const numCriteria = CRITERIA_KEYS.length;

    // Iterate through all possible subsets of criteria (1 to 2^numCriteria - 1)
    for (let i = 1; i < (1 << numCriteria); i++) {
        const baseTemplate = {};
        const currentActive = [];
        CRITERIA_KEYS.forEach((key, index) => {
            const isActive = ((i >> index) & 1) === 1;
            baseTemplate[key] = { active: isActive };
            if (isActive) currentActive.push(key);
        });

        // Recursive function to generate value combinations for active criteria
        function generateValues(keyIndex, currentCombo) {
            if (keyIndex === currentActive.length) { // All active criteria have values assigned
                LOGICS.forEach(logic => {
                    const finalCombo = cloneDeepWorker(currentCombo);
                    // Ensure all criteria keys are present, even if inactive
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
            if (!options || options.length === 0) { // Skip if no options for this key (e.g. size not populated)
                generateValues(keyIndex + 1, currentCombo);
                return;
            }

            options.forEach(value => {
                const nextCombo = cloneDeepWorker(currentCombo);
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
    totalCombinations = calculatedTotal; // Store the actual number of combinations to be tested
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
        if (!isRunning) break; // Check for cancellation

        const combo = allCombinations[i];
        let metricValue = -Infinity; // Initialize with a very low value

        try {
            metricValue = calculateMetric(currentData, combo.criteria, combo.logic, targetMetric);
        } catch (error) {
            metricValue = -Infinity; // Handle potential errors during calculation
            // console.error("Error calculating metric in worker:", error, combo);
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
                    metric: targetMetric // Pass targetMetric for UI display
                }
            });
            lastReportTime = now;
        }
    }
    const endTime = performance.now();

    if(isRunning) { // Ensure results are only sent if not cancelled
        const validResults = allResults.filter(r => r && isFinite(r.metricValue));
        validResults.sort((a, b) => b.metricValue - a.metricValue); // Sort by metric value descending

        const topResults = [];
        const precision = 1e-8; // For comparing floating point metric values
        let rank = 0;
        let countAtRank = 0; // Not strictly needed for top 10, but good for full ranking logic
        let lastScore = Infinity;

        for(let i = 0; i < validResults.length; i++) {
            const currentScore = validResults[i].metricValue;
            const isNewRank = Math.abs(currentScore - lastScore) > precision;

            if(isNewRank) {
                rank = i + 1; // Rank is 1-based index of distinct scores
                countAtRank = 1;
            } else {
                countAtRank++;
            }
            lastScore = currentScore;

            if (rank <= 10) { // Get top 10 ranks
                topResults.push(validResults[i]);
            } else {
                // If next item has same score as 10th, include it (tie for 10th place)
                if(rank === 11 && Math.abs(currentScore - (topResults[topResults.length - 1]?.metricValue ?? -Infinity)) < precision) {
                    topResults.push(validResults[i]);
                } else {
                    break; // Stop if we are past rank 10 and it's a new lower score
                }
            }
        }
        // Ensure bestResult is indeed the top one if list is not empty
        const finalBest = bestResult.criteria ? cloneDeepWorker(bestResult) : (topResults[0] ? cloneDeepWorker(topResults[0]) : null);

        self.postMessage({
            type: 'result',
            payload: {
                results: topResults.map(r => ({ // Map to ensure only necessary data is sent
                    logic: r.logic,
                    criteria: r.criteria, // Consider cloning if mutations are a concern later
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
    isRunning = false; // Reset state
    currentData = [];
    allResults = [];
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
            return;
        }
        try {
            if (!payload || !Array.isArray(payload.data) || !payload.metric || !payload.kollektiv || !payload.t2SizeRange) {
                throw new Error("Unvollständige Startdaten für Brute-Force.");
            }
            currentData = payload.data;
            targetMetric = payload.metric;
            kollektivName = payload.kollektiv;
            t2SizeRange = payload.t2SizeRange; // Set the size range from payload

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
            isRunning = false; // Signal to stop the loop
            self.postMessage({ type: 'cancelled' });
        }
    }
};

// Generic error handler for the worker itself
self.onerror = function(error) {
    self.postMessage({ type: 'error', payload: { message: `Worker Error: ${error.message || 'Unbekannter Fehler im Worker'}` } });
    isRunning = false; // Ensure worker state is reset on error
};
