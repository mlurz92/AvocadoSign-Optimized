const publicationGeneratorService = (() => {

    function _formatPValue(p, lang = 'de') {
        if (p === null || p === undefined || isNaN(p) || !isFinite(p)) return 'N/A';
        const pPrefix = lang === 'de' ? 'p' : 'P';
        if (p < 0.001) return `${pPrefix} < ${lang === 'de' ? ',001' : '.001'}`;
        let pStr = formatNumber(p, 3, 'N/A', true); // Use standard format to avoid locale issues before replacing decimal
        if (lang === 'de') {
            pStr = pStr.replace('.', ',');
        }
        return `${pPrefix} = ${pStr}`;
    }

    function _formatCI(metric, digits, isPercent, lang = 'de') {
        if (!metric || typeof metric.value !== 'number' || !isFinite(metric.value)) return 'N/A';
        const nf = (v, d = digits) => {
            let formatted = formatNumber(v, d, '--', true); // Use standard format initially
            if (lang === 'de') {
                formatted = formatted.replace('.', ',');
            }
            return formatted;
        };
        const percentSign = isPercent ? '%' : '';
        const ci = metric.ci;
        if (!ci || typeof ci.lower !== 'number' || typeof ci.upper !== 'number' || !isFinite(ci.lower) || !isFinite(ci.upper)) {
            return `${nf(metric.value)}${percentSign}`;
        }
        return `${nf(metric.value)}${percentSign} (95% CI: ${nf(ci.lower)}–${nf(ci.upper)}${percentSign})`;
    }

    function _getReplacements(context) {
        const { lang, stats, bruteForceResult, bfMetric, appliedT2Criteria, appliedT2Logic } = context;
        if (!stats || !stats.Gesamt) return {};

        const s = stats.Gesamt;
        const bfResultData = bruteForceResult || {};
        const isEnglish = lang === 'en';

        // Helper for formatting numeric values with CI and locale
        const formatMetric = (metricObj, digits, isPercent = false) => _formatCI(metricObj, digits, isPercent, lang);
        const formatP = (pValue) => _formatPValue(pValue, lang);

        const ageMedian = s.descriptive?.age.median;
        const ageQ1 = s.descriptive?.age.q1;
        const ageQ3 = s.descriptive?.age.q3;
        const ageStdDev = s.descriptive?.age.sd;

        const maleCount = s.descriptive?.gender.m;
        const totalCount = s.descriptive?.count;
        const nRCTCount = s.descriptive?.therapy.nRCT;
        const direktOPCount = s.descriptive?.therapy['direkt OP'];

        const nPositiveOverall = s.descriptive?.nStatus.positive;
        const nTotalOverall = s.descriptive?.nStatus.positive + s.descriptive?.nStatus.negative;
        const nPosOverallPercent = nTotalOverall > 0 ? formatPercent(nPositiveOverall / nTotalOverall, 1).replace('%', '') : 'N/A';

        const bfBestCriteria = bfResultData.bestResult?.criteria;
        const bfBestLogic = bfResultData.bestResult?.logic;
        const bfCriteriaDesc = bfBestCriteria ? t2CriteriaManager.formatCriteriaForDisplay(bfBestCriteria, bfBestLogic) : 'N/A';

        const asSens = s.avocadoSign?.sens;
        const asSpez = s.avocadoSign?.spez;
        const asPpv = s.avocadoSign?.ppv;
        const asNpv = s.avocadoSign?.npv;
        const asAcc = s.avocadoSign?.acc;
        const asBalAcc = s.avocadoSign?.balAcc; // AUC is derived from BalAcc for binary
        const asAuc = s.avocadoSign?.auc;

        const bfT2Auc = stats.bruteforce?.auc;
        const stdT2Auc = s.t2?.auc;

        const delongASvsBF_pValue = s.comparison_as_vs_bf?.delong.pValue;

        const refEthicsLeipzig = APP_CONFIG.REFERENCES_FOR_PUBLICATION.ETHICS_VOTE_LEIPZIG;
        const refMriSystem = APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T;
        const refContrastAgent = APP_CONFIG.REFERENCES_FOR_PUBLICATION.CONTRAST_AGENT_PROHANCE;
        const refStudyPeriod = APP_CONFIG.REFERENCES_FOR_PUBLICATION.STUDY_PERIOD_2020_2023;
        const refRadiologistExperience = APP_CONFIG.REFERENCES_FOR_PUBLICATION.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER;


        return {
            '[ETHICS_VOTE_ID]': refEthicsLeipzig.fullCitation.split(' ').pop().replace(')',''),
            '[MEAN_AGE]': formatNumber(ageMedian, 0),
            '[STD_AGE]': formatNumber(ageStdDev, 1, 'N/A', true).replace('.', lang === 'de' ? ',' : '.'),
            '[N_MALE]': maleCount,
            '[N_TOTAL]': totalCount,
            '[N_NRCT]': nRCTCount,
            '[N_SURGERY_ALONE]': direktOPCount,
            '[MRI_SYSTEM]': refMriSystem.fullCitation,
            '[CONTRAST_AGENT]': refContrastAgent.fullCitation,
            '[AS_SENS]': formatMetric(asSens, 1, true),
            '[AS_SPEZ]': formatMetric(asSpez, 1, true),
            '[AS_PPV]': formatMetric(asPpv, 1, true),
            '[AS_NPV]': formatMetric(asNpv, 1, true),
            '[AS_ACC]': formatMetric(asAcc, 1, true),
            '[AS_AUC_CI]': formatMetric(asAuc, 3, false),
            '[BF_METRIC]': bfMetric,
            '[BF_T2_CRITERIA_DESC]': bfCriteriaDesc,
            '[BF_T2_AUC]': formatMetric(bfT2Auc, 3, false),
            '[BF_T2_AUC_CI]': formatMetric(bfT2Auc, 3, false),
            '[STD_T2_AUC]': formatMetric(stdT2Auc, 3, false),
            '[P_DELONG_AS_VS_BF]': formatP(delongASvsBF_pValue),
            '[STUDY_PERIOD_START]': isEnglish ? refStudyPeriod.fullCitation.split(' ')[0] : refStudyPeriod.fullCitation.split(' ')[0], // "Januar" vs "January"
            '[STUDY_PERIOD_END]': isEnglish ? refStudyPeriod.fullCitation.split(' ')[2] : refStudyPeriod.fullCitation.split(' ')[2], // "November" vs "November"
            '[RADIOLOGIST_EXPERIENCE_1]': refRadiologistExperience.fullCitation[0],
            '[RADIOLOGIST_EXPERIENCE_2]': refRadiologistExperience.fullCitation[1],
            '[RADIOLOGIST_EXPERIENCE_3]': refRadiologistExperience.fullCitation[2],
            '[N_POSITIVE_OVERALL_PERCENT]': nPosOverallPercent,
            '[ETHICS_VOTE_NUMBER]': refEthicsLeipzig.fullCitation.split(' ').slice(-1)[0].replace(')','').replace('.',''),
            '[AGE_Q1]': formatNumber(ageQ1, 0),
            '[AGE_Q3]': formatNumber(ageQ3, 0),
            '[N_POSITIVE_OVERALL]': nPositiveOverall,
            '[N_NEGATIVE_OVERALL]': s.descriptive?.nStatus.negative,
            '[BF_METRIC_VALUE_FORMATED]': bfResultData.bestResult ? formatNumber(bfResultData.bestResult.metricValue, 4) : 'N/A',
            '[BF_T2_LOGIC]': bfBestLogic || 'N/A',
            '[BF_T2_CRITERIA_FORMATED_SHORT]': bfBestCriteria ? t2CriteriaManager.formatCriteriaForDisplay(bfBestCriteria, bfBestLogic, true) : 'N/A', // Short format

            // Associations
            '[ASSOC_SIZE_P]': formatP(s.associations?.size_mwu?.pValue),
            '[ASSOC_FORM_P]': formatP(s.associations?.form?.pValue),
            '[ASSOC_KONTUR_P]': formatP(s.associations?.kontur?.pValue),
            '[ASSOC_HOMOGENITAET_P]': formatP(s.associations?.homogenitaet?.pValue),
            '[ASSOC_SIGNAL_P]': formatP(s.associations?.signal?.pValue),

            '[ASSOC_FORM_OR]': formatMetric(s.associations?.form?.or, 2, false),
            '[ASSOC_FORM_RD]': formatMetric(s.associations?.form?.rd, 1, true),
            '[ASSOC_FORM_PHI]': formatNumber(s.associations?.form?.phi?.value, 2),

            '[ASSOC_KONTUR_OR]': formatMetric(s.associations?.kontur?.or, 2, false),
            '[ASSOC_KONTUR_RD]': formatMetric(s.associations?.kontur?.rd, 1, true),
            '[ASSOC_KONTUR_PHI]': formatNumber(s.associations?.kontur?.phi?.value, 2),

            '[ASSOC_HOMOGENITAET_OR]': formatMetric(s.associations?.homogenitaet?.or, 2, false),
            '[ASSOC_HOMOGENITAET_RD]': formatMetric(s.associations?.homogenitaet?.rd, 1, true),
            '[ASSOC_HOMOGENITAET_PHI]': formatNumber(s.associations?.homogenitaet?.phi?.value, 2),

            '[ASSOC_SIGNAL_OR]': formatMetric(s.associations?.signal?.or, 2, false),
            '[ASSOC_SIGNAL_RD]': formatMetric(s.associations?.signal?.rd, 1, true),
            '[ASSOC_SIGNAL_PHI]': formatNumber(s.associations?.signal?.phi?.value, 2),

            '[CURRENT_T2_CRITERIA_DISPLAY]': t2CriteriaManager.formatCriteriaForDisplay(appliedT2Criteria, appliedT2Logic),
            '[CURRENT_T2_LOGIC_DISPLAY]': appliedT2Logic,
            '[BF_METRIC_DISPLAY]': APP_CONFIG.METRIC_OPTIONS.find(m => m.value === bfMetric)?.label || bfMetric,
        };
    }
    
    function _generateSectionContent(sectionId, context, format) {
        const texts = PUBLICATION_CONFIG.getTexts(context.lang);
        let content = '';

        const includeTablesFigures = (format === 'html'); // Only include for HTML rendering

        switch (sectionId) {
            case 'abstract':
                content = texts.abstract.background + ' ' + texts.abstract.purpose + ' ' + texts.abstract.materials_methods + ' ' + texts.abstract.results + ' ' + texts.abstract.conclusion;
                break;
            case 'introduction':
                content = texts.introduction.paragraph1 + ' ' + texts.introduction.paragraph2 + ' ' + texts.introduction.paragraph3;
                break;
            case 'methods':
                content = texts.methods.study_design + texts.methods.mri_protocol + texts.methods.image_analysis + texts.methods.reference_standard + texts.methods.statistical_analysis;
                if (includeTablesFigures) {
                    content += `
                    <h4>Table 1: MRI Protocol</h4>
                    <p>Detailed parameters of the MRI sequences used in the study are provided in Table 1.</p>
                    <table class="table table-bordered table-sm">
                        <thead>
                            <tr><th>Parameter</th><th>Sagittal T2-TSE</th><th>Axial T2-TSE</th><th>Coronal T2-TSE</th><th>DWI (b100/500/1000)</th><th>Dixon-VIBE (post-contrast)</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Repetition time (ms)</td><td>4170</td><td>4400</td><td>4400</td><td>3700</td><td>5.8</td></tr>
                            <tr><td>Echo time (ms)</td><td>72</td><td>81</td><td>81</td><td>59</td><td>2.5/3.7</td></tr>
                            <tr><td>Field of view (mm)</td><td>220</td><td>220</td><td>220</td><td>220</td><td>270</td></tr>
                            <tr><td>Slice thickness (mm)</td><td>3</td><td>2</td><td>2</td><td>2</td><td>1.5</td></tr>
                            <tr><td>Matrix</td><td>394 x 448</td><td>380 x 432</td><td>280 x 432</td><td>140 x 140</td><td>206 x 384</td></tr>
                            <tr><td>Acquisition time (min)</td><td>4:37</td><td>4:50</td><td>4:50</td><td>3:57</td><td>4:10</td></tr>
                        </tbody>
                    </table>
                    <p>Note: DWI = diffusion-weighted imaging, TSE = turbo spin-echo, VIBE = volume interpolated breath-hold examination.</p>
                    `; // Table 1
                }
                break;
            case 'results':
                content = texts.results.demographics + texts.results.performance + texts.results.comparison;
                if (includeTablesFigures) {
                    content += `
                    <h4>Table 2: Patient Demographics and Treatment Approaches</h4>
                    <table class="table table-bordered table-sm">
                        <thead>
                            <tr><th>Characteristic</th><th>Value</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Age—mean ± SD</td><td>${formatNumber(context.stats.Gesamt.descriptive.age.mean, 1, 'N/A', true).replace('.', lang === 'de' ? ',' : '.')}±${formatNumber(context.stats.Gesamt.descriptive.age.sd, 1, 'N/A', true).replace('.', lang === 'de' ? ',' : '.')}</td></tr>
                            <tr><td>Male—no. (%)</td><td>${context.stats.Gesamt.descriptive.gender.m} (${formatPercent(context.stats.Gesamt.descriptive.gender.m / context.stats.Gesamt.descriptive.count, 1).replace('%', '')})</td></tr>
                            <tr><td>Female—no. (%)</td><td>${context.stats.Gesamt.descriptive.gender.f} (${formatPercent(context.stats.Gesamt.descriptive.gender.f / context.stats.Gesamt.descriptive.count, 1).replace('%', '')})</td></tr>
                            <tr><td>Treatment approach—no. (%)</td><td></td></tr>
                            <tr><td>Surgery alone</td><td>${context.stats.Gesamt.descriptive.therapy['direkt OP']} (${formatPercent(context.stats.Gesamt.descriptive.therapy['direkt OP'] / context.stats.Gesamt.descriptive.count, 1).replace('%', '')})</td></tr>
                            <tr><td>Neoadjuvant therapy</td><td>${context.stats.Gesamt.descriptive.therapy.nRCT} (${formatPercent(context.stats.Gesamt.descriptive.therapy.nRCT / context.stats.Gesamt.descriptive.count, 1).replace('%', '')})</td></tr>
                        </tbody>
                    </table>
                    `; // Table 2 from Lurz & Schaefer

                    content += `
                    <h4>Table 3: Diagnostic performance of Avocado Sign</h4>
                    <table class="table table-bordered table-sm">
                        <thead>
                            <tr><th>Metric</th><th>Overall (n=${context.stats.Gesamt.descriptive.count})</th><th>Surgery alone (n=${context.stats.Gesamt.descriptive.therapy['direkt OP']})</th><th>Neoadjuvant therapy (n=${context.stats.Gesamt.descriptive.therapy.nRCT})</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>AS+</td><td>${context.stats.Gesamt.avocadoSign.matrix.rp}</td><td>${context.stats['direkt OP']?.avocadoSign.matrix.rp || 'N/A'}</td><td>${context.stats.nRCT?.avocadoSign.matrix.rp || 'N/A'}</td></tr>
                            <tr><td>AS-</td><td>${context.stats.Gesamt.avocadoSign.matrix.rn}</td><td>${context.stats['direkt OP']?.avocadoSign.matrix.rn || 'N/A'}</td><td>${context.stats.nRCT?.avocadoSign.matrix.rn || 'N/A'}</td></tr>
                            <tr><td>N+</td><td>${context.stats.Gesamt.descriptive.nStatus.positive}</td><td>${context.stats['direkt OP']?.descriptive.nStatus.positive || 'N/A'}</td><td>${context.stats.nRCT?.descriptive.nStatus.positive || 'N/A'}</td></tr>
                            <tr><td>N-</td><td>${context.stats.Gesamt.descriptive.nStatus.negative}</td><td>${context.stats['direkt OP']?.descriptive.nStatus.negative || 'N/A'}</td><td>${context.stats.nRCT?.descriptive.nStatus.negative || 'N/A'}</td></tr>
                            <tr><td>AS+N+</td><td>${context.stats.Gesamt.avocadoSign.matrix.rp}</td><td>${context.stats['direkt OP']?.avocadoSign.matrix.rp || 'N/A'}</td><td>${context.stats.nRCT?.avocadoSign.matrix.rp || 'N/A'}</td></tr>
                            <tr><td>AS+N-</td><td>${context.stats.Gesamt.avocadoSign.matrix.fp}</td><td>${context.stats['direkt OP']?.avocadoSign.matrix.fp || 'N/A'}</td><td>${context.stats.nRCT?.avocadoSign.matrix.fp || 'N/A'}</td></tr>
                            <tr><td>AS-N+</td><td>${context.stats.Gesamt.avocadoSign.matrix.fn}</td><td>${context.stats['direkt OP']?.avocadoSign.matrix.fn || 'N/A'}</td><td>${context.stats.nRCT?.avocadoSign.matrix.fn || 'N/A'}</td></tr>
                            <tr><td>AS-N-</td><td>${context.stats.Gesamt.avocadoSign.matrix.rn}</td><td>${context.stats['direkt OP']?.avocadoSign.matrix.rn || 'N/A'}</td><td>${context.stats.nRCT?.avocadoSign.matrix.rn || 'N/A'}</td></tr>
                            <tr><td>Sensitivity (95% CI)</td><td>${formatMetric(context.stats.Gesamt.avocadoSign.sens, 1, true)}</td><td>${formatMetric(context.stats['direkt OP']?.avocadoSign.sens, 1, true)}</td><td>${formatMetric(context.stats.nRCT?.avocadoSign.sens, 1, true)}</td></tr>
                            <tr><td>Specificity (95% CI)</td><td>${formatMetric(context.stats.Gesamt.avocadoSign.spez, 1, true)}</td><td>${formatMetric(context.stats['direkt OP']?.avocadoSign.spez, 1, true)}</td><td>${formatMetric(context.stats.nRCT?.avocadoSign.spez, 1, true)}</td></tr>
                            <tr><td>PPV (95% CI)</td><td>${formatMetric(context.stats.Gesamt.avocadoSign.ppv, 1, true)}</td><td>${formatMetric(context.stats['direkt OP']?.avocadoSign.ppv, 1, true)}</td><td>${formatMetric(context.stats.nRCT?.avocadoSign.ppv, 1, true)}</td></tr>
                            <tr><td>NPV (95% CI)</td><td>${formatMetric(context.stats.Gesamt.avocadoSign.npv, 1, true)}</td><td>${formatMetric(context.stats['direkt OP']?.avocadoSign.npv, 1, true)}</td><td>${formatMetric(context.stats.nRCT?.avocadoSign.npv, 1, true)}</td></tr>
                            <tr><td>Accuracy (95% CI)</td><td>${formatMetric(context.stats.Gesamt.avocadoSign.acc, 1, true)}</td><td>${formatMetric(context.stats['direkt OP']?.avocadoSign.acc, 1, true)}</td><td>${formatMetric(context.stats.nRCT?.avocadoSign.acc, 1, true)}</td></tr>
                            <tr><td>AUC (95% CI)</td><td>${formatMetric(context.stats.Gesamt.avocadoSign.auc, 3, false)}</td><td>${formatMetric(context.stats['direkt OP']?.avocadoSign.auc, 3, false)}</td><td>${formatMetric(context.stats.nRCT?.avocadoSign.auc, 3, false)}</td></tr>
                        </tbody>
                    </table>
                    <p>Note: Metrics include the number of patients with positive and negative Avocado Signs (AS+ and AS-), histologically confirmed nodal metastasis (N+ and N0), and the sensitivity, specificity, PPV, NPV, accuracy, and AUC for the Avocado Sign in predicting lymph node involvement.</p>
                    `; // Table 3 from Lurz & Schaefer

                    content += `
                    <h4>Figure 3: ROC curves for the Avocado Sign</h4>
                    <p>a ROC curve for the overall cohort, demonstrating the diagnostic accuracy of the Avocado Sign in predicting mesorectal lymph node involvement. b ROC curve for patients undergoing surgery alone, highlighting the diagnostic performance in this subgroup. c ROC curve for patients receiving neoadjuvant chemoradiotherapy, illustrating the effectiveness of the Avocado Sign post-therapy</p>
                    <div id="chart-as-overall" class="chart-container" style="min-height: 350px;"></div>
                    <div id="chart-as-surgery-alone" class="chart-container" style="min-height: 350px;"></div>
                    <div id="chart-as-nRCT" class="chart-container" style="min-height: 350px;"></div>
                    `; // Figure 3 from Lurz & Schaefer
                    // This will be rendered by chart_renderer later
                }
                break;
            case 'discussion':
                content = texts.discussion.paragraph1 + ' ' + texts.discussion.paragraph2 + ' ' + texts.discussion.paragraph3;
                break;
            case 'references':
                const refs = APP_CONFIG.REFERENCES_FOR_PUBLICATION;
                content = '<ol>';
                Object.values(refs).sort((a,b) => a.numberInList - b.numberInList).forEach(ref => {
                    if(ref.fullCitation) content += `<li>${ref.fullCitation}</li>`;
                });
                content += '</ol>';
                break;
            default:
                content = `<p>${texts[sectionId] || 'Inhalt nicht gefunden.'}</p>`;
        }
        return content;
    }

    function generateSection(sectionId, context, format = 'html', lang = 'de') {
        try {
            // Ensure context.lang is set for formatting functions
            const currentContext = { ...context, lang: lang };
            const replacements = _getReplacements(currentContext);
            let rawContent = _generateSectionContent(sectionId, currentContext, format);

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
