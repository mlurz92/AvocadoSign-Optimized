const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return 'N/A';
        return formatCI(metricData.value, metricData.ci?.lower, metricData.ci?.upper, digits, isRate, 'N/A', lang);
    }

    function _renderLiteraturT2KriterienTabelle(lang, commonData) {
        const tableTitle = UI_TEXTS?.publikationTab?.tableTitles?.table2LiteratureT2Criteria?.[lang] || (lang === 'de' ? 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets' : 'Table 2: Overview of Literature-Based T2 Criteria Sets');
        let tableHTML = `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;

        const headers = UI_TEXTS?.publikationTab?.tables?.table2?.headers?.[lang] || {
            study: lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set',
            targetCohort: lang === 'de' ? 'Primäres Zielkollektiv (Orig.)' : 'Primary Target Cohort (Orig.)',
            coreCriteria: lang === 'de' ? 'Kernkriterien (Kurzfassung)' : 'Core Criteria (Summary)',
            logic: lang === 'de' ? 'Logik' : 'Logic'
        };

        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id}">
            <thead>
                <tr>
                    <th>${headers.study}</th>
                    <th>${headers.targetCohort}</th>
                    <th>${headers.coreCriteria}</th>
                    <th>${headers.logic}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const studyName = UI_TEXTS?.publikationTab?.literatureCriteria?.[lang]?.[conf.nameKey]?.name || UI_TEXTS?.publikationTab?.literatureCriteria?.de?.[conf.nameKey]?.name || conf.nameKey;
                const kriterienText = studySet.logic === 'KOMBINIERT' ?
                    (studySet.studyInfo?.keyCriteriaSummary || studySet.description) : // studyInfo.keyCriteriaSummary könnte auch sprachabhängig sein
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false, lang);

                tableHTML += `<tr>
                                <td>${studyName}</td>
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv, lang)} (${studySet.context})</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[lang]?.[studySet.logic] || UI_TEXTS.t2LogicDisplayNames.de[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang, commonData) {
        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">${lang === 'de' ? 'Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.' : 'Insufficient patient data available for Table 1.'}</p>`;

        const tableTitle = UI_TEXTS?.publikationTab?.tableTitles?.table1PatientCharacteristics?.[lang] || (lang === 'de' ? 'Tabelle 1: Patientencharakteristika' : 'Table 1: Patient Characteristics');
        let tableHTML = `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;

        const headers = UI_TEXTS?.publikationTab?.tables?.table1?.headers?.[lang] || {
            characteristic: lang === 'de' ? 'Merkmal' : 'Characteristic',
            overall: lang === 'de' ? 'Gesamt (N=[N_GESAMT])' : 'Overall (n=[N_GESAMT])',
            directOP: lang === 'de' ? 'Direkt OP (N=[N_DIR_OP])' : 'Upfront Surgery (n=[N_DIR_OP])',
            nRCT: lang === 'de' ? 'nRCT (N=[N_NRCT])' : 'nRCT (n=[N_NRCT])'
        };

        const nGesamt = allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0;
        const nDirektOP = allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0;
        const nNRCT = allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0;

        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${headers.characteristic}</th>
                    <th>${headers.overall.replace('[N_GESAMT]', nGesamt)}</th>
                    <th>${headers.directOP.replace('[N_DIR_OP]', nDirektOP)}</th>
                    <th>${headers.nRCT.replace('[N_NRCT]', nNRCT)}</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder, false, lang);
        const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null) ? formatPercent(count / total, dig, lang) : 'N/A';
        const rangeSeparator = lang === 'de' ? '–' : '–';

        const addRow = (labelKey, getterGesamt, getterDirektOP, getterNRCT) => {
            const pGesamt = allKollektivStats.Gesamt?.deskriptiv;
            const pDirektOP = allKollektivStats['direkt OP']?.deskriptiv;
            const pNRCT = allKollektivStats.nRCT?.deskriptiv;
            const labelText = UI_TEXTS?.publikationTab?.tables?.table1?.rows?.[labelKey]?.[lang] || labelKey;
            tableHTML += `<tr>
                            <td>${labelText}</td>
                            <td>${pGesamt ? getterGesamt(pGesamt) : 'N/A'}</td>
                            <td>${pDirektOP ? getterDirektOP(pDirektOP) : 'N/A'}</td>
                            <td>${pNRCT ? getterNRCT(pNRCT) : 'N/A'}</td>
                          </tr>`;
        };

        addRow('ageMedian',
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}${rangeSeparator}${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}${rangeSeparator}${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}${rangeSeparator}${fVal(p.alter?.max,0)})`
        );
        addRow('genderMale',
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`
        );
        addRow('nStatusPositive',
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, commonData) {
        if (!allKollektivStats) return `<p class="text-muted small">${lang === 'de' ? 'Keine Gütedaten für diese Sektion verfügbar.' : 'No performance data available for this section.'}</p>`;
        let tableHTML = '';
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetricRaw = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const bfMetricLabelKey = PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === bfZielMetricRaw)?.labelKey || bfZielMetricRaw;
        const bfZielMetricDisplay = UI_TEXTS?.publikationTab?.bfMetrics?.[lang]?.[bfMetricLabelKey] || UI_TEXTS?.publikationTab?.bfMetrics?.de?.[bfMetricLabelKey] || bfZielMetricRaw;


        const headers = UI_TEXTS?.publikationTab?.tables?.diagnosticPerformanceHeaders?.[lang] || {
            method: lang === 'de' ? 'Methode' : 'Method',
            cohort: lang === 'de' ? 'Kollektiv' : 'Cohort',
            sens: lang === 'de' ? 'Sens. (95% KI)' : 'Sens. (95% CI)',
            spec: lang === 'de' ? 'Spez. (95% KI)' : 'Spec. (95% CI)',
            ppv: 'PPV (95% CI)',
            npv: 'NPV (95% CI)',
            acc: lang === 'de' ? 'Acc. (95% KI)' : 'Acc. (95% CI)',
            auc: 'AUC (95% CI)'
        };
        const headerRow = `<thead><tr><th>${headers.method}</th><th>${headers.cohort}</th><th>${headers.sens}</th><th>${headers.spec}</th><th>${headers.ppv}</th><th>${headers.npv}</th><th>${headers.acc}</th><th>${headers.auc}</th></tr></thead>`;

        const renderTableRows = (methodNameKey, statsGetter) => {
            let rows = '';
            kollektive.forEach(kolId => {
                const stats = statsGetter(kolId);
                const nPat = stats?.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : commonData[`n${kolId.replace(' ','')}`] || 0;
                const methodName = UI_TEXTS?.publikationTab?.methodNames?.[lang]?.[methodNameKey] || UI_TEXTS?.publikationTab?.methodNames?.de?.[methodNameKey] || methodNameKey;
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
                                <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten' : 'No valid data'}</em></td>
                              </tr>`;
                }
            });
            return rows;
        };

        const renderSingleKollektivTableRows = (methodNameKey, kolId, stats) => {
            let rows = '';
            const nPat = stats?.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : commonData[`n${kolId.replace(' ','')}`] || 0;
            const methodName = UI_TEXTS?.publikationTab?.literatureCriteria?.[lang]?.[methodNameKey]?.name || UI_TEXTS?.publikationTab?.literatureCriteria?.de?.[methodNameKey]?.name || methodNameKey;

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
                            <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten oder nicht anwendbar' : 'No valid data or not applicable'}</em></td>
                          </tr>`;
            }
            return rows;
        }

        if (sectionId === 'ergebnisse_as_performance') {
            const tableTitle = UI_TEXTS?.publikationTab?.tableTitles?.table3ASPerformance?.[lang] || (lang === 'de' ? 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)' : 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)');
            tableHTML += `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id}">${headerRow}<tbody>`;
            tableHTML += renderTableRows('avocadoSign', (kolId) => allKollektivStats?.[kolId]?.gueteAS);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            const tableTitle = UI_TEXTS?.publikationTab?.tableTitles?.table4LiteratureT2Performance?.[lang] || (lang === 'de' ? 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)' : 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)');
            tableHTML += `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id}">${headerRow.replace(headers.method, (UI_TEXTS?.publikationTab?.tables?.literaturePerformanceHeaders?.[lang]?.criteriaSet || (lang === 'de' ? 'Kriteriensatz' : 'Criteria Set')))}<tbody>`;
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if(studySet){
                    const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                    const stats = allKollektivStats?.[targetKollektiv]?.gueteT2_literatur?.[conf.id];
                    tableHTML += renderSingleKollektivTableRows(conf.nameKey, targetKollektiv, stats);
                }
            });
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            let tableTitle = UI_TEXTS?.publikationTab?.tableTitles?.table5OptimizedT2Performance?.[lang] || (lang === 'de' ? `Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: [METRIC], vs. N-Status)` : `Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: [METRIC], vs. N-Status)`);
            tableTitle = tableTitle.replace('[METRIC]', bfZielMetricDisplay);
            tableHTML += `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id}">${headerRow.replace(headers.method, (UI_TEXTS?.publikationTab?.tables?.optimizedPerformanceHeaders?.[lang]?.optimizationTarget || (lang === 'de' ? 'Optimierungs-Ziel' : 'Optimization Target')))}<tbody>`;
            const bfMethodName = (lang === 'de' ? `Optimiert für ${bfZielMetricDisplay}` : `Optimized for ${bfZielMetricDisplay}`);
            tableHTML += renderTableRows('bfOptimized', (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
             const tableTitle = UI_TEXTS?.publikationTab?.tableTitles?.table6ComparisonPerformance?.[lang] || (lang === 'de' ? 'Tabelle 6: Statistischer Vergleich - Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)' : 'Table 6: Statistical Comparison - Avocado Sign vs. T2 Criteria (Literature and Optimized)');
             const compHeaders = UI_TEXTS?.publikationTab?.tables?.comparisonHeaders?.[lang] || {
                comparison: lang==='de'?'Vergleich':'Comparison',
                cohort: lang==='de'?'Kollektiv':'Cohort',
                method1: lang==='de'?'Methode 1 (AUC)':'Method 1 (AUC)',
                method2: lang==='de'?'Methode 2 (AUC)':'Method 2 (AUC)',
                diffAUC: lang==='de'?'Diff. AUC (M1-M2)':'AUC Diff. (M1-M2)',
                delongP: lang==='de'?'DeLong p-Wert (AUC)':'DeLong p-value (AUC)',
                mcNemarP: lang==='de'?'McNemar p-Wert (Acc.)':'McNemar p-value (Acc.)'
             };
             tableHTML += `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;
             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceTabelle.id}">
                <thead><tr>
                    <th>${compHeaders.comparison}</th>
                    <th>${compHeaders.cohort}</th>
                    <th>${compHeaders.method1}</th>
                    <th>${compHeaders.method2}</th>
                    <th>${compHeaders.diffAUC}</th>
                    <th>${compHeaders.delongP}</th>
                    <th>${compHeaders.mcNemarP}</th>
                </tr></thead><tbody>`;

            kollektive.forEach(kolId => {
                const asStats = allKollektivStats?.[kolId]?.gueteAS;
                const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {
                    const s = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                    return s && (s.applicableKollektiv === kolId || (kolId === 'Gesamt' && s.applicableKollektiv === 'Gesamt'));
                });

                const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;

                if (litSetConf) {
                    const litStats = allKollektivStats?.[kolId]?.gueteT2_literatur?.[litSetConf.id];
                    const vergleichASvsLit = allKollektivStats?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`];
                    const litSetNameShort = UI_TEXTS?.publikationTab?.literatureCriteria?.[lang]?.[litSetConf.shortNameKey]?.name || UI_TEXTS?.publikationTab?.literatureCriteria?.de?.[litSetConf.shortNameKey]?.name || litSetConf.shortNameKey;
                    let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', false, lang);

                    if (asStats && litStats && vergleichASvsLit) {
                        tableHTML += `<tr>
                            <td>AS vs. ${lang==='de'?'Lit.':'Lit.'} (${litSetNameShort})</td>
                            <td>${getKollektivDisplayName(kolId, lang)}</td>
                            <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                            <td>${lang==='de'?'Lit.':'Lit.'} (${_formatMetricForTable(litStats.auc, false, 3, lang)})</td>
                            <td>${diffAucLitStr}</td>
                            <td>${getPValueText(vergleichASvsLit.delong?.pValue, lang)}</td>
                            <td>${getPValueText(vergleichASvsLit.mcnemar?.pValue, lang)}</td>
                        </tr>`;
                    }
                }
                 if (asStats && bfStats && vergleichASvsBF && bfDef) {
                     let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', false, lang);
                     const bfMetricNameOptimizedFor = UI_TEXTS?.publikationTab?.bfMetrics?.[lang]?.[bfDef.metricName.replace(/ /g,'').toLowerCase()] || UI_TEXTS?.publikationTab?.bfMetrics?.de?.[bfDef.metricName.replace(/ /g,'').toLowerCase()] || bfDef.metricName;
                     const bfMethodDisplayName = lang === 'de' ? `BF-Optimiert (${bfMetricNameOptimizedFor})` : `BF-Optimized (${bfMetricNameOptimizedFor})`;
                     tableHTML += `<tr>
                        <td>AS vs. ${lang==='de'?'BF-Opt.':'BF-Opt.'}</td>
                        <td>${getKollektivDisplayName(kolId, lang)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                        <td>${lang==='de'?'BF-Opt.':'BF-Opt.'} (${_formatMetricForTable(bfStats.auc, false, 3, lang)})</td>
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
        const effectiveLang = (UI_TEXTS?.kollektivDisplayNames?.[lang]) ? lang : 'de';
        if (!sectionId || !effectiveLang || !publicationData || !kollektiveData) {
            const errorMsg = effectiveLang === 'de' ? 'Fehler: Notwendige Daten für die Sektionsanzeige fehlen.' : 'Error: Necessary data for section display is missing.';
            return `<p class="text-danger">${errorMsg}</p>`;
        }

        const { currentKollektiv, bruteForceMetric } = options;
        const appliedCriteria = t2CriteriaManager.getAppliedCriteria(); // Annahme: t2CriteriaManager ist global verfügbar
        const appliedLogic = t2CriteriaManager.getAppliedLogic();

        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: getKollektivDisplayName(currentKollektiv, effectiveLang),
            nGesamt: kollektiveData.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: kollektiveData['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: kollektiveData.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            ethicsVote: lang === 'de' ? "Ethikvotum Nr. XYZ/2020, Klinikum St. Georg, Leipzig" : "Ethics vote No. XYZ/2020, St. Georg Hospital, Leipzig",
            references: {
                lurzSchaefer2025: "Lurz & Schäfer (2025)", // Eigennamen bleiben meist gleich
                koh2008: "Koh et al. (2008)",
                barbaro2024: "Barbaro et al. (2024)",
                rutegard2025: "Rutegård et al. (2025)",
                beetsTan2018ESGAR: "ESGAR Consensus (Beets-Tan et al. 2018)"
            }
        };

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections || mainSectionConfig.subSections.length === 0) {
            const errorMsg = effectiveLang === 'de' ? `Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.` : `No subsections defined for main section '${sectionId}'.`;
            return `<p class="text-warning">${errorMsg}</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        const mainSectionTitle = UI_TEXTS?.publikationTab?.sectionLabels?.[effectiveLang]?.[mainSectionConfig.labelKey] || UI_TEXTS?.publikationTab?.sectionLabels?.de?.[mainSectionConfig.labelKey] || mainSectionConfig.labelKey;
        combinedHtml += `<h1 class="mb-4 display-6">${mainSectionTitle}</h1>`;

        mainSectionConfig.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            const subSectionTitle = UI_TEXTS?.publikationTab?.sectionLabels?.[effectiveLang]?.[subSection.labelKey] || UI_TEXTS?.publikationTab?.sectionLabels?.de?.[subSection.labelKey] || subSection.id.replace(/_/g, ' ');
            combinedHtml += `<h2 class="mb-3 h4">${subSectionTitle}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, effectiveLang, publicationData, kollektiveData, commonData, appliedCriteria, appliedLogic);
            combinedHtml += textContentHtml || `<p class="text-muted">${effectiveLang === 'de' ? `Inhalt für diesen Unterabschnitt (ID: ${subSection.id}) wird noch generiert.` : `Content for this subsection (ID: ${subSection.id}) is yet to be generated.`}</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(effectiveLang, commonData);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(kollektiveData, effectiveLang, commonData);
                combinedHtml += '<div class="row mt-4 g-3">';
                const fig1aKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.captionKey;
                const fig1aTitle = UI_TEXTS?.publikationTab?.figureCaptions?.[effectiveLang]?.[fig1aKey]?.replace('[KOLLEKTIV]', getKollektivDisplayName("Gesamt", effectiveLang)) || (effectiveLang === 'de' ? 'Abb. 1a' : 'Fig. 1a');
                const fig1aId = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id;

                const fig1bKey = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.captionKey;
                const fig1bTitle = UI_TEXTS?.publikationTab?.figureCaptions?.[effectiveLang]?.[fig1bKey]?.replace('[KOLLEKTIV]', getKollektivDisplayName("Gesamt", effectiveLang)) || (effectiveLang === 'de' ? 'Abb. 1b' : 'Fig. 1b');
                const fig1bId = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id;

                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${fig1aId}"><h5 class="text-center small mb-1">${fig1aTitle}</h5></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${fig1bId}"><h5 class="text-center small mb-1">${fig1bTitle}</h5></div></div>`;
                combinedHtml += '</div>';
            } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                combinedHtml += _renderDiagnostischeGueteTabellen(kollektiveData, effectiveLang, subSection.id, commonData);
                if (subSection.id === 'ergebnisse_vergleich_performance') {
                     combinedHtml += '<div class="row mt-4 g-3">';
                     const kollektiveForCharts = [
                         {id: 'Gesamt', figKey: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartGesamt.captionKey, chartHtmlId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartGesamt.id},
                         {id: 'direkt OP', figKey: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartDirektOP.captionKey, chartHtmlId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartDirektOP.id},
                         {id: 'nRCT', figKey: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartNRCT.captionKey, chartHtmlId: PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichChartNRCT.id}
                        ];
                     kollektiveForCharts.forEach((kolInfo) => {
                        const chartTitle = UI_TEXTS?.publikationTab?.figureCaptions?.[effectiveLang]?.[kolInfo.figKey]?.replace('[KOLLEKTIV]', getKollektivDisplayName(kolInfo.id, effectiveLang)) || (effectiveLang === 'de' ? `Vergleich für ${getKollektivDisplayName(kolInfo.id, effectiveLang)}` : `Comparison for ${getKollektivDisplayName(kolInfo.id, effectiveLang)}`);
                        combinedHtml += `<div class="col-lg-4 col-md-6"><div class="chart-container border rounded p-2" id="${kolInfo.chartHtmlId}"><h5 class="text-center small mb-1">${chartTitle}</h5></div></div>`;
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
