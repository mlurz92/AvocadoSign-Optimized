const publicationRenderer = (() => {

    function _getLang() {
        return (typeof state !== 'undefined' && state.getCurrentPublikationLang) ? state.getCurrentPublikationLang() : 'de';
    }

    function _getText(textObjPath, lang, replacements = {}) {
        const textObj = getObjectValueByPath(UI_TEXTS, textObjPath);
        let text = 'N/A Text Key: ' + textObjPath;

        if (textObj) {
            if (typeof textObj === 'string') {
                text = textObj;
            } else if (textObj[lang]) {
                text = textObj[lang];
            } else if (textObj['de']) {
                text = textObj['de']; // Fallback to German
            } else if (typeof Object.values(textObj)[0] === 'string') {
                text = Object.values(textObj)[0]; // Fallback to first available string
            }
        }

        for (const key in replacements) {
            text = text.replace(new RegExp(`{${key.toUpperCase()}}`, 'g'), replacements[key]);
        }
        return text;
    }

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return _getText('publikationTab.publicationMisc.notApplicableShort', lang);

        const formatSingleValue = (val, d, isP) => {
            if (isP) {
                return formatPercent(val, d, _getText('publikationTab.publicationMisc.notApplicableShort', lang));
            } else {
                let numStr = formatNumber(val, d, _getText('publikationTab.publicationMisc.notApplicableShort', lang), true);
                if (lang === 'de' && numStr !== _getText('publikationTab.publicationMisc.notApplicableShort', lang) && typeof numStr === 'string') {
                    numStr = numStr.replace('.', ',');
                }
                return numStr;
            }
        };

        const valStr = formatSingleValue(metricData.value, digits, isRate);

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isRate);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isRate);
            const ciLabel = lang === 'en' ? '95% CI' : '95% KI';
            return `${valStr} (${ciLabel}: ${lowerStr}–${upperStr})`;
        }
        return valStr;
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        const tableTitle = _getText(`publikationTab.publicationTableTitles.${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.labelKey}`, lang);
        let tableHTML = `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id}">
            <thead>
                <tr>
                    <th>${_getText('publikationTab.publicationMisc.criteriaSet', lang)}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv (Orig.)' : 'Primary Target Cohort (Orig.)'}</th>
                    <th>${lang === 'de' ? 'Kernkriterien (Kurzfassung)' : 'Core Criteria (Summary)'}</th>
                    <th>${lang === 'de' ? 'Logik' : 'Logic'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studySet.logic === 'KOMBINIERT' ?
                    (studySet.studyInfo?.keyCriteriaSummary || studySet.description) :
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false); // formatCriteriaForDisplay ist noch nicht sprachabhängig

                const logicDisplay = UI_TEXTS.t2LogicDisplayNames[studySet.logic] ? _getText(`t2LogicDisplayNames.${studySet.logic}`, lang) : studySet.logic;

                tableHTML += `<tr>
                                <td>${studySet.name}</td>
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv, lang)} (${studySet.context})</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${logicDisplay}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang) {
        const noDataText = _getText('publikationTab.publicationMisc.noData', lang);
        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">${noDataText}</p>`;

        const tableTitle = _getText(`publikationTab.publicationTableTitles.${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.labelKey}`, lang);
        let tableHTML = `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt', lang)} (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP', lang)} (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('nRCT', lang)} (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = _getText('publikationTab.publicationMisc.notApplicableShort', lang)) => formatNumber(val, dig, placeholder, lang === 'en');
        const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null) ? formatPercent(count / total, dig) : _getText('publikationTab.publicationMisc.notApplicableShort', lang);

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            const pGesamt = allKollektivStats.Gesamt?.deskriptiv;
            const pDirektOP = allKollektivStats['direkt OP']?.deskriptiv;
            const pNRCT = allKollektivStats.nRCT?.deskriptiv;
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${pGesamt ? getterGesamt(pGesamt) : _getText('publikationTab.publicationMisc.notApplicableShort', lang)}</td>
                            <td>${pDirektOP ? getterDirektOP(pDirektOP) : _getText('publikationTab.publicationMisc.notApplicableShort', lang)}</td>
                            <td>${pNRCT ? getterNRCT(pNRCT) : _getText('publikationTab.publicationMisc.notApplicableShort', lang)}</td>
                          </tr>`;
        };

        addRow('Alter, Median (Min–Max) [Jahre]', 'Age, Median (Min–Max) [Years]',
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`
        );
        addRow('Geschlecht, männlich [n (%)]', 'Sex, male [n (%)]',
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`
        );
        addRow('Pathologischer N-Status, positiv [n (%)]', 'Pathological N-Status, positive [n (%)]',
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, options) {
        const noDataText = _getText('publikationTab.publicationMisc.noData', lang);
        if (!allKollektivStats) return `<p class="text-muted small">${noDataText}</p>`;

        let tableHTML = '';
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetric = options.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        let tableIdSuffix = '', tableTitleKey = '';

        const renderTableRows = (methodName, statsGetter) => {
            let rows = '';
            kollektive.forEach(kolId => {
                const stats = statsGetter(kolId);
                const nPat = stats?.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
                 if (stats && nPat > 0) {
                    rows += `<tr>
                                <td>${methodName}</td>
                                <td>${getKollektivDisplayName(kolId, lang)} (N=${nPat})</td>
                                <td>${_formatMetricForTable(stats.sens, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.spez, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.ppv, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.npv, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.acc, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.auc, false, 3, lang)}</td>
                              </tr>`;
                } else {
                     rows += `<tr>
                                <td>${methodName}</td>
                                <td>${getKollektivDisplayName(kolId, lang)}</td>
                                <td colspan="6" class="text-center text-muted small"><em>${_getText('publikationTab.publicationMisc.noValidData', lang)}</em></td>
                              </tr>`;
                }
            });
            return rows;
        };

        const renderSingleKollektivTableRows = (methodName, kolId, stats) => {
            let rows = '';
            const nPat = stats?.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
            if (stats && nPat > 0) {
                 rows += `<tr>
                            <td>${methodName}</td>
                            <td>${getKollektivDisplayName(kolId, lang)} (N=${nPat})</td>
                            <td>${_formatMetricForTable(stats.sens, true, 1, lang)}</td>
                            <td>${_formatMetricForTable(stats.spez, true, 1, lang)}</td>
                            <td>${_formatMetricForTable(stats.ppv, true, 1, lang)}</td>
                            <td>${_formatMetricForTable(stats.npv, true, 1, lang)}</td>
                            <td>${_formatMetricForTable(stats.acc, true, 1, lang)}</td>
                            <td>${_formatMetricForTable(stats.auc, false, 3, lang)}</td>
                          </tr>`;
            } else {
                 rows += `<tr>
                            <td>${methodName}</td>
                            <td>${getKollektivDisplayName(kolId, lang)}</td>
                            <td colspan="6" class="text-center text-muted small"><em>${_getText('publikationTab.publicationMisc.noValidData', lang)}</em></td>
                          </tr>`;
            }
            return rows;
        }

        const tableHeaders = `<thead><tr>
            <th>${_getText('publikationTab.publicationMisc.method', lang)}</th>
            <th>${_getText('publikationTab.publicationMisc.cohort', lang)}</th>
            <th>Sens. (95% CI)</th><th>Spez. (95% CI)</th><th>PPV (95% CI)</th>
            <th>NPV (95% CI)</th><th>Acc. (95% CI)</th><th>AUC (95% CI)</th>
            </tr></thead>`;

        if (sectionId === 'ergebnisse_as_performance') {
            tableIdSuffix = 'as';
            tableTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.labelKey;
            tableHTML += `<h4 class="mt-4 mb-3">${_getText(`publikationTab.publicationTableTitles.${tableTitleKey}`, lang)}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id}">${tableHeaders}<tbody>`;
            tableHTML += renderTableRows(_getText('kollektivDisplayNames.avocado_sign', lang), (kolId) => allKollektivStats?.[kolId]?.gueteAS);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            tableIdSuffix = 'literatur';
            tableTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturTabelle.labelKey;
            const headerCriteriaSet = `<th>${_getText('publikationTab.publicationMisc.criteriaSet', lang)}</th>`;
            const headerAppliedCohort = `<th>${_getText('publikationTab.publicationMisc.appliedCohort', lang)}</th>`;
            const literatureTableHeaders = `<thead><tr>${headerCriteriaSet}${headerAppliedCohort}<th>Sens. (95% CI)</th><th>Spez. (95% CI)</th><th>PPV (95% CI)</th><th>NPV (95% CI)</th><th>Acc. (95% CI)</th><th>AUC (95% CI)</th></tr></thead>`;

            tableHTML += `<h4 class="mt-4 mb-3">${_getText(`publikationTab.publicationTableTitles.${tableTitleKey}`, lang)}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturTabelle.id}">${literatureTableHeaders}<tbody>`;
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if(studySet){
                    const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                    const stats = allKollektivStats?.[targetKollektiv]?.gueteT2_literatur?.[conf.id];
                    tableHTML += renderSingleKollektivTableRows(studySet.name, targetKollektiv, stats);
                }
            });
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            tableIdSuffix = 'bf';
            tableTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteBFTabelle.labelKey;
            const headerOptimizationTarget = `<th>${_getText('publikationTab.publicationMisc.optimizationTarget', lang)}</th>`;
            const bfTableHeaders = `<thead><tr>${headerOptimizationTarget}<th>${_getText('publikationTab.publicationMisc.cohort', lang)}</th><th>Sens. (95% CI)</th><th>Spez. (95% CI)</th><th>PPV (95% CI)</th><th>NPV (95% CI)</th><th>Acc. (95% CI)</th><th>AUC (95% CI)</th></tr></thead>`;

            tableHTML += `<h4 class="mt-4 mb-3">${_getText(`publikationTab.publicationTableTitles.${tableTitleKey}`, lang, { METRIC: bfZielMetric })}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteBFTabelle.id}">${bfTableHeaders}<tbody>`;
            tableHTML += renderTableRows(`${_getText('publikationTab.publicationMisc.optimizationTarget', lang)} ${bfZielMetric}`, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
             tableIdSuffix = 'vergleich';
             tableTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichTabelle.labelKey;
             const comparisonTableHeaders = `<thead><tr>
                    <th>${_getText('publikationTab.publicationMisc.comparison', lang)}</th>
                    <th>${_getText('publikationTab.publicationMisc.cohort', lang)}</th>
                    <th>${lang==='de'?'Methode 1':'Method 1'} (AUC)</th>
                    <th>${lang==='de'?'Methode 2':'Method 2'} (AUC)</th>
                    <th>${_getText('publikationTab.publicationMisc.aucDiff', lang)}</th>
                    <th>${_getText('publikationTab.publicationMisc.pValueAUC', lang)}</th>
                    <th>${_getText('publikationTab.publicationMisc.pValueAcc', lang)}</th>
                </tr></thead>`;

             tableHTML += `<h4 class="mt-4 mb-3">${_getText(`publikationTab.publicationTableTitles.${tableTitleKey}`, lang)}</h4>`;
             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichTabelle.id}">${comparisonTableHeaders}<tbody>`;

            kollektive.forEach(kolId => {
                const asStats = allKollektivStats?.[kolId]?.gueteAS;
                const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => studyT2CriteriaManager.getStudyCriteriaSetById(lc.id)?.applicableKollektiv === kolId || (kolId === 'Gesamt' && studyT2CriteriaManager.getStudyCriteriaSetById(lc.id)?.applicableKollektiv === 'Gesamt'));
                const litStats = litSetConf ? allKollektivStats?.[kolId]?.gueteT2_literatur?.[litSetConf.id] : null;
                const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;

                const vergleichASvsLit = litSetConf ? allKollektivStats?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;
                const vergleichASvsBF = allKollektivStats?.[kolId]?.vergleichASvsT2_bruteforce;

                let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, _getText('publikationTab.publicationMisc.notApplicableShort', lang), true);
                if (lang === 'de' && diffAucLitStr !== _getText('publikationTab.publicationMisc.notApplicableShort', lang)) diffAucLitStr = diffAucLitStr.replace('.', ',');

                let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, _getText('publikationTab.publicationMisc.notApplicableShort', lang), true);
                if (lang === 'de' && diffAucBfStr !== _getText('publikationTab.publicationMisc.notApplicableShort', lang)) diffAucBfStr = diffAucBfStr.replace('.', ',');

                if (asStats && litStats && vergleichASvsLit) {
                    tableHTML += `<tr>
                        <td>AS vs. ${lang==='de'?'Literatur':'Literature'} (${studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id})</td>
                        <td>${getKollektivDisplayName(kolId, lang)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                        <td>${lang==='de'?'Lit.':'Lit.'} (${_formatMetricForTable(litStats.auc, false, 3, lang)})</td>
                        <td>${diffAucLitStr}</td>
                        <td>${getPValueText(vergleichASvsLit.delong?.pValue, lang)}</td>
                        <td>${getPValueText(vergleichASvsLit.mcnemar?.pValue, lang)}</td>
                    </tr>`;
                }
                 if (asStats && bfStats && vergleichASvsBF && bfDef) {
                     tableHTML += `<tr>
                        <td>AS vs. BF-${lang==='de'?'Optimiert':'Optimized'} (${bfDef.metricName})</td>
                        <td>${getKollektivDisplayName(kolId, lang)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                        <td>BF (${_formatMetricForTable(bfStats.auc, false, 3, lang)})</td>
                        <td>${diffAucBfStr}</td>
                        <td>${getPValueText(vergleichASvsBF.delong?.pValue, lang)}</td>
                        <td>${getPValueText(vergleichASvsBF.mcnemar?.pValue, lang)}</td>
                    </tr>`;
                 }
            });
            tableHTML += `</tbody></table></div>`;
        }
        return tableHTML;
    }


    function renderSectionContent(sectionId, lang, publicationData, kollektiveData, options = {}) {
        const noDataText = _getText('publikationTab.publicationMisc.noData', lang);
        if (!sectionId || !lang || !publicationData || !kollektiveData) {
            return `<p class="text-danger">${_getText('publikationTab.publicationMisc.noData', lang)}</p>`;
        }

        const { currentKollektiv, bruteForceMetric } = options;
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: getKollektivDisplayName(currentKollektiv, lang),
            nGesamt: kollektiveData.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: kollektiveData['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: kollektiveData.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: {
                lurzSchaefer2025: "Lurz & Schäfer (2025)",
                koh2008: "Koh et al. (2008)",
                barbaro2024: "Barbaro et al. (2024)",
                rutegard2025: "Rutegård et al. (2025)",
                beetsTan2018ESGAR: "ESGAR Consensus (Beets-Tan et al. 2018)"
            }
        };

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections || mainSectionConfig.subSections.length === 0) {
            return `<p class="text-warning">${_getText('publikationTab.publicationMisc.noData', lang)} (Sektion ${sectionId})</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${_getText(`publikationTab.sectionLabels.${mainSectionConfig.labelKey}`, lang)}</h1>`;

        mainSectionConfig.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h2 class="mb-3 h4">${_getText(`publikationTab.subSectionLabels.${subSection.labelKey}`, lang)}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, publicationData, kollektiveData, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">${noDataText}</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(kollektiveData, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                const chartTitleAge = _getText(`publikationTab.publicationChartTitles.${PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungGesamtChart.labelKey}`, lang);
                const chartTitleGender = _getText(`publikationTab.publicationChartTitles.${PUBLICATION_CONFIG.publicationElements.ergebnisse.genderVerteilungGesamtChart.labelKey}`, lang);
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungGesamtChart.id}"><h5 class="text-center small mb-1">${chartTitleAge}</h5><p class="text-muted small text-center p-1">${_getText('publikationTab.publicationFigureCaptions.fig1a', lang)}</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.genderVerteilungGesamtChart.id}"><h5 class="text-center small mb-1">${chartTitleGender}</h5><p class="text-muted small text-center p-1">${_getText('publikationTab.publicationFigureCaptions.fig1b', lang)}</p></div></div>`;
                combinedHtml += '</div>';
            } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                combinedHtml += _renderDiagnostischeGueteTabellen(kollektiveData, lang, subSection.id, options);
                if (subSection.id === 'ergebnisse_vergleich_performance') {
                     combinedHtml += '<div class="row mt-4 g-3">';
                     const chartConfigs = [
                         PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichMetrikenGesamtChart,
                         PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichMetrikenDirektOPChart,
                         PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichMetrikenNRCTChart
                     ];
                     const figCaptions = ['fig2a', 'fig2b', 'fig2c'];
                     const cohortMap = { 'Gesamt': 'Gesamt', 'direkt-OP': 'direkt OP', 'nRCT': 'nRCT' };

                     chartConfigs.forEach((chartConf, index) => {
                        const cohortKey = Object.keys(cohortMap).find(key => chartConf.id.includes(key));
                        const cohortDisplayName = getKollektivDisplayName(cohortMap[cohortKey] || 'Gesamt', lang);
                        const chartTitle = _getText(`publikationTab.publicationChartTitles.${chartConf.labelKey}`, lang, { COHORT: cohortDisplayName });
                        const figRef = _getText(`publikationTab.publicationFigureCaptions.${figCaptions[index]}`, lang);
                        combinedHtml += `<div class="col-md-4"><div class="chart-container border rounded p-2" id="${chartConf.id}"><h5 class="text-center small mb-1">${chartTitle}</h5><p class="text-muted small text-center p-1">${figRef}</p></div></div>`;
                     });
                     combinedHtml += '</div>';
                }
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
