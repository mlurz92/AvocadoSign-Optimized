const publicationRenderer = (() => {

    function renderSectionContent(sectionId, lang, allKollektivStats, options = {}) {
        if (!sectionId || !lang || !allKollektivStats) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv, bruteForceMetric } = options;
        const commonData = {
            appName: APP_CONFIG.APP_NAME,
            appVersion: APP_CONFIG.APP_VERSION,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
            nGesamt: allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0,
            nDirektOP: allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0,
            nNRCT: allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: {
                lurzSchaefer2025: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025;[DOI/Ahead of Print].",
                koh2008: "Koh DM, Chau I, Tait D, et al. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
                barbaro2024: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.",
                rutegard2025: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025;[DOI/Ahead of Print].",
                beetsTan2018ESGAR: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475."
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

            const textContentFunction = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, allKollektivStats, commonData);
            combinedHtml += textContentFunction || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                const ageChartTitle = UI_TEXTS.chartTitles.publicationAgeDistribution.replace('{KollektivName}', getKollektivDisplayName(currentKollektiv));
                const genderChartTitle = UI_TEXTS.chartTitles.publicationGenderDistribution.replace('{KollektivName}', getKollektivDisplayName(currentKollektiv));
                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-alter-${currentKollektiv.replace(/\s+/g, '-')}"><h5 class="text-center small mb-1">${ageChartTitle}</h5><p class="text-muted small text-center p-3">Lade Altersverteilung...</p></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-gender-${currentKollektiv.replace(/\s+/g, '-')}"><h5 class="text-center small mb-1">${genderChartTitle}</h5><p class="text-muted small text-center p-3">Lade Geschlechterverteilung...</p></div></div>`;
                combinedHtml += '</div>';
            } else if (['ergebnisse_as_performance', 'ergebnisse_literatur_t2_performance', 'ergebnisse_optimierte_t2_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                combinedHtml += _renderDiagnostischeGueteTabellen(allKollektivStats, lang, subSection.id, currentKollektiv, bruteForceMetric);
                if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                     const rocChartTitle = UI_TEXTS.chartTitles.publicationROCasVsT2.replace('{KollektivName}', getKollektivDisplayName(currentKollektiv));
                     const barChartTitle = UI_TEXTS.chartTitles.publicationPerfBarAsVsT2.replace('{KollektivName}', getKollektivDisplayName(currentKollektiv));
                     combinedHtml += '<div class="row mt-4 g-3">';
                     combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-roc-${subSection.id.replace('ergebnisse_','')}"><h5 class="text-center small mb-1">${rocChartTitle}</h5><p class="text-muted small text-center p-3">Lade ROC Kurve...</p></div></div>`;
                     combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-bar-${subSection.id.replace('ergebnisse_','')}"><h5 class="text-center small mb-1">${barChartTitle}</h5><p class="text-muted small text-center p-3">Lade Balkendiagramm...</p></div></div>`;
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
                    <th>${lang === 'de' ? 'Studie / Kriterien Set' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv' : 'Primary Target Cohort'}</th>
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
        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">Keine ausreichenden Patientendaten für Tabelle verfügbar.</p>`;
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle 1: Patientencharakteristika' : 'Table 1: Patient Characteristics'}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>Gesamt (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || '0'})</th>
                    <th>Direkt OP (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || '0'})</th>
                    <th>nRCT (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || '0'})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder);
        const fPerc = (count, total, dig = 0) => (total > 0 && count !== undefined && count !== null && !isNaN(count) && !isNaN(total)) ? formatPercent(count / total, dig) : 'N/A';

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${getterGesamt(allKollektivStats.Gesamt?.deskriptiv)}</td>
                            <td>${getterDirektOP(allKollektivStats['direkt OP']?.deskriptiv)}</td>
                            <td>${getterNRCT(allKollektivStats.nRCT?.deskriptiv)}</td>
                          </tr>`;
        };

        addRow('Alter, Median (Min-Max) [Jahre]', 'Age, Median (Min-Max) [Years]',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})` : 'N/A',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})` : 'N/A',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}–${fVal(p.alter?.max,0)})` : 'N/A'
        );
        addRow('Geschlecht, männlich [n (%)]', 'Sex, male [n (%)]',
            p => p ? `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : 'N/A',
            p => p ? `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : 'N/A',
            p => p ? `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : 'N/A'
        );
         addRow('Pathologischer N-Status, positiv [n (%)]', 'Pathological N-Status, positive [n (%)]',
            p => p ? `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : 'N/A',
            p => p ? `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : 'N/A',
            p => p ? `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : 'N/A'
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(allKollektivStats, lang, sectionId, currentKollektiv, bfOptimizedMetric) {
        if (!allKollektivStats) return '<p class="text-muted small">Keine Gütedaten für diese Sektion verfügbar.</p>';
        let title = '', tableIdSuffix = '';
        const dataSetsToDisplay = [];

        const formatMetric = (m, isRate = true, digits = 1) => {
            if (!m || m.value === undefined || isNaN(m.value) || !isFinite(m.value)) return 'N/A';
            const valStr = isRate ? formatPercent(m.value, digits) : formatNumber(m.value, digits);
            if (m.ci && m.ci.lower !== null && m.ci.upper !== null && !isNaN(m.ci.lower) && !isNaN(m.ci.upper) && isFinite(m.ci.lower) && isFinite(m.ci.upper)) {
                const lowerStr = isRate ? formatPercent(m.ci.lower, digits, '') : formatNumber(m.ci.lower, digits, '');
                const upperStr = isRate ? formatPercent(m.ci.upper, digits, '') : formatNumber(m.ci.upper, digits, '');
                return `${valStr} (${lowerStr}–${upperStr})`;
            }
            return valStr;
        };

        if (sectionId === 'ergebnisse_as_performance') {
            title = lang === 'de' ? 'Tabelle 3: Diagnostische Güte - Avocado Sign (vs. N-Status)' : 'Table 3: Diagnostic Performance - Avocado Sign (vs. N-Status)';
            tableIdSuffix = 'as-perf';
            dataSetsToDisplay.push({ name: 'Avocado Sign', statsByKollektiv: { 'Gesamt': allKollektivStats.Gesamt?.gueteAS, 'direkt OP': allKollektivStats['direkt OP']?.gueteAS, 'nRCT': allKollektivStats.nRCT?.gueteAS } });
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            title = lang === 'de' ? 'Tabelle 4: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)' : 'Table 4: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)';
            tableIdSuffix = 'lit-t2-perf';
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySetDetails = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                const stats = {};
                for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                    stats[kollektiv] = allKollektivStats[kollektiv]?.gueteT2_literatur?.[conf.id];
                }
                dataSetsToDisplay.push({ name: studySetDetails?.name || conf.nameKey, statsByKollektiv: stats, applicableCohort: studySetDetails?.applicableKollektiv });
            });
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            title = lang === 'de' ? `Tabelle 5: Diagnostische Güte - Optimierte T2-Kriterien (Ziel: ${bfOptimizedMetric}, vs. N-Status)` : `Table 5: Diagnostic Performance - Optimized T2 Criteria (Target: ${bfOptimizedMetric}, vs. N-Status)`;
            tableIdSuffix = 'opt-t2-perf';
            const stats = {};
            for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                stats[kollektiv] = allKollektivStats[kollektiv]?.gueteT2_bruteforce;
            }
            const bfDefGesamt = allKollektivStats.Gesamt?.bruteforce_definition;
            const bfDefDO = allKollektivStats['direkt OP']?.bruteforce_definition;
            const bfDefNRCT = allKollektivStats.nRCT?.bruteforce_definition;

            let setName = lang === 'de' ? `Optimierte T2 Kriterien (Ziel: ${bfOptimizedMetric})` : `Optimized T2 Criteria (Target: ${bfOptimizedMetric})`;
            if (bfDefGesamt?.metricName !== bfOptimizedMetric && bfDefDO?.metricName !== bfOptimizedMetric && bfDefNRCT?.metricName !== bfOptimizedMetric) {
                 setName = lang === 'de' ? `Optimierte T2 Kriterien (Keine Daten für Ziel: ${bfOptimizedMetric})` : `Optimized T2 Criteria (No data for target: ${bfOptimizedMetric})`;
            }
            dataSetsToDisplay.push({ name: setName, statsByKollektiv: stats, isBFOptimizedSet: true });
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
            title = lang === 'de' ? 'Tabelle 6: Vergleich Diagnostische Güte (AS vs. T2-Varianten, vs. N-Status)' : 'Table 6: Comparison of Diagnostic Performance (AS vs. T2 Variants, vs. N-Status)';
            tableIdSuffix = 'vergleich-perf';
            dataSetsToDisplay.push({ name: 'Avocado Sign', statsByKollektiv: { 'Gesamt': allKollektivStats.Gesamt?.gueteAS, 'direkt OP': allKollektivStats['direkt OP']?.gueteAS, 'nRCT': allKollektivStats.nRCT?.gueteAS } });
            dataSetsToDisplay.push({ name: lang === 'de' ? 'Angewandte T2 Kriterien' : 'Applied T2 Criteria', statsByKollektiv: { 'Gesamt': allKollektivStats.Gesamt?.gueteT2_angewandt, 'direkt OP': allKollektivStats['direkt OP']?.gueteT2_angewandt, 'nRCT': allKollektivStats.nRCT?.gueteT2_angewandt } });
            const bfStats = {};
             for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                bfStats[kollektiv] = allKollektivStats[kollektiv]?.gueteT2_bruteforce;
            }
            dataSetsToDisplay.push({ name: lang === 'de' ? `Optimierte T2 (${bfOptimizedMetric})` : `Optimized T2 (${bfOptimizedMetric})`, statsByKollektiv: bfStats, isBFOptimizedSet: true });
        }

        if (dataSetsToDisplay.length === 0 || dataSetsToDisplay.every(ds => Object.values(ds.statsByKollektiv).every(s => !s || !s.matrix))) {
            return `<p class="text-muted small">${title} - Keine validen Gütedaten für die Anzeige in den ausgewerteten Kollektiven vorhanden.</p>`;
        }

        let tableHTML = `<h4 class="mt-4 mb-3">${title}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteGesamtTabelle.id}-${tableIdSuffix}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Methode' : 'Method'}</th>
                    <th>${lang === 'de' ? 'Kollektiv' : 'Cohort'}</th>
                    <th>Sens. (95% CI)</th>
                    <th>Spez. (95% CI)</th>
                    <th>PPV (95% CI)</th>
                    <th>NPV (95% CI)</th>
                    <th>Acc. (95% CI)</th>
                    <th>AUC (95% CI)</th>
                </tr>
            </thead><tbody>`;

        dataSetsToDisplay.forEach(dataSet => {
            if(dataSet.statsByKollektiv) {
                for (const kollektivId of ['Gesamt', 'direkt OP', 'nRCT']) {
                    const stats = dataSet.statsByKollektiv[kollektivId];
                    let displayName = dataSet.name;
                    let criteriaNote = '';

                    if (dataSet.isBFOptimizedSet && allKollektivStats[kollektivId]?.bruteforce_definition) {
                        const bfDef = allKollektivStats[kollektivId].bruteforce_definition;
                        if(bfDef.metricName !== bfOptimizedMetric) {
                             criteriaNote = lang === 'de' ? ` (Optimiert für ${bfDef.metricName})` : ` (Optimized for ${bfDef.metricName})`;
                        } else {
                             criteriaNote = lang === 'de' ? ` (Kriterien: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, true)})` : ` (Criteria: ${studyT2CriteriaManager.formatCriteriaForDisplay(bfDef.criteria, bfDef.logic, true)})`;
                        }
                    }

                    if (sectionId === 'ergebnisse_literatur_t2_performance' && dataSet.applicableCohort && dataSet.applicableCohort !== 'Gesamt' && dataSet.applicableCohort !== kollektivId) {
                         tableHTML += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kollektivId)}</td>
                                <td colspan="6" class="text-center text-muted small"><em>${lang === 'de' ? 'Nicht primär anwendbar/evaluiert' : 'Not primarily applicable/evaluated'}</em></td>
                              </tr>`;
                        continue;
                    }

                    if (stats && stats.matrix) {
                        const nPat = stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn;
                        if (nPat > 0) {
                             tableHTML += `<tr>
                                <td>${displayName}${criteriaNote}</td>
                                <td>${getKollektivDisplayName(kollektivId)} (N=${nPat})</td>
                                <td>${formatMetric(stats.sens)}</td>
                                <td>${formatMetric(stats.spez)}</td>
                                <td>${formatMetric(stats.ppv)}</td>
                                <td>${formatMetric(stats.npv)}</td>
                                <td>${formatMetric(stats.acc)}</td>
                                <td>${formatMetric(stats.auc, false, 3)}</td>
                              </tr>`;
                        } else if (sectionId === 'ergebnisse_literatur_t2_performance' || dataSet.isBFOptimizedSet) {
                             tableHTML += `<tr>
                                <td>${displayName}${criteriaNote}</td>
                                <td>${getKollektivDisplayName(kollektivId)}</td>
                                <td colspan="6" class="text-center text-muted small">${lang === 'de' ? 'Keine Patienten im Kollektiv' : 'No patients in cohort'}</td>
                              </tr>`;
                        }
                    } else if (sectionId === 'ergebnisse_literatur_t2_performance' || dataSet.isBFOptimizedSet) {
                         tableHTML += `<tr>
                                <td>${displayName}${criteriaNote}</td>
                                <td>${getKollektivDisplayName(kollektivId)}</td>
                                <td colspan="6" class="text-center text-muted small">${lang === 'de' ? 'Keine Daten' : 'No data'}</td>
                              </tr>`;
                    }
                }
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }


    return Object.freeze({
        renderSectionContent
    });

})();
