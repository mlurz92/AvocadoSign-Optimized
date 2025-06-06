const publicationGeneratorService = (() => {

    function _formatPValue(p, lang = 'de') {
        if (p === null || p === undefined || isNaN(p)) return 'N/A';
        const pPrefix = lang === 'de' ? 'p' : 'P';
        if (p < 0.001) return `${pPrefix} < ${lang === 'de' ? ',001' : '.001'}`;
        const pStr = formatNumber(p, 3, 'N/A', true).replace('.', lang === 'de' ? ',' : '.');
        return `${pPrefix} = ${pStr}`;
    }

    function _formatCI(metric, digits, isPercent, lang = 'de') {
        if (!metric || typeof metric.value !== 'number' || !isFinite(metric.value)) return 'N/A';
        const nf = (v) => formatNumber(v, digits, '--').replace('.', lang === 'de' ? ',' : '.');
        const percentSign = isPercent ? '%' : '';
        const ci = metric.ci;
        if (!ci || typeof ci.lower !== 'number' || typeof ci.upper !== 'number' || !isFinite(ci.lower) || !isFinite(ci.upper)) {
            return `${nf(metric.value)}${percentSign}`;
        }
        return `${nf(metric.value)}${percentSign} (95% CI: ${nf(ci.lower)}–${nf(ci.upper)}${percentSign})`;
    }

    function _getReplacements(context) {
        const { lang, stats, bruteForceResult, bfMetric, appliedT2Criteria } = context;
        if (!stats || !stats.Gesamt) return {};

        const s = stats.Gesamt;
        const bfResultData = bruteForceResult || {};

        return {
            '[ETHICS_VOTE_ID]': APP_CONFIG.REFERENCES_FOR_PUBLICATION.ETHICS_VOTE_LEIPZIG.fullCitation.split(' ').pop().replace(')',''),
            '[MEAN_AGE]': formatNumber(s.descriptive?.age.median, 0),
            '[STD_AGE]': formatNumber(s.descriptive?.age.sd, 1).replace('.', lang === 'de' ? ',' : '.'),
            '[N_MALE]': s.descriptive?.gender.m,
            '[N_TOTAL]': s.descriptive?.count,
            '[N_NRCT]': s.descriptive?.therapy.nRCT,
            '[N_SURGERY_ALONE]': s.descriptive?.therapy['direkt OP'],
            '[MRI_SYSTEM]': APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T.fullCitation,
            '[CONTRAST_AGENT]': APP_CONFIG.REFERENCES_FOR_PUBLICATION.CONTRAST_AGENT_PROHANCE.fullCitation,
            '[AS_SENS]': _formatCI(s.avocadoSign?.sens, 1, true, lang),
            '[AS_SPEZ]': _formatCI(s.avocadoSign?.spez, 1, true, lang),
            '[AS_PPV]': _formatCI(s.avocadoSign?.ppv, 1, true, lang),
            '[AS_NPV]': _formatCI(s.avocadoSign?.npv, 1, true, lang),
            '[AS_ACC]': _formatCI(s.avocadoSign?.acc, 1, true, lang),
            '[AS_AUC_CI]': _formatCI(s.avocadoSign?.auc, 3, false, lang),
            '[BF_METRIC]': bfMetric,
            '[BF_T2_CRITERIA_DESC]': bfResultData.bestResult ? t2CriteriaManager.formatCriteriaForDisplay(bfResultData.bestResult.criteria, bfResultData.bestResult.logic) : 'N/A',
            '[BF_T2_AUC]': _formatCI(stats.bruteforce?.auc, 3, false, lang),
            '[BF_T2_AUC_CI]': _formatCI(stats.bruteforce?.auc, 3, false, lang),
            '[STD_T2_AUC]': _formatCI(stats.t2?.auc, 3, false, lang),
            '[P_DELONG_AS_VS_BF]': _formatPValue(stats.comparison_as_vs_bf?.delong.pValue, lang),
        };
    }
    
    function _generateSectionContent(sectionId, context, format) {
        const texts = PUBLICATION_CONFIG.getTexts(context.lang);
        let content = '';

        if (sectionId.startsWith('abstract')) content = texts.abstract.background + ' ' + texts.abstract.purpose + ' ' + texts.abstract.materials_methods + ' ' + texts.abstract.results + ' ' + texts.abstract.conclusion;
        else if (sectionId.startsWith('introduction')) content = texts.introduction.paragraph1 + ' ' + texts.introduction.paragraph2 + ' ' + texts.introduction.paragraph3;
        else if (sectionId.startsWith('discussion')) content = texts.discussion.paragraph1 + ' ' + texts.discussion.paragraph2 + ' ' + texts.discussion.paragraph3;
        else if (sectionId.startsWith('methods')) content = texts.methods.study_design + texts.methods.mri_protocol + texts.methods.image_analysis + texts.methods.reference_standard + texts.methods.statistical_analysis;
        else if (sectionId.startsWith('results')) content = texts.results.demographics + texts.results.performance + texts.results.comparison;
        else if (sectionId.startsWith('references')) {
             const refs = APP_CONFIG.REFERENCES_FOR_PUBLICATION;
             content = '<ol>';
             Object.values(refs).forEach(ref => {
                 if(ref.fullCitation) content += `<li>${ref.fullCitation}</li>`;
             });
             content += '</ol>';
             return content;
        }

        return content;
    }

    function generateSection(sectionId, context, format = 'html') {
        try {
            const replacements = _getReplacements(context);
            let rawContent = _generateSectionContent(sectionId, context, format);

            for (const [key, value] of Object.entries(replacements)) {
                rawContent = rawContent.replace(new RegExp(key.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g'), value ?? 'N/A');
            }
            
            if (format === 'html') {
                return rawContent.split('</p>').map(p => `<p>${p.trim()}`).join('').replace(/<p><p>/g, '<p>').replace(/<p><\/p>/g, '');
            }
            
            return rawContent;

        } catch (error) {
            console.error(`Fehler beim Generieren der Sektion ${sectionId}:`, error);
            return `<p class="text-danger">Fehler bei der Generierung des Inhalts für Sektion '${sectionId}'.</p>`;
        }
    }

    return Object.freeze({
        generateSection
    });

})();
