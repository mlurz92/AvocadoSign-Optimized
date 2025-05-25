const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, lang = 'de', isRate = true, digits = 1) {
        const localizedTexts = getLocalizedUITexts(lang);
        const generalTexts = localizedTexts.general || {};
        const na = generalTexts.notApplicable || 'N/A';

        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return na;

        const formatSingleValue = (val, d, isP) => {
            if (isP) {
                return formatPercent(val, d, na);
            } else {
                let numStr = formatNumber(val, d, na, true); // Use true for standard format, lang will be applied by formatNumber
                if (lang === 'de' && numStr !== na && typeof numStr === 'string') {
                    numStr = numStr.replace('.', ',');
                }
                return numStr;
            }
        };

        const valStr = formatSingleValue(metricData.value, digits, isRate);

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isRate);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isRate);
            const ciLabel = generalTexts.ci95 || (lang === 'de' ? '95% KI' : '95% CI');
            return `${valStr} (${ciLabel}: ${lowerStr}–${upperStr})`;
        }
        return valStr;
    }

    function _renderLiteraturT2KriterienTabelle(lang, localizedTexts) {
        const pubTabTexts = localizedTexts.publikationTab || {};
        const tableTitles = pubTabTexts.tableTitles || {};
        const generalTexts = localizedTexts.general || {};

        let tableHTML = `<h4 class="mt-4 mb-3">${tableTitles.literaturT2Kriterien || (lang === 'de' ? 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets' : 'Table 2: Overview of Literature-Based T2 Criteria Sets')}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
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
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false);

                tableHTML += `<tr>
                                <td>${studySet.name}</td>
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv, lang)} (${studySet.context})</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${(localizedTexts.t2LogicDisplayNames || {})[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang, localizedTexts) {
        const pubTabTexts = localizedTexts.publikationTab || {};
        const tableTitles = pubTabTexts.tableTitles || {};
        const generalTexts = localizedTexts.general || {};
        const na = generalTexts.notApplicable || 'N/A';

        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">${generalTexts.noData || 'Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.'}</p>`;

        let tableHTML = `<h4 class="mt-4 mb-3">${tableTitles.patientenCharakteristika || (lang === 'de' ? 'Tabelle 1: Patientencharakteristika' : 'Table 1: Patient Characteristics')}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${localizedTexts.kollektivDisplayNames?.Gesamt || 'Gesamt'} (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${localizedTexts.kollektivDisplayNames?.['direkt OP'] || 'Direkt OP'} (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${localizedTexts.kollektivDisplayNames?.nRCT || 'nRCT'} (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = na) => formatNumber(val, dig, placeholder, lang === 'en');
        const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null) ? formatPercent(count / total, dig) : na;

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            const pGesamt = allKollektivStats.Gesamt?.deskriptiv;
            const pDirektOP = allKollektivStats['direkt OP']?.deskriptiv;
            const pNRCT = allKollektivStats.nRCT?.deskriptiv;
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${pGesamt ? getterGesamt(pGesamt) : na}</td>
                            <td>${pDirektOP ? getterDirektOP(pDirektOP) : na}</td>
                            <td>${pNRCT ? getterNRCT(pNRCT) : na}</td>
                          </tr>`;
        };
        
        const ageLabelDe = 'Alter, Median (Min–Max) [Jahre]';
        const ageLabelEn = 'Age, Median (Min–Max) [Years]';
        const sexLabelDe = 'Geschlecht, männlich [n (%)]';
        const sexLabelEn = 'Sex, male [n (%)]';
        const nStatusLabelDe = 'Pathologischer N-Status, positiv [n (%)]';
        const nStatusLabelEn = 'Pathological N-Status, positive [n (%)]';

        addRow(ageLabelDe, ageLabelEn,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`
        );
        addRow(sexLabelDe, sexLabelEn,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`
        );
        addRow(nStatusLabelDe, nStatusLabelEn,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, localizedTexts, options = {}) {
        const { bruteForceMetric } = options;
        const pubTabTexts = localizedTexts.publikationTab || {};
        const tableTitles = pubTabTexts.tableTitles || {};
        const generalTexts = localizedTexts.general || {};
        const legendLabels = localizedTexts.legendLabels || {};
        const na = generalTexts.notApplicable || 'N/A';

        if (!allKollektivStats) return `<p class="text-muted small">${generalTexts.noData || 'Keine Gütedaten für diese Sektion verfügbar.'}</p>`;
        let tableHTML = '';
        const tableIdBase = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteGesamtTabelle.id;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        
        const getLocalizedCohortName = (kolId) => {
            return (localizedTexts.kollektivDisplayNames || {})[kolId] || kolId;
        };
        
        const getMethodDisplayName = (methodKey) => {
            if (methodKey === 'AS') return legendLabels.avocadoSign || 'Avocado Sign (AS)';
            return methodKey;
        };

        const renderTableRows = (methodName, statsGetter) => {
            let rows = '';
            kollektive.forEach(kolId => {
                const stats = statsGetter(kolId);
                const nPat = stats?.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
                 if (stats && nPat > 0) {
                    rows += `<tr>
                                <td>${getMethodDisplayName(methodName)}</td>
                                <td>${getLocalizedCohortName(kolId)} (N=${nPat})</td>
                                <td>${_formatMetricForTable(stats.sens, lang, true, 1)}</td>
                                <td>${_formatMetricForTable(stats.spez, lang, true, 1)}</td>
                                <td>${_formatMetricForTable(stats.ppv, lang, true, 1)}</td>
                                <td>${_formatMetricForTable(stats.npv, lang, true, 1)}</td>
                                <td>${_formatMetricForTable(stats.acc, lang, true, 1)}</td>
                                <td>${_formatMetricForTable(stats.auc, lang, false, 3)}</td>
                              </tr>`;
                } else {
                     rows += `<tr>
                                <td>${getMethodDisplayName(methodName)}</td>
                                <td>${getLocalizedCohortName(kolId)}</td>
                                <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten' : 'No valid data'}</em></td>
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
                            <td>${getMethodDisplayName(methodName)}</td>
                            <td>${getLocalizedCohortName(kolId)} (N=${nPat})</td>
                            <td>${_formatMetricForTable(stats.sens, lang, true, 1)}</td>
                            <td>${_formatMetricForTable(stats.spez, lang, true, 1)}</td>
                            <td>${_formatMetricForTable(stats.ppv, lang, true, 1)}</td>
                            <td>${_formatMetricForTable(stats.npv, lang, true, 1)}</td>
                            <td>${_formatMetricForTable(stats.acc, lang, true, 1)}</td>
                            <td>${_formatMetricForTable(stats.auc, lang, false, 3)}</td>
                          </tr>`;
            } else {
                 rows += `<tr>
                            <td>${getMethodDisplayName(methodName)}</td>
                            <td>${getLocalizedCohortName(kolId)}</td>
                            <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten oder nicht anwendbar' : 'No valid data or not applicable'}</em></td>
                          </tr>`;
            }
            return rows;
        }

        const headers = [
            generalTexts.method || (lang === 'de' ? 'Methode' : 'Method'),
            generalTexts.cohort || (lang === 'de' ? 'Kollektiv' : 'Cohort'),
            `${generalTexts.sensitivityShort || 'Sens.'} (${generalTexts.ci95 || '95% CI'})`,
            `${generalTexts.specificityShort || 'Spez.'} (${generalTexts.ci95 || '95% CI'})`,
            `${generalTexts.ppvShort || 'PPV'} (${generalTexts.ci95 || '95% CI'})`,
            `${generalTexts.npvShort || 'NPV'} (${generalTexts.ci95 || '95% CI'})`,
            `${generalTexts.accuracyShort || 'Acc.'} (${generalTexts.ci95 || '95% CI'})`,
            `${generalTexts.aucShort || 'AUC'} (${generalTexts.ci95 || '95% CI'})`
        ];
        const headerRow = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;


        if (sectionId === 'ergebnisse_as_performance') {
            const title = tableTitles.asPerformance || (lang === 'de' ? 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)' : 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)');
            tableHTML += `<h4 class="mt-4 mb-3">${title}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdBase}-as">${headerRow}<tbody>`;
            tableHTML += renderTableRows('AS', (kolId) => allKollektivStats?.[kolId]?.gueteAS);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            const title = tableTitles.literaturT2Performance || (lang === 'de' ? 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)' : 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)');
            tableHTML += `<h4 class="mt-4 mb-3">${title}</h4>`;
            const litHeaders = [
                lang === 'de' ? 'Kriteriensatz' : 'Criteria Set',
                generalTexts.cohortApplied || (lang === 'de' ? 'Angew. Kollektiv' : 'Applied Cohort'),
                ...headers.slice(2) // sens, spez etc.
            ];
            const litHeaderRow = `<thead><tr>${litHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdBase}-literatur">${litHeaderRow}<tbody>`;
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
            let title = tableTitles.optimierteT2Performance || (lang === 'de' ? `Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: {METRIC}, vs. N-Status)` : `Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: {METRIC}, vs. N-Status)`);
            title = title.replace('{METRIC}', bruteForceMetric);
            tableHTML += `<h4 class="mt-4 mb-3">${title}</h4>`;
            const bfHeaders = [
                `${generalTexts.optimizationTarget || (lang === 'de' ? 'Optimierungs-Ziel' : 'Optimization Target')}`,
                ...headers.slice(1) // kollektiv, sens etc.
            ];
            const bfHeaderRow = `<thead><tr>${bfHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdBase}-bf">${bfHeaderRow}<tbody>`;
            tableHTML += renderTableRows(`${lang === 'de' ? 'Optimiert für' : 'Optimized for'} ${bruteForceMetric}`, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
             const title = tableTitles.vergleichPerformance || (lang === 'de' ? 'Tabelle 6: Statistischer Vergleich - Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)' : 'Table 6: Statistical Comparison - Avocado Sign vs. T2 Criteria (Literature and Optimized)');
             tableHTML += `<h4 class="mt-4 mb-3">${title}</h4>`;
             const compHeaders = [
                 lang === 'de' ? 'Vergleich' : 'Comparison',
                 generalTexts.cohort || (lang === 'de' ? 'Kollektiv' : 'Cohort'),
                 `${lang === 'de' ? 'Methode 1' : 'Method 1'} (${generalTexts.aucShort || 'AUC'})`,
                 `${lang === 'de' ? 'Methode 2' : 'Method 2'} (${generalTexts.aucShort || 'AUC'})`,
                 `${lang === 'de' ? 'Diff. AUC (M1-M2)' : 'AUC Diff. (M1-M2)'}`,
                 `DeLong p-${lang === 'de' ? 'Wert' : 'value'} (${generalTexts.aucShort || 'AUC'})`,
                 `McNemar p-${lang === 'de' ? 'Wert' : 'value'} (${generalTexts.accuracyShort || 'Acc.'})`
             ];
             const compHeaderRow = `<thead><tr>${compHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;

             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdBase}-vergleich">${compHeaderRow}<tbody>`;

            kollektive.forEach(kolId => {
                const asStats = allKollektivStats?.[kolId]?.gueteAS;
                const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {
                    const s = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                    return s?.applicableKollektiv === kolId || (kolId === 'Gesamt' && s?.applicableKollektiv === 'Gesamt');
                });

                const litStats = litSetConf ? allKollektivStats?.[kolId]?.gueteT2_literatur?.[litSetConf.id] : null;
                const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;

                const vergleichASvsLit = litSetConf ? allKollektivStats?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;
                const vergleichASvsBF = allKollektivStats?.[kolId]?.vergleichASvsT2_bruteforce;

                let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, na, true);
                if (lang === 'de' && diffAucLitStr !== na) diffAucLitStr = diffAucLitStr.replace('.', ',');

                let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, na, true);
                if (lang === 'de' && diffAucBfStr !== na) diffAucBfStr = diffAucBfStr.replace('.', ',');

                if (asStats && litStats && vergleichASvsLit) {
                    const litSetName = studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id;
                    tableHTML += `<tr>
                        <td>AS vs. ${generalTexts.literature || 'Lit.'} (${litSetName})</td>
                        <td>${getLocalizedCohortName(kolId)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, lang, false, 3)})</td>
                        <td>${generalTexts.literature || 'Lit.'} (${_formatMetricForTable(litStats.auc, lang, false, 3)})</td>
                        <td>${diffAucLitStr}</td>
                        <td>${getPValueText(vergleichASvsLit.delong?.pValue, lang)}</td>
                        <td>${getPValueText(vergleichASvsLit.mcnemar?.pValue, lang)}</td>
                    </tr>`;
                }
                 if (asStats && bfStats && vergleichASvsBF && bfDef) {
                     tableHTML += `<tr>
                        <td>AS vs. BF-${lang === 'de' ? 'Optimiert' : 'Optimized'} (${bfDef.metricName})</td>
                        <td>${getLocalizedCohortName(kolId)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, lang, false, 3)})</td>
                        <td>BF (${_formatMetricForTable(bfStats.auc, lang, false, 3)})</td>
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
        const localizedTexts = getLocalizedUITexts(lang);
        const generalTexts = localizedTexts.general || {};
        const pubTabTexts = localizedTexts.publikationTab || {};
        const chartTitles = localizedTexts.chartTitles || {};
        const legendLabels = localizedTexts.legendLabels || {};

        if (!sectionId || !publicationData || !kollektiveData) {
            return `<p class="text-danger">${generalTexts.error || 'Fehler'}: ${generalTexts.noData || 'Notwendige Daten für die Sektionsanzeige fehlen.'}</p>`;
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
                lurzSchaefer2025: "Lurz & Schäfer (2025)", // These are fixed, could be localized if needed
                koh2008: "Koh et al. (2008)",
                barbaro2024: "Barbaro et al. (2024)",
                rutegard2025: "Rutegård et al. (2025)",
                beetsTan2018ESGAR: "ESGAR Consensus (Beets-Tan et al. 2018)"
            }
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">${lang === 'de' ? 'Keine Unterabschnitte für Hauptabschnitt' : 'No subsections defined for main section'} '${sectionId}'.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${(pubTabTexts.sectionLabels || {})[mainSection.labelKey] || mainSection.labelKey}</h1>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h2 class="mb-3 h4">${(pubTabTexts.subSectionLabels || {})[subSection.id] || subSection.label}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, publicationData, kollektiveData, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">${lang === 'de' ? 'Inhalt für diesen Unterabschnitt wird noch generiert.' : 'Content for this subsection is being generated.'}</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang, localizedTexts);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(kollektiveData, lang, localizedTexts);
                const figCaptions = pubTabTexts.figureCaptions || {};
                const gesamtKollektivName = getKollektivDisplayName("Gesamt", lang);
                const ageFigCaption = (figCaptions.patientenCharakteristikaAlter || (lang === 'de' ? 'Abb. 1a: Altersverteilung ({KOLLEKTIV})' : 'Fig. 1a: Age Distribution ({KOLLEKTIV})')).replace('{KOLLEKTIV}', gesamtKollektivName);
                const genderFigCaption = (figCaptions.patientenCharakteristikaGeschlecht || (lang === 'de' ? 'Abb. 1b: Geschlechterverteilung ({KOLLEKTIV})' : 'Fig. 1b: Gender Distribution ({KOLLEKTIV})')).replace('{KOLLEKTIV}', gesamtKollektivName);

                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-alter-Gesamt"><h5 class="text-center small mb-1">${(chartTitles.ageDistribution || 'Altersverteilung')} (${gesamtKollektivName})</h5><p class="text-muted small text-center p-1">${ageFigCaption}</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-gender-Gesamt"><h5 class="text-center small mb-1">${(chartTitles.genderDistribution || 'Geschlechterverteilung')} (${gesamtKollektivName})</h5><p class="text-muted small text-center p-1">${genderFigCaption}</p></div></div>`;
                combinedHtml += '</div>';
            } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                combinedHtml += _renderDiagnostischeGueteTabellen(kollektiveData, lang, subSection.id, localizedTexts, { bruteForceMetric });
                if (subSection.id === 'ergebnisse_vergleich_performance') {
                     combinedHtml += '<div class="row mt-4 g-3">';
                     const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                     const figCaptions = pubTabTexts.figureCaptions || {};

                     kollektiveForCharts.forEach((kolId, index) => {
                        const chartLetter = String.fromCharCode(97 + index); // a, b, c
                        const chartId = `pub-chart-vergleich-${kolId.replace(/\s+/g, '-')}`;
                        const localizedKollektivName = getKollektivDisplayName(kolId, lang);
                        const chartTitleText = (chartTitles.pubVergleichPerformance || 'Performance Vergleich: {KOLLEKTIVNAME}').replace('{KOLLEKTIVNAME}', localizedKollektivName);
                        
                        const bfDef = kollektiveData?.[kolId]?.bruteforce_definition;
                        const bfMetricName = bfDef?.metricName || bruteForceMetric || 'Zielmetrik';
                        let litSetNameShort = 'Lit.';
                        const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {
                            const s = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                            return s?.applicableKollektiv === kolId || (kolId === 'Gesamt' && s?.applicableKollektiv === 'Gesamt');
                        });
                        if (litSetConf) {
                            const study = studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id);
                            litSetNameShort = study?.displayShortName || study?.name || litSetConf.id;
                        }

                        const figCaptionText = (figCaptions.vergleichPerformanceChart || 'Abb. 2{LETTER}: Vergleichende Darstellung der diagnostischen Gütekriterien (AS vs. {T2_LIT_NAME} vs. BF-T2) für Kollektiv {KOLLEKTIV}. AS = Avocado Sign; BF-T2 = Brute-Force optimierte T2-Kriterien für {BF_METRIC_NAME}.')
                            .replace('{LETTER}', chartLetter)
                            .replace('{T2_LIT_NAME}', litSetNameShort)
                            .replace('{KOLLEKTIV}', localizedKollektivName)
                            .replace('{BF_METRIC_NAME}', bfMetricName);

                        combinedHtml += `<div class="col-md-4"><div class="chart-container border rounded p-2" id="${chartId}"><h5 class="text-center small mb-1">${chartTitleText}</h5><p class="text-muted small text-center p-1">${figCaptionText}</p></div></div>`;
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
