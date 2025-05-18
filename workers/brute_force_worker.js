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
    const sortedActiveKeys = [...activeKeys].sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));

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
         if (Array.isArray(obj)) { const c = []; for (let i = 0; i < obj.length; i++) c[i] = cloneDeepWorker(obj[i]); return c; }
         if (typeof obj === 'object') { const c = {}; for (const k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) c[k] = cloneDeepWorker(obj[k]); return c; }
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
     const lymphNodes = patient.lymphknoten_t2; if (!Array.isArray(lymphNodes)) return null;
     const activeKeys = Object.keys(criteria).filter(key => key !== 'logic' && criteria[key]?.active === true);

     if (activeKeys.length === 0) { // If no criteria are active, patient is considered negative for T2
        return '-';
     }
     if (lymphNodes.length === 0) { // If no LNs, patient is considered negative for T2
        return '-';
     }

     for (let k = 0; k < lymphNodes.length; k++) {
         const lk = lymphNodes[k]; if (!lk) continue;
         const checkResult = checkSingleLymphNodeWorker(lk, criteria); let lkIsPositive = false;
         if (logic === 'UND') { lkIsPositive = activeKeys.every(key => checkResult[key] === true); }
         else { lkIsPositive = activeKeys.some(key => checkResult[key] === true); }
         if (lkIsPositive) return '+';
     } return '-';
}

function calculateMetric(data, criteria, logic, metricName) {
    let rp = 0, fp = 0, fn = 0, rn = 0; if (!Array.isArray(data)) return NaN;
    data.forEach(p => { if(!p || typeof p !== 'object') return; const predictedT2 = applyT2CriteriaToPatientWorker(p, criteria, logic); const actualN = p.n === '+'; const validN = p.n === '+' || p.n === '-'; const validT2 = predictedT2 === '+' || predictedT2 === '-'; if (validN && validT2) { const predicted = predictedT2 === '+'; if (predicted && actualN) rp++; else if (predicted && !actualN) fp++; else if (!predicted && actualN) fn++; else if (!predicted && !actualN) rn++; } });
    const total = rp + fp + fn + rn; if (total === 0) return NaN;
    const sens = (rp + fn) > 0 ? rp / (rp + fn) : 0; const spez = (fp + rn) > 0 ? rn / (fp + rn) : 0; const ppv = (rp + fp) > 0 ? rp / (rp + fp) : 0; const npv = (fn + rn) > 0 ? rn / (fn + rn) : 0;
    let result;
    switch (metricName) {
        case 'Accuracy': result = (rp + rn) / total; break;
        case 'Balanced Accuracy': result = (isNaN(sens) || isNaN(spez)) ? NaN : (sens + spez) / 2.0; break;
        case 'F1-Score': result = (isNaN(ppv) || isNaN(sens) || (ppv + sens) <= 1e-9) ? NaN : 2.0 * (ppv * sens) / (ppv + sens); break;
        case 'PPV': result = ppv; break; case 'NPV': result = npv; break;
        default: result = (isNaN(sens) || isNaN(spez)) ? NaN : (sens + spez) / 2.0; break;
    } return isNaN(result) ? -Infinity : result;
}

function generateCriteriaCombinations() {
    const CRITERIA_KEYS = ['size', 'form', 'kontur', 'homogenitaet', 'signal'];
    const VALUE_OPTIONS = { size: [], form: ['rund', 'oval'], kontur: ['scharf', 'irregulär'], homogenitaet: ['homogen', 'heterogen'], signal: ['signalarm', 'intermediär', 'signalreich'] };
    const LOGICS = ['UND', 'ODER'];
    const { min, max, step } = t2SizeRange;
    for (let s = min * 10; s <= max * 10; s += step * 10) { VALUE_OPTIONS.size.push(parseFloat((s / 10).toFixed(1))); }
    if (!VALUE_OPTIONS.size.includes(min)) VALUE_OPTIONS.size.unshift(min); if (!VALUE_OPTIONS.size.includes(max)) VALUE_OPTIONS.size.push(max);
    VALUE_OPTIONS.size = [...new Set(VALUE_OPTIONS.size)].sort((a, b) => a - b);
    const combinations = []; let calculatedTotal = 0; const numCriteria = CRITERIA_KEYS.length;
    for (let i = 1; i < (1 << numCriteria); i++) {
        const baseTemplate = {}; const currentActive = [];
        CRITERIA_KEYS.forEach((key, index) => { const isActive = ((i >> index) & 1) === 1; baseTemplate[key] = { active: isActive }; if (isActive) currentActive.push(key); });
        function generateValues(keyIndex, currentCombo) {
            if (keyIndex === currentActive.length) { LOGICS.forEach(logic => { const finalCombo = cloneDeepWorker(currentCombo); CRITERIA_KEYS.forEach(k => { if (!finalCombo[k]) finalCombo[k] = { active: false }; }); combinations.push({ logic: logic, criteria: finalCombo }); }); calculatedTotal += LOGICS.length; return; }
            const currentKey = currentActive[keyIndex]; const options = VALUE_OPTIONS[currentKey];
            options.forEach(value => { const nextCombo = cloneDeepWorker(currentCombo); if (currentKey === 'size') { nextCombo[currentKey].threshold = value; nextCombo[currentKey].condition = '>='; } else { nextCombo[currentKey].value = value; } generateValues(keyIndex + 1, nextCombo); });
        }
        generateValues(0, baseTemplate);
    }
    totalCombinations = calculatedTotal; return combinations;
}

