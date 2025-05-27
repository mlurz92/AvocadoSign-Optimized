const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let numStrToFormat = val;
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(numStrToFormat, d, 'N/A');
            } else {
                formattedNum = formatNumber(numStrToFormat, d, 'N/A', false);
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metricData.value, digits, isRate);
        if (valStr === 'N/A') return valStr;

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper) && isFinite(metricData.ci.lower) && isFinite(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isRate);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isRate);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            const ciText = lang === 'de' ? '95%-KI' : '95% CI';

            let mainValForDisplay = valStr;
            let lowerValForDisplay = lowerStr;
            let upperValForDisplay = upperStr;

            if(isRate){
                mainValForDisplay = String(mainValForDisplay).replace('%','');
                lowerValForDisplay = String(lowerValForDisplay).replace('%','');
                upperValForDisplay = String(upperValForDisplay).replace('%','');
                return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})%`;
            } else {
                 return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})`;
            }
        }
        return valStr;
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        let tableHTML = `<h4 class="mt-4 mb-3" id="${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id}-title">${lang === 'de' ? PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.titleDe : PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.titleEn}</h4>`;
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
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv)} (${studySet.context || 'N/A'})</td>
                                <td style="white-space: normal;">${kriterienText || 'Keine Beschreibung'}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang) {
        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.</p>`;
        let tableHTML = `<h4 class="mt-4 mb-3" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}-title">${lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleDe : PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('nRCT')} (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A', useStd = false) => formatNumber(val, dig, placeholder, useStd);
        const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null && !isNaN(count)) ? formatPercent(count / total, dig) : 'N/A';

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            const pGesamt = allKollektivStats.Gesamt?.deskriptiv;
            const pDirektOP = allKollektivStats['direkt OP']?.deskriptiv;
            const pNRCT = allKollektivStats.nRCT?.deskriptiv;
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${pGesamt ? getterGesamt(pGesamt) : 'N/A'}</td>
                            <td>${pDirektOP ? getterDirektOP(pDirektOP) : 'N/A'}</td>
                            <td>${pNRCT ? getterNRCT(pNRCT) : 'N/A'}</td>
                          </tr>`;
        };

        addRow('Alter, Median (Min–Max) [Jahre]', 'Age, Median (Min–Max) [Years]',
            p => `${fVal(p.alter?.median,1,undefined,lang==='en')} (${fVal(p.alter?.min,0,undefined,lang==='en')}–${fVal(p.alter?.max,0,undefined,lang==='en')})`,
            p => `${fVal(p.alter?.median,1,undefined,lang==='en')} (${fVal(p.alter?.min,0,undefined,lang==='en')}–${fVal(p.alter?.max,0,undefined,lang==='en')})`,
            p => `${fVal(p.alter?.median,1,undefined,lang==='en')} (${fVal(p.alter?.min,0,undefined,lang==='en')}–${fVal(p.alter?.max,0,undefined,lang==='en')})`
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

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, commonData) {
        if (!allKollektivStats) return '<p class="text-muted small">Keine Gütedaten für diese Sektion verfügbar.</p>';
        let tableHTML = '';
        let tableIdForHTML = 'pub-table-default-guete';
        let tableTitleDe = 'Diagnostische Güte';
        let tableTitleEn = 'Diagnostic Performance';

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const renderTableRows = (methodName, statsGetter) => {
            let rows = '';
            kollektive.forEach(kolId => {
                const stats = statsGetter(kolId);
                const currentKollektivData = allKollektivStats?.[kolId]?.deskriptiv;
                const nPat = currentKollektivData?.anzahlPatienten || 0;

                 if (stats && stats.matrix && (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn > 0)) {
                    rows += `<tr>
                                <td>${methodName}</td>
                                <td>${getKollektivDisplayName(kolId)} (N=${nPat})</td>
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
                                <td>${getKollektivDisplayName(kolId)} (N=${nPat})</td>
                                <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten' : 'No valid data'}</em></td>
                              </tr>`;
                }
            });
            return rows;
        };

        const renderSingleKollektivTableRows = (methodName, kolIdForSet, stats) => {
            let rows = '';
            const currentKollektivData = allKollektivStats?.[kolIdForSet]?.deskriptiv;
            const nPat = currentKollektivData?.anzahlPatienten || 0;

            if (stats && stats.matrix && (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn > 0)) {
                 rows += `<tr>
                            <td>${methodName}</td>
                            <td>${getKollektivDisplayName(kolIdForSet)} (N=${nPat})</td>
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
                            <td>${getKollektivDisplayName(kolIdForSet)} (N=${nPat > 0 ? nPat : '?'})</td>
                            <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten oder nicht anwendbar' : 'No valid data or not applicable'}</em></td>
                          </tr>`;
            }
            return rows;
        }

        if (sectionId === 'ergebnisse_as_performance') {
            tableIdForHTML = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id;
            tableTitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleDe;
            tableTitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleEn;
            tableHTML += `<h4 class="mt-4 mb-3" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><thead><tr><th>${lang==='de'?'Methode':'Method'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
            tableHTML += renderTableRows('Avocado Sign', (kolId) => allKollektivStats?.[kolId]?.gueteAS);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            tableIdForHTML = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
            tableTitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleDe;
            tableTitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleEn;
            tableHTML += `<h4 class="mt-4 mb-3" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><thead><tr><th>${lang==='de'?'Kriteriensatz':'Criteria Set'}</th><th>${lang==='de'?'Angew. Kollektiv':'Applied Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if(studySet){
                    const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                    const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                    tableHTML += renderSingleKollektivTableRows(studySet.name, targetKollektivForStudy, stats);
                }
            });
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            tableIdForHTML = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
            tableTitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleDe.replace('{BF_METRIC}', bfZielMetric);
            tableTitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleEn.replace('{BF_METRIC}', bfZielMetric);
            tableHTML += `<h4 class="mt-4 mb-3" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><thead><tr><th>${lang==='de'?'Optimierungs-Ziel':'Optimization Target'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
            tableHTML += renderTableRows(`Optimiert für ${bfZielMetric}`, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
             tableIdForHTML = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id;
             tableTitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.titleDe;
             tableTitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.titleEn;
             tableHTML += `<h4 class="mt-4 mb-3" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}">
                <thead><tr>
                    <th>${lang==='de'?'Vergleich':'Comparison'}</th>
                    <th>${lang==='de'?'Kollektiv':'Cohort'}</th>
                    <th>${lang==='de'?'Methode 1':'Method 1'} (AUC)</th>
                    <th>${lang==='de'?'Methode 2':'Method 2'} (AUC)</th>
                    <th>${lang==='de'?'Diff. AUC (M1-M2)':'AUC Diff. (M1-M2)'}</th>
                    <th>DeLong p-Wert (AUC)</th>
                    <th>McNemar p-Wert (Acc.)</th>
                </tr></thead><tbody>`;

            kollektive.forEach(kolId => {
                const asStats = allKollektivStats?.[kolId]?.gueteAS;

                const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                    return studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'));
                });

                const litStats = litSetConf ? allKollektivStats?.[kolId]?.gueteT2_literatur?.[litSetConf.id] : null;
                const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;

                const vergleichASvsLit = litSetConf ? allKollektivStats?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;
                const vergleichASvsBF = allKollektivStats?.[kolId]?.vergleichASvsT2_bruteforce;

                let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', true);
                if (lang === 'de' && diffAucLitStr !== 'N/A') diffAucLitStr = diffAucLitStr.replace('.', ',');
                else if (lang === 'en' && diffAucLitStr !== 'N/A') diffAucLitStr = diffAucLitStr.replace(',', '.');


                let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', true);
                if (lang === 'de' && diffAucBfStr !== 'N/A') diffAucBfStr = diffAucBfStr.replace('.', ',');
                else if (lang === 'en' && diffAucBfStr !== 'N/A') diffAucBfStr = diffAucBfStr.replace(',', '.');


                if (asStats && litStats && vergleichASvsLit) {
                    tableHTML += `<tr>
                        <td>AS vs. Literatur (${studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id})</td>
                        <td>${getKollektivDisplayName(kolId)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                        <td>Lit. (${_formatMetricForTable(litStats.auc, false, 3, lang)})</td>
                        <td>${diffAucLitStr}</td>
                        <td>${getPValueText(vergleichASvsLit.delong?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.delong?.pValue)}</td>
                        <td>${getPValueText(vergleichASvsLit.mcnemar?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.mcnemar?.pValue)}</td>
                    </tr>`;
                }
                 if (asStats && bfStats && vergleichASvsBF && bfDef) {
                     tableHTML += `<tr>
                        <td>AS vs. BF-Optimiert (${bfDef.metricName || bfZielMetric})</td>
                        <td>${getKollektivDisplayName(kolId)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                        <td>BF (${_formatMetricForTable(bfStats.auc, false, 3, lang)})</td>
                        <td>${diffAucBfStr}</td>
                        <td>${getPValueText(vergleichASvsBF.delong?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.delong?.pValue)}</td>
                        <td>${getPValueText(vergleichASvsBF.mcnemar?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.mcnemar?.pValue)}</td>
                    </tr>`;
                 }
            });
            tableHTML += `</tbody></table></div>`;
        }
        return tableHTML;
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
            references: commonDataFromLogic.references || {}
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}</h1>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h2 class="mb-3 h4">${subSection.label}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart.id}"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.ageDistribution} (${getKollektivDisplayName("Gesamt")})</h5><p class="text-muted small text-center p-1">${lang==='de'?'Abb. 1a':'Fig. 1a'}</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart.id}"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.genderDistribution} (${getKollektivDisplayName("Gesamt")})</h5><p class="text-muted small text-center p-1">${lang==='de'?'Abb. 1b':'Fig. 1b'}</p></div></div>`;
                combinedHtml += '</div>';
            } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                combinedHtml += _renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
                if (subSection.id === 'ergebnisse_vergleich_performance') {
                     combinedHtml += '<div class="row mt-4 g-3">';
                     const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                     const chartElementsConfig = [
                        PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt,
                        PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP,
                        PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT
                     ];
                     kollektiveForCharts.forEach((kolId, index) => {
                        const chartLetter = String.fromCharCode(97 + index);
                        const chartConfig = chartElementsConfig[index];
                        const chartId = chartConfig.id;
                        const chartTitle = lang === 'de' ? chartConfig.titleDe : chartConfig.titleEn;
                        const figRef = lang === 'de' ? `Abb. 2${chartLetter}` : `Fig. 2${chartLetter}`;
                        combinedHtml += `<div class="col-md-4"><div class="chart-container border rounded p-2" id="${chartId}"><h5 class="text-center small mb-1">${chartTitle.replace('{Kollektiv}', getKollektivDisplayName(kolId))}</h5><p class="text-muted small text-center p-1">${figRef}</p></div></div>`;
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
