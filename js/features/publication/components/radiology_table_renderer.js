const publicationTabComponents = ((existingComponents) => {

    function _formatMetricForTableDisplay(metricData, isRate = true, digits = 1, lang = 'de', placeholder = 'N/A') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value) || !isFinite(metricData.value)) {
            return placeholder;
        }
        return formatCI(metricData.value, metricData.ci?.lower, metricData.ci?.upper, digits, isRate, placeholder);
    }

    function _generateTableFootnotesHTML(footnotesConfig, lang) {
        if (!footnotesConfig || typeof footnotesConfig !== 'object' || Object.keys(footnotesConfig).length === 0) {
            return '';
        }
        let footnotesHTML = '<div class="publication-table-footnotes small mt-2">';
        const sortedKeys = Object.keys(footnotesConfig).sort();

        sortedKeys.forEach(key => {
            const noteText = lang === 'de' ? footnotesConfig[key].de : footnotesConfig[key].en;
            if (noteText) {
                footnotesHTML += `<p class="mb-1"><sup>${key}</sup> ${noteText}</p>`;
            }
        });
        footnotesHTML += '</div>';
        return footnotesHTML;
    }

    function _createFullTableHTML(config, rowsData, lang) {
        if (!config || !config.id || !config.titleDe || !config.titleEn || !Array.isArray(config.headers) || !Array.isArray(rowsData)) {
            console.error("Ungültige Konfiguration oder Daten für _createFullTableHTML");
            return `<p class="text-danger">Fehler beim Erstellen der Tabelle (ID: ${config?.id}).</p>`;
        }

        let tableHTML = `<div class="publication-table-wrapper my-4" id="${config.id}-wrapper">`;
        tableHTML += `<h4 class="mt-3 mb-1 publication-table-title" id="${config.id}-title">${lang === 'de' ? config.titleDe : config.titleEn}</h4>`;
        if (config.descriptionDe && config.descriptionEn) {
            const legendId = `${config.id}-legend`;
            tableHTML += `<p class="small text-muted mb-2" id="${legendId}">${lang === 'de' ? config.descriptionDe : config.descriptionEn}</p>`;
        }

        tableHTML += `<div class="table-responsive">`;
        tableHTML += `<table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}" aria-labelledby="${config.id}-title" ${config.descriptionDe ? `aria-describedby="${config.id}-legend"` : ''}>`;

        let captionText = '';
        if (config.captionDe && config.captionEn) {
            captionText = lang === 'de' ? config.captionDe : config.captionEn;
        }
        if (captionText) {
             tableHTML += `<caption>${captionText}</caption>`;
        }


        tableHTML += `<thead><tr>`;
        config.headers.forEach(header => {
            const headerText = lang === 'de' ? header.de : header.en;
            const tooltipText = lang === 'de' ? header.tooltipDe : header.tooltipEn;
            const thAttributes = tooltipText ? ` data-tippy-content="${tooltipText}"` : '';
            tableHTML += `<th scope="col"${thAttributes}>${headerText}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;

        rowsData.forEach(row => {
            tableHTML += `<tr>`;
            row.forEach((cell, index) => {
                const cellContent = (cell !== null && cell !== undefined && !(typeof cell === 'number' && isNaN(cell))) ? cell : 'N/A';
                const thScope = index === 0 && typeof cell === 'string' && cell.length < 50 ? ` scope="row"` : '';
                tableHTML += `<td${thScope}>${cellContent}</td>`;
            });
            tableHTML += `</tr>`;
        });

        tableHTML += `</tbody></table></div>`;
        tableHTML += _generateTableFootnotesHTML(config.footnotes, lang);
        tableHTML += `</div>`;
        return tableHTML;
    }

    function renderPatientCharacteristicsTable(allKollektivStats, lang) {
        const configKey = 'patientCharacteristics';
        const config = PUBLICATION_CONFIG.publicationElements.tables[configKey];
        if (!allKollektivStats || !allKollektivStats.Gesamt?.deskriptiv || !config) {
            return `<p class="text-muted small">Keine ausreichenden Patientendaten für Tabelle '${config?.titleDe || configKey}' verfügbar.</p>`;
        }

        const pGesamt = allKollektivStats.Gesamt.deskriptiv;
        const pDirektOP = allKollektivStats['direkt OP']?.deskriptiv || {};
        const pNRCT = allKollektivStats.nRCT?.deskriptiv || {};

        const nGesamt = pGesamt.anzahlPatienten || 0;
        const nDirektOP = pDirektOP.anzahlPatienten || 0;
        const nNRCT = pNRCT.anzahlPatienten || 0;

        const tableConfig = { ...config };
        tableConfig.headers = [
            { de: 'Merkmal', en: 'Characteristic', tooltipDe: 'Klinisches oder demographisches Merkmal.', tooltipEn: 'Clinical or demographic characteristic.' },
            { de: `${getKollektivDisplayName('Gesamt')} (N=${nGesamt})`, en: `${getKollektivDisplayName('Gesamt')} (n=${nGesamt})` },
            { de: `${getKollektivDisplayName('direkt OP')} (N=${nDirektOP})`, en: `${getKollektivDisplayName('direkt OP')} (n=${nDirektOP})` },
            { de: `${getKollektivDisplayName('nRCT')} (N=${nNRCT})`, en: `${getKollektivDisplayName('nRCT')} (n=${nNRCT})` }
        ];

        const rows = [];
        const fNum = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder, true);
        const fPerc = (count, total, dig = 0) => (total > 0 && count !== undefined && !isNaN(count)) ? `${fNum(count,0)} (${formatPercent(count / total, dig)})` : `${fNum(count,0)} (N/A)`;

        rows.push([
            lang === 'de' ? 'Alter, Median (Spannweite) [Jahre]' : 'Age, Median (Range) [Years]',
            pGesamt.alter ? `${fNum(pGesamt.alter.median)} (${fNum(pGesamt.alter.min,0)}-${fNum(pGesamt.alter.max,0)})` : 'N/A',
            pDirektOP.alter ? `${fNum(pDirektOP.alter.median)} (${fNum(pDirektOP.alter.min,0)}-${fNum(pDirektOP.alter.max,0)})` : 'N/A',
            pNRCT.alter ? `${fNum(pNRCT.alter.median)} (${fNum(pNRCT.alter.min,0)}-${fNum(pNRCT.alter.max,0)})` : 'N/A'
        ]);
         rows.push([
            lang === 'de' ? 'Geschlecht, männlich [n (%)]' : 'Sex, male [n (%)]',
            fPerc(pGesamt.geschlecht?.m, nGesamt),
            fPerc(pDirektOP.geschlecht?.m, nDirektOP),
            fPerc(pNRCT.geschlecht?.m, nNRCT)
        ]);
        rows.push([
            lang === 'de' ? 'Pathologischer N-Status, positiv [n (%)]' : 'Pathological N-Status, positive [n (%)]',
            fPerc(pGesamt.nStatus?.plus, nGesamt),
            fPerc(pDirektOP.nStatus?.plus, nDirektOP),
            fPerc(pNRCT.nStatus?.plus, nNRCT)
        ]);
         rows.push([
            lang === 'de' ? 'Avocado Sign (MRT), positiv [n (%)]' : 'Avocado Sign (MRI), positive [n (%)]',
            fPerc(pGesamt.asStatus?.plus, nGesamt),
            fPerc(pDirektOP.asStatus?.plus, nDirektOP),
            fPerc(pNRCT.asStatus?.plus, nNRCT)
        ]);
        tableConfig.footnotes = {
            a: {de: 'N/A: Nicht verfügbar oder nicht anwendbar.', en: 'N/A: Not available or not applicable.'},
            b: {de: 'Prozentangaben beziehen sich auf die Gesamtzahl (N) des jeweiligen Kollektivs.', en: 'Percentages refer to the total number (n) of the respective cohort.'}
        };

        return _createFullTableHTML(tableConfig, rows, lang);
    }

    function renderMRTSequencesTable(lang) {
        const configKey = 'mrtSequences';
        const config = { ...PUBLICATION_CONFIG.publicationElements.tables[configKey] };
        config.headers = [
            { de: 'Sequenz', en: 'Sequence' }, { de: 'Ebene', en: 'Plane' },
            { de: 'TR (ms)<sup>a</sup>', en: 'TR (ms)<sup>a</sup>' }, { de: 'TE (ms)<sup>b</sup>', en: 'TE (ms)<sup>b</sup>' },
            { de: 'Schichtdicke (mm)', en: 'Slice Thickness (mm)' }, { de: 'Matrix', en: 'Matrix' },
            { de: 'FOV (mm)<sup>c</sup>', en: 'FOV (mm)<sup>c</sup>' }, { de: 'Bemerkungen', en: 'Notes'}
        ];
        const rowsData = [
            ["T2 TSE", "Sagittal", "4170", "72", "3", "394x448", "220", ""],
            ["T2 TSE", "Axial", "4400", "81", "2", "380x432", "220", ""],
            ["T2 TSE", "Koronar", "4400", "81", "2", "280x432", "220", ""],
            ["DWI", "Axial", "3700", "59", "2", "140x140", "220", "b=100, 500, 1000 s/mm²"],
            ["T1 VIBE Dixon (+KM)<sup>d</sup>", "Axial", "5.8", "2.5 / 3.7", "1.5", "206x384", "270", lang === 'de' ? "Post-Kontrast" : "Post-contrast"]
        ];
        config.footnotes = {
            a: { de: 'TR: Repetitionszeit.', en: 'TR: Repetition Time.'},
            b: { de: 'TE: Echozeit.', en: 'TE: Echo Time.'},
            c: { de: 'FOV: Field of View.', en: 'FOV: Field of View.'},
            d: { de: 'KM: Kontrastmittel (Gadoteridol).', en: 'CE: Contrast Enhanced (Gadoteridol).'}
        };
        return _createFullTableHTML(config, rowsData, lang);
    }

    function renderLiteratureT2CriteriaOverviewTable(lang) {
        const configKey = 'literatureT2CriteriaOverview';
        const config = { ...PUBLICATION_CONFIG.publicationElements.tables[configKey] };
        config.headers = [
            { de: 'Studie / Kriteriensatz', en: 'Study / Criteria Set' },
            { de: 'Primäres Zielkollektiv (Orig.)<sup>a</sup>', en: 'Primary Target Cohort (Orig.)<sup>a</sup>' },
            { de: 'Kernkriterien (Zusammenfassung)', en: 'Core Criteria (Summary)' },
            { de: 'Logik', en: 'Logic' }
        ];
        const rowsData = [];
        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet && studySet.studyInfo) {
                rowsData.push([
                    `${studySet.name} [${conf.citationKey}]`,
                    getKollektivDisplayName(studySet.applicableKollektiv) + (studySet.studyInfo.patientCohort ? ` (${studySet.studyInfo.patientCohort.split('(')[0].trim()})` : ''),
                    studySet.studyInfo.keyCriteriaSummary || 'N/A',
                    UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic
                ]);
            }
        });
        config.footnotes = {
             a: {de: 'Gibt das Patientenkollektiv an, für das die Kriterien in der Originalpublikation primär entwickelt oder validiert wurden.', en: 'Indicates the patient cohort for which the criteria were primarily developed or validated in the original publication.'},
             N_A: {de: 'N/A: Nicht anwendbar oder nicht verfügbar.', en: 'N/A: Not applicable or not available.'}
        };
        return _createFullTableHTML(config, rowsData, lang);
    }

    function renderPerformanceMetricsTable(allKollektivStats, lang, configKey, statsObjectKey, kollektivIds = ['Gesamt', 'direkt OP', 'nRCT'], methodDisplayName = '', commonData = {}) {
        const config = { ...PUBLICATION_CONFIG.publicationElements.tables[configKey] };
        if (!allKollektivStats || !config) return `<p class="text-muted small">Keine Daten oder Konfiguration für Tabelle '${config?.titleDe || configKey}'.</p>`;

        let titleDe = config.titleDe;
        let titleEn = config.titleEn;
        if (methodDisplayName) {
            titleDe = titleDe.replace('{BF_METRIC}', methodDisplayName);
            titleEn = titleEn.replace('{BF_METRIC}', methodDisplayName);
        }
        config.titleDe = titleDe; config.titleEn = titleEn;

        config.headers = [
            { de: 'Kollektiv', en: 'Cohort' }, { de: 'N', en: 'n' },
            { de: 'Sens. (95%-KI)<sup>a</sup>', en: 'Sens. (95% CI)<sup>a</sup>' }, { de: 'Spez. (95%-KI)<sup>a</sup>', en: 'Spec. (95% CI)<sup>a</sup>' },
            { de: 'PPV (95%-KI)<sup>a</sup>', en: 'PPV (95% CI)<sup>a</sup>' }, { de: 'NPV (95%-KI)<sup>a</sup>', en: 'NPV (95% CI)<sup>a</sup>' },
            { de: 'Acc. (95%-KI)<sup>a</sup>', en: 'Acc. (95% CI)<sup>a</sup>' }, { de: 'AUC (95%-KI)<sup>b</sup>', en: 'AUC (95% CI)<sup>b</sup>' }
        ];
        const rowsData = [];
        kollektivIds.forEach(kolId => {
            const stats = allKollektivStats[kolId]?.[statsObjectKey];
            const nPat = allKollektivStats[kolId]?.deskriptiv?.anzahlPatienten || 0;
            const isBruteForce = statsObjectKey === 'gueteT2_bruteforce';
            const bfDef = isBruteForce ? allKollektivStats[kolId]?.bruteforce_definition : null;
            let kollektivDisplayName = getKollektivDisplayName(kolId);
            if(isBruteForce && bfDef && bfDef.criteria) {
                kollektivDisplayName += ` (BF Opt.: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, true)})`;
            }

            if (stats && stats.matrix && nPat > 0) {
                rowsData.push([
                    kollektivDisplayName, nPat,
                    _formatMetricForTableDisplay(stats.sens, true, 1, lang),
                    _formatMetricForTableDisplay(stats.spez, true, 1, lang),
                    _formatMetricForTableDisplay(stats.ppv, true, 1, lang),
                    _formatMetricForTableDisplay(stats.npv, true, 1, lang),
                    _formatMetricForTableDisplay(stats.acc, true, 1, lang),
                    _formatMetricForTableDisplay(stats.auc, false, 3, lang)
                ]);
            } else {
                rowsData.push([kollektivDisplayName, nPat, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']);
            }
        });
         config.footnotes = {
            KI: {de: 'KI: Konfidenzintervall.', en: 'CI: Confidence Interval.'},
            a: {de: `95%-KI berechnet mittels ${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION}.`, en: `95% CI calculated using ${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION}.`},
            b: {de: `95%-KI berechnet mittels ${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE} (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} Replikationen). AUC ist für binäre Tests äquivalent zur Balanced Accuracy.`, en: `95% CI calculated using ${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE} (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications). AUC is equivalent to Balanced Accuracy for binary tests.`},
            N_A: {de: 'N/A: Nicht verfügbar oder nicht anwendbar.', en: 'N/A: Not available or not applicable.'}
        };
        return _createFullTableHTML(config, rowsData, lang);
    }

    function renderPerformanceLiteratureT2CriteriaTable(allKollektivStats, lang) {
        const configKey = 'performanceLiteratureT2';
        const config = { ...PUBLICATION_CONFIG.publicationElements.tables[configKey] };
         config.headers = [
            { de: 'Kriteriensatz [Ref.]', en: 'Criteria Set [Ref.]' }, { de: 'Eval. Kollektiv', en: 'Eval. Cohort' }, { de: 'N', en: 'n' },
            { de: 'Sens. (95%-KI)<sup>a</sup>', en: 'Sens. (95% CI)<sup>a</sup>' }, { de: 'Spez. (95%-KI)<sup>a</sup>', en: 'Spec. (95% CI)<sup>a</sup>' },
            { de: 'AUC (95%-KI)<sup>b</sup>', en: 'AUC (95% CI)<sup>b</sup>' }
        ];
        const rowsData = [];
        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                const nPat = allKollektivStats?.[targetKollektivForStudy]?.deskriptiv?.anzahlPatienten || 0;

                if (stats && stats.matrix && nPat > 0) {
                     rowsData.push([
                        `${studySet.name} [${conf.citationKey}]`, getKollektivDisplayName(targetKollektivForStudy), nPat,
                        _formatMetricForTableDisplay(stats.sens, true, 1, lang),
                        _formatMetricForTableDisplay(stats.spez, true, 1, lang),
                        _formatMetricForTableDisplay(stats.auc, false, 3, lang)
                    ]);
                } else {
                    rowsData.push([`${studySet.name} [${conf.citationKey}]`, getKollektivDisplayName(targetKollektivForStudy), nPat, 'N/A', 'N/A', 'N/A']);
                }
            }
        });
         config.footnotes = {
            KI: {de: 'KI: Konfidenzintervall.', en: 'CI: Confidence Interval.'},
            a: {de: `95%-KI berechnet mittels ${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION}.`, en: `95% CI calculated using ${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_PROPORTION}.`},
            b: {de: `95%-KI berechnet mittels ${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE} (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} Replikationen). AUC ist für binäre Tests äquivalent zur Balanced Accuracy.`, en: `95% CI calculated using ${APP_CONFIG.STATISTICAL_CONSTANTS.DEFAULT_CI_METHOD_EFFECTSIZE} (${APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS} replications). AUC is equivalent to Balanced Accuracy for binary tests.`},
            Ref: {de: 'Ref.: Referenzschlüssel, siehe Literaturverzeichnis.', en: 'Ref.: Reference key, see list of references.'},
            N_A: {de: 'N/A: Nicht verfügbar oder nicht anwendbar.', en: 'N/A: Not available or not applicable.'}
        };
        return _createFullTableHTML(config, rowsData, lang);
    }


    function renderComparisonAST2Table(allKollektivStats, lang, commonData) {
        const configKey = 'comparisonASvsT2';
        const config = { ...PUBLICATION_CONFIG.publicationElements.tables[configKey] };
        const bfOptimizedMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        config.headers = [
            { de: 'Kollektiv', en: 'Cohort' },
            { de: 'Vergleich<sup>a</sup>', en: 'Comparison<sup>a</sup>' },
            { de: 'AUC AS (95%-KI)', en: 'AUC AS (95% CI)' },
            { de: 'AUC T2 (95%-KI)', en: 'AUC T2 (95% CI)' },
            { de: 'Diff. AUC<sup>b</sup> (AS-T2)', en: 'AUC Diff.<sup>b</sup> (AS-T2)' },
            { de: 'DeLong p-Wert (AUC)', en: 'DeLong p-value (AUC)' },
            { de: 'McNemar p-Wert (Acc.)', en: 'McNemar p-value (Acc.)' }
        ];
        const rowsData = [];
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];

        kollektive.forEach(kolId => {
            const asStats = allKollektivStats?.[kolId]?.gueteAS;
            const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                return studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'));
            });
            const litStats = litSetConf ? allKollektivStats?.[kolId]?.gueteT2_literatur?.[litSetConf.id] : null;
            const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
            const bfStats = bfDef ? allKollektivStats?.[kolId]?.gueteT2_bruteforce : null;
            const vergleichASvsLit = litSetConf ? allKollektivStats?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;
            const vergleichASvsBF = bfDef ? allKollektivStats?.[kolId]?.vergleichASvsT2_bruteforce : null;

            if (asStats && litStats && vergleichASvsLit) {
                rowsData.push([
                    getKollektivDisplayName(kolId),
                    `AS vs. ${studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id} [${litSetConf.citationKey}]`,
                    _formatMetricForTableDisplay(asStats.auc, false, 3, lang),
                    _formatMetricForTableDisplay(litStats.auc, false, 3, lang),
                    formatNumber(vergleichASvsLit.delong?.diffAUC, 3, 'N/A', true),
                    _formatPValueForText(vergleichASvsLit.delong?.pValue, lang) + ` ${getStatisticalSignificanceSymbol(vergleichASvsLit.delong?.pValue)}`,
                    _formatPValueForText(vergleichASvsLit.mcnemar?.pValue, lang) + ` ${getStatisticalSignificanceSymbol(vergleichASvsLit.mcnemar?.pValue)}`
                ]);
            }
            if (asStats && bfStats && vergleichASvsBF && bfDef) {
                 rowsData.push([
                    getKollektivDisplayName(kolId),
                    `AS vs. ${lang === 'de' ? 'BF-Opt.' : 'BF-Opt.'} (${bfDef.metricName || bfOptimizedMetric})`,
                    _formatMetricForTableDisplay(asStats.auc, false, 3, lang),
                    _formatMetricForTableDisplay(bfStats.auc, false, 3, lang),
                    formatNumber(vergleichASvsBF.delong?.diffAUC, 3, 'N/A', true),
                    _formatPValueForText(vergleichASvsBF.delong?.pValue, lang) + ` ${getStatisticalSignificanceSymbol(vergleichASvsBF.delong?.pValue)}`,
                    _formatPValueForText(vergleichASvsBF.mcnemar?.pValue, lang) + ` ${getStatisticalSignificanceSymbol(vergleichASvsBF.mcnemar?.pValue)}`
                ]);
            }
        });
        config.footnotes = {
            AS: { de: 'AS: Avocado Sign.', en: 'AS: Avocado Sign.'},
            T2: { de: 'T2: T2-gewichtete Kriterien (Literatur-basiert oder Brute-Force-optimiert).', en: 'T2: T2-weighted criteria (literature-based or brute-force optimized).'},
            BF_Opt: { de: `BF-Opt.: Brute-Force-optimiert für die im Publikations-Tab ausgewählte Metrik (hier: ${bfOptimizedMetric}).`, en: `BF-Opt.: Brute-force optimized for the metric selected in the publication tab (here: ${bfOptimizedMetric}).`},
            a: {de: 'Der Vergleich bezieht sich auf das Avocado Sign versus das jeweils genannte T2-Kriterienset.', en: 'Comparison refers to Avocado Sign versus the respective T2 criteria set mentioned.'},
            b: {de: 'Differenz der AUC-Werte (AUC<sub>AS</sub> - AUC<sub>T2</sub>).', en: 'Difference in AUC values (AUC<sub>AS</sub> - AUC<sub>T2</sub>).'},
            KI: {de: 'KI: Konfidenzintervall.', en: 'CI: Confidence Interval.'},
            Ref: {de: 'Ref.: Referenzschlüssel, siehe Literaturverzeichnis.', en: 'Ref.: Reference key, see list of references.'},
            N_A: {de: 'N/A: Nicht verfügbar oder Test nicht anwendbar.', en: 'N/A: Not available or test not applicable.'}
        };
        return _createFullTableHTML(config, rowsData, lang);
    }


    existingComponents = {
        ...(existingComponents || {}),
        renderPatientCharacteristicsTable,
        renderMRTSequencesTable,
        renderLiteratureT2CriteriaOverviewTable,
        renderPerformanceMetricsTable,
        renderPerformanceLiteratureT2CriteriaTable,
        renderComparisonAST2Table
    };
    return existingComponents;

})(window.publicationTabComponents || {});