function runBruteForce() {
    if (!isRunning) return; if (!currentData || currentData.length === 0) { self.postMessage({ type: 'error', payload: { message: "Keine Daten im Worker." } }); isRunning = false; return; }
    startTime = performance.now(); combinationsTested = 0; allResults = []; bestResult = { metricValue: -Infinity, criteria: null, logic: null };
    const allCombinations = generateCriteriaCombinations(); if (totalCombinations === 0 || allCombinations.length === 0) { self.postMessage({ type: 'error', payload: { message: "Keine Kriterienkombinationen generiert." } }); isRunning = false; return; }
    self.postMessage({ type: 'started', payload: { totalCombinations: totalCombinations } });
    const reportInterval = Math.max(50, Math.floor(totalCombinations / reportIntervalFactor)); let lastReportTime = performance.now();
    for (let i = 0; i < allCombinations.length; i++) {
        if (!isRunning) break;
        const combo = allCombinations[i]; let metricValue = -Infinity;
        try { metricValue = calculateMetric(currentData, combo.criteria, combo.logic, targetMetric); }
        catch(error) { metricValue = -Infinity; }
        const result = { logic: combo.logic, criteria: combo.criteria, metricValue: metricValue }; allResults.push(result);
        if (result.metricValue > bestResult.metricValue && isFinite(result.metricValue)) bestResult = result;
        combinationsTested++; const now = performance.now();
        if (combinationsTested % reportInterval === 0 || combinationsTested === totalCombinations || (now - lastReportTime > 1000)) {
            self.postMessage({ type: 'progress', payload: { tested: combinationsTested, total: totalCombinations, currentBest: bestResult.criteria ? cloneDeepWorker(bestResult) : null, metric: targetMetric } }); lastReportTime = now;
        }
    }
    const endTime = performance.now();
    if(isRunning) {
        const validResults = allResults.filter(r => r && isFinite(r.metricValue)); validResults.sort((a, b) => b.metricValue - a.metricValue);
        const topResults = []; const precision = 1e-8; let rank = 0; let countAtRank = 0; let lastScore = Infinity;
        for(let i = 0; i < validResults.length; i++) { const currentScore = validResults[i].metricValue; const isNewRank = Math.abs(currentScore - lastScore) > precision; if(isNewRank) { rank = i + 1; countAtRank = 1; } else { countAtRank++; } lastScore = currentScore; if (rank <= 10) { topResults.push(validResults[i]); } else { if(rank === 11 && Math.abs(currentScore - (topResults[topResults.length - 1]?.metricValue ?? -Infinity)) < precision) { topResults.push(validResults[i]); } else { break; } } }
        const finalBest = bestResult.criteria ? cloneDeepWorker(bestResult) : (topResults[0] ? cloneDeepWorker(topResults[0]) : null);
        self.postMessage({ type: 'result', payload: { results: topResults.map(r => ({ logic: r.logic, criteria: r.criteria, metricValue: r.metricValue })), bestResult: finalBest, metric: targetMetric, kollektiv: kollektivName, duration: endTime - startTime, totalTested: combinationsTested } });
    }
    isRunning = false; currentData = []; allResults = [];
}

self.onmessage = function(event) {
    if (!event || !event.data) { console.error("Worker: Ungültige Nachricht empfangen."); return; }
    const { action, payload } = event.data;
    if (action === 'start') {
        if (isRunning) { console.warn("Worker läuft bereits."); return; }
        try { if (!payload || !Array.isArray(payload.data) || !payload.metric || !payload.kollektiv || !payload.t2SizeRange) throw new Error("Unvollständige Startdaten."); currentData = payload.data; targetMetric = payload.metric; kollektivName = payload.kollektiv; t2SizeRange = payload.t2SizeRange; if (currentData.length === 0) throw new Error("Leeres Datenset."); isRunning = true; runBruteForce(); }
        catch (error) { self.postMessage({ type: 'error', payload: { message: `Initialisierungsfehler: ${error.message}` } }); isRunning = false; }
    } else if (action === 'cancel') { if (isRunning) { isRunning = false; self.postMessage({ type: 'cancelled' }); } }
};

self.onerror = function(error) { self.postMessage({ type: 'error', payload: { message: `Worker Error: ${error.message || 'Unbekannter Fehler'}` } }); isRunning = false; };