const publicationGeneratorService = (() => {

    function _formatPValue(p, lang = 'de') {
        if (p < 0.001) return lang === 'de' ? 'p &lt; ,001' : 'P &lt; .001';
        const pStr = formatNumber(p, 3).replace('.', lang === 'de' ? ',' : '.');
        return `p = ${pStr}`;
    }

    function _formatCI(value, lower, upper, digits, isPercent, lang) {
        const nf = (v) => formatNumber(v, digits, '--').replace('.', lang === 'de' ? ',' : '.');
        const percentSign = isPercent ? '%' : '';
        return `${nf(value)}${percentSign} (95%-KI: ${nf(lower)}${percentSign} – ${nf(upper)}${percentSign})`;
    }

    function _generateAbstract(context, format) {
        const { lang, stats } = context;
        const text = PUBLICATION_CONFIG.getTexts(lang).abstract;
        const p_delong = _formatPValue(stats.comparison.delong.pValue, lang);
        const p_mcnemar = _formatPValue(stats.comparison.mcnemar.pValue, lang);
        
        const replacements = {
            '[N_TOTAL]': stats.descriptive.count,
            '[N_PRCT]': stats.descriptive.therapy.pRCT,
            '[N_NRCT]': stats.descriptive.therapy.nRCT,
            '[AS_SENS]': formatNumber(stats.avocadoSign.sens.value, 1).replace('.', lang === 'de' ? ',' : '.'),
            '[AS_SPEZ]': formatNumber(stats.avocadoSign.spez.value, 1).replace('.', lang === 'de' ? ',' : '.'),
            '[T2_SENS]': formatNumber(stats.t2.sens.value, 1).replace('.', lang === 'de' ? ',' : '.'),
            '[T2_SPEZ]': formatNumber(stats.t2.spez.value, 1).replace('.', lang === 'de' ? ',' : '.'),
            '[AS_AUC]': formatNumber(stats.avocadoSign.auc.value, 3).replace('.', lang === 'de' ? ',' : '.'),
            '[T2_AUC]': formatNumber(stats.t2.auc.value, 3).replace('.', lang === 'de' ? ',' : '.'),
            '[P_DELONG]': p_delong,
            '[P_MCNEMAR]': p_mcnemar
        };

        let content = text.background + text.purpose + text.materials_methods + text.results + text.conclusion;
        for (const key in replacements) {
            content = content.replace(new RegExp(key.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g'), replacements[key]);
        }
        return content;
    }
    
    function _generateIntroduction(context, format) {
         const { lang } = context;
         const text = PUBLICATION_CONFIG.getTexts(lang).introduction;
         return text.paragraph1 + text.paragraph2 + text.paragraph3;
    }

    function _generateMethods(context, format) {
        const { lang, stats, t2Criteria, t2Logic } = context;
        const text = PUBLICATION_CONFIG.getTexts(lang).methods;
        const t2_desc = t2CriteriaManager.formatCriteriaForDisplay(t2Criteria, t2Logic);

        const replacements = {
            '[N_TOTAL]': stats.descriptive.count,
            '[T2_CRITERIA_DESC]': t2_desc,
        };

        let content = text.study_design + text.mri_protocol + text.image_analysis + text.statistical_analysis;
        for (const key in replacements) {
            content = content.replace(new RegExp(key.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g'), replacements[key]);
        }
        return content;
    }

    function _generateResults(context, format) {
        const { lang, stats, bfMetric, bruteForceResult } = context;
        const text = PUBLICATION_CONFIG.getTexts(lang).results;
        
        const replacements = {
            '[N_TOTAL]': stats.descriptive.count,
            '[MEDIAN_AGE]': formatNumber(stats.descriptive.age.median, 0),
            '[IQR_AGE]': `${formatNumber(stats.descriptive.age.q1, 0)}–${formatNumber(stats.descriptive.age.q3, 0)}`,
            '[N_MALE]': stats.descriptive.gender.m,
            '[PERC_MALE]': formatNumber(stats.descriptive.gender.m / stats.descriptive.count * 100, 1).replace('.', lang === 'de' ? ',' : '.'),
            '[AS_AUC_CI]': _formatCI(stats.avocadoSign.auc.value, stats.avocadoSign.auc.ci.lower, stats.avocadoSign.auc.ci.upper, 3, false, lang),
            '[T2_AUC_CI]': _formatCI(stats.t2.auc.value, stats.t2.auc.ci.lower, stats.t2.auc.ci.upper, 3, false, lang),
            '[P_DELONG]': _formatPValue(stats.comparison.delong.pValue, lang),
            '[BF_METRIC_NAME]': bfMetric,
            '[BF_VALUE]': bruteForceResult ? formatNumber(bruteForceResult.metricValue, 4).replace('.', lang === 'de' ? ',' : '.') : 'N/A',
            '[BF_CRITERIA]': bruteForceResult ? t2CriteriaManager.formatCriteriaForDisplay(bruteForceResult.criteria, bruteForceResult.logic) : 'N/A',
        };
        
        let content = text.demographics + text.performance + text.brute_force;
        for (const key in replacements) {
            content = content.replace(new RegExp(key.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g'), replacements[key]);
        }
        return content;
    }

    function _generateDiscussion(context, format) {
        const { lang } = context;
        const text = PUBLICATION_CONFIG.getTexts(lang).discussion;
        return text.paragraph1 + text.paragraph2 + text.paragraph3;
    }

    function _generateTables(context, format) {
        // Diese Funktion würde komplexe Tabellen-Generatoren aufrufen.
        // Vorerst ein Platzhalter, da die Tabellen selbst noch definiert werden müssen.
        return `<p>Tabellengenerierung wird in einem zukünftigen Schritt implementiert.</p>`;
    }

    function _generateFigures(context, format) {
        // Platzhalter für Abbildungen
        return `<p>Abbildungsgenerierung wird in einem zukünftigen Schritt implementiert.</p>`;
    }
    
    function _generateReferences(context, format) {
        const refs = APP_CONFIG.REFERENCES_FOR_PUBLICATION;
        let refList = `<ol class="references-list">`;
        Object.keys(refs).forEach(key => {
            const ref = refs[key];
            if (ref.fullCitation) {
                refList += `<li>${ref.fullCitation}</li>`;
            }
        });
        refList += `</ol>`;
        return refList;
    }


    function generateSection(sectionId, context, format = 'html') {
        switch (sectionId) {
            case 'abstract':
                return _generateAbstract(context, format);
            case 'introduction':
                return _generateIntroduction(context, format);
            case 'methods':
                return _generateMethods(context, format);
            case 'results':
                return _generateResults(context, format);
            case 'discussion':
                return _generateDiscussion(context, format);
            case 'tables':
                return _generateTables(context, format);
            case 'figures':
                return _generateFigures(context, format);
            case 'references':
                return _generateReferences(context, format);
            default:
                return `<p>Sektion '${sectionId}' nicht gefunden.</p>`;
        }
    }

    return Object.freeze({
        generateSection
    });

})();
