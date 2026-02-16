window.dataProcessor = (() => {
    function calculateAge(birthDateStr, examDateStr) {
        if (!birthDateStr || !examDateStr) return null;
        try {
            const birthDate = new Date(birthDateStr);
            const examDate = new Date(examDateStr);
            if (isNaN(birthDate.getTime()) || isNaN(examDate.getTime()) || birthDate > examDate) return null;
            let age = examDate.getFullYear() - birthDate.getFullYear();
            const monthDiff = examDate.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && examDate.getDate() < birthDate.getDate())) age--;
            return age >= 0 ? age : null;
        } catch (e) {
            return null;
        }
    }

    function determineSizeCategory(size) {
        if (typeof size !== 'number' || isNaN(size) || size < 0) return null;
        const categories = window.APP_CONFIG.STATISTICAL_CONSTANTS.SIZE_CATEGORIES;
        for (const cat of categories) {
            if (size >= cat.min && size <= cat.max) return cat.id;
        }
        return 'large';
    }

    function processSinglePatient(rawPatient, index) {
        const p = {};
        p.id = typeof rawPatient.id === 'number' ? rawPatient.id : index + 1;
        p.lastName = typeof rawPatient.lastName === 'string' ? rawPatient.lastName.trim() : 'Unknown';
        p.firstName = typeof rawPatient.firstName === 'string' ? rawPatient.firstName.trim() : '';
        p.birthDate = rawPatient.birthDate || null;
        p.examDate = rawPatient.examDate || null;
        p.sex = (rawPatient.sex === 'm' || rawPatient.sex === 'f') ? rawPatient.sex : 'unknown';
        p.therapy = (rawPatient.therapy === 'surgeryAlone' || rawPatient.therapy === 'neoadjuvantTherapy') ? rawPatient.therapy : 'unknown';
        
        p.nStatus = (rawPatient.nStatus === '+' || rawPatient.nStatus === '-') ? rawPatient.nStatus : null;
        p.asStatus = (rawPatient.asStatus === '+' || rawPatient.asStatus === '-') ? rawPatient.asStatus : null;
        p.isMetastatic = p.nStatus === '+';

        const validateCount = (value) => (typeof value === 'number' && value >= 0 && Number.isInteger(value)) ? value : 0;
        p.countPathologyNodes = validateCount(rawPatient.pathologyTotalNodeCount);
        p.countPathologyNodesPositive = validateCount(rawPatient.pathologyPositiveNodeCount);
        p.countASNodes = validateCount(rawPatient.asTotalNodeCount);
        p.countASNodesPositive = validateCount(rawPatient.asPositiveNodeCount);

        p.notes = typeof rawPatient.notes === 'string' ? rawPatient.notes.trim() : '';
        p.age = calculateAge(p.birthDate, p.examDate);

        p.tStage = rawPatient.tStage || null;
        p.tumorLocation = rawPatient.tumorLocation || null;
        p.nSubstage = rawPatient.nSubstage || null;
        p.contrastDelaySeconds = typeof rawPatient.contrastDelaySeconds === 'number' ? rawPatient.contrastDelaySeconds : null;

        p.t2Nodes = Array.isArray(rawPatient.t2Nodes) 
            ? rawPatient.t2Nodes.map(lk => (lk && typeof lk === 'object') ? { ...lk } : null).filter(lk => lk !== null)
            : [];
        
        p.countT2Nodes = p.t2Nodes.length;
        p.t2Status = null;
        p.countT2NodesPositive = 0;
        p.t2NodesEvaluated = [];

        let maxDiameter = 0;
        let validNodeCount = 0;
        let hasNullSignal = false;

        p.t2Nodes.forEach(node => {
            if (typeof node.size === 'number' && !isNaN(node.size)) {
                if (node.size > maxDiameter) maxDiameter = node.size;
                validNodeCount++;
            }
            if (node.signal === null) hasNullSignal = true;
        });

        p.maxNodeSize = validNodeCount > 0 ? maxDiameter : null;
        p.maxNodeSizeCategory = p.maxNodeSize !== null ? determineSizeCategory(p.maxNodeSize) : null;
        p.hasSignalNullNodes = hasNullSignal;
        p.isPotentialDuplicate = false;

        return p;
    }

    function markDuplicates(patients) {
        const n = patients.length;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const p1 = patients[i];
                const p2 = patients[j];
                const nameMatch = p1.lastName.toLowerCase() === p2.lastName.toLowerCase() && 
                                  p1.firstName.slice(0, 3).toLowerCase() === p2.firstName.slice(0, 3).toLowerCase();
                
                let dobMatch = false;
                if (p1.birthDate && p2.birthDate) {
                    const d1 = new Date(p1.birthDate);
                    const d2 = new Date(p2.birthDate);
                    const diffTime = Math.abs(d2 - d1);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 60) dobMatch = true;
                }

                if (nameMatch && dobMatch) {
                    p1.isPotentialDuplicate = true;
                    p2.isPotentialDuplicate = true;
                    if (!p1.notes.includes('Duplicate warning')) p1.notes = (p1.notes ? p1.notes + '; ' : '') + `Potential duplicate of ID ${p2.id}`;
                    if (!p2.notes.includes('Duplicate warning')) p2.notes = (p2.notes ? p2.notes + '; ' : '') + `Potential duplicate of ID ${p1.id}`;
                }
            }
        }
    }

    function processAllData(rawData) {
        if (!Array.isArray(rawData)) return [];
        if (typeof window.APP_CONFIG === 'undefined') return [];
        const processed = rawData.map((patient, index) => processSinglePatient(patient, index));
        markDuplicates(processed);
        return processed;
    }

    function filterDataByCohort(data, cohortId) {
        if (!Array.isArray(data)) return [];
        if (cohortId === window.APP_CONFIG.COHORTS.OVERALL.id) {
            return data.map(item => Object.assign({}, item));
        }
        const cohortConfig = Object.values(window.APP_CONFIG.COHORTS).find(c => c.id === cohortId);
        if (cohortConfig && cohortConfig.therapyValue) {
            return data.filter(p => p && p.therapy === cohortConfig.therapyValue).map(item => Object.assign({}, item));
        }
        return [];
    }

    return Object.freeze({
        processAllData,
        filterDataByCohort
    });
})();