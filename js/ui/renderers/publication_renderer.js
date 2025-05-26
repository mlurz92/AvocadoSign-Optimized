const publicationRenderer = (() => {

    function _formatMetricForTable(metricData, isRate = true, digits = 1, lang = 'de', placeholder = 'N/A') {
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return placeholder;

        const formatSingleValue = (val, d, isP, pldr) => {
            if (val === null || val === undefined || isNaN(val)) return pldr;
            if (isP) {
                return formatPercent(val, d, pldr);
            } else {
                let numStr = formatNumber(val, d, pldr, true); // useStandardFormat = true for consistent decimal point
                if (lang === 'de' && numStr !== pldr && typeof numStr === 'string') {
                    numStr = numStr.replace('.', ',');
                }
                return numStr;
            }
        };

        const valStr = formatSingleValue(metricData.value, digits, isRate, placeholder);

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isRate, placeholder);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isRate, placeholder);
            if (lowerStr === placeholder || upperStr === placeholder) return valStr; // If CI is incomplete, just return value
            return `${valStr} (${lowerStr}–${upperStr})`;
        }
        return valStr;
    }

    function _renderPatientenCharakteristikaTabelleHTML(allKollektivStats, lang) {
        const config = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        const title = lang === 'de' ? config.titleDe : config.titleEn;
        let tableHTML = `<h4 class="mt-4 mb-3">${title}</h4>`;
        const gesamtData = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.GESAMT]?.deskriptiv;
        const direktOPData = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP]?.deskriptiv;
        const nRCTData = allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.NRCT]?.deskriptiv;

        if (!gesamtData) return `${tableHTML}<p class="text-muted small">Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.</p>`;

        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${lang === 'de' ? 'Gesamt' : 'Overall'} (N=${gesamtData.anzahlPatienten || 0})</th>
                    <th>${lang === 'de' ? 'Direkt OP' : 'Upfront Surgery'} (N=${direktOPData?.anzahlPatienten || 0})</th>
                    <th>${lang === 'de' ? 'nRCT' : 'nRCT'} (N=${nRCTData?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder, lang === 'en');
        const fPerc = (count, total, dig = 0) => (total > 0 && count !== undefined && count !== null && !isNaN(count)) ? formatPercent(count / total, dig) : 'N/A';

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${getterGesamt(gesamtData)}</td>
                            <td>${direktOPData ? getterDirektOP(direktOPData) : 'N/A'}</td>
                            <td>${nRCTData ? getterNRCT(nRCTData) : 'N/A'}</td>
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

    function _renderLiteraturT2KriterienTabelleHTML(lang) {
        const config = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle;
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? config.titleDe : config.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv (Orig./Anwendung)' : 'Primary Target Cohort (Orig./Application)'}</th>
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
                const anwendungskontext = getKollektivDisplayName(studySet.applicableKollektiv || APP_CONFIG.KOLLEKTIV_IDS.GESAMT);
                tableHTML += `<tr>
                                <td>${studySet.name}</td>
                                <td>${studySet.context} / <strong>${anwendungskontext}</strong></td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabelleHTML(allKollektivStats, lang, methode, configKey, tableTitleDe, tableTitleEn) {
        const config = PUBLICATION_CONFIG.publicationElements.ergebnisse[configKey];
        const title = lang === 'de' ? tableTitleDe : tableTitleEn;
        let tableHTML = `<h4 class="mt-4 mb-3">${title}</h4>`;

        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <thead><tr>
                <th>${lang==='de'?'Kollektiv':'Cohort'}</th>
                <th>Sens. (95% CI)</th><th>Spez. (95% CI)</th><th>PPV (95% CI)</th>
                <th>NPV (95% CI)</th><th>Acc. (95% CI)</th><th>AUC (95% CI)</th>
            </tr></thead><tbody>`;

        const kollektive = [APP_CONFIG.KOLLEKTIV_IDS.GESAMT, APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, APP_CONFIG.KOLLEKTIV_IDS.NRCT];
        kollektive.forEach(kolId => {
            const stats = allKollektivStats?.[kolId]?.[methode];
            const nPat = allKollektivStats?.[kolId]?.deskriptiv?.anzahlPatienten || 0;
            const kolDisplayName = getKollektivDisplayName(kolId);

            if (stats && stats.matrix && nPat > 0) {
                tableHTML += `<tr>
                                <td>${kolDisplayName} (N=${nPat})</td>
                                <td>${_formatMetricForTable(stats.sens, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.spez, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.ppv, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.npv, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.acc, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.auc, false, 3, lang)}</td>
                              </tr>`;
            } else {
                 tableHTML += `<tr>
                                <td>${kolDisplayName} (N=${nPat})</td>
                                <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine validen Daten' : 'No valid data'}</em></td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderStatistischeVergleicheTabelleHTML(allKollektivStats, lang) {
        const config = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischeVergleicheAST2Tabelle;
        const title = lang === 'de' ? config.titleDe : config.titleEn;
        let tableHTML = `<h4 class="mt-4 mb-3">${title}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <thead><tr>
                <th>${lang==='de'?'Kollektiv':'Cohort'}</th>
                <th>${lang==='de'?'Vergleich':'Comparison'}</th>
                <th>${lang==='de'?'Methode 1 (AUC)':'Method 1 (AUC)'}</th>
                <th>${lang==='de'?'Methode 2 (AUC)':'Method 2 (AUC)'}</th>
                <th>${lang==='de'?'Diff. AUC (M1-M2)':'AUC Diff. (M1-M2)'}</th>
                <th>DeLong p (AUC)</th>
                <th>McNemar p (Acc.)</th>
            </tr></thead><tbody>`;

        const kollektive = [APP_CONFIG.KOLLEKTIV_IDS.GESAMT, APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP, APP_CONFIG.KOLLEKTIV_IDS.NRCT];
        const na = 'N/A';

        kollektive.forEach(kolId => {
            const kolData = allKollektivStats?.[kolId];
            const nPat = kolData?.deskriptiv?.anzahlPatienten || 0;
            const kolDisplayName = getKollektivDisplayName(kolId);
            if (!kolData || nPat === 0) return;

            const asStats = kolData.gueteAS;
            const bfStats = kolData.gueteT2_bruteforce;
            const bfDef = kolData.bruteforce_definition;

            const litSetConf = PUBLICATION_CONFIG.literatureCriteriaSets.find(lc => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(lc.id);
                return studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === APP_CONFIG.KOLLEKTIV_IDS.GESAMT && kolId === APP_CONFIG.KOLLEKTIV_IDS.GESAMT));
            });
            const litStats = litSetConf ? kolData.gueteT2_literatur?.[litSetConf.id] : null;
            const litSetName = litSetConf ? (studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id)?.displayShortName || litSetConf.id) : 'Lit. T2';

            const vergleichASvsLit = litSetConf ? kolData[`vergleichASvsT2_literatur_${litSetConf.id}`] : null;
            const vergleichASvsBF = kolData.vergleichASvsT2_bruteforce;

            const formatAUCVal = (stats) => stats?.auc ? _formatMetricForTable(stats.auc, false, 3, lang) : na;
            const formatDiffAUC = (val) => formatNumber(val, 3, na, lang === 'en');
            const formatPVal = (pval) => pval !== null && !isNaN(pval) ? `${getPValueText(pval, lang)} ${getStatisticalSignificanceSymbol(pval)}` : na;

            if (asStats && litStats && vergleichASvsLit) {
                tableHTML += `<tr>
                    <td rowspan="1">${kolDisplayName} (N=${nPat})</td>
                    <td>AS vs. ${litSetName}</td>
                    <td>AS (${formatAUCVal(asStats)})</td>
                    <td>${litSetName} (${formatAUCVal(litStats)})</td>
                    <td>${formatDiffAUC(vergleichASvsLit.delong?.diffAUC)}</td>
                    <td>${formatPVal(vergleichASvsLit.delong?.pValue)}</td>
                    <td>${formatPVal(vergleichASvsLit.mcnemar?.pValue)}</td>
                </tr>`;
            } else if (asStats) {
                 tableHTML += `<tr>
                    <td rowspan="1">${kolDisplayName} (N=${nPat})</td>
                    <td>AS vs. ${litSetName}</td>
                    <td>AS (${formatAUCVal(asStats)})</td>
                    <td colspan="4" class="text-center text-muted small"><em>${litSetName} ${lang === 'de' ? 'nicht anwendbar/berechnet' : 'not applicable/calculated'}</em></td>
                </tr>`;
            }


            if (asStats && bfStats && vergleichASvsBF && bfDef) {
                 const bfDisplayName = `Optimiert (${bfDef.metricName.substring(0,6)}.)`;
                 tableHTML += `<tr>
                    ${(asStats && litStats && vergleichASvsLit) ? '' : `<td rowspan="1">${kolDisplayName} (N=${nPat})</td>`}
                    <td>AS vs. ${bfDisplayName}</td>
                    <td>AS (${formatAUCVal(asStats)})</td>
                    <td>${bfDisplayName} (${formatAUCVal(bfStats)})</td>
                    <td>${formatDiffAUC(vergleichASvsBF.delong?.diffAUC)}</td>
                    <td>${formatPVal(vergleichASvsBF.delong?.pValue)}</td>
                    <td>${formatPVal(vergleichASvsBF.mcnemar?.pValue)}</td>
                </tr>`;
            } else if (asStats) {
                 tableHTML += `<tr>
                    ${(asStats && litStats && vergleichASvsLit) ? '' : `<td rowspan="1">${kolDisplayName} (N=${nPat})</td>`}
                    <td>AS vs. Optimiert</td>
                    <td>AS (${formatAUCVal(asStats)})</td>
                    <td colspan="4" class="text-center text-muted small"><em>Optimiert ${lang === 'de' ? 'nicht verfügbar/berechnet' : 'not available/calculated'}</em></td>
                </tr>`;
            }
             if(asStats && litStats && vergleichASvsLit && asStats && bfStats && vergleichASvsBF && bfDef){
                 // This case is handled by the rowspan logic above if the first row was fully rendered.
             } else if (!(asStats && litStats && vergleichASvsLit) && !(asStats && bfStats && vergleichASvsBF && bfDef) && asStats) {
                  // Only AS data exists, no comparison rows
             } else if ((asStats && litStats && vergleichASvsLit) || (asStats && bfStats && vergleichASvsBF && bfDef)){
                 // Add a border if only one comparison row was added to keep table structure consistent
                 const lastRow = tableHTML.lastIndexOf("<tr>");
                 if (lastRow > -1) {
                    const firstTdEnd = tableHTML.indexOf("</td>", lastRow);
                    if(firstTdEnd > -1 && !tableHTML.substring(lastRow, firstTdEnd).includes('rowspan')) {
                         tableHTML = tableHTML.substring(0, lastRow) + tableHTML.substring(lastRow).replace("<tr>", "<tr style='border-bottom: 1px solid #dee2e6;'>");
                    }
                 }
             }

        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }


    function renderSectionContent(mainSectionId, lang, allKollektivStats, options = {}) {
        if (!mainSectionId || !lang || !allKollektivStats) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv, defaultBruteForceMetric } = options;
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
            nGesamt: allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.GESAMT]?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.DIREKT_OP]?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats?.[APP_CONFIG.KOLLEKTIV_IDS.NRCT]?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            defaultBruteForceMetric: defaultBruteForceMetric,
            references: {
                lurzSchaefer2025: "Lurz & Schäfer (2025)",
                koh2008: "Koh et al. (2008)",
                barbaro2024: "Barbaro et al. (2024)",
                rutegard2025: "Rutegård et al. (2025)",
                beetsTan2018ESGAR: "ESGAR Consensus (Beets-Tan et al. 2018)",
                lahaye2009: "Lahaye et al. (2009)"
            }
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${mainSectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${mainSectionId}">`;
        combinedHtml += `<h2 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}</h2>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h3 class="mb-3 h4">${subSection.label}</h3>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelleHTML(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelleHTML(allKollektivStats, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                const fig1a_id = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartAlterGesamt.id;
                const fig1a_title = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.chartAlterGesamt.titleDe.replace('[N_GESAMT]', commonData.nGesamt) : PUBLICATION_CONFIG.publicationElements.ergebnisse.chartAlterGesamt.titleEn.replace('[N_GESAMT]', commonData.nGesamt);
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${fig1a_id}"><h5 class="text-center small mb-1">${fig1a_title}</h5></div></div>`;

                const fig1b_id = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartGenderGesamt.id;
                const fig1b_title = lang === 'de' ? PUBLICATION_CONFIG.publicationElements.ergebnisse.chartGenderGesamt.titleDe.replace('[N_GESAMT]', commonData.nGesamt) : PUBLICATION_CONFIG.publicationElements.ergebnisse.chartGenderGesamt.titleEn.replace('[N_GESAMT]', commonData.nGesamt);
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${fig1b_id}"><h5 class="text-center small mb-1">${fig1b_title}</h5></div></div>`;
                combinedHtml += '</div>';
            } else if (subSection.id === 'ergebnisse_as_performance') {
                combinedHtml += _renderDiagnostischeGueteTabelleHTML(allKollektivStats, lang, 'gueteAS', 'diagnostischeGueteASTabelle', PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleDe, PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle.titleEn);
            } else if (subSection.id === 'ergebnisse_literatur_t2_performance') {
                 const tableConf = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
                 const title = lang === 'de' ? tableConf.titleDe : tableConf.titleEn;
                 let tableHTMLSpecific = `<h4 class="mt-4 mb-3">${title}</h4>`;
                 tableHTMLSpecific += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConf.id}">
                    <thead><tr>
                        <th>${lang==='de'?'Kriteriensatz':'Criteria Set'}</th>
                        <th>${lang==='de'?'Angew. Kollektiv':'Applied Cohort'}</th>
                        <th>Sens. (95% CI)</th><th>Spez. (95% CI)</th><th>PPV (95% CI)</th>
                        <th>NPV (95% CI)</th><th>Acc. (95% CI)</th><th>AUC (95% CI)</th>
                    </tr></thead><tbody>`;
                PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                    if(studySet){
                        const targetKollektiv = studySet.applicableKollektiv || APP_CONFIG.KOLLEKTIV_IDS.GESAMT;
                        const stats = allKollektivStats?.[targetKollektiv]?.gueteT2_literatur?.[conf.id];
                        const nPat = allKollektivStats?.[targetKollektiv]?.deskriptiv?.anzahlPatienten || 0;
                        const kolDisplayName = getKollektivDisplayName(targetKollektiv);
                        if (stats && stats.matrix && nPat > 0) {
                             tableHTMLSpecific += `<tr>
                                <td>${studySet.name}</td><td>${kolDisplayName} (N=${nPat})</td>
                                <td>${_formatMetricForTable(stats.sens, true, 1, lang)}</td><td>${_formatMetricForTable(stats.spez, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.ppv, true, 1, lang)}</td><td>${_formatMetricForTable(stats.npv, true, 1, lang)}</td>
                                <td>${_formatMetricForTable(stats.acc, true, 1, lang)}</td><td>${_formatMetricForTable(stats.auc, false, 3, lang)}</td>
                              </tr>`;
                        } else {
                             tableHTMLSpecific += `<tr><td>${studySet.name}</td><td>${kolDisplayName} (N=${nPat})</td><td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'N/A oder nicht berechnet' : 'N/A or not calculated'}</em></td></tr>`;
                        }
                    }
                });
                tableHTMLSpecific += `</tbody></table></div>`;
                combinedHtml += tableHTMLSpecific;
            } else if (subSection.id === 'ergebnisse_optimierte_t2_performance') {
                 const tableConf = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle;
                 const title = lang === 'de' ? tableConf.titleDe.replace('Balanced Accuracy', defaultBruteForceMetric) : tableConf.titleEn.replace('Balanced Accuracy', defaultBruteForceMetric);
                combinedHtml += _renderDiagnostischeGueteTabelleHTML(allKollektivStats, lang, 'gueteT2_bruteforce', 'diagnostischeGueteOptimierteT2Tabelle', title, title);
            } else if (subSection.id === 'ergebnisse_vergleich_performance') {
                combinedHtml += _renderStatistischeVergleicheTabelleHTML(allKollektivStats, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                const chartConfigs = [
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichsChartGesamt,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichsChartDirektOP,
                    PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichsChartNRCT
                ];
                const nValues = {
                    GESAMT: commonData.nGesamt,
                    DIREKT_OP: commonData.nDirektOP,
                    NRCT: commonData.nNRCT
                };
                chartConfigs.forEach((chartConf, index) => {
                    const kolIdKey = Object.keys(APP_CONFIG.KOLLEKTIV_IDS).find(k => chartConf.id.toLowerCase().includes(APP_CONFIG.KOLLEKTIV_IDS[k].replace(/\s+/g, '').toLowerCase()));
                    const nVal = kolIdKey ? nValues[kolIdKey] : 0;
                    const chartTitle = (lang === 'de' ? chartConf.titleDe : chartConf.titleEn).replace(`[N_${kolIdKey}]`, nVal);
                    combinedHtml += `<div class="col-md-4"><div class="chart-container border rounded p-2" id="${chartConf.id}"><h5 class="text-center small mb-1">${chartTitle}</h5></div></div>`;
                 });
                combinedHtml += '</div>';
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
