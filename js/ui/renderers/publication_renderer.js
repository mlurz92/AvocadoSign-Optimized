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
            nGesamt: publicationData.patientenCharakteristika?.Gesamt?.anzahlPatienten || 0,
            nDirektOP: publicationData.patientenCharakteristika?.['direkt OP']?.anzahlPatienten || 0,
            nNRCT: publicationData.patientenCharakteristika?.nRCT?.anzahlPatienten || 0,
            t2SizeMin: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min,
            t2SizeMax: APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max,
            bootstrapReplications: APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS,
            significanceLevel: APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL,
            references: { // Dummy, müsste aus einer Konfigurationsdatei kommen oder dynamisch erzeugt werden
                lurzSchaefer2025: "Lurz M, Schäfer AO. The Avocado Sign: A novel imaging marker for nodal staging in rectal cancer. Eur Radiol. 2025;[DOI/Ahead of Print].",
                koh2008: "Koh DM, Chau I, Tait D, et al. Evaluating mesorectal lymph nodes in rectal cancer before and after neoadjuvant chemoradiation using thin-section T2-weighted magnetic resonance imaging. Int J Radiat Oncol Biol Phys. 2008;71(2):456-461.",
                barbaro2024: "Barbaro B, Carafa MRP, Minordi LM, et al. Magnetic resonance imaging for assessment of rectal cancer nodes after chemoradiotherapy: A single center experience. Radiother Oncol. 2024;193:110124.",
                rutegard2025: "Rutegård MK, Båtsman M, Blomqvist L, et al. Evaluation of MRI characterisation of histopathologically matched lymph nodes and other mesorectal nodal structures in rectal cancer. Eur Radiol. 2025;[DOI/Ahead of Print].",
                beetsTan2018ESGAR: "Beets-Tan RGH, Lambregts DMJ, Maas M, et al. Magnetic resonance imaging for clinical management of rectal cancer: updated recommendations from the 2016 European Society of Gastrointestinal and Abdominal Radiology (ESGAR) consensus meeting. Eur Radiol. 2018;28(4):1465-1475."
            }
        };

        let html = `<div class="publication-section-content" id="pub-content-${sectionId}">`;
        html += `<h2 class="mb-4">${PUBLICATION_CONFIG.sections.flatMap(s => s.subSections).find(sub => sub.id === sectionId)?.label || 'Unbekannter Abschnitt'}</h2>`;

        const textContentFunction = publicationTextGenerator.getSectionText(sectionId, lang, publicationData, kollektiveData, commonData);
        html += textContentFunction || `<p class="text-muted">Inhalt für diesen Abschnitt (ID: ${sectionId}, Sprache: ${lang}) wird noch generiert.</p>`;

        // Add specific tables or charts based on sectionId
        if (sectionId === 'methoden_t2_definition') {
            html += _renderLiteraturT2KriterienTabelle(lang);
        } else if (sectionId === 'ergebnisse_patientencharakteristika') {
            html += _renderPatientenCharakteristikaTabelle(publicationData.patientenCharakteristika, lang);
            html += '<div class="row mt-4">';
            html += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-alter-${currentKollektiv.replace(/\s+/g, '-')}"><h5 class="text-center small">${UI_TEXTS.chartTitles.ageDistribution} (${getKollektivDisplayName(currentKollektiv)})</h5></div></div>`;
            html += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-gender-${currentKollektiv.replace(/\s+/g, '-')}"><h5 class="text-center small">${UI_TEXTS.chartTitles.genderDistribution} (${getKollektivDisplayName(currentKollektiv)})</h5></div></div>`;
            html += '</div>';
        } else if (sectionId === 'ergebnisse_as_performance' || sectionId === 'ergebnisse_literatur_t2_performance' || sectionId === 'ergebnisse_optimierte_t2_performance' || sectionId === 'ergebnisse_vergleich_performance') {
            html += _renderDiagnostischeGueteTabellen(publicationData.diagnostischeGuete, lang, sectionId, kollektiveData, currentKollektiv);
            if (['ergebnisse_as_performance', 'ergebnisse_vergleich_performance'].includes(sectionId)) {
                 html += '<div class="row mt-4">';
                 html += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-roc-${sectionId.replace('ergebnisse_','')}"><h5 class="text-center small">ROC Kurven Vergleich</h5></div></div>`;
                 html += `<div class="col-md-6"><div class="chart-container border rounded p-2" id="pub-chart-bar-${sectionId.replace('ergebnisse_','')}"><h5 class="text-center small">Performance Metriken Vergleich</h5></div></div>`;
                 html += '</div>';
            }
        }

        html += `</div>`;
        return html;
    }

    function _renderLiteraturT2KriterienTabelle(lang) {
        let tableHTML = `<h4 class="mt-4">${lang === 'de' ? 'Übersicht der Literatur-basierten T2-Kriteriensets' : 'Overview of Literature-Based T2 Criteria Sets'}</h4>`;
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
        if (!data) return '<p>Keine Patientendaten verfügbar.</p>';
        let tableHTML = `<h4 class="mt-4">${lang === 'de' ? 'Patientencharakteristika' : 'Patient Characteristics'}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>Gesamt (N=${data.Gesamt?.anzahlPatienten || 0})</th>
                    <th>Direkt OP (N=${data['direkt OP']?.anzahlPatienten || 0})</th>
                    <th>nRCT (N=${data.nRCT?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A') => formatNumber(val, dig, placeholder);
        const fPerc = (count, total, dig = 1) => total > 0 ? formatPercent(count / total, dig) : 'N/A';

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            tableHTML += `<tr>
                            <td>${lang === 'de' ? labelDe : labelEn}</td>
                            <td>${getterGesamt(data.Gesamt)}</td>
                            <td>${getterDirektOP(data['direkt OP'])}</td>
                            <td>${getterNRCT(data.nRCT)}</td>
                          </tr>`;
        };

        addRow('Alter, Median (Min-Max) [Jahre]', 'Age, Median (Min-Max) [Years]',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : 'N/A',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : 'N/A',
            p => p ? `${fVal(p.alter?.median)} (${fVal(p.alter?.min,0)}-${fVal(p.alter?.max,0)})` : 'N/A'
        );
        addRow('Geschlecht, männlich [n (%)]', 'Sex, male [n (%)]',
            p => p ? `${p.geschlecht?.m || 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : 'N/A',
            p => p ? `${p.geschlecht?.m || 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : 'N/A',
            p => p ? `${p.geschlecht?.m || 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})` : 'N/A'
        );
        addRow('Pathologischer N-Status, positiv [n (%)]', 'Pathological N-Status, positive [n (%)]',
            p => p ? `${p.nStatus?.plus || 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : 'N/A',
            p => p ? `${p.nStatus?.plus || 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : 'N/A',
            p => p ? `${p.nStatus?.plus || 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})` : 'N/A'
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabellen(data, lang, sectionId, kollektiveData, currentKollektiv) {
        if (!data) return '<p>Keine Gütedaten verfügbar.</p>';
        let title = '';
        let dataSetsToDisplay = []; // Array von {name: '', statsByKollektiv: {Gesamt: {}, 'direkt OP': {}, nRCT: {}}}

        const formatMetric = (m, isRate = true, digits = 1) => {
            if (!m || m.value === undefined || isNaN(m.value)) return 'N/A';
            const val = isRate ? formatPercent(m.value, digits) : formatNumber(m.value, digits);
            const ciLower = isRate ? formatPercent(m.ci?.lower, digits, '') : formatNumber(m.ci?.lower, digits, '');
            const ciUpper = isRate ? formatPercent(m.ci?.upper, digits, '') : formatNumber(m.ci?.upper, digits, '');
            if (ciLower !== '' && ciUpper !== '') {
                return `${val} (${ciLower}–${ciUpper})`;
            }
            return val;
        };


        if (sectionId === 'ergebnisse_as_performance') {
            title = lang === 'de' ? 'Diagnostische Güte: Avocado Sign (vs. N-Status)' : 'Diagnostic Performance: Avocado Sign (vs. N-Status)';
            dataSetsToDisplay.push({ name: 'Avocado Sign', statsByKollektiv: kollektiveData.Gesamt?.gueteAS ? { 'Gesamt': kollektiveData.Gesamt.gueteAS, 'direkt OP': kollektiveData['direkt OP']?.gueteAS, 'nRCT': kollektiveData.nRCT?.gueteAS } : {} });
        } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
            title = lang === 'de' ? 'Diagnostische Güte: Literatur-basierte T2-Kriterien (vs. N-Status)' : 'Diagnostic Performance: Literature-Based T2 Criteria (vs. N-Status)';
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const stats = {};
                let hasData = false;
                for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                    stats[kollektiv] = kollektiveData[kollektiv]?.gueteT2_literatur?.[conf.id];
                    if (stats[kollektiv]) hasData = true;
                }
                if (hasData) {
                    dataSetsToDisplay.push({ name: conf.nameKey, statsByKollektiv: stats });
                }
            });
        } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
            title = lang === 'de' ? 'Diagnostische Güte: Optimierte T2-Kriterien (Brute-Force, vs. N-Status)' : 'Diagnostic Performance: Optimized T2 Criteria (Brute-Force, vs. N-Status)';
            const stats = {};
            let hasData = false;
             for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                stats[kollektiv] = kollektiveData[kollektiv]?.gueteT2_bruteforce;
                 if (stats[kollektiv]) hasData = true;
            }
            if(hasData) {
                const bfMetricForDisplay = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                dataSetsToDisplay.push({ name: `Optimierte T2 Kriterien (Ziel: ${bfMetricForDisplay})`, statsByKollektiv: stats });
            }
        } else if (sectionId === 'ergebnisse_vergleich_performance') {
            title = lang === 'de' ? 'Vergleich Diagnostische Güte: AS vs. Beste T2 (vs. N-Status)' : 'Comparison Diagnostic Performance: AS vs. Best T2 (vs. N-Status)';
             // Hier Logik für Auswahl "Beste T2" (kann komplex werden, vorerst angewandte T2)
            dataSetsToDisplay.push({ name: 'Avocado Sign', statsByKollektiv: kollektiveData.Gesamt?.gueteAS ? { 'Gesamt': kollektiveData.Gesamt.gueteAS, 'direkt OP': kollektiveData['direkt OP']?.gueteAS, 'nRCT': kollektiveData.nRCT?.gueteAS } : {} });
            dataSetsToDisplay.push({ name: `Angewandte T2 Kriterien`, statsByKollektiv: kollektiveData.Gesamt?.gueteT2_angewandt ? { 'Gesamt': kollektiveData.Gesamt.gueteT2_angewandt, 'direkt OP': kollektiveData['direkt OP']?.gueteT2_angewandt, 'nRCT': kollektiveData.nRCT?.gueteT2_angewandt } : {} });
            const bfMetricForDisplay = state.getCurrentPublikationBruteForceMetric() || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
            const bfStats = {};
            let hasBfData = false;
             for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                bfStats[kollektiv] = kollektiveData[kollektiv]?.gueteT2_bruteforce;
                 if (bfStats[kollektiv]) hasBfData = true;
            }
            if(hasBfData) {
                dataSetsToDisplay.push({ name: `Optimierte T2 (${bfMetricForDisplay})`, statsByKollektiv: bfStats });
            }

        }


        let tableHTML = `<h4 class="mt-4">${title}</h4>`;
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
                for (const kollektiv of ['Gesamt', 'direkt OP', 'nRCT']) {
                    const stats = dataSet.statsByKollektiv[kollektiv];
                    if (stats && stats.matrix) { // Ensure stats and matrix exist
                        const nPat = stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn;
                        if (nPat > 0) { // Only display if there are patients
                             tableHTML += `<tr>
                                <td>${dataSet.name}</td>
                                <td>${getKollektivDisplayName(kollektiv)} (N=${nPat})</td>
                                <td>${formatMetric(stats.sens)}</td>
                                <td>${formatMetric(stats.spez)}</td>
                                <td>${formatMetric(stats.ppv)}</td>
                                <td>${formatMetric(stats.npv)}</td>
                                <td>${formatMetric(stats.acc)}</td>
                                <td>${formatMetric(stats.auc, false, 3)}</td>
                              </tr>`;
                        }
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
