const publicationRenderer = (() => {

    function renderSectionContent(sectionId, lang, publicationData, kollektiveData, options = {}) {
        if (!sectionId || !lang || !publicationData || !kollektiveData) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv, bruteForceMetric } = options;
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
            nGesamt: kollektiveData.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: kollektiveData['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: kollektiveData.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            t2SizeStep: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            bruteForceMetricForPublication: bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            references: {
                lurzSchaefer2025: "Lurz & Schäfer (2025)",
                koh2008: "Koh et al. (2008)",
                barbaro2024: "Barbaro et al. (2024)",
                rutegard2025: "Rutegård et al. (2025)",
                beetsTan2018ESGAR: "Beets-Tan et al. (2018)"
            }
        };

        const mainSection = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSection || !mainSection.subSections || mainSection.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h2 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSection.labelKey] || mainSection.labelKey}</h2>`;

        mainSection.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h3 class="mb-3 h4">${subSection.label}</h3>`;

            const textContentFunction = publicationTextGenerator.getSectionText(subSection.id, lang, publicationData, kollektiveData, commonData);
            combinedHtml += textContentFunction || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(kollektiveData, lang);
                combinedHtml += '<div class="row mt-4 g-3">';
                const alterChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.alterChartContainerIdPrefix}${currentKollektiv.replace(/\s+/g, '-')}`;
                const genderChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.genderChartContainerIdPrefix}${currentKollektiv.replace(/\s+/g, '-')}`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${alterChartId}"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.ageDistribution} (${getKollektivDisplayName(currentKollektiv)})</h5><p class="text-muted small text-center p-1">Lade Diagramm...</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${genderChartId}"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.genderDistribution} (${getKollektivDisplayName(currentKollektiv)})</h5><p class="text-muted small text-center p-1">Lade Diagramm...</p></div></div>`;
                combinedHtml += '</div>';
            } else if (subSection.id === 'ergebnisse_as_performance' || subSection.id === 'ergebnisse_literatur_t2_performance' || subSection.id === 'ergebnisse_optimierte_t2_performance' || subSection.id === 'ergebnisse_vergleich_performance') {
                combinedHtml += _renderDiagnostischeGueteTabellen(kollektiveData, lang, subSection.id, commonData);
                if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                     combinedHtml += '<div class="row mt-4 g-3">';
                     const rocChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.rocChartContainerIdPrefix}${subSection.id.replace('ergebnisse_','')}`;
                     const barChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichBarChartContainerIdPrefix}${subSection.id.replace('ergebnisse_','')}`;
                     combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${rocChartId}"><h5 class="text-center small mb-1">ROC Kurven Vergleich (${getKollektivDisplayName(currentKollektiv)})</h5><p class="text-muted small text-center p-1">Lade Diagramm...</p></div></div>`;
                     combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${barChartId}"><h5 class="text-center small mb-1">Performance Metriken Vergleich (${getKollektivDisplayName(currentKollektiv)})</h5><p class="text-muted small text-center p-1">Lade Diagramm...</p></div></div>`;
                     combinedHtml += '</div>';
                }
            }
            combinedHtml += `</div>`;
        });

        combinedHtml += `</div>`;
        return combinedHtml;
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle 2: Übersicht der Literatur-basierten T2-Kriteriensets' : 'Table 2: Overview of Literature-Based T2 Criteria Sets'}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Studie / Kriterienset' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv (Anwendung)' : 'Primary Target Cohort (Application)'}</th>
                    <th>${lang === 'de' ? 'Kernkriterien (Kurzfassung)' : 'Core Criteria (Summary)'}</th>
                    <th>${lang === 'de' ? 'Logik' : 'Logic'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studySet.studyInfo?.keyCriteriaSummary || studySet.description || studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false);
                const anwendungskontext = `${getKollektivDisplayName(studySet.applicableKollektiv)} (${studySet.context})`;
                tableHTML += `<tr>
                                <td>${studySet.name}</td>
                                <td>${anwendungskontext}</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(kollektiveData, lang) {
        if (!kollektiveData || !kollektiveData.Gesamt || !kollektiveData.Gesamt.deskriptiv) return `<p class="text-muted small">Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.</p>`;
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle 1: Patientencharakteristika' : 'Table 1: Patient Characteristics'}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (N=${kollektiveData.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (N=${kollektiveData['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('nRCT')} (N=${kollektiveData.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder);
        const fPerc = (count, total, dig = 0, placeholder = 'N/A') => (total > 0 && count !== undefined && count !== null && !isNaN(count)) ? formatPercent(count / total, dig) : placeholder;

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${getterGesamt(kollektiveData.Gesamt?.deskriptiv)}</td>
                            <td>${getterDirektOP(kollektiveData['direkt OP']?.deskriptiv)}</td>
                            <td>${getterNRCT(kollektiveData.nRCT?.deskriptiv)}</td>
                          </tr>`;
        };
        const na = 'N/A';
        addRow('Alter, Median (Range) [Jahre]', 'Age, Median (Range) [Years]',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : na,
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : na,
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : na
        );
        addRow('Geschlecht, männlich [n (%)]', 'Sex, male [n (%)]',
            p => p ? `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : na,
            p => p ? `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : na,
            p => p ? `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : na
        );
        addRow('Pathologischer N-Status, positiv [n (%)]', 'Pathological N-Status, positive [n (%)]',
            p => p ? `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : na,
            p => p ? `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : na,
            p => p ? `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : na
        );
        addRow('Avocado Sign (AS) Status, positiv [n (%)]', 'Avocado Sign (AS) Status, positive [n (%)]',
             p => p ? `${p.asStatus?.plus ?? 0} (${fPerc(p.asStatus?.plus, p.anzahlPatienten)})` : na,
             p => p ? `${p.asStatus?.plus ?? 0} (${fPerc(p.asStatus?.plus, p.anzahlPatienten)})` : na,
             p => p ? `${p.asStatus?.plus ?? 0} (${fPerc(p.asStatus?.plus, p.anzahlPatienten)})` : na
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(kollektiveData, lang, sectionId, commonData) {
        if (!kollektiveData) return '<p class="text-muted small">Keine Gütedaten für diese Sektion verfügbar.</p>';

        let title = '';
        let tableIdSuffix = '';
        const dataSetsToDisplay = [];
        const bfMetricForDisplay = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const formatMetricForTable = (metricObj, isRate = true, digits = 1, langParam = lang) => {
            if (!metricObj || metricObj.value === undefined || isNaN(metricObj.value)) return '–';
            return formatCI(metricObj.value, metricObj.ci?.lower, metricObj.ci?.upper, digits, isRate, '–');
        };


        if (sectionId === 'ergebnisse_as_performance') {
            title = lang === 'de' ? 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)' : 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)';
            tableIdSuffix = 'as-performance';
            dataSetsToDisplay.push({ name: 'Avocado Sign', statsByKollektiv: { 'Gesamt': kollektiveData.Gesamt?.gueteAS, 'direkt OP': kollektiveData['direkt OP']?.gueteAS, 'nRCT': kollektiveData.nRCT?.gueteAS } });
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            title = lang === 'de' ? 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)' : 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)';
            tableIdSuffix = 'literatur-t2-performance';
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const stats = {};
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                for (const kollektivId of ['Gesamt', 'direkt OP', 'nRCT']) {
                    if (kollektiveData[kollektivId]) {
                        let isApplicable = true;
                        if (studySet?.applicableKollektiv && studySet.applicableKollektiv !== 'Gesamt' && studySet.applicableKollektiv !== kollektivId) {
                            isApplicable = false;
                        }
                        stats[kollektivId] = isApplicable ? kollektiveData[kollektivId]?.gueteT2_literatur?.[conf.id] : null;
                    } else {
                        stats[kollektivId] = null;
                    }
                }
                dataSetsToDisplay.push({ name: studySet?.name || conf.nameKey, statsByKollektiv: stats, id: conf.id });
            });
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            title = lang === 'de' ? `Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: ${bfMetricForDisplay}, vs. N-Status)` : `Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: ${bfMetricForDisplay}, vs. N-Status)`;
            tableIdSuffix = 'optimierte-t2-performance';
            const stats = {};
            for (const kollektivId of ['Gesamt', 'direkt OP', 'nRCT']) {
                stats[kollektivId] = kollektiveData[kollektivId]?.gueteT2_bruteforce;
            }
            dataSetsToDisplay.push({ name: `Optimierte T2 (${bfMetricForDisplay})`, statsByKollektiv: stats });
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
            title = lang === 'de' ? 'Tabelle 6: Paarweiser Vergleich der diagnostischen Güte (vs. N-Status)' : 'Table 6: Pairwise Comparison of Diagnostic Performance (vs. N-Status)';
            tableIdSuffix = 'vergleich-performance';
             for (const kollektivId of ['Gesamt', 'direkt OP', 'nRCT']) {
                if (!kollektiveData[kollektivId]) continue;
                const asData = kollektiveData[kollektivId].gueteAS;
                const t2AngewandtData = kollektiveData[kollektivId].gueteT2_angewandt;
                const t2OptimiertData = kollektiveData[kollektivId].gueteT2_bruteforce;
                const vergleichASvsAngewandt = kollektiveData[kollektivId].vergleichASvsT2_angewandt;
                const vergleichASvsOptimiert = kollektiveData[kollektivId].vergleichASvsT2_bruteforce;

                dataSetsToDisplay.push({
                    kollektivName: getKollektivDisplayName(kollektivId),
                    asData, t2AngewandtData, t2OptimiertData,
                    vergleichASvsAngewandt, vergleichASvsOptimiert,
                    bfDefinition: kollektiveData[kollektivId].bruteforce_definition
                });
            }
        }

        if (dataSetsToDisplay.length === 0 || dataSetsToDisplay.every(ds => typeof ds.statsByKollektiv === 'object' && ds.statsByKollektiv !== null && Object.values(ds.statsByKollektiv).every(s => !s || !s.matrix))) {
            return `<p class="text-muted small">${title} - Keine validen Gütedaten für die Anzeige in den ausgewerteten Kollektiven vorhanden.</p>`;
        }

        let tableHTML = `<h4 class="mt-4 mb-3">${title}</h4>`;
        const tableBaseId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteGesamtTabelle.idPrefix || 'pub-table-diagnostische-guete-'}${tableIdSuffix}`;

        if (sectionId !== 'ergebnisse_vergleich_performance') {
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableBaseId}">
                <thead>
                    <tr>
                        <th>${lang === 'de' ? 'Methode' : 'Method'}</th>
                        <th>${lang === 'de' ? 'Kollektiv' : 'Cohort'}</th>
                        <th>Sens. (95% CI)</th>
                        <th>Spez. (95% CI)</th>
                        <th>PPV (95% CI)</th>
                        <th>NPV (95% CI)</th>
                        <th>Acc. (95% CI)</th>
                        <th>AUC/BalAcc (95% CI)</th>
                    </tr>
                </thead><tbody>`;

            dataSetsToDisplay.forEach(dataSet => {
                if (!dataSet.statsByKollektiv) return;
                for (const kollektivId of ['Gesamt', 'direkt OP', 'nRCT']) {
                    const stats = dataSet.statsByKollektiv[kollektivId];
                    const nPat = stats?.matrix ? (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn) : (kollektiveData[kollektivId]?.deskriptiv?.anzahlPatienten || 0);

                    if (stats === null && sectionId === 'ergebnisse_literatur_t2_performance') {
                         tableHTML += `<tr>
                                <td>${dataSet.name}</td>
                                <td>${getKollektivDisplayName(kollektivId)}</td>
                                <td colspan="6" class="text-center text-muted small"><em>${lang==='de'?'Nicht anwendbar/evaluiert':'Not applicable/evaluated'}</em></td>
                              </tr>`;
                        continue;
                    }
                    if (!stats || !stats.matrix || nPat === 0) {
                         tableHTML += `<tr>
                                <td>${dataSet.name}</td>
                                <td>${getKollektivDisplayName(kollektivId)} (N=${nPat})</td>
                                <td colspan="6" class="text-center text-muted small">${lang==='de'?'Keine validen Daten':'No valid data'}</td>
                              </tr>`;
                        continue;
                    }
                     tableHTML += `<tr>
                            <td>${dataSet.name} ${dataSet.id && sectionId === 'ergebnisse_literatur_t2_performance' ? `(${studyT2CriteriaManager.getStudyCriteriaSetById(dataSet.id)?.displayShortName || dataSet.id})`:''}</td>
                            <td>${getKollektivDisplayName(kollektivId)} (N=${nPat})</td>
                            <td>${formatMetricForTable(stats.sens)}</td>
                            <td>${formatMetricForTable(stats.spez)}</td>
                            <td>${formatMetricForTable(stats.ppv)}</td>
                            <td>${formatMetricForTable(stats.npv)}</td>
                            <td>${formatMetricForTable(stats.acc)}</td>
                            <td>${formatMetricForTable(stats.auc, false, 3)}</td>
                          </tr>`;
                }
            });
            tableHTML += `</tbody></table></div>`;
        } else { // Special table for 'ergebnisse_vergleich_performance'
             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableBaseId}">
                <thead>
                    <tr>
                        <th>${lang === 'de' ? 'Kollektiv' : 'Cohort'}</th>
                        <th>${lang === 'de' ? 'Vergleich' : 'Comparison'}</th>
                        <th>AUC/BalAcc (95% CI)</th>
                        <th>Accuracy (95% CI)</th>
                        <th>p-Wert (AUC, DeLong)</th>
                        <th>p-Wert (Acc, McNemar)</th>
                    </tr>
                </thead><tbody>`;
            dataSetsToDisplay.forEach(compData => {
                if (!compData || !kollektiveData[compData.kollektivName.toLowerCase().replace(' ','_')]) return; // Check if kollektivData has the key
                const nPat = kollektiveData[compData.kollektivName.toLowerCase().replace(' ','_')]?.deskriptiv?.anzahlPatienten || 'N/A';

                tableHTML += `<tr><td rowspan="2">${compData.kollektivName} (N=${nPat})</td>
                                <td>Avocado Sign</td>
                                <td>${formatMetricForTable(compData.asData?.auc, false, 3)}</td>
                                <td>${formatMetricForTable(compData.asData?.acc)}</td>
                                <td rowspan="1" class="align-middle text-center">${getPValueText(compData.vergleichASvsAngewandt?.delong?.pValue, lang)}</td>
                                <td rowspan="1" class="align-middle text-center">${getPValueText(compData.vergleichASvsAngewandt?.mcnemar?.pValue, lang)}</td>
                              </tr>
                              <tr>
                                <td>Angewandte T2</td>
                                <td>${formatMetricForTable(compData.t2AngewandtData?.auc, false, 3)}</td>
                                <td>${formatMetricForTable(compData.t2AngewandtData?.acc)}</td>
                                <td colspan="2" class="text-center text-muted small"><em>vs. Avocado Sign</em></td>
                              </tr>`;
                if(compData.t2OptimiertData && compData.bfDefinition) {
                    tableHTML += `<tr><td rowspan="2">${compData.kollektivName} (N=${nPat})</td>
                                <td>Avocado Sign</td>
                                <td>${formatMetricForTable(compData.asData?.auc, false, 3)}</td>
                                <td>${formatMetricForTable(compData.asData?.acc)}</td>
                                <td rowspan="1" class="align-middle text-center">${getPValueText(compData.vergleichASvsOptimiert?.delong?.pValue, lang)}</td>
                                <td rowspan="1" class="align-middle text-center">${getPValueText(compData.vergleichASvsOptimiert?.mcnemar?.pValue, lang)}</td>
                              </tr>
                              <tr>
                                <td>Optimierte T2 (${compData.bfDefinition.metricName})</td>
                                <td>${formatMetricForTable(compData.t2OptimiertData?.auc, false, 3)}</td>
                                <td>${formatMetricForTable(compData.t2OptimiertData?.acc)}</td>
                                <td colspan="2" class="text-center text-muted small"><em>vs. Avocado Sign<br>(${studyT2CriteriaManager.formatCriteriaForDisplay(compData.bfDefinition.criteria, compData.bfDefinition.logic, true)})</em></td>
                              </tr>`;
                }
                 tableHTML += `<tr><td colspan="6" style="background-color: var(--border-color-light); height: 3px; padding:0;"></td></tr>`;
            });
             tableHTML += `</tbody></table></div>`;
        }
        return tableHTML;
    }


    return Object.freeze({
        renderSectionContent
    });

})();
