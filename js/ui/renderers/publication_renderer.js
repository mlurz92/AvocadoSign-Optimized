const publicationRenderer = (() => {

    function renderSectionContent(mainSectionId, lang, publicationData, kollektiveData, options = {}) {
        if (!mainSectionId || !lang || !publicationData || !kollektiveData) {
            return `<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>`;
        }
        const langKey = lang === 'en' ? 'en' : 'de';
        const { currentKollektiv, bruteForceMetric } = options;

        const commonDataForTextGen = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: currentKollektiv,
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

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === mainSectionId);

        if (!mainSectionConfig) {
            return `<p class="text-warning">Keine Konfiguration für Hauptabschnitt '${mainSectionId}' gefunden.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${mainSectionConfig.id}">`;
        const mainSectionTitle = UI_TEXTS.publikationTab.sectionLabels[mainSectionConfig.labelKey]?.[langKey] || UI_TEXTS.publikationTab.sectionLabels[mainSectionConfig.labelKey]?.['de'] || mainSectionConfig.labelKey;
        combinedHtml += `<h2 class="mb-4 display-6">${mainSectionTitle}</h2>`;

        if (!mainSectionConfig.subSections || mainSectionConfig.subSections.length === 0) {
            combinedHtml += `<p class="text-muted">${langKey === 'de' ? 'Für diesen Hauptabschnitt sind keine Unterabschnitte definiert.' : 'No subsections defined for this main section.'}</p>`;
        } else {
            mainSectionConfig.subSections.forEach(subSection => {
                combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
                const subSectionTitle = UI_TEXTS.publicationSubSectionLabels?.[subSection.labelKey]?.[langKey] || UI_TEXTS.publicationSubSectionLabels?.[subSection.labelKey]?.['de'] || subSection.label;
                combinedHtml += `<h3 class="mb-3 h4">${subSectionTitle}</h3>`;

                const textContent = publicationTextGenerator.getSectionText(subSection.id, lang, publicationData, kollektiveData, commonDataForTextGen);
                combinedHtml += textContent || `<p class="text-muted">${langKey === 'de' ? 'Inhalt für diesen Unterabschnitt wird noch generiert.' : 'Content for this subsection is being generated.'}</p>`;

                if (subSection.id === 'methoden_t2_definition') {
                    combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
                } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                    combinedHtml += _renderPatientenCharakteristikaTabelle(kollektiveData, lang);
                    combinedHtml += '<div class="row mt-4 g-3">';
                    const alterChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.alterChartContainerIdPrefix}${currentKollektiv.replace(/\s+/g, '-')}`;
                    const genderChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.genderChartContainerIdPrefix}${currentKollektiv.replace(/\s+/g, '-')}`;
                    const ageDistTitleBase = UI_TEXTS.chartTitles.ageDistribution;
                    const ageDistTitle = (typeof ageDistTitleBase === 'object' ? ageDistTitleBase[langKey] : ageDistTitleBase) || (langKey === 'de' ? 'Altersverteilung' : 'Age Distribution');
                    const genderDistTitleBase = UI_TEXTS.chartTitles.genderDistribution;
                    const genderDistTitle = (typeof genderDistTitleBase === 'object' ? genderDistTitleBase[langKey] : genderDistTitleBase) || (langKey === 'de' ? 'Geschlecht' : 'Gender');
                    const loadingText = langKey === 'de' ? 'Lade Diagramm...' : 'Loading chart...';

                    combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${alterChartId}"><h5 class="text-center small mb-1">${ageDistTitle} (${getKollektivDisplayName(currentKollektiv, langKey)})</h5><p class="text-muted small text-center p-1">${loadingText}</p></div></div>`;
                    combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${genderChartId}"><h5 class="text-center small mb-1">${genderDistTitle} (${getKollektivDisplayName(currentKollektiv, langKey)})</h5><p class="text-muted small text-center p-1">${loadingText}</p></div></div>`;
                    combinedHtml += '</div>';
                } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                    combinedHtml += _renderDiagnostischeGueteTabellen(kollektiveData, lang, subSection.id, commonDataForTextGen);
                    if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                        combinedHtml += '<div class="row mt-4 g-3">';
                        const rocChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.rocChartContainerIdPrefix}${subSection.id.replace('ergebnisse_', '')}`;
                        const barChartId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichBarChartContainerIdPrefix}${subSection.id.replace('ergebnisse_', '')}`;
                        const rocTitle = langKey === 'de' ? 'ROC Kurven Vergleich' : 'ROC Curve Comparison';
                        const barTitle = langKey === 'de' ? 'Performance Metriken Vergleich' : 'Performance Metrics Comparison';
                        const loadingText = langKey === 'de' ? 'Lade Diagramm...' : 'Loading chart...';

                        combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${rocChartId}"><h5 class="text-center small mb-1">${rocTitle} (${getKollektivDisplayName(currentKollektiv, langKey)})</h5><p class="text-muted small text-center p-1">${loadingText}</p></div></div>`;
                        combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${barChartId}"><h5 class="text-center small mb-1">${barTitle} (${getKollektivDisplayName(currentKollektiv, langKey)})</h5><p class="text-muted small text-center p-1">${loadingText}</p></div></div>`;
                        combinedHtml += '</div>';
                    }
                }
                combinedHtml += `</div>`;
            });
        }

        combinedHtml += `</div>`;
        return combinedHtml;
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        const langKey = lang === 'en' ? 'en' : 'de';
        const tableTitleConfig = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle;
        const tableTitle = tableTitleConfig[`title${langKey.charAt(0).toUpperCase() + langKey.slice(1)}`] || tableTitleConfig.titleDe;

        let tableHTML = `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableTitleConfig.id}">
            <thead>
                <tr>
                    <th>${UI_TEXTS.publicationTableHeaders?.studySet?.[langKey] || (langKey === 'de' ? 'Studie / Kriterienset' : 'Study / Criteria Set')}</th>
                    <th>${UI_TEXTS.publicationTableHeaders?.targetCohort?.[langKey] || (langKey === 'de' ? 'Primäres Zielkollektiv (Anwendung)' : 'Primary Target Cohort (Application)')}</th>
                    <th>${UI_TEXTS.publicationTableHeaders?.coreCriteria?.[langKey] || (langKey === 'de' ? 'Kernkriterien (Kurzfassung)' : 'Core Criteria (Summary)')}</th>
                    <th>${UI_TEXTS.publicationTableHeaders?.logic?.[langKey] || (langKey === 'de' ? 'Logik' : 'Logic')}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studySet.studyInfo?.keyCriteriaSummary || studySet.description || studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false, langKey);
                const anwendungskontext = `${getKollektivDisplayName(studySet.applicableKollektiv, langKey)} (${studySet.context})`;
                const logicText = UI_TEXTS.t2LogicDisplayNames[studySet.logic]?.[langKey] || UI_TEXTS.t2LogicDisplayNames[studySet.logic]?.['de'] || studySet.logic;
                const studyNameBase = UI_TEXTS.literatureSetNames?.[conf.id];
                const studyName = (typeof studyNameBase === 'object' ? studyNameBase[langKey] : studyNameBase) || studySet.name;


                tableHTML += `<tr>
                                <td>${studyName}</td>
                                <td>${anwendungskontext}</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${logicText}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(kollektiveData, lang) {
        const langKey = lang === 'en' ? 'en' : 'de';
        if (!kollektiveData || !kollektiveData.Gesamt || !kollektiveData.Gesamt.deskriptiv) return `<p class="text-muted small">${langKey === 'de' ? 'Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.' : 'Insufficient patient data for Table 1.'}</p>`;

        const tableTitleConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        const tableTitle = tableTitleConfig[`title${langKey.charAt(0).toUpperCase() + langKey.slice(1)}`] || tableTitleConfig.titleDe;

        let tableHTML = `<h4 class="mt-4 mb-3">${tableTitle}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableTitleConfig.id}">
            <thead>
                <tr>
                    <th>${UI_TEXTS.publicationTableHeaders?.characteristic?.[langKey] || (langKey === 'de' ? 'Merkmal' : 'Characteristic')}</th>
                    <th>${getKollektivDisplayName('Gesamt', langKey)} (N=${kollektiveData.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP', langKey)} (N=${kollektiveData['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('nRCT', langKey)} (N=${kollektiveData.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder, false, langKey);
        const fPerc = (count, total, dig = 0, placeholder = 'N/A') => (total > 0 && count !== undefined && count !== null && !isNaN(count)) ? formatPercent(count / total, dig, placeholder, langKey) : placeholder;

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            tableHTML += `<tr>
                            <td>${langKey === 'de' ? labelDe : labelEn}</td>
                            <td>${getterGesamt(kollektiveData.Gesamt?.deskriptiv)}</td>
                            <td>${getterDirektOP(kollektiveData['direkt OP']?.deskriptiv)}</td>
                            <td>${getterNRCT(kollektiveData.nRCT?.deskriptiv)}</td>
                          </tr>`;
        };
        const na = langKey === 'de' ? 'N/V' : 'N/A';
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
        if (!kollektiveData) return `<p class="text-muted small">${lang === 'de' ? 'Keine Gütedaten für diese Sektion verfügbar.' : 'No performance data available for this section.'}</p>`;
        const langKey = lang === 'en' ? 'en' : 'de';
        let title = '';
        let tableIdSuffix = '';
        const dataSetsToDisplay = [];
        const bfMetricForDisplay = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

        const formatMetricForTable = (metricObj, isRate = true, digits = 1, langParam = langKey) => {
            if (!metricObj || metricObj.value === undefined || isNaN(metricObj.value)) return '–';
            return formatCI(metricObj.value, metricObj.ci?.lower, metricObj.ci?.upper, digits, isRate, '–', langParam);
        };


        if (sectionId === 'ergebnisse_as_performance') {
            title = UI_TEXTS.publicationTableTitles?.asPerformance?.[langKey] || (langKey === 'de' ? 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)' : 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)');
            tableIdSuffix = 'as-performance';
            dataSetsToDisplay.push({ nameKey: UI_TEXTS.legendLabels.avocadoSign[langKey] || UI_TEXTS.legendLabels.avocadoSign.de, statsByKollektiv: { 'Gesamt': kollektiveData.Gesamt?.gueteAS, 'direkt OP': kollektiveData['direkt OP']?.gueteAS, 'nRCT': kollektiveData.nRCT?.gueteAS } });
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            title = UI_TEXTS.publicationTableTitles?.literaturT2Performance?.[langKey] || (langKey === 'de' ? 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)' : 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)');
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
                const studyNameBase = UI_TEXTS.literatureSetNames?.[conf.id];
                const nameForKey = (typeof studyNameBase === 'object' ? studyNameBase[langKey] : studyNameBase) || studySet?.name || conf.id;
                dataSetsToDisplay.push({ nameKey: nameForKey, statsByKollektiv: stats, id: conf.id, shortName: studySet?.displayShortName });
            });
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            const titleDe = `Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: ${bfMetricForDisplay}, vs. N-Status)`;
            const titleEn = `Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: ${bfMetricForDisplay}, vs. N-Status)`;
            title = UI_TEXTS.publicationTableTitles?.optimierteT2Performance?.[langKey]?.replace('[METRIC]', bfMetricForDisplay) || (langKey === 'de' ? titleDe : titleEn);
            tableIdSuffix = 'optimierte-t2-performance';
            const stats = {};
            for (const kollektivId of ['Gesamt', 'direkt OP', 'nRCT']) {
                stats[kollektivId] = kollektiveData[kollektivId]?.gueteT2_bruteforce;
            }
            const nameDe = `Optimierte T2 (${bfMetricForDisplay})`;
            const nameEn = `Optimized T2 (${bfMetricForDisplay})`;
            dataSetsToDisplay.push({ nameKey: langKey === 'de' ? nameDe : nameEn, statsByKollektiv: stats });
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
            title = UI_TEXTS.publicationTableTitles?.vergleichPerformance?.[langKey] || (langKey === 'de' ? 'Tabelle 6: Paarweiser Vergleich der diagnostischen Güte (vs. N-Status)' : 'Table 6: Pairwise Comparison of Diagnostic Performance (vs. N-Status)');
            tableIdSuffix = 'vergleich-performance';
             for (const kollektivId of ['Gesamt', 'direkt OP', 'nRCT']) {
                if (!kollektiveData[kollektivId]) continue;
                const asData = kollektiveData[kollektivId].gueteAS;
                const t2AngewandtData = kollektiveData[kollektivId].gueteT2_angewandt;
                const t2OptimiertData = kollektiveData[kollektivId].gueteT2_bruteforce;
                const vergleichASvsAngewandt = kollektiveData[kollektivId].vergleichASvsT2_angewandt;
                const vergleichASvsOptimiert = kollektiveData[kollektivId].vergleichASvsT2_bruteforce;

                dataSetsToDisplay.push({
                    kollektivIdentifier: kollektivId,
                    asData, t2AngewandtData, t2OptimiertData,
                    vergleichASvsAngewandt, vergleichASvsOptimiert,
                    bfDefinition: kollektiveData[kollektivId].bruteforce_definition
                });
            }
        }

        if (dataSetsToDisplay.length === 0 || dataSetsToDisplay.every(ds => typeof ds.statsByKollektiv === 'object' && ds.statsByKollektiv !== null && Object.values(ds.statsByKollektiv).every(s => !s || !s.matrix))) {
             const fallbackText = langKey === 'de' ? 'Keine validen Gütedaten für die Anzeige in den ausgewerteten Kollektiven vorhanden.' : 'No valid performance data available for display in the evaluated cohorts.';
            return `<p class="text-muted small">${title} - ${fallbackText}</p>`;
        }

        let tableHTML = `<h4 class="mt-4 mb-3">${title}</h4>`;
        const tableBaseId = `${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteGesamtTabelle.idPrefix || 'pub-table-diagnostische-guete-'}${tableIdSuffix}`;

        if (sectionId !== 'ergebnisse_vergleich_performance') {
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableBaseId}">
                <thead>
                    <tr>
                        <th>${UI_TEXTS.publicationTableHeaders?.method?.[langKey] || (langKey === 'de' ? 'Methode' : 'Method')}</th>
                        <th>${UI_TEXTS.publicationTableHeaders?.cohort?.[langKey] || (langKey === 'de' ? 'Kollektiv' : 'Cohort')}</th>
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
                    const displayName = dataSet.nameKey;

                    if (stats === null && sectionId === 'ergebnisse_literatur_t2_performance') {
                         tableHTML += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kollektivId, langKey)}</td>
                                <td colspan="6" class="text-center text-muted small"><em>${langKey === 'de' ? 'Nicht anwendbar/evaluiert' : 'Not applicable/evaluated'}</em></td>
                              </tr>`;
                        continue;
                    }
                    if (!stats || !stats.matrix || nPat === 0) {
                         tableHTML += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kollektivId, langKey)} (N=${nPat})</td>
                                <td colspan="6" class="text-center text-muted small">${langKey === 'de' ? 'Keine validen Daten' : 'No valid data'}</td>
                              </tr>`;
                        continue;
                    }
                     tableHTML += `<tr>
                            <td>${displayName} ${dataSet.shortName && sectionId === 'ergebnisse_literatur_t2_performance' ? `(${dataSet.shortName})`:''}</td>
                            <td>${getKollektivDisplayName(kollektivId, langKey)} (N=${nPat})</td>
                            <td>${formatMetricForTable(stats.sens, true, 1, langKey)}</td>
                            <td>${formatMetricForTable(stats.spez, true, 1, langKey)}</td>
                            <td>${formatMetricForTable(stats.ppv, true, 1, langKey)}</td>
                            <td>${formatMetricForTable(stats.npv, true, 1, langKey)}</td>
                            <td>${formatMetricForTable(stats.acc, true, 1, langKey)}</td>
                            <td>${formatMetricForTable(stats.auc, false, 3, langKey)}</td>
                          </tr>`;
                }
            });
            tableHTML += `</tbody></table></div>`;
        } else { // 'ergebnisse_vergleich_performance'
             tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableBaseId}">
                <thead>
                    <tr>
                        <th>${UI_TEXTS.publicationTableHeaders?.cohort?.[langKey] || (langKey === 'de' ? 'Kollektiv' : 'Cohort')}</th>
                        <th>${UI_TEXTS.publicationTableHeaders?.comparison?.[langKey] || (langKey === 'de' ? 'Vergleich' : 'Comparison')}</th>
                        <th>AUC/BalAcc (95% CI)</th>
                        <th>Accuracy (95% CI)</th>
                        <th>${UI_TEXTS.publicationTableHeaders?.pValueAUC?.[langKey] || (langKey === 'de' ? 'p-Wert (AUC, DeLong)' : 'p-value (AUC, DeLong)')}</th>
                        <th>${UI_TEXTS.publicationTableHeaders?.pValueAcc?.[langKey] || (langKey === 'de' ? 'p-Wert (Acc, McNemar)' : 'p-value (Acc, McNemar)')}</th>
                    </tr>
                </thead><tbody>`;
            dataSetsToDisplay.forEach(compData => {
                if (!compData || !kollektiveData[compData.kollektivIdentifier]) return;
                const kollektivDisplayName = getKollektivDisplayName(compData.kollektivIdentifier, langKey);
                const nPat = kollektiveData[compData.kollektivIdentifier]?.deskriptiv?.anzahlPatienten || 'N/A';
                const asDisplayNameBase = UI_TEXTS.legendLabels.avocadoSign;
                const asDisplayName = (typeof asDisplayNameBase === 'object' ? asDisplayNameBase[langKey] : asDisplayNameBase) || asDisplayNameBase.de;
                const appliedT2DisplayNameBase = UI_TEXTS.kollektivDisplayNames.applied_criteria;
                const appliedT2DisplayName = (typeof appliedT2DisplayNameBase === 'object' ? appliedT2DisplayNameBase[langKey] : appliedT2DisplayNameBase) || appliedT2DisplayNameBase.de;

                const optimizedT2Name = compData.bfDefinition?.metricName ? (langKey === 'de' ? `Optimierte T2 (${compData.bfDefinition.metricName})` : `Optimized T2 (${compData.bfDefinition.metricName})`) : (langKey === 'de' ? 'Optimierte T2' : 'Optimized T2');

                tableHTML += `<tr><td rowspan="2">${kollektivDisplayName} (N=${nPat})</td>
                                <td>${asDisplayName}</td>
                                <td>${formatMetricForTable(compData.asData?.auc, false, 3, langKey)}</td>
                                <td>${formatMetricForTable(compData.asData?.acc, true, 1, langKey)}</td>
                                <td rowspan="1" class="align-middle text-center">${publicationTextGenerator.getPValueText(compData.vergleichASvsAngewandt?.delong?.pValue, langKey)}</td>
                                <td rowspan="1" class="align-middle text-center">${publicationTextGenerator.getPValueText(compData.vergleichASvsAngewandt?.mcnemar?.pValue, langKey)}</td>
                              </tr>
                              <tr>
                                <td>${appliedT2DisplayName}</td>
                                <td>${formatMetricForTable(compData.t2AngewandtData?.auc, false, 3, langKey)}</td>
                                <td>${formatMetricForTable(compData.t2AngewandtData?.acc, true, 1, langKey)}</td>
                                <td colspan="2" class="text-center text-muted small"><em>${langKey === 'de' ? 'vs. Avocado Sign' : 'vs. Avocado Sign'}</em></td>
                              </tr>`;
                if(compData.t2OptimiertData && compData.bfDefinition) {
                    tableHTML += `<tr><td rowspan="2">${kollektivDisplayName} (N=${nPat})</td>
                                <td>${asDisplayName}</td>
                                <td>${formatMetricForTable(compData.asData?.auc, false, 3, langKey)}</td>
                                <td>${formatMetricForTable(compData.asData?.acc, true, 1, langKey)}</td>
                                <td rowspan="1" class="align-middle text-center">${publicationTextGenerator.getPValueText(compData.vergleichASvsOptimiert?.delong?.pValue, langKey)}</td>
                                <td rowspan="1" class="align-middle text-center">${publicationTextGenerator.getPValueText(compData.vergleichASvsOptimiert?.mcnemar?.pValue, langKey)}</td>
                              </tr>
                              <tr>
                                <td>${optimizedT2Name}</td>
                                <td>${formatMetricForTable(compData.t2OptimiertData?.auc, false, 3, langKey)}</td>
                                <td>${formatMetricForTable(compData.t2OptimiertData?.acc, true, 1, langKey)}</td>
                                <td colspan="2" class="text-center text-muted small"><em>${langKey === 'de' ? 'vs. Avocado Sign' : 'vs. Avocado Sign'}<br>(${studyT2CriteriaManager.formatCriteriaForDisplay(compData.bfDefinition.criteria, compData.bfDefinition.logic, true, langKey)})</em></td>
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
