const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (isP) {
                return formatPercent(val, d, 'N/A');
            } else {
                let numStr = formatNumber(val, d, 'N/A', true);
                if (lang === 'de' && numStr !== 'N/A' && typeof numStr === 'string') {
                    numStr = numStr.replace('.', ',');
                }
                return numStr;
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
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets' : 'Table 2: Overview of Literature-Based T2 Criteria Sets'}</h4>`;
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
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv)} (${studySet.context})</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang) {
        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.</p>`;
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle 1: Patientencharakteristika' : 'Table 1: Patient Characteristics'}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>Gesamt (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>Direkt OP (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>nRCT (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder, lang === 'en');
        const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null) ? formatPercent(count / total, dig) : 'N/A';

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

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, currentKollektivForCharts) {
        if (!allKollektivStats) return '<p class="text-muted small">Keine Gütedaten für diese Sektion verfügbar.</p>';
        let tableHTML = '';
        const tableIdBase = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteGesamtTabelle.id;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const bfZielMetric = PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const renderTableRows = (methodName, statsGetter) => {
            let rows = '';
            kollektive.forEach(kolId => {
                const stats = statsGetter(kolId);
                const nPat = stats?.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : 0;
                 if (stats && nPat > 0) {
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
                                <td>${getKollektivDisplayName(kolId)}</td>
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
                            <td>${getKollektivDisplayName(kolId)}</td>
                            <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten oder nicht anwendbar' : 'No valid data or not applicable'}</em></td>
                          </tr>`;
            }
            return rows;
        }

        if (sectionId === 'ergebnisse_as_performance') {
            tableHTML += `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)' : 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)'}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdBase}-as"><thead><tr><th>${lang==='de'?'Methode':'Method'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95% CI)</th><th>Spez. (95% CI)</th><th>PPV (95% CI)</th><th>NPV (95% CI)</th><th>Acc. (95% CI)</th><th>AUC (95% CI)</th></tr></thead><tbody>`;
            tableHTML += renderTableRows('Avocado Sign', (kolId) => allKollektivStats?.[kolId]?.gueteAS);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            tableHTML += `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)' : 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)'}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdBase}-literatur"><thead><tr><th>${lang==='de'?'Kriteriensatz':'Criteria Set'}</th><th>${lang==='de'?'Angew. Kollektiv':'Applied Cohort'}</th><th>Sens. (95% CI)</th><th>Spez. (95% CI)</th><th>PPV (95% CI)</th><th>NPV (95% CI)</th><th>Acc. (95% CI)</th><th>AUC (95% CI)</th></tr></thead><tbody>`;
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
            tableHTML += `<h4 class="mt-4 mb-3">${lang === 'de' ? `Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: ${bfZielMetric}, vs. N-Status)` : `Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: ${bfZielMetric}, vs. N-Status)`}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdBase}-bf"><thead><tr><th>${lang==='de'?'Optimierungs-Ziel':'Optimization Target'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95% CI)</th><th>Spez. (95% CI)</th><th>PPV (95% CI)</th><th>NPV (95% CI)</th><th>Acc. (95% CI)</th><th>AUC (95% CI)</th></tr></thead><tbody>`;
            tableHTML += renderTableRows(`Optimiert für ${bfZielMetric}`, (kolId) => allKollektivStats?.[kolId]?.gueteT2_bruteforce);
            tableHTML += `</tbody></table></div>`;
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
             tableHTML += `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle 6: Statistischer Vergleich - Avocado Sign vs. T2-Kriterien (Literatur und Optimiert)' : 'Table 6: Statistical Comparison - Avocado Sign vs. T2 Criteria (Literature and Optimized)'}</h4>`;
             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableIdBase}-vergleich">
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
                const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => studyT2CriteriaManager.getStudyCriteriaSetById(lc.id)?.applicableKollektiv === kolId || (kolId === 'Gesamt' && studyT2CriteriaManager.getStudyCriteriaSetById(lc.id)?.applicableKollektiv === 'Gesamt'));
                const litStats = litSetConf ? allKollektivStats?.[kolId]?.gueteT2_literatur?.[litSetConf.id] : null;
                const bfStats = allKollektivStats?.[kolId]?.gueteT2_bruteforce;
                const bfDef = allKollektivStats?.[kolId]?.bruteforce_definition;

                const vergleichASvsLit = litSetConf ? allKollektivStats?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;
                const vergleichASvsBF = allKollektivStats?.[kolId]?.vergleichASvsT2_bruteforce;

                let diffAucLitStr = formatNumber(vergleichASvsLit?.delong?.diffAUC, 3, 'N/A', true);
                if (lang === 'de' && diffAucLitStr !== 'N/A') diffAucLitStr = diffAucLitStr.replace('.', ',');

                let diffAucBfStr = formatNumber(vergleichASvsBF?.delong?.diffAUC, 3, 'N/A', true);
                if (lang === 'de' && diffAucBfStr !== 'N/A') diffAucBfStr = diffAucBfStr.replace('.', ',');

                if (asStats && litStats && vergleichASvsLit) {
                    tableHTML += `<tr>
                        <td>AS vs. Literatur (${studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id})</td>
                        <td>${getKollektivDisplayName(kolId)}</td>
                        <td>AS (${_formatMetricForTable(asStats.auc, false, 3, lang)})</td>
                        <td>Lit. (${_formatMetricForTable(litStats.auc, false, 3, lang)})</td>
                        <td>${diffAucLitStr}</td>
                        <td>${getPValueText(vergleichASvsLit.delong?.pValue, lang)}</td>
                        <td>${getPValueText(vergleichASvsLit.mcnemar?.pValue, lang)}</td>
                    </tr>`;
                }
                 if (asStats && bfStats && vergleichASvsBF && bfDef) {
                     tableHTML += `<tr>
                        <td>AS vs. BF-Optimiert (${bfDef.metricName})</td>
                        <td>${getKollektivDisplayName(kolId)}</td>
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
        if (!sectionId || !lang || !publicationData || !kollektiveData) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv } = options;
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
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
                beetsTan2018ESGAR: "ESGAR Consensus (Beets-Tan et al. 2018)",
                lahaye2009: "Lahaye et al. (2009)"
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
            combinedHtml += `<h2 class="mb-3 h4">${subSection.label}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, publicationData, kollektiveData, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(kollektiveData, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-alter-Gesamt"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.ageDistribution} (${getKollektivDisplayName("Gesamt")})</h5><p class="text-muted small text-center p-1">${lang==='de'?'Abb. 1a':'Fig. 1a'}</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-gender-Gesamt"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.genderDistribution} (${getKollektivDisplayName("Gesamt")})</h5><p class="text-muted small text-center p-1">${lang==='de'?'Abb. 1b':'Fig. 1b'}</p></div></div>`;
                combinedHtml += '</div>';
            } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                combinedHtml += _renderDiagnostischeGueteTabellen(kollektiveData, lang, subSection.id, currentKollektiv);
                if (subSection.id === 'ergebnisse_vergleich_performance') {
                     combinedHtml += '<div class="row mt-4 g-3">';
                     const kollektiveForCharts = ['Gesamt', 'direkt OP', 'nRCT'];
                     kollektiveForCharts.forEach((kolId, index) => {
                        const chartLetter = String.fromCharCode(97 + index);
                        const chartId = `pub-chart-vergleich-${kolId.replace(/\s+/g, '-')}`;
                        const chartTitle = lang === 'de' ? `Vergleichsmetriken für ${getKollektivDisplayName(kolId)}` : `Comparative Metrics for ${getKollektivDisplayName(kolId)}`;
                        const figRef = lang === 'de' ? `Abb. 2${chartLetter}` : `Fig. 2${chartLetter}`;
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
