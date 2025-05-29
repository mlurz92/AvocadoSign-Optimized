const publicationTabRenderer = (() => {

    function _formatValueForTable(value, digits = 1, isPercent = false, lang = 'de', placeholder = 'N/A') {
        if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return placeholder;
        if (isPercent) {
            return formatPercent(value, digits, placeholder);
        }
        return formatNumber(value, digits, placeholder, true);
    }

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value) || !isFinite(metricData.value)) return 'N/A';
        return formatCI(metricData.value, metricData.ci?.lower, metricData.ci?.upper, digits, isRate, 'N/A');
    }

    function _createGenericTableHTML(config, rowsData, lang) {
        let tableHTML = `<h4 class="mt-4 mb-3" id="${config.id}-title">${lang === 'de' ? config.titleDe : config.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">`;
        if (config.captionDe && config.captionEn) {
            tableHTML += `<caption>${lang === 'de' ? config.captionDe : config.captionEn}</caption>`;
        }
        tableHTML += `<thead><tr>`;
        config.headers.forEach(header => {
            tableHTML += `<th>${lang === 'de' ? header.de : header.en}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;
        rowsData.forEach(row => {
            tableHTML += `<tr>`;
            row.forEach(cell => {
                tableHTML += `<td>${cell !== null && cell !== undefined ? cell : 'N/A'}</td>`;
            });
            tableHTML += `</tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang) {
        const config = PUBLICATION_CONFIG.publicationElements.tables.patientCharacteristics;
        if (!allKollektivStats || !allKollektivStats.Gesamt?.deskriptiv) return `<p class="text-muted small">Keine ausreichenden Patientendaten für ${lang === 'de' ? config.titleDe : config.titleEn} verfügbar.</p>`;

        const pGesamt = allKollektivStats.Gesamt.deskriptiv;
        const pDirektOP = allKollektivStats['direkt OP']?.deskriptiv || {};
        const pNRCT = allKollektivStats.nRCT?.deskriptiv || {};

        const nGesamt = pGesamt.anzahlPatienten || 0;
        const nDirektOP = pDirektOP.anzahlPatienten || 0;
        const nNRCT = pNRCT.anzahlPatienten || 0;

        config.headers = [
            { de: 'Merkmal', en: 'Characteristic' },
            { de: `${getKollektivDisplayName('Gesamt')} (N=${nGesamt})`, en: `${getKollektivDisplayName('Gesamt')} (n=${nGesamt})` },
            { de: `${getKollektivDisplayName('direkt OP')} (N=${nDirektOP})`, en: `${getKollektivDisplayName('direkt OP')} (n=${nDirektOP})` },
            { de: `${getKollektivDisplayName('nRCT')} (N=${nNRCT})`, en: `${getKollektivDisplayName('nRCT')} (n=${nNRCT})` }
        ];

        const rows = [];
        const fNum = (val, dig = 1) => formatNumber(val, dig, 'N/A', true);
        const fPerc = (count, total, dig = 0) => (total > 0 && count !== undefined && !isNaN(count)) ? `${fNum(count,0)} (${formatPercent(count / total, dig)})` : `${fNum(count,0)} (N/A)`;

        rows.push([
            lang === 'de' ? 'Alter, Median (Spannweite) [Jahre]' : 'Age, Median (Range) [Years]',
            `${fNum(pGesamt.alter?.median)} (${fNum(pGesamt.alter?.min,0)}-${fNum(pGesamt.alter?.max,0)})`,
            `${fNum(pDirektOP.alter?.median)} (${fNum(pDirektOP.alter?.min,0)}-${fNum(pDirektOP.alter?.max,0)})`,
            `${fNum(pNRCT.alter?.median)} (${fNum(pNRCT.alter?.min,0)}-${fNum(pNRCT.alter?.max,0)})`
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
            lang === 'de' ? 'Avocado Sign, positiv [n (%)]' : 'Avocado Sign, positive [n (%)]',
            fPerc(pGesamt.asStatus?.plus, nGesamt),
            fPerc(pDirektOP.asStatus?.plus, nDirektOP),
            fPerc(pNRCT.asStatus?.plus, nNRCT)
        ]);

        return _createGenericTableHTML(config, rows, lang);
    }

    function _renderMRTSequencesTable(lang) {
        const config = PUBLICATION_CONFIG.publicationElements.tables.mrtSequences;
         config.headers = [
            { de: 'Sequenz', en: 'Sequence' },
            { de: 'Ebene', en: 'Plane' },
            { de: 'TR (ms)', en: 'TR (ms)' },
            { de: 'TE (ms)', en: 'TE (ms)' },
            { de: 'Schichtdicke (mm)', en: 'Slice Thickness (mm)' },
            { de: 'Matrix', en: 'Matrix' },
            { de: 'FOV (mm)', en: 'FOV (mm)' }
        ];
        const rowsData = [
            ["T2 TSE", "Sagittal", "4170", "72", "3", "394x448", "220"],
            ["T2 TSE", "Axial", "4400", "81", "2", "380x432", "220"],
            ["T2 TSE", "Koronar", "4400", "81", "2", "280x432", "220"],
            ["DWI", "Axial", "3700", "59", "2", "140x140", "220 (b=100,500,1000 s/mm²)" ],
            ["T1 VIBE Dixon (nach KM)", "Axial", "5.8", "2.5/3.7", "1.5", "206x384", "270"]
        ];
        return _createGenericTableHTML(config, rowsData, lang);
    }


    function _renderLiteraturT2KriterienUebersichtTabelle(lang) {
        const config = PUBLICATION_CONFIG.publicationElements.tables.literatureT2CriteriaOverview;
        config.headers = [
            { de: 'Studie / Kriteriensatz', en: 'Study / Criteria Set' },
            { de: 'Primäres Zielkollektiv (Orig.)', en: 'Primary Target Cohort (Orig.)' },
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
        return _createGenericTableHTML(config, rowsData, lang);
    }

    function _renderPerformanceTable(config, allKollektivStats, statsKey, lang, kollektivIds = ['Gesamt', 'direkt OP', 'nRCT'], methodDisplayName = '') {
        if (!allKollektivStats) return `<p class="text-muted small">Keine Daten für ${lang === 'de' ? config.titleDe : config.titleEn}.</p>`;
        config.headers = [
            { de: 'Kollektiv', en: 'Cohort' },
            { de: 'N', en: 'n' },
            { de: 'Sens. (95%-KI)', en: 'Sens. (95% CI)' },
            { de: 'Spez. (95%-KI)', en: 'Spec. (95% CI)' },
            { de: 'PPV (95%-KI)', en: 'PPV (95% CI)' },
            { de: 'NPV (95%-KI)', en: 'NPV (95% CI)' },
            { de: 'Acc. (95%-KI)', en: 'Acc. (95% CI)' },
            { de: 'AUC (95%-KI)', en: 'AUC (95% CI)' }
        ];
        const rowsData = [];
        kollektivIds.forEach(kolId => {
            const stats = allKollektivStats[kolId]?.[statsKey];
            const nPat = allKollektivStats[kolId]?.deskriptiv?.anzahlPatienten || 0;
            if (stats && stats.matrix && nPat > 0) {
                rowsData.push([
                    getKollektivDisplayName(kolId),
                    nPat,
                    _formatMetricForTable(stats.sens, true, 1, lang),
                    _formatMetricForTable(stats.spez, true, 1, lang),
                    _formatMetricForTable(stats.ppv, true, 1, lang),
                    _formatMetricForTable(stats.npv, true, 1, lang),
                    _formatMetricForTable(stats.acc, true, 1, lang),
                    _formatMetricForTable(stats.auc, false, 3, lang)
                ]);
            } else {
                rowsData.push([getKollektivDisplayName(kolId), nPat, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']);
            }
        });
        let titleDe = config.titleDe;
        let titleEn = config.titleEn;
        if (methodDisplayName) {
            titleDe = titleDe.replace('{BF_METRIC}', methodDisplayName);
            titleEn = titleEn.replace('{BF_METRIC}', methodDisplayName);
        }
        return _createGenericTableHTML({...config, titleDe, titleEn}, rowsData, lang);
    }

    function _renderPerformanceLiteratureT2Table(allKollektivStats, lang) {
        const config = PUBLICATION_CONFIG.publicationElements.tables.performanceLiteratureT2;
         config.headers = [
            { de: 'Kriteriensatz', en: 'Criteria Set' },
            { de: 'Eval. Kollektiv', en: 'Eval. Cohort' },
            { de: 'N', en: 'n' },
            { de: 'Sens. (95%-KI)', en: 'Sens. (95% CI)' },
            { de: 'Spez. (95%-KI)', en: 'Spec. (95% CI)' },
            { de: 'PPV (95%-KI)', en: 'PPV (95% CI)' },
            { de: 'NPV (95%-KI)', en: 'NPV (95% CI)' },
            { de: 'Acc. (95%-KI)', en: 'Acc. (95% CI)' },
            { de: 'AUC (95%-KI)', en: 'AUC (95% CI)' }
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
                        `${studySet.name} [${conf.citationKey}]`,
                        getKollektivDisplayName(targetKollektivForStudy),
                        nPat,
                        _formatMetricForTable(stats.sens, true, 1, lang),
                        _formatMetricForTable(stats.spez, true, 1, lang),
                        _formatMetricForTable(stats.ppv, true, 1, lang),
                        _formatMetricForTable(stats.npv, true, 1, lang),
                        _formatMetricForTable(stats.acc, true, 1, lang),
                        _formatMetricForTable(stats.auc, false, 3, lang)
                    ]);
                } else {
                    rowsData.push([`${studySet.name} [${conf.citationKey}]`, getKollektivDisplayName(targetKollektivForStudy), nPat, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']);
                }
            }
        });
        return _createGenericTableHTML(config, rowsData, lang);
    }

    function _renderComparisonASvsT2Table(allKollektivStats, lang, commonData) {
        const config = PUBLICATION_CONFIG.publicationElements.tables.comparisonASvsT2;
        const bfOptimizedMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        config.headers = [
            { de: 'Kollektiv', en: 'Cohort' },
            { de: 'Vergleich', en: 'Comparison' },
            { de: 'AUC Methode 1 (95%-KI)', en: 'AUC Method 1 (95% CI)' },
            { de: 'AUC Methode 2 (95%-KI)', en: 'AUC Method 2 (95% CI)' },
            { de: 'Diff. AUC (M1-M2)', en: 'AUC Diff. (M1-M2)' },
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
                    _formatMetricForTable(asStats.auc, false, 3, lang),
                    _formatMetricForTable(litStats.auc, false, 3, lang),
                    formatNumber(vergleichASvsLit.delong?.diffAUC, 3, 'N/A', true),
                    _formatPValueForText(vergleichASvsLit.delong?.pValue, lang) + ` ${getStatisticalSignificanceSymbol(vergleichASvsLit.delong?.pValue)}`,
                    _formatPValueForText(vergleichASvsLit.mcnemar?.pValue, lang) + ` ${getStatisticalSignificanceSymbol(vergleichASvsLit.mcnemar?.pValue)}`
                ]);
            }
            if (asStats && bfStats && vergleichASvsBF && bfDef) {
                 rowsData.push([
                    getKollektivDisplayName(kolId),
                    `AS vs. BF-Opt. (${bfDef.metricName || bfOptimizedMetric})`,
                    _formatMetricForTable(asStats.auc, false, 3, lang),
                    _formatMetricForTable(bfStats.auc, false, 3, lang),
                    formatNumber(vergleichASvsBF.delong?.diffAUC, 3, 'N/A', true),
                    _formatPValueForText(vergleichASvsBF.delong?.pValue, lang) + ` ${getStatisticalSignificanceSymbol(vergleichASvsBF.delong?.pValue)}`,
                    _formatPValueForText(vergleichASvsBF.mcnemar?.pValue, lang) + ` ${getStatisticalSignificanceSymbol(vergleichASvsBF.mcnemar?.pValue)}`
                ]);
            }
        });
        return _createGenericTableHTML(config, rowsData, lang);
    }


    function renderSectionContent(sectionId, lang, allKollektivStats, commonDataFromLogic, options = {}) {
        if (!sectionId || !lang || !allKollektivStats || !commonDataFromLogic) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv, bruteForceMetric } = options;
        const commonData = {
            ...commonDataFromLogic,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
            bruteForceMetricForPublication: bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            references: PUBLICATION_CONFIG.referenceManagement.references.reduce((acc, ref) => { acc[ref.key] = ref.text; return acc; }, {})
        };

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections || mainSectionConfig.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSectionConfig.labelKey] || mainSectionConfig.labelKey}</h1>`;

        mainSectionConfig.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h2 class="mb-3 h4">${lang === 'de' ? subSection.titleDe : subSection.titleEn}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_bildakquisition') {
                combinedHtml += _renderMRTSequencesTable(lang);
            } else if (subSection.id === 'methoden_bildanalyse') {
                combinedHtml += _renderLiteraturT2KriterienUebersichtTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                const figConsort = PUBLICATION_CONFIG.publicationElements.figures.consortDiagram;
                const figAvocado = PUBLICATION_CONFIG.publicationElements.figures.avocadoSignExamples;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${figConsort.id}"><h5 class="text-center small mb-1">${lang==='de'?figConsort.titleDe:figConsort.titleEn}</h5><p class="text-muted small text-center p-1">${figConsort.numberPlaceholder.replace('Fig','Abbildung')}</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${figAvocado.id}"><h5 class="text-center small mb-1">${lang==='de'?figAvocado.titleDe:figAvocado.titleEn}</h5><p class="text-muted small text-center p-1">${figAvocado.numberPlaceholder.replace('Fig','Abbildung')}</p></div></div>`;
                combinedHtml += '</div>';
            } else if (subSection.id === 'ergebnisse_as_performance') {
                combinedHtml += _renderPerformanceTable(PUBLICATION_CONFIG.publicationElements.tables.performanceAS, allKollektivStats, 'gueteAS', lang);
            } else if (subSection.id === 'ergebnisse_literatur_t2_performance') {
                combinedHtml += _renderPerformanceLiteratureT2Table(allKollektivStats, lang);
            } else if (subSection.id === 'ergebnisse_optimierte_t2_performance') {
                combinedHtml += _renderPerformanceTable(PUBLICATION_CONFIG.publicationElements.tables.performanceOptimizedT2, allKollektivStats, 'gueteT2_bruteforce', lang, ['Gesamt', 'direkt OP', 'nRCT'], commonData.bruteForceMetricForPublication);
            } else if (subSection.id === 'ergebnisse_vergleich_as_vs_t2') {
                combinedHtml += _renderComparisonASvsT2Table(allKollektivStats, lang, commonData);
                 combinedHtml += '<div class="row mt-4 g-3">';
                 const chartElementsConfig = [
                    PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonOverall,
                    PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonDirektOP,
                    PUBLICATION_CONFIG.publicationElements.figures.performanceComparisonNRCT
                 ];
                 const rocConfig = PUBLICATION_CONFIG.publicationElements.figures.rocCurvesComparison;
                 combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${rocConfig.id}"><h5 class="text-center small mb-1">${lang==='de'?rocConfig.titleDe:rocConfig.titleEn}</h5><p class="text-muted small text-center p-1">${rocConfig.numberPlaceholder.replace('Fig','Abbildung')}</p></div></div>`;

                 chartElementsConfig.forEach((chartConfig) => {
                    const chartTitleText = lang === 'de' ? chartConfig.titleDe : chartConfig.titleEn;
                    const figRef = chartConfig.numberPlaceholder.replace('Fig', lang==='de'?'Abbildung':'Figure');
                    combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${chartConfig.id}"><h5 class="text-center small mb-1">${chartTitleText}</h5><p class="text-muted small text-center p-1">${figRef}</p></div></div>`;
                 });
                 combinedHtml += '</div>';
            }
            combinedHtml += `</div>`;
        });

        combinedHtml += `</div>`;
        return combinedHtml;
    }

    return Object.freeze({
        renderSectionContent
    });

})();
