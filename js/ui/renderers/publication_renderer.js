const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) {
            return getUiTexts(lang).misc?.notAvailable || 'N/A';
        }

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val)) return getUiTexts(lang).misc?.notAvailable || 'N/A';
            if (isP) {
                return formatPercent(val, d, '--%', lang);
            } else {
                return formatNumber(val, d, '--', true, lang); // useStandardFormat true for consistency within CI
            }
        };

        const valStr = formatSingleValue(metricData.value, digits, isRate);

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isRate);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isRate);
            return `${valStr} (${lowerStr}–${upperStr})`;
        }
        return valStr;
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        const langUiTexts = getUiTexts(lang);
        const pubTabTexts = langUiTexts.publikationTab || {};
        const tableHeaders = langUiTexts.publicationTableHeaders || {};
        const studyNames = langUiTexts.studyNames || {};

        const titleKey = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.titleKey;
        let tableHTML = `<h4 class="mt-4 mb-3">${pubTabTexts.publicationTableTitles?.[titleKey] || titleKey}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id}">
            <thead>
                <tr>
                    <th>${tableHeaders.studySet || 'Studie / Kriteriensatz'}</th>
                    <th>${tableHeaders.primaryTargetCohort || 'Primäres Zielkollektiv (Orig.)'}</th>
                    <th>${tableHeaders.coreCriteria || 'Kernkriterien (Kurzfassung)'}</th>
                    <th>${tableHeaders.logic || 'Logik'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studySet.logic === 'KOMBINIERT' ?
                    (studySet.studyInfo?.keyCriteriaSummary || studySet.description) : // studyInfo.keyCriteriaSummary sollte sprachabhängig sein, wenn es UI_TEXT ist
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false);

                tableHTML += `<tr>
                                <td>${studyNames[studySet.nameKey] || studySet.nameKey}</td>
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv, lang)} (${studySet.context})</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${langUiTexts.t2LogicDisplayNames?.[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang) {
        const langUiTexts = getUiTexts(lang);
        const pubTabTexts = langUiTexts.publikationTab || {};
        const tableHeaders = langUiTexts.publicationTableHeaders || {};
        const naString = langUiTexts.misc?.notAvailable || 'N/A';

        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) {
            return `<p class="text-muted small">${pubTabTexts.noPatientDataForTable || 'Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.'}</p>`;
        }

        const titleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleKey;
        let tableHTML = `<h4 class="mt-4 mb-3">${pubTabTexts.publicationTableTitles?.[titleKey] || titleKey}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${tableHeaders.characteristic || 'Merkmal'}</th>
                    <th>${(tableHeaders.overall || 'Gesamt (N={N_GESAMT})').replace('{N_GESAMT}', allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0)}</th>
                    <th>${(tableHeaders.surgeryAlone || 'Direkt OP (N={N_SURGERY})').replace('{N_SURGERY}', allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0)}</th>
                    <th>${(tableHeaders.nRCT || 'nRCT (N={N_NRCT})').replace('{N_NRCT}', allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0)}</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = naString) => formatNumber(val, dig, placeholder, false, lang); // useStandardFormat false for locale specific formatting
        const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null) ? formatPercent(count / total, dig, '--%', lang) : naString;

        const addRow = (labelKey, getterGesamt, getterDirektOP, getterNRCT) => {
            const pGesamt = allKollektivStats.Gesamt?.deskriptiv;
            const pDirektOP = allKollektivStats['direkt OP']?.deskriptiv;
            const pNRCT = allKollektivStats.nRCT?.deskriptiv;
            tableHTML += `<tr>
                            <td>${tableHeaders[labelKey] || labelKey}</td>
                            <td>${pGesamt ? getterGesamt(pGesamt) : naString}</td>
                            <td>${pDirektOP ? getterDirektOP(pDirektOP) : naString}</td>
                            <td>${pNRCT ? getterNRCT(pNRCT) : naString}</td>
                          </tr>`;
        };

        addRow('ageMedian',
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`
        );
        addRow('sexMale',
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`
        );
        addRow('pathNStatusPositive',
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, currentKollektivForCharts) {
        const langUiTexts = getUiTexts(lang);
        const pubTabTexts = langUiTexts.publikationTab || {};
        const tableHeaders = langUiTexts.publicationTableHeaders || {};
        const naString = langUiTexts.misc?.notAvailable || 'N/A';

        if (!allKollektivStats) return `<p class="text-muted small">${pubTabTexts.noPerformanceData || 'Keine Gütedaten für diese Sektion verfügbar.'}</p>`;
        let tableHTML = '';
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetric = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

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
                                <td colspan="6" class="text-center text-muted small"><em>${langUiTexts.noValidData || 'Keine validen Daten'}</em></td>
                              </tr>`;
                }
            });
            return rows;
        };

        const renderSingleKollektivTableRows = (methodNameKey, kolId, stats) => {
            let rows = '';
            const methodName = (langUiTexts.studyNames || {})[methodNameKey] || methodNameKey;
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
                            <td colspan="6" class="text-center text-muted small"><em>${langUiTexts.noValidDataOrNotApplicable || 'Keine validen Daten oder nicht anwendbar'}</em></td>
                          </tr>`;
            }
            return rows;
        }

        let tableTitleKey = '';
        let tableId = '';
        let tableBodyContent = '';

        if (sectionId === 'ergebnisse_as_performance') {
            tableTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleKey;
            tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id;
            tableBodyContent = renderTableRows(langUiTexts.kollektivDisplayNames?.avocado_sign || 'Avocado Sign', (kolId) => allKollektivStats?.[kolId]?.gueteAS);
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            tableTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleKey;
            tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if(studySet){
                    const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                    const stats = allKollektivStats?.[targetKollektiv]?.gueteT2_literatur?.[conf.id];
                    tableBodyContent += renderSingleKollektivTableRows(studySet.nameKey, targetKollektiv, stats);
                }
            });
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            tableTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleKey;
            tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
            const optimizedForText = (langUiTexts.publicationTableContent?.optimizedFor || 'Optimiert für {METRIC}').replace('{METRIC}', (langUiTexts.bruteForceMetricLabels?.[bfZielMetric.replace(/\s/g, '').toLowerCase()] || bfZielMetric));
            tableBodyContent = renderTableRows(optimizedForText, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce);
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
             tableTitleKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.statVergleichAST2Tabelle.titleKey;
             tableId = PUBLICATION_CONFIG.publicationElements.ergebnisse.statVergleichAST2Tabelle.id;
             tableHTML += `<h4 class="mt-4 mb-3">${(pubTabTexts.publicationTableTitles?.[tableTitleKey] || tableTitleKey)}</h4>`;
             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}">
                <thead><tr>
                    <th>${tableHeaders.comparison || 'Vergleich'}</th>
                    <th>${tableHeaders.cohort || 'Kollektiv'}</th>
                    <th>${tableHeaders.method1AUC || 'Methode 1 (AUC)'}</th>
                    <th>${tableHeaders.method2AUC || 'Methode 2 (AUC)'}</th>
                    <th>${tableHeaders.aucDiffM1M2 || 'Diff. AUC (M1-M2)'}</th>
                    <th>${tableHeaders.delongPValueAUC || 'DeLong p-Wert (AUC)'}</th>
                    <th>${tableHeaders.mcNemarPValueAcc || 'McNemar p-Wert (Acc.)'}</th>
                </tr></thead><tbody>`;

            kollektive.forEach(kolId => {
                const asStats = allKollektivStats?.[kolId]?.gueteAS;
                const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => studyT2CriteriaManager.getStudyCriteriaSetById(lc.id)?.applicableKollektiv === kolId || (kolId === 'Gesamt' && studyT2CriteriaManager.getStudyCriteriaSetById(lc.id)?.applicableKollektiv === 'Gesamt'));
                const litStats = litSetConf ? allKollektivStats?.[kolId]?.gueteT2_literatur?.[litSetConf.id] : null;
                const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;

                const vergleichASvsLit = litSetConf ? allKollektivStats?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;
                const vergleichASvsBF = allKollektivStats?.[kolId]?.vergleichASvsT2_bruteforce;

                const diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, naString, true, lang);
                const diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, naString, true, lang);
                const studyShortNames = langUiTexts.studyShortNames || {};

                if (asStats && litStats && vergleichASvsLit) {
                    tableHTML += `<tr>
                        <td>AS vs. ${studyShortNames[litSetConf.shortNameKey] || litSetConf.shortNameKey}</td>
                        <td>${getKollektivDisplayName(kolId, lang)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                        <td>${studyShortNames[litSetConf.shortNameKey] || litSetConf.shortNameKey} (${_formatMetricForTable(litStats.auc, false, 3, lang)})</td>
                        <td>${diffAucLitStr}</td>
                        <td>${getPValueText(vergleichASvsLit.delong?.pValue, lang)}</td>
                        <td>${getPValueText(vergleichASvsLit.mcnemar?.pValue, lang)}</td>
                    </tr>`;
                }
                 if (asStats && bfStats && vergleichASvsBF && bfDef) {
                     const bfMetricDisplayName = (langUiTexts.bruteForceMetricLabels?.[bfDef.metricName.replace(/\s/g, '').toLowerCase()] || bfDef.metricName);
                     tableHTML += `<tr>
                        <td>AS vs. BF-${(langUiTexts.publicationTableContent?.optimizedShort || 'Opt.')} (${bfMetricDisplayName})</td>
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
            return tableHTML;
        }

        if (tableTitleKey && tableId && tableBodyContent) {
            tableHTML += `<h4 class="mt-4 mb-3">${(pubTabTexts.publicationTableTitles?.[tableTitleKey] || tableTitleKey).replace('{METRIC}', (langUiTexts.bruteForceMetricLabels?.[bfZielMetric.replace(/\s/g, '').toLowerCase()] || bfZielMetric) )}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}"><thead><tr>
                            <th>${tableHeaders.method || (sectionId === 'ergebnisse_literatur_t2_performance' ? tableHeaders.criteriaSet : 'Methode')}</th>
                            <th>${tableHeaders.cohort || (sectionId === 'ergebnisse_literatur_t2_performance' ? tableHeaders.appliedCohort : 'Kollektiv')}</th>
                            <th>${tableHeaders.sensitivityCI || 'Sens. (95% CI)'}</th>
                            <th>${tableHeaders.specificityCI || 'Spez. (95% CI)'}</th>
                            <th>${tableHeaders.ppvCI || 'PPV (95% CI)'}</th>
                            <th>${tableHeaders.npvCI || 'NPV (95% CI)'}</th>
                            <th>${tableHeaders.accuracyCI || 'Acc. (95% CI)'}</th>
                            <th>${tableHeaders.aucCI || 'AUC (95% CI)'}</th>
                            </tr></thead><tbody>${tableBodyContent}</tbody></table></div>`;
        }
        return tableHTML;
    }


    function renderSectionContent(sectionId, lang, publicationData, kollektiveData, options = {}) {
        const langUiTexts = getUiTexts(lang);
        const pubTabTexts = langUiTexts.publikationTab || {};
        const sectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);

        if (!sectionId || !lang || !publicationData || !kollektiveData || !sectionConfig) {
            return `<p class="text-danger">${langUiTexts.error?.general || 'Fehler: Notwendige Daten für die Sektionsanzeige fehlen.'}</p>`;
        }

        const { currentKollektiv } = options; // currentKollektiv for chart context, if needed
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
            references: { // These should ideally also come from a translatable source if displayed
                lurzSchaefer2025: "Lurz & Schäfer (2025)",
                koh2008: "Koh et al. (2008)",
                barbaro2024: "Barbaro et al. (2024)",
                rutegard2025: "Rutegård et al. (2025)",
                beetsTan2018ESGAR: "ESGAR Consensus (Beets-Tan et al. 2018)"
            }
        };

        if (!sectionConfig.subSections || sectionConfig.subSections.length === 0) {
            return `<p class="text-warning">${(pubTabTexts.noSubsectionsDefined || 'Keine Unterabschnitte für Hauptabschnitt \'{SECTION_ID}\' definiert.').replace('{SECTION_ID}', sectionId)}</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${pubTabTexts.sectionLabels?.[sectionConfig.labelKey] || sectionConfig.labelKey}</h1>`;

        sectionConfig.subSections.forEach(subSection => {
            const subSectionLabel = (pubTabTexts.subSectionLabels || {})[subSection.labelKey] || subSection.labelKey;
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h2 class="mb-3 h4">${subSectionLabel}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, publicationData, kollektiveData, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">${(langUiTexts.contentGenerationPending || 'Inhalt für diesen Unterabschnitt (ID: {SUB_SECTION_ID}, Sprache: {LANG}) wird noch generiert.').replace('{SUB_SECTION_ID}', subSection.id).replace('{LANG}', lang)}</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(kollektiveData, lang);
                const ageChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaAlterChart;
                const genderChartConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaGeschlechtChart;
                const ageChartTitle = (pubTabTexts.chartTitles?.[ageChartConfig.titleKey] || ageChartConfig.titleKey).replace('{KOLLEKTIV}', getKollektivDisplayName("Gesamt", lang));
                const ageFigCaption = (pubTabTexts.publicationFigureCaptions?.[ageChartConfig.titleKey] || ageChartConfig.titleKey).replace('{KOLLEKTIV}', getKollektivDisplayName("Gesamt", lang));
                const genderChartTitle = (pubTabTexts.chartTitles?.[genderChartConfig.titleKey] || genderChartConfig.titleKey).replace('{KOLLEKTIV}', getKollektivDisplayName("Gesamt", lang));
                const genderFigCaption = (pubTabTexts.publicationFigureCaptions?.[genderChartConfig.titleKey] || genderChartConfig.titleKey).replace('{KOLLEKTIV}', getKollektivDisplayName("Gesamt", lang));

                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${ageChartConfig.id}"><h5 class="text-center small mb-1">${ageChartTitle}</h5><p class="text-muted small text-center p-1">${ageFigCaption}</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${genderChartConfig.id}"><h5 class="text-center small mb-1">${genderChartTitle}</h5><p class="text-muted small text-center p-1">${genderFigCaption}</p></div></div>`;
                combinedHtml += '</div>';
            } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                combinedHtml += _renderDiagnostischeGueteTabellen(kollektiveData, lang, subSection.id, currentKollektiv);
                if (subSection.id === 'ergebnisse_vergleich_performance') {
                     combinedHtml += '<div class="row mt-4 g-3">';
                     const kollektiveForChartsMap = {
                        Gesamt: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt,
                        'direkt OP': PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP,
                        nRCT: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT
                     };
                     Object.entries(kollektiveForChartsMap).forEach(([kolId, chartConfig]) => {
                        const chartTitle = (langUiTexts.chartTitles?.comparisonBarPublikation || 'Vergleichsmetriken für {KOLLEKTIV}').replace('{KOLLEKTIV}', getKollektivDisplayName(kolId, lang));
                        const figCaption = (pubTabTexts.publicationFigureCaptions?.[chartConfig.titleKey] || chartConfig.titleKey)
                            .replace('{LETTER}', chartConfig.letter)
                            .replace('{KOLLEKTIV}', getKollektivDisplayName(kolId, lang));
                        combinedHtml += `<div class="col-md-4"><div class="chart-container border rounded p-2" id="${chartConfig.id}"><h5 class="text-center small mb-1">${chartTitle}</h5><p class="text-muted small text-center p-1">${figCaption}</p></div></div>`;
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
