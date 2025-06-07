const publicationGeneratorService = (() => {

    function _getReplacements(context) {
        const { lang, stats, bruteForceResult, bfMetric, appliedT2Criteria, appliedT2Logic } = context;
        if (!stats || !stats.Gesamt) return {};

        const s = stats.Gesamt;
        const bfResultData = bruteForceResult || {};
        const isEnglish = lang === 'en';

        const formatMetric = (metricObj, digits, isPercent = false) => utils.formatCI(metricObj?.value, metricObj?.ci?.lower, metricObj?.ci?.upper, digits, isPercent, 'N/A');
        const formatP = (pValue) => utils.getPValueText(pValue, lang);

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
        const nPosOverallPercent = nTotalOverall > 0 ? utils.formatPercent(nPositiveOverall / nTotalOverall, 1).replace('%', '') : 'N/A';

        const bfBestCriteria = bfResultData.bestResult?.criteria;
        const bfBestLogic = bfResultData.bestResult?.logic;
        const bfCriteriaDesc = bfBestCriteria ? t2CriteriaManager.formatCriteriaForDisplay(bfBestCriteria, bfBestLogic) : 'N/A';

        const asSens = s.avocadoSign?.sens;
        const asSpez = s.avocadoSign?.spez;
        const asPpv = s.avocadoSign?.ppv;
        const asNpv = s.avocadoSign?.npv;
        const asAcc = s.avocadoSign?.acc;
        const asAuc = s.avocadoSign?.auc;

        const bfT2Auc = stats.Gesamt.bruteforce?.auc;
        const stdT2Auc = s.t2?.auc;

        const delongASvsBF_pValue = s.comparison_as_vs_bf?.delong.pValue;

        const refEthicsLeipzig = APP_CONFIG.REFERENCES_FOR_PUBLICATION.ETHICS_VOTE_LEIPZIG;
        const refMriSystem = APP_CONFIG.REFERENCES_FOR_PUBLICATION.MRI_SYSTEM_SIEMENS_3T;
        const refContrastAgent = APP_CONFIG.REFERENCES_FOR_PUBLICATION.CONTRAST_AGENT_PROHANCE;
        const refStudyPeriod = APP_CONFIG.REFERENCES_FOR_PUBLICATION.STUDY_PERIOD_2020_2023;
        const refRadiologistExperience = APP_CONFIG.REFERENCES_FOR_PUBLICATION.RADIOLOGIST_EXPERIENCE_LURZ_SCHAEFER;

        return {
            '[ETHICS_VOTE_ID]': refEthicsLeipzig.fullCitation.split(' ').pop().replace(')',''),
            '[MEAN_AGE]': utils.formatNumber(ageMedian, 0),
            '[STD_AGE]': utils.formatNumber(ageStdDev, 1, 'N/A', true).replace('.', lang === 'de' ? ',' : '.'),
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
            '[STUDY_PERIOD_START]': refStudyPeriod.fullCitation.split(' ')[0],
            '[STUDY_PERIOD_END]': refStudyPeriod.fullCitation.split(' ')[2],
            '[RADIOLOGIST_EXPERIENCE_1]': refRadiologistExperience.fullCitation[0],
            '[RADIOLOGIST_EXPERIENCE_2]': refRadiologistExperience.fullCitation[1],
            '[RADIOLOGIST_EXPERIENCE_3]': refRadiologistExperience.fullCitation[2],
            '[N_POSITIVE_OVERALL_PERCENT]': nPosOverallPercent,
            '[ETHICS_VOTE_NUMBER]': refEthicsLeipzig.fullCitation.split(' ').slice(-1)[0].replace(')','').replace('.',''),
            '[AGE_Q1]': utils.formatNumber(ageQ1, 0),
            '[AGE_Q3]': utils.formatNumber(ageQ3, 0),
            '[N_POSITIVE_OVERALL]': nPositiveOverall,
            '[N_NEGATIVE_OVERALL]': s.descriptive?.nStatus.negative,
            '[BF_METRIC_VALUE_FORMATED]': bfResultData.bestResult ? utils.formatNumber(bfResultData.bestResult.metricValue, 4) : 'N/A',
            '[BF_T2_LOGIC]': bfBestLogic || 'N/A',
            '[BF_T2_CRITERIA_FORMATED_SHORT]': bfBestCriteria ? t2CriteriaManager.formatCriteriaForDisplay(bfBestCriteria, bfBestLogic, true) : 'N/A',

            '[ASSOC_SIZE_P]': formatP(s.associations?.size_mwu?.pValue),
            '[ASSOC_FORM_P]': formatP(s.associations?.form?.pValue),
            '[ASSOC_KONTUR_P]': formatP(s.associations?.kontur?.pValue),
            '[ASSOC_HOMOGENITAET_P]': formatP(s.associations?.homogenitaet?.pValue),
            '[ASSOC_SIGNAL_P]': formatP(s.associations?.signal?.pValue),
            '[ASSOC_FORM_OR]': formatMetric(s.associations?.form?.or, 2, false),
            '[ASSOC_FORM_RD]': formatMetric(s.associations?.form?.rd, 1, true),
            '[ASSOC_FORM_PHI]': utils.formatNumber(s.associations?.form?.phi?.value, 2),
            '[ASSOC_KONTUR_OR]': formatMetric(s.associations?.kontur?.or, 2, false),
            '[ASSOC_KONTUR_RD]': formatMetric(s.associations?.kontur?.rd, 1, true),
            '[ASSOC_KONTUR_PHI]': utils.formatNumber(s.associations?.kontur?.phi?.value, 2),
            '[ASSOC_HOMOGENITAET_OR]': formatMetric(s.associations?.homogenitaet?.or, 2, false),
            '[ASSOC_HOMOGENITAET_RD]': formatMetric(s.associations?.homogenitaet?.rd, 1, true),
            '[ASSOC_HOMOGENITAET_PHI]': utils.formatNumber(s.associations?.homogenitaet?.phi?.value, 2),
            '[ASSOC_SIGNAL_OR]': formatMetric(s.associations?.signal?.or, 2, false),
            '[ASSOC_SIGNAL_RD]': formatMetric(s.associations?.signal?.rd, 1, true),
            '[ASSOC_SIGNAL_PHI]': utils.formatNumber(s.associations?.signal?.phi?.value, 2),

            '[CURRENT_T2_CRITERIA_DISPLAY]': t2CriteriaManager.formatCriteriaForDisplay(appliedT2Criteria, appliedT2Logic),
            '[CURRENT_T2_LOGIC_DISPLAY]': appliedT2Logic,
            '[BF_METRIC_DISPLAY]': APP_CONFIG.METRIC_OPTIONS.find(m => m.value === bfMetric)?.label || bfMetric,
        };
    }
    
    function _generateSectionContent(sectionId, context, format) {
        const texts = PUBLICATION_CONFIG.getTexts(context.lang);
        let content = '';
        const includeTablesFigures = (format === 'html');

        const getSectionText = (sectionKey) => {
            const section = texts[sectionKey];
            if (!section) return `<p>${texts[sectionKey] || 'Inhalt nicht gefunden.'}</p>`;
            return Object.values(section).join(' ');
        };

        const generateTableHTML = (tableData) => {
            let html = `<table class="table table-bordered table-sm">`;
            if (tableData.head) {
                html += `<thead><tr>${tableData.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
            }
            html += `<tbody>`;
            tableData.body.forEach(row => {
                html += `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
            });
            html += `</tbody></table>`;
            if (tableData.note) {
                html += `<p class="small text-muted mt-1">${tableData.note}</p>`;
            }
            return html;
        };

        switch (sectionId) {
            case 'abstract':
            case 'introduction':
            case 'discussion':
                content = getSectionText(sectionId);
                break;
            case 'methods':
                content = Object.values(texts.methods).join('');
                if (includeTablesFigures) {
                    content += `<h4>Tabelle 1: MRT-Protokoll</h4>` + generateTableHTML(publicationContentGeneratorRadiology.getTable1Data(context));
                }
                break;
            case 'results':
                content = Object.values(texts.results).join('');
                if (includeTablesFigures) {
                    content += `<h4>Tabelle 2: Demographie</h4>` + generateTableHTML(publicationContentGeneratorRadiology.getTable2Data(context));
                    content += `<h4>Tabelle 3: Diagnostische Güte</h4>` + generateTableHTML(publicationContentGeneratorRadiology.getTable3Data(context));
                    content += `<h4>Abbildung 3: ROC-Kurven</h4>` + publicationContentGeneratorRadiology.getFigure3Data(context);
                }
                break;
            case 'references':
                content = publicationContentGeneratorRadiology.getReferences(context);
                break;
            default:
                content = `<p>Inhalt für Sektion '${sectionId}' nicht gefunden.</p>`;
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
                return rawContent.replace(/<\/p><p>/g, '<br><br>').replace(/<p>|<\/p>/g, '');
            }
            
            return rawContent;

        } catch (error) {
            console.error(`Fehler beim Generieren der Sektion ${sectionId}:`, error);
            return `<p class="text-danger">Fehler bei der Generierung des Inhalts für Sektion '${sectionId}'.</p>`;
        }
    }

    const publicationContentGeneratorRadiology = {
        getTable1Data: (context) => ({
            head: ['Parameter', 'Sagittal T2-TSE', 'Axial T2-TSE', 'Coronal T2-TSE', 'DWI (b100/500/1000)', 'Dixon-VIBE (post-contrast)'],
            body: [
                ['Repetition time (ms)', '4170', '4400', '4400', '3700', '5.8'],
                ['Echo time (ms)', '72', '81', '81', '59', '2.5/3.7'],
                ['Field of view (mm)', '220', '220', '220', '220', '270'],
                ['Slice thickness (mm)', '3', '2', '2', '2', '1.5'],
                ['Matrix', '394 x 448', '380 x 432', '280 x 432', '140 x 140', '206 x 384'],
                ['Acquisition time (min)', '4:37', '4:50', '4:50', '3:57', '4:10']
            ],
            note: 'DWI = diffusion-weighted imaging, TSE = turbo spin-echo, VIBE = volume interpolated breath-hold examination.'
        }),
        getTable2Data: (context) => ({
            head: ['Characteristic', 'Value'],
            body: [
                ['Age—mean ± SD', `${utils.formatNumber(context.stats.Gesamt.descriptive.age.mean, 1, 'N/A', true).replace('.', context.lang === 'de' ? ',' : '.')} ± ${utils.formatNumber(context.stats.Gesamt.descriptive.age.sd, 1, 'N/A', true).replace('.', context.lang === 'de' ? ',' : '.')}`],
                ['Male—no. (%)', `${context.stats.Gesamt.descriptive.gender.m} (${utils.formatPercent(context.stats.Gesamt.descriptive.gender.m / context.stats.Gesamt.descriptive.count, 1)})`],
                ['Female—no. (%)', `${context.stats.Gesamt.descriptive.gender.f} (${utils.formatPercent(context.stats.Gesamt.descriptive.gender.f / context.stats.Gesamt.descriptive.count, 1)})`],
                ['Treatment approach—no. (%)', ''],
                ['Surgery alone', `${context.stats.Gesamt.descriptive.therapy['direkt OP']} (${utils.formatPercent(context.stats.Gesamt.descriptive.therapy['direkt OP'] / context.stats.Gesamt.descriptive.count, 1)})`],
                ['Neoadjuvant therapy', `${context.stats.Gesamt.descriptive.therapy.nRCT} (${utils.formatPercent(context.stats.Gesamt.descriptive.therapy.nRCT / context.stats.Gesamt.descriptive.count, 1)})`],
            ]
        }),
        getTable3Data: (context) => {
             const sGesamt = context.stats.Gesamt;
             const sOp = context.stats['direkt OP'];
             const sNrct = context.stats.nRCT;
             const formatMetric = (metric, d, isPercent) => utils.formatCI(metric?.value, metric?.ci?.lower, metric?.ci?.upper, d, isPercent, 'N/A');
             return {
                head: ['Metric', `Overall (n=${sGesamt?.descriptive.count || 'N/A'})`, `Surgery alone (n=${sOp?.descriptive.count || 'N/A'})`, `Neoadjuvant therapy (n=${sNrct?.descriptive.count || 'N/A'})`],
                body: [
                    ['Sensitivity (95% CI)', formatMetric(sGesamt?.avocadoSign.sens, 1, true), formatMetric(sOp?.avocadoSign.sens, 1, true), formatMetric(sNrct?.avocadoSign.sens, 1, true)],
                    ['Specificity (95% CI)', formatMetric(sGesamt?.avocadoSign.spez, 1, true), formatMetric(sOp?.avocadoSign.spez, 1, true), formatMetric(sNrct?.avocadoSign.spez, 1, true)],
                    ['PPV (95% CI)', formatMetric(sGesamt?.avocadoSign.ppv, 1, true), formatMetric(sOp?.avocadoSign.ppv, 1, true), formatMetric(sNrct?.avocadoSign.ppv, 1, true)],
                    ['NPV (95% CI)', formatMetric(sGesamt?.avocadoSign.npv, 1, true), formatMetric(sOp?.avocadoSign.npv, 1, true), formatMetric(sNrct?.avocadoSign.npv, 1, true)],
                    ['Accuracy (95% CI)', formatMetric(sGesamt?.avocadoSign.acc, 1, true), formatMetric(sOp?.avocadoSign.acc, 1, true), formatMetric(sNrct?.avocadoSign.acc, 1, true)],
                    ['AUC (95% CI)', formatMetric(sGesamt?.avocadoSign.auc, 3, false), formatMetric(sOp?.avocadoSign.auc, 3, false), formatMetric(sNrct?.avocadoSign.auc, 3, false)]
                ],
                note: 'AS = Avocado Sign, CI = confidence interval, PPV = positive predictive value, NPV = negative predictive value, AUC = area under the receiver operating characteristic curve.'
            };
        },
        getFigure3Data: (context) => `<div class="row"><div class="col-md-4"><div id="chart-as-overall" class="chart-container" style="min-height: 300px;"></div><p class="text-center small">a) Overall Cohort</p></div><div class="col-md-4"><div id="chart-as-surgery-alone" class="chart-container" style="min-height: 300px;"></div><p class="text-center small">b) Surgery Alone</p></div><div class="col-md-4"><div id="chart-as-nRCT" class="chart-container" style="min-height: 300px;"></div><p class="text-center small">c) nRCT</p></div></div>`,
        getReferences: (context) => {
            const refs = APP_CONFIG.REFERENCES_FOR_PUBLICATION;
            let content = '<ol>';
            Object.values(refs).sort((a,b) => a.numberInList - b.numberInList).forEach(ref => {
                if(ref.fullCitation) content += `<li>${ref.fullCitation}</li>`;
            });
            content += '</ol>';
            return content;
        }
    };

    return Object.freeze({
        generateSection
    });

})();
