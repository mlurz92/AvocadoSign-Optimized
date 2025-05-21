const publicationRenderer = (() => {

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

            const textContentFunction = publicationTextGenerator.getSectionText(subSection.id, lang, publicationData, kollektiveData, commonData);
            combinedHtml += textContentFunction || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienTabelle(lang);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(kollektiveData, lang); // Pass kollektiveData for this specific table
                combinedHtml += '<div class="row mt-4 g-3">';
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-alter-${currentKollektiv.replace(/\s+/g, '-')}"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.ageDistribution} (${getKollektivDisplayName(currentKollektiv)})</h5></div></div>`;
                combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-gender-${currentKollektiv.replace(/\s+/g, '-')}"><h5 class="text-center small mb-1">${UI_TEXTS.chartTitles.genderDistribution} (${getKollektivDisplayName(currentKollektiv)})</h5></div></div>`;
                combinedHtml += '</div>';
            } else if (subSection.id === 'ergebnisse_as_performance' || subSection.id === 'ergebnisse_literatur_t2_performance' || subSection.id === 'ergebnisse_optimierte_t2_performance' || subSection.id === 'ergebnisse_vergleich_performance') {
                combinedHtml += _renderDiagnostischeGueteTabellen(kollektiveData, lang, subSection.id, kollektiveData, currentKollektiv); // Pass kollektiveData for this specific table generator too
                if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(subSection.id)) {
                     combinedHtml += '<div class="row mt-4 g-3">';
                     combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-roc-${subSection.id.replace('ergebnisse_','')}"><h5 class="text-center small mb-1">ROC Kurven Vergleich</h5></div></div>`;
                     combinedHtml += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-bar-${subSection.id.replace('ergebnisse_','')}"><h5 class="text-center small mb-1">Performance Metriken Vergleich</h5></div></div>`;
                     combinedHtml += '</div>';
                }
            }
            combinedHtml += `</div>`;
        });

        combinedHtml += `</div>`;
        return combinedHtml;
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle: Übersicht der Literatur-basierten T2-Kriteriensets' : 'Table: Overview of Literature-Based T2 Criteria Sets'}</h4>`;
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
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, true);

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

    function _renderPatientenCharakteristikaTabelle(data, lang) {
        if (!data || !data.Gesamt || !data.Gesamt.deskriptiv) return `<p class="text-muted small">Keine ausreichenden Patientendaten für Tabelle verfügbar.</p>`;
        let tableHTML = `<h4 class="mt-4 mb-3">${lang === 'de' ? 'Tabelle: Patientencharakteristika' : 'Table: Patient Characteristics'}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>Gesamt (N=${data.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>Direkt OP (N=${data['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>nRCT (N=${data.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder);
        const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null) ? formatPercent(count / total, dig) : 'N/A';

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${getterGesamt(data.Gesamt?.deskriptiv)}</td>
                            <td>${getterDirektOP(data['direkt OP']?.deskriptiv)}</td>
                            <td>${getterNRCT(data.nRCT?.deskriptiv)}</td>
                          </tr>`;
        };

        addRow('Alter, Median (Min-Max) [Jahre]', 'Age, Median (Min-Max) [Years]',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : 'N/A',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : 'N/A',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : 'N/A'
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

    function _renderDiagnostischeGueteTabellen(data, lang, sectionId, kollektiveData, currentKollektiv) {
        if (!data) return '<p class="text-muted small">Keine Gütedaten für diese Sektion verfügbar.</p>';
        let title = '';
        let dataSetsToDisplay = [];

        const formatMetric = (m, isRate = true, digits = 1) => {
            if (!m || m.value === undefined || isNaN(m.value)) return 'N/A';
            const val = isRate ? formatPercent(m.value, digits) : formatNumber(m.value, digits);
            const ciLower = isRate ? formatPercent(m.ci?.lower, digits, '') : formatNumber(m.ci?.lower, digits, '');
            const ciUpper = isRate ? formatPercent(m.ci?.upper, digits, '') : formatNumber(m.ci?.upper, digits, '');
            if (ciLower !== '' && ciUpper !== '' && ciLower !== 'N/A' && ciUpper !== 'N/A') {
                return `${val} (${ciLower}–${ciUpper})`;
            }
            return val;
        };


        if (sectionId === 'ergebnisse_as_performance') {
            title = lang === 'de' ? 'Tabelle: Diagnostische Güte - Avocado Sign (vs. N-Status)' : 'Table: Diagnostic Performance - Avocado Sign (vs. N-Status)';
            dataSetsToDisplay.push({ name: 'Avocado Sign', statsByKollektiv: { 'Gesamt': kollektiveData.Gesamt?.gueteAS, 'direkt OP': kollektiveData['direkt OP']?.gueteAS, 'nRCT': kollektiveData.nRCT?.gueteAS } });
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            title = lang === 'de' ? 'Tabelle: Diagnostische Güte - Literatur-basierte T2-Kriterien (vs. N-Status)' : 'Table: Diagnostic Performance - Literature-Based T2 Criteria (vs. N-Status)';
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const stats = {};
                let hasDataForThisSet = false;
                for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                    const perfData = kollektiveData[kollektiv]?.gueteT2_literatur?.[conf.id];
                    if (perfData) { // Auch wenn perfData null ist (nicht anwendbar), wollen wir es evtl. zeigen
                        stats[kollektiv] = perfData;
                        if (perfData && perfData.matrix) hasDataForThisSet = true; // Nur wenn Matrix da ist, gibt es was zu zeigen
                    } else {
                        stats[kollektiv] = null;
                    }
                }
                dataSetsToDisplay.push({ name: conf.nameKey, statsByKollektiv: stats, applicableCohort: studyT2CriteriaManager.getStudyCriteriaSetById(conf.id)?.applicableKollektiv });
            });
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            title = lang === 'de' ? 'Tabelle: Diagnostische Güte - Optimierte T2-Kriterien (Brute-Force, vs. N-Status)' : 'Table: Diagnostic Performance - Optimized T2 Criteria (Brute-Force, vs. N-Status)';
            const bfMetricForDisplay = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
            const stats = {};
            let hasData = false;
             for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                stats[kollektiv] = kollektiveData[kollektiv]?.gueteT2_bruteforce;
                 if (stats[kollektiv] && stats[kollektiv].matrix) hasData = true;
            }
            if(hasData) {
                dataSetsToDisplay.push({ name: `Optimierte T2 Kriterien (Ziel: ${bfMetricForDisplay})`, statsByKollektiv: stats });
            } else {
                 return `<p class="text-muted small">Keine Brute-Force Optimierungsdaten für Metrik '${bfMetricForDisplay}' in den ausgewerteten Kollektiven verfügbar.</p>`;
            }
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
            title = lang === 'de' ? 'Tabelle: Vergleich Diagnostische Güte - AS vs. T2 (vs. N-Status)' : 'Table: Comparison Diagnostic Performance - AS vs. T2 (vs. N-Status)';
            dataSetsToDisplay.push({ name: 'Avocado Sign', statsByKollektiv: { 'Gesamt': kollektiveData.Gesamt?.gueteAS, 'direkt OP': kollektiveData['direkt OP']?.gueteAS, 'nRCT': kollektiveData.nRCT?.gueteAS } });
            dataSetsToDisplay.push({ name: `Angewandte T2 Kriterien`, statsByKollektiv: { 'Gesamt': kollektiveData.Gesamt?.gueteT2_angewandt, 'direkt OP': kollektiveData['direkt OP']?.gueteT2_angewandt, 'nRCT': kollektiveData.nRCT?.gueteT2_angewandt } });
            const bfMetricForDisplay = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
            const bfStats = {};
            let hasBfData = false;
             for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                bfStats[kollektiv] = kollektiveData[kollektiv]?.gueteT2_bruteforce;
                 if (bfStats[kollektiv] && bfStats[kollektiv].matrix) hasBfData = true;
            }
            if(hasBfData) {
                dataSetsToDisplay.push({ name: `Optimierte T2 (${bfMetricForDisplay})`, statsByKollektiv: bfStats });
            }
        }

        if (dataSetsToDisplay.length === 0 || dataSetsToDisplay.every(ds => Object.values(ds.statsByKollektiv).every(s => !s || !s.matrix))) {
            return `<p class="text-muted small">${title} - Keine validen Gütedaten für die Anzeige in den ausgewerteten Kollektiven vorhanden.</p>`;
        }

        let tableHTML = `<h4 class="mt-4 mb-3">${title}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteGesamtTabelle.id}-${sectionId.replace('ergebnisse_','')}">
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
                    if (sectionId === 'ergebnisse_literatur_t2_performance' && dataSet.applicableCohort && dataSet.applicableCohort !== 'Gesamt' && dataSet.applicableCohort !== kollektivId) {
                        // Für Literatursets, die nicht auf dieses Kollektiv anwendbar sind
                         tableHTML += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kollektivId)}</td>
                                <td colspan="6" class="text-center text-muted small"><em>Nicht anwendbar/evaluiert für dieses Kollektiv</em></td>
                              </tr>`;
                        continue;
                    }

                    if (stats && stats.matrix) {
                        const nPat = stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn;
                        if (nPat > 0) {
                             tableHTML += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kollektivId)} (N=${nPat})</td>
                                <td>${formatMetric(stats.sens)}</td>
                                <td>${formatMetric(stats.spez)}</td>
                                <td>${formatMetric(stats.ppv)}</td>
                                <td>${formatMetric(stats.npv)}</td>
                                <td>${formatMetric(stats.acc)}</td>
                                <td>${formatMetric(stats.auc, false, 3)}</td>
                              </tr>`;
                        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
                             tableHTML += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kollektivId)}</td>
                                <td colspan="6" class="text-center text-muted small">Keine Patienten im Kollektiv</td>
                              </tr>`;
                        }
                    } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
                         tableHTML += `<tr>
                                <td>${displayName}</td>
                                <td>${getKollektivDisplayName(kollektivId)}</td>
                                <td colspan="6" class="text-center text-muted small">Keine Daten</td>
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
