const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return 'N/A';
        
        const valueFormatter = isRate ? formatPercent : (num, d, p) => formatNumber(num, d, p, lang === 'en');

        const valStr = valueFormatter(metricData.value, digits, 'N/A');
        if (valStr === 'N/A') return valStr;

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper) && isFinite(metricData.ci.lower) && isFinite(metricData.ci.upper)) {
            const lowerStr = valueFormatter(metricData.ci.lower, digits, 'N/A');
            const upperStr = valueFormatter(metricData.ci.upper, digits, 'N/A');
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            
            const ciLabelKey = lang === 'de' ? 'KI' : 'CI';
            const ciText = `95%-${ciLabelKey}`;

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

    function _renderLiteraturT2KriterienTabelle(lang, commonData) {
        const pubElements = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle;
        const tableId = pubElements.id;
        const tableTitle = lang === 'de' ? pubElements.titleDe : pubElements.titleEn;

        let tableHTML = `<h4 class="mt-4 mb-3" id="${tableId}-title">${tableTitle}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv (Anwendung hier)' : 'Primary Target Cohort (Applied Here)'}</th>
                    <th>${lang === 'de' ? 'Kernkriterien (Kurzfassung)' : 'Core Criteria (Summary)'}</th>
                    <th>${lang === 'de' ? 'Logik' : 'Logic'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false);
                const applicableKollektivDisplay = getKollektivDisplayName(studySet.applicableKollektiv || 'Gesamt');
                const contextText = studySet.context || (studySet.applicableKollektiv === 'Gesamt' ? (lang === 'de' ? 'Gesamtkollektiv' : 'Overall Cohort') : applicableKollektivDisplay);

                tableHTML += `<tr>
                                <td>${studySet.name || conf.nameKey}</td>
                                <td>${applicableKollektivDisplay} (${contextText})</td>
                                <td style="white-space: normal;">${kriterienText || 'Keine Beschreibung'}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang, commonData) {
        const pubElements = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        const tableId = pubElements.id;
        const tableTitle = lang === 'de' ? pubElements.titleDe : pubElements.titleEn;

        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">${tableTitle}: Keine ausreichenden Patientendaten verfügbar.</p>`;
        
        let tableHTML = `<h4 class="mt-4 mb-3" id="${tableId}-title">${tableTitle}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('nRCT')} (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A', useStd = (lang === 'en')) => formatNumber(val, dig, placeholder, useStd);
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
            p => `${fVal(p.alter?.median,1)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median,1)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median,1)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`
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
        if (!allKollektivStats) return `<p class="text-muted small">Keine Gütedaten für diese Sektion verfügbar.</p>`;
        let tableHTML = '';
        let tableConfig;

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

        switch(sectionId) {
            case 'ergebnisse_as_performance':
                tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle;
                tableHTML += `<h4 class="mt-4 mb-3" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h4>`;
                tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}"><thead><tr><th>${lang==='de'?'Methode':'Method'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
                tableHTML += renderTableRows('Avocado Sign', (kolId) => allKollektivStats?.[kolId]?.gueteAS);
                tableHTML += `</tbody></table></div>`;
                break;
            case 'ergebnisse_literatur_t2_performance':
                tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
                tableHTML += `<h4 class="mt-4 mb-3" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h4>`;
                tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}"><thead><tr><th>${lang==='de'?'Kriteriensatz':'Criteria Set'}</th><th>${lang==='de'?'Angew. Kollektiv':'Applied Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
                PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                    if(studySet){
                        const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                        const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                        tableHTML += renderSingleKollektivTableRows(studySet.name, targetKollektivForStudy, stats);
                    }
                });
                tableHTML += `</tbody></table></div>`;
                break;
            case 'ergebnisse_optimierte_t2_performance':
                tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle;
                const titleDe = tableConfig.titleDe.replace('{BF_METRIC}', bfZielMetric);
                const titleEn = tableConfig.titleEn.replace('{BF_METRIC}', bfZielMetric);
                tableHTML += `<h4 class="mt-4 mb-3" id="${tableConfig.id}-title">${lang === 'de' ? titleDe : titleEn}</h4>`;
                tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}"><thead><tr><th>${lang==='de'?'Optimierungs-Ziel':'Optimization Target'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
                tableHTML += renderTableRows(`${lang === 'de' ? 'Optimiert für' : 'Optimized for'} ${bfZielMetric}`, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce);
                tableHTML += `</tbody></table></div>`;
                break;
            case 'ergebnisse_vergleich_performance':
                 tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle;
                 tableHTML += `<h4 class="mt-4 mb-3" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h4>`;
                 tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
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
                    let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', lang === 'en');
                    let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', lang === 'en');

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
                break;
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
            references: { // Ensure all expected references are available
                ...(APP_CONFIG.REFERENCES_FOR_PUBLICATION || {}), // Will be defined later
                ...(commonDataFromLogic.references || {})
            }
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}</h1>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            const subSectionTitle = subSection.label || (UI_TEXTS.publikationTab.sectionLabels[subSection.id] || subSection.id.replace(/_/g, ' '));
            combinedHtml += `<h2 class="mb-3 h4">${subSectionTitle}</h2>`;
            
            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData, options);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang, commonData);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(allKollektivStats, lang, commonData);
                combinedHtml += '<div class="row mt-4 g-3">';
                const chartConfigAge = PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart;
                const chartConfigGender = PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${chartConfigAge.id}"><h5 class="text-center small mb-1">${lang === 'de' ? chartConfigAge.titleDe : chartConfigAge.titleEn}</h5><p class="text-muted small text-center p-1">${lang === 'de' ? chartConfigAge.referenceLabelDe : chartConfigAge.referenceLabelEn}</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${chartConfigGender.id}"><h5 class="text-center small mb-1">${lang === 'de' ? chartConfigGender.titleDe : chartConfigGender.titleEn}</h5><p class="text-muted small text-center p-1">${lang === 'de' ? chartConfigGender.referenceLabelDe : chartConfigGender.referenceLabelEn}</p></div></div>`;
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
                        const chartConfig = chartElementsConfig[index];
                        const chartId = chartConfig.id;
                        const chartTitle = (lang === 'de' ? chartConfig.titleDe : chartConfig.titleEn).replace('{Kollektiv}', getKollektivDisplayName(kolId));
                        const figRef = lang === 'de' ? chartConfig.referenceLabelDe : chartConfig.referenceLabelEn;
                        combinedHtml += `<div class="col-md-4"><div class="chart-container border rounded p-2" id="${chartId}"><h5 class="text-center small mb-1">${chartTitle}</h5><p class="text-muted small text-center p-1">${figRef}</p></div></div>`;
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
