const publicationTables = (() => {

    function _formatMetricForTable(metricData, isPercent = true, digits = 0, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value) || !isFinite(metricData.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                // For non-percentage numbers (like AUC/F1-Score), always use period as decimal separator for international consistency in tables
                formattedNum = formatNumber(val, d, 'N/A', true); // Use standard format
            }
            return formattedNum;
        };

        let valStr = formatSingleValue(metricData.value, digits, isPercent);
        if (valStr === 'N/A') return valStr;

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && isFinite(metricData.ci.lower) && isFinite(metricData.ci.upper) && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper)) {
            let lowerStr = formatSingleValue(metricData.ci.lower, digits, isPercent);
            let upperStr = formatSingleValue(metricData.ci.upper, digits, isPercent);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;

            // Remove % sign for CI range as per Radiology style (e.g., 85% (95% CI: 75–95)%)
            if (isPercent) {
                valStr = valStr.replace('%', '');
                lowerStr = lowerStr.replace('%', '');
                upperStr = upperStr.replace('%', '');
            }
            return `${valStr} (95% CI: ${lowerStr}–${upperStr})${isPercent ? '%' : ''}`;
        }
        // If no CI, return value with percentage if applicable
        return `${valStr}${isPercent && valStr !== 'N/A' ? '%' : ''}`;
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
                                <td>${studySet.name || studySet.labelKey}</td>
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
                    <th>${getKollektivDisplayName('Gesamt')}<br>(N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP')}<br>(N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('nRCT')}<br>(N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 0, placeholder = 'N/A') => {
            const num = parseFloat(val);
            if (isNaN(num) || !isFinite(num)) return placeholder;
            return num.toFixed(dig); // Use toFixed for numerical formatting to control digits
        };
        const fPerc = (count, total, dig = 0) => {
            if (total === 0 || count === undefined || count === null || isNaN(count)) return 'N/A';
            const percentage = (count / total) * 100;
            return formatPercent(percentage / 100, dig); // Pass the raw ratio to formatPercent
        };
        const na = 'N/A';

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

        // Alter: Median (Min-Max) [Jahre]
        addRow('Alter, Median (Min–Max) [Jahre]', 'Age, Median (Min–Max) [Years]',
            p => `${fVal(p.alter?.median,0)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median,0)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`,
            p => `${fVal(p.alter?.median,0)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})`
        );
        // Geschlecht, männlich [n (%)]
        addRow('Geschlecht, männlich [n (%)]', 'Sex, male [n (%)]',
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten, 0)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten, 0)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten, 0)})`
        );
        // Pathologischer N-Status, positiv [n (%)]
        addRow('Pathologischer N-Status, positiv [n (%)]', 'Pathological N-Status, positive [n (%)]',
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten, 0)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten, 0)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten, 0)})`
        );
        tableHTML += `
            <tr>
                <td colspan="4" class="small text-muted" style="text-align: left;">
                    <br>
                    ${lang === 'de' ? 'Hinweis: Diese Tabelle enthält eine Zusammenfassung der demografischen und klinischen Merkmale der Studienteilnehmer. Informationen zu Rasse und Ethnizität wurden in dieser Studie nicht erhoben. Bei zukünftigen Erhebungen würden diese Informationen, falls verfügbar, gemäß den Journalrichtlinien detailliert berichtet werden, inklusive der Quelle der Klassifizierung und der Auflistung spezifischer Kategorien in alphabetischer Reihenfolge.' : 'Note: This table summarizes the demographic and clinical characteristics of the study participants. Information on race and ethnicity was not collected in this study. In future data collection, if available, such information would be reported in detail according to journal guidelines, including the source of classification and listing specific categories in alphabetical order.'}
                </td>
            </tr>
        `;
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, commonData) {
        if (!allKollektivStats) return `<p class="text-muted small">Keine Gütedaten für diese Sektion verfügbar.</p>`;
        let tableHTML = '';
        let tableIdForHTML = 'pub-table-default-guete';
        let tableTitleDe = 'Diagnostische Güte';
        let tableTitleEn = 'Diagnostic Performance';

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const renderTableRows = (methodName, statsGetter, includeBFDef = false) => {
            let rows = '';
            kollektive.forEach(kolId => {
                const stats = statsGetter(kolId);
                const currentKollektivData = allKollektivStats?.[kolId]?.deskriptiv;
                const nPat = currentKollektivData?.anzahlPatienten || 0;

                 if (stats && stats.matrix && (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn > 0)) {
                    let bfDefText = '';
                    if (includeBFDef) {
                        const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;
                        if (bfDef) {
                            const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, false);
                            const metricValueStr = formatNumber(bfDef.metricValue, 4, 'N/A', true);
                            const metricNameDisplay = bfDef.metricName || bfZielMetric;
                            bfDefText = `<br>(${lang === 'de' ? 'Optimiert für' : 'Optimized for'} ${metricNameDisplay}, ${lang === 'de' ? 'erreichter Wert' : 'achieved value'}: ${metricValueStr})<br>${lang === 'de' ? 'Kriterien' : 'Criteria'}: ${formattedCriteria}`;
                        } else {
                            bfDefText = `<br>(${lang === 'de' ? 'Keine BF-Kriterien' : 'No BF criteria'})`;
                        }
                    }

                    rows += `<tr>
                                <td>${methodName}${bfDefText}</td>
                                <td>${getKollektivDisplayName(kolId)}<br>(N=${nPat})</td>
                                <td>${_formatMetricForTable(stats.sens, true, 0, lang)}</td>
                                <td>${_formatMetricForTable(stats.spez, true, 0, lang)}</td>
                                <td>${_formatMetricForTable(stats.ppv, true, 0, lang)}</td>
                                <td>${_formatMetricForTable(stats.npv, true, 0, lang)}</td>
                                <td>${_formatMetricForTable(stats.acc, true, 0, lang)}</td>
                                <td>${_formatMetricForTable(stats.auc, false, 2, lang)}</td>
                              </tr>`;
                } else {
                     rows += `<tr>
                                <td>${methodName}${includeBFDef ? '<br>' + (lang === 'de' ? 'Keine BF-Kriterien' : 'No BF criteria') : ''}</td>
                                <td>${getKollektivDisplayName(kolId)}<br>(N=${nPat > 0 ? nPat : '?'})</td>
                                <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten oder nicht anwendbar' : 'No valid data or not applicable'}</em></td>
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
                            <td>${getKollektivDisplayName(kolIdForSet)}<br>(N=${nPat})</td>
                            <td>${_formatMetricForTable(stats.sens, true, 0, lang)}</td>
                            <td>${_formatMetricForTable(stats.spez, true, 0, lang)}</td>
                            <td>${_formatMetricForTable(stats.ppv, true, 0, lang)}</td>
                            <td>${_formatMetricForTable(stats.npv, true, 0, lang)}</td>
                            <td>${_formatMetricForTable(stats.acc, true, 0, lang)}</td>
                            <td>${_formatMetricForTable(stats.auc, false, 2, lang)}</td>
                          </tr>`;
            } else {
                 rows += `<tr>
                            <td>${methodName}</td>
                            <td>${getKollektivDisplayName(kolIdForSet)}<br>(N=${nPat > 0 ? nPat : '?'})</td>
                            <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten oder nicht anwendbar' : 'No valid data or not applicable'}</em></td>
                          </tr>`;
            }
            return rows;
        };

        if (sectionId === 'ergebnisse_as_diagnostische_guete') {
            tableIdForHTML = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.id;
            tableTitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleDe;
            tableTitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleEn;
            tableHTML += `<h4 class="mt-4 mb-3" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><thead><tr><th>${lang==='de'?'Methode':'Method'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens.<br>(95% CI)</th><th>Spez.<br>(95% CI)</th><th>PPV<br>(95% CI)</th><th>NPV<br>(95% CI)</th><th>Acc.<br>(95% CI)</th><th>AUC<br>(95% CI)</th></tr></thead><tbody>`;
            tableHTML += renderTableRows('Avocado Sign', (kolId) => allKollektivStats?.[kolId]?.gueteAS);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_t2_literatur_diagnostische_guete') {
            tableIdForHTML = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
            tableTitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleDe;
            tableTitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleEn;
            tableHTML += `<h4 class="mt-4 mb-3" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><thead><tr><th>${lang==='de'?'Kriteriensatz':'Criteria Set'}</th><th>${lang==='de'?'Angew. Kollektiv':'Applied Cohort'}</th><th>Sens.<br>(95% CI)</th><th>Spez.<br>(95% CI)</th><th>PPV<br>(95% CI)</th><th>NPV<br>(95% CI)</th><th>Acc.<br>(95% CI)</th><th>AUC<br>(95% CI)</th></tr></thead><tbody>`;
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if(studySet){
                    const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                    const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                    tableHTML += renderSingleKollektivTableRows(studySet.name || studySet.labelKey, targetKollektivForStudy, stats);
                }
            });
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_t2_optimiert_diagnostische_guete') {
            tableIdForHTML = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id;
            tableTitleDe = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleDe.replace('{BF_METRIC}', bfZielMetric);
            tableTitleEn = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleEn.replace('{BF_METRIC}', bfZielMetric);
            tableHTML += `<h4 class="mt-4 mb-3" id="${tableIdForHTML}-title">${lang === 'de' ? tableTitleDe : tableTitleEn}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdForHTML}"><thead><tr><th>${lang==='de'?'Optimierungs-Ziel':'Optimization Target'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens.<br>(95% CI)</th><th>Spez.<br>(95% CI)</th><th>PPV<br>(95% CI)</th><th>NPV<br>(95% CI)</th><th>Acc.<br>(95% CI)</th><th>AUC<br>(95% CI)</th></tr></thead><tbody>`;
            tableHTML += renderTableRows(`Optimiert für ${bfZielMetric}`, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce, true);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_vergleich_as_vs_t2') {
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
                    <th>${lang==='de'?'Diff. AUC (M1–M2)':'AUC Diff. (M1–M2)'}</th>
                    <th>${lang==='de'?'DeLong p-Wert (AUC)':'DeLong p-Value (AUC)'}</th>
                    <th>${lang==='de'?'McNemar p-Wert (Acc.)':'McNemar p-Value (Acc.)'}</th>
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

                // Format AUC differences and p-values
                const formatAucVal = (val) => formatNumber(val, 2, 'N/A', true); // AUCs have 2 digits
                const formatPVal = (pVal) => getPValueText(pVal).replace('p=', ''); // Remove 'p=' for table display

                let diffAucLitStr = formatAucVal(vergleichASvsLit?.delong?.diffAUC);
                let diffAucBfStr = formatAucVal(vergleichASvsBF?.delong?.diffAUC);
                
                let pDeLongASvsLit = formatPVal(vergleichASvsLit?.delong?.pValue);
                let pMcNemarASvsLit = formatPVal(vergleichASvsLit?.mcnemar?.pValue);
                let pDeLongASvsBF = formatPVal(vergleichASvsBF?.delong?.pValue);
                let pMcNemarASvsBF = formatPVal(vergleichASvsBF?.mcnemar?.pValue);

                if (asStats && litStats && vergleichASvsLit) {
                    tableHTML += `<tr>
                        <td>AS vs. ${litSetConf.displayShortName || litSetConf.labelKey || litSetConf.id}</td>
                        <td>${getKollektivDisplayName(kolId)}</td>
                        <td>${formatAucVal(asStats.auc?.value)}</td>
                        <td>${formatAucVal(litStats.auc?.value)}</td>
                        <td>${diffAucLitStr}</td>
                        <td>${pDeLongASvsLit} ${getStatisticalSignificanceSymbol(vergleichASvsLit.delong?.pValue)}</td>
                        <td>${pMcNemarASvsLit} ${getStatisticalSignificanceSymbol(vergleichASvsLit.mcnemar?.pValue)}</td>
                    </tr>`;
                }
                 if (asStats && bfStats && vergleichASvsBF && bfDef) {
                     tableHTML += `<tr>
                        <td>AS vs. BF-Optimized (${bfDef.metricName || bfZielMetric})</td>
                        <td>${getKollektivDisplayName(kolId)}</td>
                        <td>${formatAucVal(asStats.auc?.value)}</td>
                        <td>${formatAucVal(bfStats.auc?.value)}</td>
                        <td>${diffAucBfStr}</td>
                        <td>${pDeLongASvsBF} ${getStatisticalSignificanceSymbol(vergleichASvsBF.delong?.pValue)}</td>
                        <td>${pMcNemarASvsBF} ${getStatisticalSignificanceSymbol(vergleichASvsBF.mcnemar?.pValue)}</td>
                    </tr>`;
                 }
            });
            tableHTML += `</tbody></table></div>`;
        }
        return tableHTML;
    }

    return Object.freeze({
        renderLiteraturT2KriterienTabelle: _renderLiteraturT2KriterienTabelle,
        renderPatientenCharakteristikaTabelle: _renderPatientenCharakteristikaTabelle,
        renderDiagnostischeGueteTabellen: _renderDiagnostischeGueteTabellen
    });

})();
