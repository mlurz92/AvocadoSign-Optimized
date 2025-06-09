const CriteriaManager = {
    criteria: {
        'avocado': {
            id: 'avocado',
            name: 'Avocado Sign',
            type: 'binary',
            apply: function(item) {
                return (item.avocado_sign === 1) ? 1 : 0;
            },
            scorer: function(item) {
                return item.avocado_score !== undefined ? item.avocado_score : item.avocado_sign;
            }
        },
        'beets_tan_2018': {
            id: 'beets_tan_2018',
            name: 'Beets-Tan et al. (2018)',
            type: 'binary',
            apply: function(item) {
                return (item.t2_short_axis >= 5) ? 1 : 0;
            },
            scorer: function(item) {
                return item.t2_short_axis;
            }
        },
        'koh_2008': {
            id: 'koh_2008',
            name: 'Koh et al. (2008)',
            type: 'binary',
            apply: function(item) {
                return (item.t2_short_axis >= 9) ? 1 : 0;
            },
            scorer: function(item) {
                return item.t2_short_axis;
            }
        },
        'barbaro_2024': {
            id: 'barbaro_2024',
            name: 'Barbaro et al. (2024)',
            type: 'binary',
            apply: function(item) {
                const isIrregularBorder = item.t2_kontur_begrenzung === 1;
                const isMixedSignal = item.t2_signalintensitaet === 1;
                return (isIrregularBorder || isMixedSignal) ? 1 : 0;
            },
            scorer: function(item) {
                let score = 0;
                if (item.t2_kontur_begrenzung === 1) score += 1;
                if (item.t2_signalintensitaet === 1) score += 1;
                return score;
            }
        },
        'rutegard_2025': {
            id: 'rutegard_2025',
            name: 'Rutegård et al. (2025)',
            type: 'binary',
            apply: function(item) {
                return (item.t2_short_axis > 9 || item.t2_long_axis > 10) ? 1 : 0;
            },
            scorer: function(item) {
                return Math.max(item.t2_short_axis, item.t2_long_axis);
            }
        },
        'brute_force_optimized': {
            id: 'brute_force_optimized',
            name: 'Brute-Force Optimized',
            type: 'dynamic',
            isOptimized: false,
            params: {},
            apply: function(item) {
                if (!this.isOptimized) return 0;
                const paramKeys = Object.keys(this.params);
                for (const key of paramKeys) {
                    if (item[key] >= this.params[key]) {
                        return 1;
                    }
                }
                return 0;
            },
            scorer: function(item) {
                if (!this.isOptimized) return 0;
                const paramKeys = Object.keys(this.params);
                // A simple scoring mechanism for the dynamic criterion. 
                // This could be made more complex if needed.
                let score = 0;
                paramKeys.forEach(key => {
                    score += item[key];
                });
                return score / paramKeys.length;
            }
        }
    },

    getCriteriaById: function(id) {
        return this.criteria[id];
    },

    getAllCriteria: function() {
        return Object.values(this.criteria);
    },

    getSelectOptions: function() {
        return this.getAllCriteria()
            .filter(c => c.type !== 'dynamic' || c.isOptimized)
            .map(c => ({ value: c.id, text: c.name }));
    },
    
    updateBruteForceCriterion: function(bestParams, bestThreshold) {
        const criterion = this.criteria['brute_force_optimized'];
        if (bestParams && bestThreshold !== undefined) {
            criterion.params = { [bestParams]: bestThreshold };
            criterion.name = `Optimized (${bestParams.replace('t2_', '').replace('_', ' ')} ≥ ${bestThreshold.toFixed(2)})`;
            criterion.isOptimized = true;
        } else {
            criterion.name = 'Brute-Force Optimized (not run)';
            criterion.isOptimized = false;
            criterion.params = {};
        }
    }
};

window.CriteriaManager = CriteriaManager;
