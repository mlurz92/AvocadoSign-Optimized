const publicationTableGeneratorRadiology = (() => {

    // Importiere die benötigten Formatierungsfunktionen vom Text-Generator
    const _formatNumberForPub = publicationTextGeneratorRadiology.formatNumberForPub;
    const _formatPercentForPub = publicationTextGeneratorRadiology.formatPercentForPub;
    const _fCIForPub = publicationTextGeneratorRadiology.fCIForPub;
    const _getPValueTextForPub = publicationTextGeneratorRadiology.getPValueTextForPub;


    function _formatTableCell(value, digits = 1, lang = 'de', options = {}) {
        const { isRate = false, isPValue = false, isMeanSD = false, isMedianIQR = false, isRange = false, isCount = false } = options;
        const naStr = 'N/A';

        if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
            return naStr;
        }

        if (isPValue) {
            return _getPValueTextForPub(value, lang).replace('P = ', ''); // Entferne 'P = ' für die Tabelle
        }

        if (isMeanSD && typeof value === 'object' && value.mean !== undefined && value.sd !== undefined) {
            const meanStr = _formatTableCell(value.mean, digits, lang);
            const sdStr = _formatTableCell(value.sd, digits, lang);
            return `${meanStr} ± ${sdStr}`;
        }

        if (isMedianIQR && typeof value === 'object' && value.median !== undefined) {
            const medianStr = _formatTableCell(value.median, digits, lang);
            const q1Str = value.q1 !== undefined ? _formatTableCell(value.q1, digits, lang) : naStr;
            const q3Str = value.q3 !== undefined ? _formatTableCell(value.q3, digits, lang) : naStr;
            if (q1Str !== naStr && q3Str !== naStr) {
                return `${medianStr} (IQR: ${q1Str}–${q3Str})`;
            }
            return medianStr;
        }
        
        if (isRange && typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
            const minStr = _formatTableCell(value.min, digits, lang);
            const maxStr = _formatTableCell(value.max, digits, lang);
            return `${minStr}–${maxStr}`;
        }


        if (isRate) {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || !isFinite(numValue)) return naStr;
            let percentString = (numValue * 100).toFixed(digits);
            if (lang === 'de') percentString = percentString.replace('.', ',');
            return `${percentString}%`;
        }

        if (isCount) {
            const numValue = parseInt(value, 10);
            if (isNaN(numValue)) return naStr;
            // Verwende die exponierte Funktion für Zahlenformatierung mit Standardformat
            return _formatNumberForPub(numValue, 0, lang, true);
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue) || !isFinite(numValue)) return naStr;
        // Verwende die exponierte Funktion für Zahlenformatierung
        return _formatNumberForPub(numValue, digits, lang);
    }

    function _formatCIForTable(metricValue, ciLower, ciUpper, digits = 1, isRate = true, lang = 'de') {
        const valueStr = _formatTableCell(metricValue, digits, lang, { isRate });
        if (valueStr === 'N/A') return 'N/A';

        const lowerStr = _formatTableCell(ciLower, digits, lang, { isRate });
        const upperStr = _formatTableCell(ciUpper, digits, lang, { isRate });

        if (lowerStr === 'N/A' || upperStr === 'N/A') return valueStr;
        
        let valuePart = valueStr;
        let ciPart = `${lowerStr}, ${upperStr}`;
        if(isRate) {
            valuePart = valueStr.replace('%','');
            ciPart = `${lowerStr.replace('%','')}, ${upperStr.replace('%','')}`;
        }
        return `${valuePart} (${ciPart})`;
    }


    function _renderLiteraturT2KriterienTabelleRadiology(lang) {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle;
        let tableHTML = `<h5 class="mt-4 mb-2" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h5>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv (Originalstudie)' : 'Primary Target Cohort (Original Study)'}</th>
                    <th>${lang === 'de' ? 'Kernkriterien (Zusammenfassung)' : 'Core Criteria (Summary)'}</th>
                    <th>${lang === 'de' ? 'Logische Verknüpfung' : 'Logic'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studySet.logic === 'KOMBINIERT' ?
                    (studySet.studyInfo?.keyCriteriaSummary || studySet.description || (lang === 'de' ? 'Kombinierte Logik gemäß Publikation' : 'Combined logic as per publication')) :
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false);

                tableHTML += `<tr>
                                <td>${studySet.name || UI_TEXTS.kollektivDisplayNames[studySet.id] || studySet.labelKey}</td>
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv)} ${(studySet.context && studySet.context !== studySet.applicableKollektiv) ? `(${(studySet.studyInfo?.patientCohort || studySet.context || 'N/A')})` : ''}</td>
                                <td style="white-space: normal;">${kriterienText || (lang === 'de' ? 'Keine Beschreibung' : 'No description')}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody>
            <tfoot>
                <tr><td colspan="4" class="small text-muted">${lang === 'de' ? 'ESGAR = European Society of Gastrointestinal and Abdominal Radiology.' : 'ESGAR = European Society of Gastrointestinal and Abdominal Radiology.'}</td></tr>
            </tfoot>
        </table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelleRadiology(allKollektivStats, lang, commonData) {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">${lang === 'de' ? 'Keine ausreichenden Patientendaten für Tabelle Ergebnisse 1 verfügbar.' : 'Insufficient patient data for Results Table 1.'}</p>`;

        let tableHTML = `<h5 class="mt-4 mb-2" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h5>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (n=${_formatTableCell(allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten, 0, lang, {isCount: true})})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (n=${_formatTableCell(allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten, 0, lang, {isCount: true})})</th>
                    <th>${getKollektivDisplayName('nRCT')} (n=${_formatTableCell(allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten, 0, lang, {isCount: true})})</th>
                </tr>
            </thead><tbody>`;
        
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

        addRow(lang === 'de' ? 'Alter (Jahre), Median (IQR)' : 'Age (years), median (IQR)', lang === 'de' ? 'Alter (Jahre), Median (IQR)' : 'Age (years), median (IQR)',
            p => _formatTableCell(p.alter, 0, lang, { isMedianIQR: true }),
            p => _formatTableCell(p.alter, 0, lang, { isMedianIQR: true }),
            p => _formatTableCell(p.alter, 0, lang, { isMedianIQR: true })
        );
         addRow(lang === 'de' ? 'Alter (Jahre), Mittelwert ± SD' : 'Age (years), mean ± SD', lang === 'de' ? 'Alter (Jahre), Mittelwert ± SD' : 'Age (years), mean ± SD',
            p => _formatTableCell(p.alter, 1, lang, { isMeanSD: true }),
            p => _formatTableCell(p.alter, 1, lang, { isMeanSD: true }),
            p => _formatTableCell(p.alter, 1, lang, { isMeanSD: true })
        );
        addRow(lang === 'de' ? 'Geschlecht, männlich, n (%)' : 'Sex, male, n (%)', lang === 'de' ? 'Geschlecht, männlich, n (%)' : 'Sex, male, n (%)',
            p => `${_formatTableCell(p.geschlecht?.m,0,lang,{isCount:true})} (${_formatPercentForPub(p.geschlecht?.m, p.anzahlPatienten, 0, lang)})`,
            p => `${_formatTableCell(p.geschlecht?.m,0,lang,{isCount:true})} (${_formatPercentForPub(p.geschlecht?.m, p.anzahlPatienten, 0, lang)})`,
            p => `${_formatTableCell(p.geschlecht?.m,0,lang,{isCount:true})} (${_formatPercentForPub(p.geschlecht?.m, p.anzahlPatienten, 0, lang)})`
        );
        addRow(lang === 'de' ? 'Pathologischer N-Status, positiv, n (%)' : 'Pathologic N-status, positive, n (%)', lang === 'de' ? 'Pathologischer N-Status, positiv, n (%)' : 'Pathologic N-status, positive, n (%)',
            p => `${_formatTableCell(p.nStatus?.plus,0,lang,{isCount:true})} (${_formatPercentForPub(p.nStatus?.plus, p.anzahlPatienten, 1, lang)})`,
            p => `${_formatTableCell(p.nStatus?.plus,0,lang,{isCount:true})} (${_formatPercentForPub(p.nStatus?.plus, p.anzahlPatienten, 1, lang)})`,
            p => `${_formatTableCell(p.nStatus?.plus,0,lang,{isCount:true})} (${_formatPercentForPub(p.nStatus?.plus, p.anzahlPatienten, 1, lang)})`
        );
         tableHTML += `</tbody>
            <tfoot>
                <tr><td colspan="4" class="small text-muted">${lang === 'de' ? 'IQR = Interquartilsabstand (Q1–Q3), SD = Standardabweichung, nRCT = neoadjuvante Radiochemotherapie.' : 'IQR = interquartile range (Q1–Q3), SD = standard deviation, nRCT = neoadjuvant chemoradiotherapy.'}</td></tr>
            </tfoot>
        </table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabelleRadiology(allKollektivStats, lang, sectionId, commonData) {
        if (!allKollektivStats) return `<p class="text-muted small">${lang === 'de' ? 'Keine Gütedaten verfügbar.' : 'No performance data available.'}</p>`;
        let tableHTML = '';
        let tableConfig = null;
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        switch(sectionId) {
            case 'ergebnisse_as_diagnostische_guete':
                tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle;
                break;
            case 'ergebnisse_t2_literatur_diagnostische_guete':
                tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
                break;
            case 'ergebnisse_t2_optimiert_diagnostische_guete':
                tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle;
                break;
            default: return `<p class="text-warning small">${lang === 'de' ? 'Unbekannter Tabellentyp für diagnostische Güte.' : 'Unknown table type for diagnostic performance.'}</p>`;
        }

        const titleDe = tableConfig.titleDe.replace('{BF_METRIC}', bfZielMetric);
        const titleEn = tableConfig.titleEn.replace('{BF_METRIC}', bfZielMetric);
        tableHTML += `<h5 class="mt-4 mb-2" id="${tableConfig.id}-title">${lang === 'de' ? titleDe : titleEn}</h5>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead><tr>
                <th>${lang==='de'?'Methode / Kriteriensatz':'Method / Criteria Set'}</th>
                <th>${lang==='de'?'Kollektiv (n)':'Cohort (n)'}</th>
                <th>${lang==='de'?'Sensitivität':'Sensitivity'} (%) (95% CI)</th>
                <th>${lang==='de'?'Spezifität':'Specificity'} (%) (95% CI)</th>
                <th>PPV (%) (95% CI)</th>
                <th>NPV (%) (95% CI)</th>
                <th>${lang==='de'?'Genauigkeit':'Accuracy'} (%) (95% CI)</th>
                <th>AUC (95% CI)</th>
            </tr></thead><tbody>`;

        const renderRows = (methodDisplayName, statsGetter, kollektivIds) => {
            let rows = '';
            kollektivIds.forEach(kolId => {
                const stats = statsGetter(kolId);
                const currentKollektivData = allKollektivStats?.[kolId]?.deskriptiv;
                const nPat = currentKollektivData?.anzahlPatienten || 0;
                const displayName = getKollektivDisplayName(kolId);

                 if (stats && stats.matrix && (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn > 0)) {
                    rows += `<tr>
                                <td>${methodDisplayName}</td>
                                <td>${displayName} (${_formatTableCell(nPat,0,lang,{isCount:true})})</td>
                                <td>${_formatCIForTable(stats.sens?.value, stats.sens?.ci?.lower, stats.sens?.ci?.upper, 1, true, lang)}</td>
                                <td>${_formatCIForTable(stats.spez?.value, stats.spez?.ci?.lower, stats.spez?.ci?.upper, 1, true, lang)}</td>
                                <td>${_formatCIForTable(stats.ppv?.value, stats.ppv?.ci?.lower, stats.ppv?.ci?.upper, 1, true, lang)}</td>
                                <td>${_formatCIForTable(stats.npv?.value, stats.npv?.ci?.lower, stats.npv?.ci?.upper, 1, true, lang)}</td>
                                <td>${_formatCIForTable(stats.acc?.value, stats.acc?.ci?.lower, stats.acc?.ci?.upper, 1, true, lang)}</td>
                                <td>${_formatCIForTable(stats.balAcc?.value, stats.balAcc?.ci?.lower, stats.balAcc?.ci?.upper, 1, true, lang)}</td>
                                <td>${_formatCIForTable(stats.f1?.value, stats.f1?.ci?.lower, stats.f1?.ci?.upper, 3, false, lang)}</td>
                                <td>${_formatCIForTable(stats.auc?.value, stats.auc?.ci?.lower, stats.auc?.ci?.upper, 2, false, lang)}</td>
                              </tr>`;
                } else {
                     rows += `<tr>
                                <td>${methodDisplayName}</td>
                                <td>${displayName} (${_formatTableCell(nPat,0,lang,{isCount:true})})</td>
                                <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten' : 'No valid data'}</em></td>
                              </tr>`;
                }
            });
            return rows;
        };
        
        const kollektiveToRender = ['Gesamt', 'direkt OP', 'nRCT'];

        if (sectionId === 'ergebnisse_as_diagnostische_guete') {
            tableHTML += renderRows('Avocado Sign', (kolId) => allKollektivStats?.[kolId]?.gueteAS, kollektiveToRender);
        } else if (sectionId === 'ergebnisse_t2_literatur_diagnostische_guete') {
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if(studySet){
                    const targetKollektivForStudy = studySet.applicableKollektiv || 'Gesamt';
                    const stats = allKollektivStats?.[targetKollektivForStudy]?.gueteT2_literatur?.[conf.id];
                    tableHTML += renderRows(studySet.name || UI_TEXTS.kollektivDisplayNames[studySet.id] || studySet.labelKey, () => stats, [targetKollektivForStudy]);
                }
            });
        } else if (sectionId === 'ergebnisse_t2_optimiert_diagnostische_guete') {
            tableHTML += renderRows(lang === 'de' ? `Optimierte T2-Kriterien (für ${bfZielMetric})` : `Optimized T2 Criteria (for ${bfZielMetric})`, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce, kollektiveToRender);
        }
        tableHTML += `</tbody>
            <tfoot>
                <tr><td colspan="8" class="small text-muted">${lang === 'de' ? 'PPV = Positiver Prädiktiver Wert, NPV = Negativer Prädiktiver Wert, AUC = Fläche unter der Kurve (hier äquivalent zur Balanced Accuracy). Alle Konfidenzintervalle (CI) sind 95%-Intervalle.' : 'PPV = positive predictive value, NPV = negative predictive value, AUC = area under the curve (here equivalent to balanced accuracy). All confidence intervals (CI) are 95% CIs.'}</td></tr>
            </tfoot>
        </table></div>`;
        return tableHTML;
    }
    
    function _renderStatistischerVergleichAST2TabelleRadiology(allKollektivStats, lang, commonData) {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle;
        const bfZielMetric = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        let tableHTML = `<h5 class="mt-4 mb-2" id="${tableConfig.id}-title">${lang === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h5>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead><tr>
                <th>${lang==='de'?'Vergleich':'Comparison'}</th>
                <th>${lang==='de'?'Kollektiv':'Cohort'}</th>
                <th>${lang==='de'?'AUC Methode 1':'AUC Method 1'} (95% CI)</th>
                <th>${lang==='de'?'AUC Methode 2':'AUC Method 2'} (95% CI)</th>
                <th>${lang==='de'?'Differenz AUC (M1–M2)':'AUC Difference (M1–M2)'}</th>
                <th>DeLong ${lang==='de'?'p-Wert':'P value'} (AUC)</th>
                <th>McNemar ${lang==='de'?'p-Wert':'P value'} (Accuracy)</th>
            </tr></thead><tbody>`;

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
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

            if (asStats && litStats && vergleichASvsLit) {
                const litSetName = studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || UI_TEXTS.kollektivDisplayNames[litSetConf.id] || litSetConf.id;
                tableHTML += `<tr>
                    <td>AS vs. ${litSetName}</td>
                    <td>${getKollektivDisplayName(kolId)}</td>
                    <td>${_fCIForTable(asStats.auc.value, asStats.auc.ci?.lower, asStats.auc.ci?.upper, 2, false, lang)}</td>
                    <td>${_fCIForTable(litStats.auc.value, litStats.auc.ci?.lower, litStats.auc.ci?.upper, 2, false, lang)}</td>
                    <td>${_formatTableCell(vergleichASvsLit.delong?.diffAUC, 2, lang, {forceSign: true})}</td>
                    <td>${_formatTableCell(vergleichASvsLit.delong?.pValue, 3, lang, {isPValue: true})}</td>
                    <td>${_formatTableCell(vergleichASvsLit.mcnemar?.pValue, 3, lang, {isPValue: true})}</td>
                </tr>`;
            }
             if (asStats && bfStats && vergleichASvsBF && bfDef) {
                 tableHTML += `<tr>
                    <td>AS vs. ${lang === 'de' ? 'Optimierte T2 (für ' : 'Optimized T2 (for '}${bfDef.metricName || bfZielMetric})</td>
                    <td>${getKollektivDisplayName(kolId)}</td>
                    <td>${_fCIForTable(asStats.auc.value, asStats.auc.ci?.lower, asStats.auc.ci?.upper, 2, false, lang)}</td>
                    <td>${_fCIForTable(bfStats.auc.value, bfStats.auc.ci?.lower, bfStats.auc.ci?.upper, 2, false, lang)}</td>
                    <td>${_formatTableCell(vergleichASvsBF.delong?.diffAUC, 2, lang, {forceSign: true})}</td>
                    <td>${_formatTableCell(vergleichASvsBF.delong?.pValue, 3, lang, {isPValue: true})}</td>
                    <td>${_formatTableCell(vergleichASvsBF.mcnemar?.pValue, 3, lang, {isPValue: true})}</td>
                </tr>`;
             }
        });
        tableHTML += `</tbody>
            <tfoot>
                <tr><td colspan="7" class="small text-muted">${lang === 'de' ? 'AUC = Fläche unter der Kurve. Alle Konfidenzintervalle (CI) sind 95%-Intervalle. P-Werte < .05 gelten als statistisch signifikant.' : 'AUC = area under the curve. All confidence intervals (CI) are 95% CIs. P values < .05 were considered statistically significant.'}</td></tr>
            </tfoot>
        </table></div>`;
        return tableHTML;
    }


    return Object.freeze({
        renderLiteraturT2KriterienTabelleRadiology: _renderLiteraturT2KriterienTabelleRadiology,
        renderPatientenCharakteristikaTabelleRadiology: _renderPatientenCharakteristikaTabelleRadiology,
        renderDiagnostischeGueteTabelleRadiology: _renderDiagnostischeGueteTabelleRadiology,
        renderStatistischerVergleichAST2TabelleRadiology: _renderStatistischerVergleichAST2TabelleRadiology
    });

})();
