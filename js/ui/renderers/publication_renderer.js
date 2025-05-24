const publicationRenderer = (() => {

    function renderSectionContent(sectionId, lang, allKollektivStats, options = {}) {
        if (!sectionId || !lang || !allKollektivStats) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv, bruteForceMetric } = options;
        const appliedCriteria = typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.getAppliedCriteria() : getDefaultT2Criteria();
        const appliedLogic = typeof t2CriteriaManager !== 'undefined' ? t2CriteriaManager.getAppliedLogic() : APP_CONFIG.DEFAULT_SETTINGS.T2_LOGIC;

        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
            nGesamt: allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            t2SizeStep: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.step,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            appliedCriteria: appliedCriteria,
            appliedLogic: appliedLogic,
            bruteForceMetric: bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            references: {
                lurzSchaefer2025: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025.",
                koh2008: "Koh DM, Chau I, Tait D, et al. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
                barbaro2024: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.",
                rutegard2025: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025.",
                beetsTan2018ESGAR: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475."
            }
        };

        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections || mainSectionConfig.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSectionConfig.labelKey] || mainSectionConfig.labelKey}</h1>`;

        mainSectionConfig.subSections.forEach(subSectionConfig => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSectionConfig.id}">`;
            combinedHtml += `<h2 class="mb-3 h4">${subSectionConfig.label}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSectionConfig.id, lang, allKollektivStats, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSectionConfig.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSectionConfig.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSectionConfig.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                const ageChartTitle = UI_TEXTS.chartTitles.publicationAgeDistribution.replace('{KollektivName}', getKollektivDisplayName(currentKollektiv));
                const genderChartTitle = UI_TEXTS.chartTitles.publicationGenderDistribution.replace('{KollektivName}', getKollektivDisplayName(currentKollektiv));
                const ageChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartAlter.idPrefix + (currentKollektiv || 'Gesamt').replace(/\s+/g, '-');
                const genderChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartGeschlecht.idPrefix + (currentKollektiv || 'Gesamt').replace(/\s+/g, '-');

                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${ageChartId}"><h5 class="text-center small mb-1">${ageChartTitle}</h5><p class="text-muted small text-center p-3">Lade Altersverteilung...</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${genderChartId}"><h5 class="text-center small mb-1">${genderChartTitle}</h5><p class="text-muted small text-center p-3">Lade Geschlechterverteilung...</p></div></div>`;
                combinedHtml += '</div>';
            } else if (subSectionConfig.id === 'ergebnisse_as_performance') {
                combinedHtml += _renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSectionConfig.id, currentKollektiv, commonData.bruteForceMetric);
                 const asPerfChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartASPerformanceAllKollektive.id;
                 const asPerfChartTitle = UI_TEXTS.chartTitles[PUBLICATION_CONFIG.publicationElements.ergebnisse.chartASPerformanceAllKollektive.titleKey] || "Performance AS";
                 combinedHtml += `<div class="row mt-4 g-3"><div class="col-md-12"><div class="chart-container border rounded p-2" id="${asPerfChartId}"><h5 class="text-center small mb-1">${asPerfChartTitle}</h5><p class="text-muted small text-center p-3">Lade Diagramm...</p></div></div></div>`;
            } else if (subSectionConfig.id === 'ergebnisse_literatur_t2_performance') {
                combinedHtml += _renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSectionConfig.id, currentKollektiv, commonData.bruteForceMetric);
                 const litPerfChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartLiteraturT2Performance.id;
                 const litPerfChartTitle = UI_TEXTS.chartTitles[PUBLICATION_CONFIG.publicationElements.ergebnisse.chartLiteraturT2Performance.titleKey] || "Performance Literatur T2";
                 combinedHtml += `<div class="row mt-4 g-3"><div class="col-md-12"><div class="chart-container border rounded p-2" id="${litPerfChartId}"><h5 class="text-center small mb-1">${litPerfChartTitle}</h5><p class="text-muted small text-center p-3">Lade Diagramm...</p></div></div></div>`;
            } else if (subSectionConfig.id === 'ergebnisse_optimierte_t2_performance') {
                combinedHtml += _renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSectionConfig.id, currentKollektiv, commonData.bruteForceMetric);
                 const bfPerfChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartBFT2Performance.id;
                 const bfPerfChartTitle = UI_TEXTS.chartTitles[PUBLICATION_CONFIG.publicationElements.ergebnisse.chartBFT2Performance.titleKey] || "Performance BF-optimierte T2";
                 combinedHtml += `<div class="row mt-4 g-3"><div class="col-md-12"><div class="chart-container border rounded p-2" id="${bfPerfChartId}"><h5 class="text-center small mb-1">${bfPerfChartTitle.replace('{BFMetric}', commonData.bruteForceMetric)}</h5><p class="text-muted small text-center p-3">Lade Diagramm...</p></div></div></div>`;
            } else if (subSectionConfig.id === 'ergebnisse_vergleich_performance') {
                combinedHtml += _renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSectionConfig.id, currentKollektiv, commonData.bruteForceMetric);
                 const barChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartVergleichASvsT2Bar.id;
                 const rocChartId = PUBLICATION_CONFIG.publicationElements.ergebnisse.chartVergleichASvsT2ROC.id;
                 const barChartTitle = UI_TEXTS.chartTitles[PUBLICATION_CONFIG.publicationElements.ergebnisse.chartVergleichASvsT2Bar.titleKey].replace('{KollektivName}', getKollektivDisplayName(currentKollektiv));
                 const rocChartTitle = UI_TEXTS.chartTitles[PUBLICATION_CONFIG.publicationElements.ergebnisse.chartVergleichASvsT2ROC.titleKey].replace('{KollektivName}', getKollektivDisplayName(currentKollektiv));
                 combinedHtml += '<div class="row mt-4 g-3">';
                 combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${rocChartId}"><h5 class="text-center small mb-1">${rocChartTitle}</h5><p class="text-muted small text-center p-3">Lade ROC Kurve...</p></div></div>`;
                 combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="${barChartId}"><h5 class="text-center small mb-1">${barChartTitle}</h5><p class="text-muted small text-center p-3">Lade Balkendiagramm...</p></div></div>`;
                 combinedHtml += '</div>';
            }
            combinedHtml += `</div>`;
        });

        combinedHtml += `</div>`;
        return combinedHtml;
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        const tableConf = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle;
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? tableConf.titleDe : tableConf.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConf.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv' : 'Primary Target Cohort'}</th>
                    <th>${lang === 'de' ? 'Kernkriterien (Kurzfassung)' : 'Core Criteria (Summary)'}</th>
                    <th>${lang === 'de' ? 'Logik' : 'Logic'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studySet.studyInfo?.keyCriteriaSummary || studySet.description || studyT2CriteriaManager.formatStudyCriteriaForDisplayStrict(studySet.criteria, studySet.logic, false);
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
        const tableConf = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        if (!allKollektivStats || !allKollektivStats.Gesamt?.deskriptiv) return `<p class="text-muted small">${lang === 'de' ? tableConf.titleDe : tableConf.titleEn} - Keine ausreichenden Patientendaten für Tabelle verfügbar.</p>`;

        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? tableConf.titleDe : tableConf.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConf.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || '0'})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || '0'})</th>
                    <th>${getKollektivDisplayName('nRCT')} (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || '0'})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder);
        const fPerc = (count, total, dig = 0, placeholder = 'N/A') => (total > 0 && count !== undefined && count !== null && !isNaN(count) && !isNaN(total)) ? formatPercent(count / total, dig) : placeholder;

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${getterGesamt(allKollektivStats.Gesamt?.deskriptiv)}</td>
                            <td>${getterDirektOP(allKollektivStats['direkt OP']?.deskriptiv)}</td>
                            <td>${getterNRCT(allKollektivStats.nRCT?.deskriptiv)}</td>
                          </tr>`;
        };
        const na = 'N/A';
        addRow('Alter, Median (Min-Max) [Jahre]', 'Age, Median (Min-Max) [Years]',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})` : na,
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})` : na,
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})` : na
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
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSectionId, currentGlobalKollektiv, publicationBfMetric) {
        if (!allKollektivStats) return '<p class="text-muted small">Keine Gütedaten für diese Sektion verfügbar.</p>';
        let tableConfig, titleDe, titleEn, tableId;
        const dataSetsToDisplay = [];
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const na = 'N/A';

        const formatMetricForTable = (m, isRate = true, digits = 1) => {
            if (!m || m.value === undefined || isNaN(m.value) || !isFinite(m.value)) return na;
            const valStr = isRate ? formatPercent(m.value, digits, na) : formatNumber(m.value, digits, na);
            if (valStr === na) return na;
            if (m.ci && m.ci.lower !== null && m.ci.upper !== null && !isNaN(m.ci.lower) && !isNaN(m.ci.upper) && isFinite(m.ci.lower) && isFinite(m.ci.upper)) {
                const lowerStr = isRate ? formatPercent(m.ci.lower, digits, '') : formatNumber(m.ci.lower, digits, '', '');
                const upperStr = isRate ? formatPercent(m.ci.upper, digits, '') : formatNumber(m.ci.upper, digits, '', '');
                if (lowerStr === '' || upperStr === '') return valStr;
                return `${valStr} (${lowerStr}–${upperStr})`;
            }
            return valStr;
        };

        if (subSectionId === 'ergebnisse_as_performance') {
            tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle;
            titleDe = tableConfig.titleDe; titleEn = tableConfig.titleEn; tableId = tableConfig.id;
            kollektive.forEach(kolId => {
                dataSetsToDisplay.push({ name: 'Avocado Sign', kollektiv: kolId, stats: allKollektivStats[kolId]?.gueteAS });
            });
        } else if (subSectionId === 'ergebnisse_literatur_t2_performance') {
            tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle;
            titleDe = tableConfig.titleDe; titleEn = tableConfig.titleEn; tableId = tableConfig.id;
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySetDetails = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if (studySetDetails) {
                     kollektive.forEach(kolId => {
                        if (studySetDetails.applicableKollektiv === 'Gesamt' || studySetDetails.applicableKollektiv === kolId) {
                           dataSetsToDisplay.push({ name: studySetDetails.name || conf.nameKey, kollektiv: kolId, stats: allKollektivStats[kolId]?.gueteT2_literatur?.[conf.id] });
                        }
                     });
                }
            });
        } else if (subSectionId === 'ergebnisse_optimierte_t2_performance') {
            tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteBFT2Tabelle;
            titleDe = tableConfig.titleDe.replace('{BFMetric}', publicationBfMetric); titleEn = tableConfig.titleEn.replace('{BFMetric}', publicationBfMetric); tableId = tableConfig.id;
            kollektive.forEach(kolId => {
                const bfDef = allKollektivStats[kolId]?.bruteforce_definition;
                let setName = lang === 'de' ? `Optimierte T2 (${publicationBfMetric})` : `Optimized T2 (${publicationBfMetric})`;
                if (bfDef && bfDef.metricName !== publicationBfMetric) {
                    setName = lang === 'de' ? `Optimierte T2 (für ${bfDef.metricName})` : `Optimized T2 (for ${bfDef.metricName})`;
                } else if (!bfDef) {
                    setName = lang === 'de' ? `Optimierte T2 (k.A. für ${publicationBfMetric})` : `Optimized T2 (N/A for ${publicationBfMetric})`;
                }
                dataSetsToDisplay.push({ name: setName, kollektiv: kolId, stats: allKollektivStats[kolId]?.gueteT2_bruteforce, bfDef: bfDef });
            });
        } else if (subSectionId === 'ergebnisse_vergleich_performance') {
            tableConfig = PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichsTabelleASvsT2;
            titleDe = tableConfig.titleDe; titleEn = tableConfig.titleEn; tableId = tableConfig.id;
            // Diese Tabelle ist komplexer und zeigt AS vs. Lit vs. BF für jedes Kollektiv.
            // Wir bauen sie etwas anders auf.
            let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? titleDe : titleEn}</h4>`;
            tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}">
                <thead>
                    <tr>
                        <th>${lang === 'de' ? 'Kollektiv' : 'Cohort'}</th>
                        <th>${lang === 'de' ? 'Methode' : 'Method'}</th>
                        <th>${lang === 'de' ? 'Kriterien / Details' : 'Criteria / Details'}</th>
                        <th>Sens. (95% KI)</th>
                        <th>Spez. (95% KI)</th>
                        <th>AUC (95% KI)</th>
                        <th>p (vs. AS, Acc.)</th>
                        <th>p (vs. AS, AUC)</th>
                    </tr>
                </thead><tbody>`;

            kollektive.forEach(kolId => {
                const nPatKoll = allKollektivStats[kolId]?.deskriptiv?.anzahlPatienten;
                if (!nPatKoll || nPatKoll === 0) return;

                const asStats = allKollektivStats[kolId]?.gueteAS;
                if (asStats) {
                    tableHTML += `<tr>
                        <td rowspan="1">${getKollektivDisplayName(kolId)} (N=${nPatKoll})</td>
                        <td>Avocado Sign</td>
                        <td>N/A</td>
                        <td>${formatMetricForTable(asStats.sens)}</td>
                        <td>${formatMetricForTable(asStats.spez)}</td>
                        <td>${formatMetricForTable(asStats.auc, false, 3)}</td>
                        <td>-</td><td>-</td>
                    </tr>`;
                }

                PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                    if (studySet && (studySet.applicableKollektiv === 'Gesamt' || studySet.applicableKollektiv === kolId)) {
                        const litStats = allKollektivStats[kolId]?.gueteT2_literatur?.[conf.id];
                        // Hier müsste der Vergleich AS vs. Lit ad-hoc berechnet werden, wenn nicht schon vorhanden
                        // Für diese Version belassen wir p-Werte als Platzhalter oder N/A
                        if (litStats) {
                             const criteriaDisplay = studySet.studyInfo?.keyCriteriaSummary || studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, true);
                             tableHTML += `<tr>
                                <td></td>
                                <td>${studySet.displayShortName || studySet.name}</td>
                                <td style="font-size:0.9em;">${criteriaDisplay}</td>
                                <td>${formatMetricForTable(litStats.sens)}</td>
                                <td>${formatMetricForTable(litStats.spez)}</td>
                                <td>${formatMetricForTable(litStats.auc, false, 3)}</td>
                                <td>N/A</td><td>N/A</td>
                            </tr>`;
                        }
                    }
                });

                const bfDef = allKollektivStats[kolId]?.bruteforce_definition;
                const bfStats = allKollektivStats[kolId]?.gueteT2_bruteforce;
                const bfVergleich = allKollektivStats[kolId]?.vergleichASvsT2_bruteforce;
                if (bfDef && bfStats && bfDef.metricName === publicationBfMetric) {
                     const criteriaDisplay = studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, true);
                     tableHTML += `<tr>
                        <td></td>
                        <td>${lang === 'de' ? `Optimierte T2 (${publicationBfMetric})` : `Optimized T2 (${publicationBfMetric})`}</td>
                        <td style="font-size:0.9em;">${criteriaDisplay} (Wert: ${formatNumber(bfDef.metricValue,3)})</td>
                        <td>${formatMetricForTable(bfStats.sens)}</td>
                        <td>${formatMetricForTable(bfStats.spez)}</td>
                        <td>${formatMetricForTable(bfStats.auc, false, 3)}</td>
                        <td>${getPValueText(bfVergleich?.mcnemar?.pValue, lang, false)}</td>
                        <td>${getPValueText(bfVergleich?.delong?.pValue, lang, false)}</td>
                    </tr>`;
                }
            });
            tableHTML += `</tbody></table></div>`;
            return tableHTML;
        } else { return ''; }


        if (dataSetsToDisplay.length === 0 || dataSetsToDisplay.every(ds => !ds.stats || !ds.stats.matrix )) {
            return `<p class="text-muted small">${lang === 'de' ? titleDe : titleEn} - Keine validen Gütedaten für die Anzeige in den ausgewerteten Kollektiven vorhanden.</p>`;
        }

        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? titleDe : titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Methode' : 'Method'}</th>
                    <th>${lang === 'de' ? 'Kollektiv' : 'Cohort'}</th>
                    <th>Sens. (95% KI)</th>
                    <th>Spez. (95% KI)</th>
                    <th>PPV (95% KI)</th>
                    <th>NPV (95% KI)</th>
                    <th>Acc. (95% KI)</th>
                    <th>AUC (95% KI)</th>
                    ${subSectionId === 'ergebnisse_optimierte_t2_performance' ? `<th>${lang === 'de' ? 'Kriterien (BF)' : 'Criteria (BF)'}</th>` : ''}
                </tr>
            </thead><tbody>`;

        dataSetsToDisplay.forEach(dataSet => {
            const stats = dataSet.stats;
            const kollektivId = dataSet.kollektiv;
            const nPat = allKollektivStats[kollektivId]?.deskriptiv?.anzahlPatienten;

            if (stats && stats.matrix && nPat > 0) {
                tableHTML += `<tr>
                    <td>${dataSet.name}</td>
                    <td>${getKollektivDisplayName(kollektivId)} (N=${nPat})</td>
                    <td>${formatMetricForTable(stats.sens)}</td>
                    <td>${formatMetricForTable(stats.spez)}</td>
                    <td>${formatMetricForTable(stats.ppv)}</td>
                    <td>${formatMetricForTable(stats.npv)}</td>
                    <td>${formatMetricForTable(stats.acc)}</td>
                    <td>${formatMetricForTable(stats.auc, false, 3)}</td>
                    ${subSectionId === 'ergebnisse_optimierte_t2_performance' && dataSet.bfDef ? `<td style="font-size:0.9em;">${studyT2CriteriaManager.formatCriteriaForDisplay(dataSet.bfDef.criteria, dataSet.bfDef.logic, true)} (Wert: ${formatNumber(dataSet.bfDef.metricValue,3)})</td>` : (subSectionId === 'ergebnisse_optimierte_t2_performance' ? `<td>${na}</td>` : '')}
                  </tr>`;
            } else if (subSectionId === 'ergebnisse_literatur_t2_performance' || subSectionId === 'ergebnisse_optimierte_t2_performance') {
                 tableHTML += `<tr>
                    <td>${dataSet.name}</td>
                    <td>${getKollektivDisplayName(kollektivId)} (N=${nPat || 0})</td>
                    <td colspan="${subSectionId === 'ergebnisse_optimierte_t2_performance' ? '7' : '6'}" class="text-center text-muted small"><em>${lang === 'de' ? 'Keine/unzureichende Daten' : 'No/insufficient data'}</em></td>
                  </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    return Object.freeze({
        renderSectionContent
    });

})();
