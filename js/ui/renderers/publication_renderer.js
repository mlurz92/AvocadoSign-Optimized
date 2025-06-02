const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return 'N/A';

        const useStandardFormat = lang === 'en' && !isRate;
        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let numStrToFormat = val;
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(numStrToFormat, d, 'N/A%');
            } else {
                formattedNum = formatNumber(numStrToFormat, d, 'N/A', useStandardFormat);
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metricData.value, digits, isRate);
        if (valStr === 'N/A' || valStr === 'N/A%') return valStr;

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper) && isFinite(metricData.ci.lower) && isFinite(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isRate);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isRate);

            if (lowerStr === 'N/A' || lowerStr === 'N/A%' || upperStr === 'N/A' || upperStr === 'N/A%') return valStr;

            const ciText = lang === 'de' ? '95%-KI' : '95% CI';
            let mainValForDisplay = valStr;
            let lowerValForDisplay = lowerStr;
            let upperValForDisplay = upperStr;

            if (isRate && mainValForDisplay !== 'N/A' && mainValForDisplay !== 'N/A%') {
                mainValForDisplay = String(mainValForDisplay).replace('%', '');
                lowerValForDisplay = String(lowerValForDisplay).replace('%', '');
                upperValForDisplay = String(upperValForDisplay).replace('%', '');
                return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0\u2013\u00A0${upperValForDisplay})%`;
            } else {
                return `${mainValForDisplay} (${ciText}: ${lowerValForDisplay}\u00A0\u2013\u00A0${upperValForDisplay})`;
            }
        }
        return valStr;
    }

    function _getPValueTextForPublication(pValue, lang = 'de') {
        if (pValue === null || pValue === undefined || isNaN(pValue) || !isFinite(pValue)) return 'N/A';
        return getPValueText(pValue, lang);
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle;
        let tableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
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
                    (studySet.studyInfo?.keyCriteriaSummary || studySet.description || (lang === 'de' ? 'Kombinierte Logik' : 'Combined Logic')) :
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false) || (lang === 'de' ? 'Keine Beschreibung verfügbar' : 'No description available');
                const investigationType = studySet.studyInfo?.investigationType || studySet.context || 'N/A';

                tableHTML += `<tr>
                                <td>${studySet.name || conf.nameKey}</td>
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv || 'N/A')} (${investigationType})</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang) {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) {
            return `<h4 class="mt-4 mb-3 publication-table-title" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h4><p class="text-muted small">Keine ausreichenden Patientendaten für ${lang === 'de' ? 'Tabelle 1' : 'Table 1'} verfügbar.</p>`;
        }
        let tableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (N=${formatNumber(allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten, 0, '0', true) || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (N=${formatNumber(allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten, 0, '0', true) || 0})</th>
                    <th>${getKollektivDisplayName('nRCT')} (N=${formatNumber(allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten, 0, '0', true) || 0})</th>
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

        const stdFormatNum = lang === 'en';
        addRow('Alter, Median (Min–Max) [Jahre]', 'Age, Median (Min–Max) [Years]',
            p => `${fVal(p.alter?.median,1,'N/A',stdFormatNum)} (${fVal(p.alter?.min,0,'N/A',stdFormatNum)}–${fVal(p.alter?.max,0,'N/A',stdFormatNum)})`,
            p => `${fVal(p.alter?.median,1,'N/A',stdFormatNum)} (${fVal(p.alter?.min,0,'N/A',stdFormatNum)}–${fVal(p.alter?.max,0,'N/A',stdFormatNum)})`,
            p => `${fVal(p.alter?.median,1,'N/A',stdFormatNum)} (${fVal(p.alter?.min,0,'N/A',stdFormatNum)}–${fVal(p.alter?.max,0,'N/A',stdFormatNum)})`
        );
        addRow('Geschlecht, männlich [n (%)]', 'Sex, male [n (%)]',
            p => `${formatNumber(p.geschlecht?.m, 0, '0', true) ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${formatNumber(p.geschlecht?.m, 0, '0', true) ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${formatNumber(p.geschlecht?.m, 0, '0', true) ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`
        );
        addRow('Pathologischer N-Status, positiv [n (%)]', 'Pathological N-Status, positive [n (%)]',
            p => `${formatNumber(p.nStatus?.plus, 0, '0', true) ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${formatNumber(p.nStatus?.plus, 0, '0', true) ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${formatNumber(p.nStatus?.plus, 0, '0', true) ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, commonData) {
        if (!allKollektivStats) return `<p class="text-muted small">${lang === 'de' ? 'Keine Gütedaten für diese Sektion verfügbar.' : 'No performance data available for this section.'}</p>`;
        let tableHTML = '';
        let tableIdForHTML = 'pub-table-default-guete';
        let tableTitleDe = 'Diagnostische Güte';
        let tableTitleEn = 'Diagnostic Performance';
        let tableCaption = '';

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const renderTableRowsForMethod = (methodName, statsGetter, methodDisplayName = null) => {
            let rows = '';
            kollektive.forEach(kolId => {
                const stats = statsGetter(kolId);
                const currentKollektivData = allKollektivStats?.[kolId]?.deskriptiv;
                const nPat = currentKollektivData?.anzahlPatienten || 0;
                const displayName = methodDisplayName || methodName;

                 if (stats && stats.matrix && (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn > 0)) {
                    rows += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kolId)} (N=${formatNumber(nPat,0,lang,true)})</td>
                                <td>${_formatMetricForTable(stats.sens, 1, true, lang)}</td>
                                <td>${_formatMetricForTable(stats.spez, 1, true, lang)}</td>
                                <td>${_formatMetricForTable(stats.ppv, 1, true, lang)}</td>
                                <td>${_formatMetricForTable(stats.npv, 1, true, lang)}</td>
                                <td>${_formatMetricForTable(stats.acc, 1, true, lang)}</td>
                                <td>${_formatMetricForTable(stats.auc, 3, false, lang)}</td>
                              </tr>`;
                } else {
                     rows += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kolId)} (N=${formatNumber(nPat,0,lang,true)})</td>
                                <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten' : 'No valid data'}</em></td>
                              </tr>`;
                }
            });
            return rows;
        };

        const renderSingleKollektivTableRowsForMethod = (methodName, kolIdForSet, stats, methodDisplayName = null) => {
            let rows = '';
            const currentKollektivData = allKollektivStats?.[kolIdForSet]?.deskriptiv;
            const nPat = currentKollektivData?.anzahlPatienten || 0;
            const displayName = methodDisplayName || methodName;

            if (stats && stats.matrix && (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn > 0)) {
                 rows += `<tr>
                            <td>${displayName}</td>
                            <td>${getKollektivDisplayName(kolIdForSet)} (N=${formatNumber(nPat,0,lang,true)})</td>
                            <td>${_formatMetricForTable(stats.sens, 1, true, lang)}</td>
                            <td>${_formatMetricForTable(stats.spez, 1, true, lang)}</td>
                            <td>${_formatMetricForTable(stats.ppv, 1, true, lang)}</td>
                            <td>${_formatMetricForTable(stats.npv, 1, true, lang)}</td>
                            <td>${_formatMetricForTable(stats.acc, 1, true, lang)}</td>
                            <td>${_formatMetricForTable(stats.auc, 3, false, lang)}</td>
                          </tr>`;
            } else {
                 rows += `<tr>
                            <td>${displayName}</td>
                            <td>${getKollektivDisplayName(kolIdForSet)} (N=${formatNumber(nPat,0,lang,true) || '?'})</td>
                            <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten oder nicht anwendbar' : 'No valid data or not applicable'}</em></td>
                          </tr>`;
            }
            return rows;
        };

        if (sectionId === 'ergebnisse_as_performance') {
            const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle;
            tableIdForHTML = tableConfig.id;
            tableTitleDe = tableConfig.titleDe;
            tableTitleEn = tableConfig.titleEn;
            tableHTML += `<h4 class="mt-4 mb-3 publication-table-title" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableCaption = lang === 'de' ? 'Diagnostische Gütemetriken für das Avocado Sign (AS) in Relation zum pathologischen N-Status für verschiedene Patientenkollektive. Angegeben sind Sensitivität (Sens.), Spezifität (Spez.), positiver prädiktiver Wert (PPV), negativer prädiktiver Wert (NPV), Accuracy (Acc.) und Fläche unter der ROC-Kurve (AUC) mit jeweiligen 95%-Konfidenzintervallen (95%-KI).' : 'Diagnostic performance metrics for the Avocado Sign (AS) in relation to pathological N-status for different patient cohorts. Sensitivity (Sens.), specificity (Spez.), positive predictive value (PPV), negative predictive value (NPV), accuracy (Acc.), and area under the ROC curve (AUC) are reported with their respective 95% confidence intervals (95% CI).';
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><caption>${tableCaption}</caption><thead><tr><th>${lang==='de'?'Methode':'Method'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
            tableHTML += renderTableRowsForMethod('Avocado Sign', (kolId) => allKollektivStats?.[kolId]?.gueteAS);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
            tableIdForHTML = tableConfig.id;
            tableTitleDe = tableConfig.titleDe;
            tableTitleEn = tableConfig.titleEn;
            tableHTML += `<h4 class="mt-4 mb-3 publication-table-title" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableCaption = lang === 'de' ? 'Diagnostische Gütemetriken für Literatur-basierte T2-Kriteriensets in Relation zum pathologischen N-Status. Jedes Set wurde auf dem in der Literatur beschriebenen oder einem vergleichbaren Zielkollektiv evaluiert.' : 'Diagnostic performance metrics for literature-based T2 criteria sets in relation to pathological N-status. Each set was evaluated on its target cohort as described in the literature or a comparable cohort.';
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><caption>${tableCaption}</caption><thead><tr><th>${lang==='de'?'Kriteriensatz':'Criteria Set'}</th><th>${lang==='de'?'Angew. Kollektiv':'Applied Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if(studySet){
                    const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                    const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                    tableHTML += renderSingleKollektivTableRowsForMethod(conf.nameKey, targetKollektivForStudy, stats, studySet.displayShortName);
                }
            });
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle;
            tableIdForHTML = tableConfig.id;
            tableTitleDe = tableConfig.titleDe.replace('{BF_METRIC}', bfZielMetric);
            tableTitleEn = tableConfig.titleEn.replace('{BF_METRIC}', bfZielMetric);
            tableHTML += `<h4 class="mt-4 mb-3 publication-table-title" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableCaption = lang === 'de' ? `Diagnostische Gütemetriken für mittels Brute-Force für die Zielmetrik '${bfZielMetric}' optimierte T2-Kriteriensets in Relation zum pathologischen N-Status.` : `Diagnostic performance metrics for T2 criteria sets optimized via brute-force for the target metric '${bfZielMetric}' in relation to pathological N-status.`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><caption>${tableCaption}</caption><thead><tr><th>${lang==='de'?'Optimierungs-Ziel':'Optimization Target'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;
            tableHTML += renderTableRowsForMethod(`Optimiert für ${bfZielMetric}`, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
             const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle;
             tableIdForHTML = tableConfig.id;
             tableTitleDe = tableConfig.titleDe;
             tableTitleEn = tableConfig.titleEn;
             tableHTML += `<h4 class="mt-4 mb-3 publication-table-title" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
             tableCaption = lang === 'de' ? 'Statistischer Vergleich der diagnostischen Leistung (AUC und Accuracy) zwischen Avocado Sign (AS) und verschiedenen T2-Kriteriensets (Literatur-basiert sowie für {BF_METRIC} optimiert). P-Werte < 0.05 indizieren einen signifikanten Unterschied.' : `Statistical comparison of diagnostic performance (AUC and Accuracy) between Avocado Sign (AS) and various T2 criteria sets (literature-based and optimized for {BF_METRIC}). P-values < 0.05 indicate a significant difference.`;
             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><caption>${tableCaption.replace('{BF_METRIC}', bfZielMetric)}</caption>
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
                const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
                const vergleichASvsBF = allKollektivStats?.[kolId]?.vergleichASvsT2_bruteforce;

                const litSetsForKollektiv = PUBLICATION_CONFIG.literatureCriteriaSets.filter(lc => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                    return studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'));
                });

                litSetsForKollektiv.forEach(litSetConf => {
                    const litStats = allKollektivStats?.[kolId]?.gueteT2_literatur?.[litSetConf.id];
                    const vergleichASvsLit = allKollektivStats?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`];
                    const litShortName = studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id;

                    if (asStats && litStats && vergleichASvsLit) {
                        tableHTML += `<tr>
                            <td>AS vs. ${litShortName}</td>
                            <td>${getKollektivDisplayName(kolId)}</td>
                            <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                            <td>${litShortName} (${_formatMetricForTable(litStats.auc, false, 3, lang)})</td>
                            <td>${formatNumber(vergleichASvsLit.delong?.diffAUC, 3, 'N/A', lang === 'en')}</td>
                            <td>${_getPValueTextForPublication(vergleichASvsLit.delong?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.delong?.pValue)}</td>
                            <td>${_getPValueTextForPublication(vergleichASvsLit.mcnemar?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsLit.mcnemar?.pValue)}</td>
                        </tr>`;
                    }
                });

                 if (asStats && bfStats && vergleichASvsBF && bfDef && bfDef.metricName === bfZielMetric) {
                     tableHTML += `<tr>
                        <td>AS vs. BF-Optimiert (${bfDef.metricName})</td>
                        <td>${getKollektivDisplayName(kolId)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                        <td>BF (${_formatMetricForTable(bfStats.auc, false, 3, lang)})</td>
                        <td>${formatNumber(vergleichASvsBF.delong?.diffAUC, 3, 'N/A', lang === 'en')}</td>
                        <td>${_getPValueTextForPublication(vergleichASvsBF.delong?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.delong?.pValue)}</td>
                        <td>${_getPValueTextForPublication(vergleichASvsBF.mcnemar?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichASvsBF.mcnemar?.pValue)}</td>
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
            references: commonDataFromLogic.references || APP_CONFIG.REFERENCES_FOR_PUBLICATION || {}
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6 publication-main-title">${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}</h1>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h2 class="mb-3 h4 publication-sub-title">${subSection.label}</h2>`;

            if (typeof publicationTextGenerator === 'undefined' || typeof publicationTextGenerator.getSectionText !== 'function') {
                combinedHtml += `<p class="text-danger">Fehler: publicationTextGenerator.getSectionText ist nicht verfügbar.</p>`;
            } else {
                const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);
                combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert oder ist nicht vorhanden.</p>`;
            }


            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                combinedHtml += '<div class="row mt-4 g-3 figure-row">';
                const chartConfigsChars = [
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart
                ];
                chartConfigsChars.forEach(chartConfig => {
                    const chartTitle = lang === 'de' ? chartConfig.titleDe : chartConfig.titleEn;
                     const figRef = chartTitle.match(/\((Abbildung|Figure) (\d+[a-z]?)\)/i);
                     const figLabel = figRef ? (lang === 'de' ? `Abb. ${figRef[2]}` : `Fig. ${figRef[2]}`) : '';
                    combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${chartConfig.id}"><h5 class="text-center small mb-1 chart-title-pub">${chartTitle.replace(/\s*\(.*\)/, '')}</h5><p class="text-muted small text-center p-1 chart-figcaption">${figLabel}</p></div></div>`;
                });
                combinedHtml += '</div>';
            } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                combinedHtml += _renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, commonData);
                if (subSection.id === 'ergebnisse_vergleich_performance') {
                     combinedHtml += '<div class="row mt-4 g-3 figure-row">';
                     const chartElementsConfigPerf = [
                        PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartGesamt,
                        PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartDirektOP,
                        PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceChartNRCT
                     ];
                     const kollektiveForPerfCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                     chartElementsConfigPerf.forEach((chartConfig, index) => {
                        const chartTitle = lang === 'de' ? chartConfig.titleDe : chartConfig.titleEn;
                        const figRef = chartTitle.match(/\((Abbildung|Figure) (\d+[a-z]?)\)/i);
                        const figLabel = figRef ? (lang === 'de' ? `Abb. ${figRef[2]}` : `Fig. ${figRef[2]}`) : '';
                        combinedHtml += `<div class="col-md-4"><div class="chart-container border rounded p-2" id="${chartConfig.id}"><h5 class="text-center small mb-1 chart-title-pub">${chartTitle.replace('{Kollektiv}', getKollektivDisplayName(kollektiveForPerfCharts[index])).replace(/\s*\(.*\)/, '')}</h5><p class="text-muted small text-center p-1 chart-figcaption">${figLabel}</p></div></div>`;
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
