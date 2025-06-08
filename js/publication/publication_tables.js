const publicationTables = (() => {

    function _renderLiteraturT2KriterienTabelle(lang) {
        const config = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle;
        let tableHTML = `<h4 class="mt-4 mb-3" id="${config.id}-title">${lang === 'de' ? config.titleDe : config.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Primäres Zielkollektiv' : 'Primary Target Cohort'}</th>
                    <th>${lang === 'de' ? 'Kernkriterien (Zusammenfassung)' : 'Core Criteria (Summary)'}</th>
                    <th>${lang === 'de' ? 'Logik' : 'Logic'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const criteriaText = studySet.logic === 'KOMBINIERT' ?
                    (studySet.studyInfo?.keyCriteriaSummary || studySet.description) :
                    studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, false);

                tableHTML += `<tr>
                                <td>${studySet.name || studySet.labelKey}</td>
                                <td>${utils.getKollektivDisplayName(studySet.applicableKollektiv)}</td>
                                <td style="white-space: normal;">${criteriaText || 'N/A'}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang) {
        const config = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        if (!allKollektivStats?.Gesamt?.deskriptiv) return `<h4 class="mt-4 mb-3" id="${config.id}-title">${lang === 'de' ? config.titleDe : config.titleEn}</h4><p class="text-muted small">Keine Daten für Tabelle 1 verfügbar.</p>`;
        
        let tableHTML = `<h4 class="mt-4 mb-3" id="${config.id}-title">${lang === 'de' ? config.titleDe : config.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${utils.getKollektivDisplayName('Gesamt')} (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${utils.getKollektivDisplayName('direkt OP')} (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${utils.getKollektivDisplayName('nRCT')} (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const na = 'N/A';
        const fv = (val, dig) => utils.formatNumber(val, dig, na, lang === 'en');
        const fPerc = (count, total) => utils.formatPercent(count / total, 1);

        const addRow = (labelDe, labelEn, getter) => {
            tableHTML += `<tr><td>${lang === 'de' ? labelDe : labelEn}</td>`;
            ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
                const stats = allKollektivStats[kolId]?.deskriptiv;
                tableHTML += `<td>${stats ? getter(stats) : na}</td>`;
            });
            tableHTML += `</tr>`;
        };

        addRow('Alter, Median (IQR) [Jahre]', 'Age, Median (IQR) [Years]', p => `${fv(p.alter?.median, 0)} (${fv(p.alter?.q1, 0)}–${fv(p.alter?.q3, 0)})`);
        addRow('Geschlecht, männlich [n (%)]', 'Sex, male [n (%)]', p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`);
        addRow('Pathologischer N-Status, positiv [n (%)]', 'Pathological N-Status, positive [n (%)]', p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`);
        
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabelle(allKollektivStats, lang, sectionId, commonData) {
        const bfZielMetric = commonData.bruteForceMetricForPublication;
        const configMap = {
            'ergebnisse_as_diagnostische_guete': PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteASTabelle,
            'ergebnisse_t2_literatur_diagnostische_guete': PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle,
            'ergebnisse_t2_optimiert_diagnostische_guete': PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteOptimierteT2Tabelle
        };
        const config = configMap[sectionId];
        if (!config) return '';

        let titleDe = config.titleDe.replace('{BF_METRIC}', bfZielMetric);
        let titleEn = config.titleEn.replace('{BF_METRIC}', bfZielMetric);
        let tableHTML = `<h4 class="mt-4 mb-3" id="${config.id}-title">${lang === 'de' ? titleDe : titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <thead><tr><th>${lang==='de'?'Methode':'Method'}</th><th>${lang==='de'?'Kollektiv':'Cohort'}</th><th>Sens. (95%-KI)</th><th>Spez. (95%-KI)</th><th>PPV (95%-KI)</th><th>NPV (95%-KI)</th><th>Acc. (95%-KI)</th><th>AUC (95%-KI)</th></tr></thead><tbody>`;

        const renderRow = (methodName, kollektivId, stats) => {
            if (!stats) return `<tr><td>${methodName}</td><td>${utils.getKollektivDisplayName(kollektivId)}</td><td colspan="6" class="text-center text-muted">N/A</td></tr>`;
            const n = stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn;
            return `<tr>
                        <td>${methodName}</td>
                        <td>${utils.getKollektivDisplayName(kollektivId)} (N=${n})</td>
                        <td>${utils.formatCI(stats.sens.value, stats.sens.ci.lower, stats.sens.ci.upper, 1, true)}</td>
                        <td>${utils.formatCI(stats.spez.value, stats.spez.ci.lower, stats.spez.ci.upper, 1, true)}</td>
                        <td>${utils.formatCI(stats.ppv.value, stats.ppv.ci.lower, stats.ppv.ci.upper, 1, true)}</td>
                        <td>${utils.formatCI(stats.npv.value, stats.npv.ci.lower, stats.npv.ci.upper, 1, true)}</td>
                        <td>${utils.formatCI(stats.acc.value, stats.acc.ci.lower, stats.acc.ci.upper, 1, true)}</td>
                        <td>${utils.formatCI(stats.auc.value, stats.auc.ci.lower, stats.auc.ci.upper, 3, false)}</td>
                    </tr>`;
        };
        
        if (sectionId === 'ergebnisse_as_diagnostische_guete') {
            ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
                tableHTML += renderRow('Avocado Sign', kolId, allKollektivStats[kolId]?.gueteAS);
            });
        } else if (sectionId === 'ergebnisse_t2_literatur_diagnostische_guete') {
            PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
                const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
                if (studySet) {
                    const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                    tableHTML += renderRow(studySet.name, targetKollektiv, allKollektivStats[targetKollektiv]?.gueteT2_literatur?.[conf.id]);
                }
            });
        } else if (sectionId === 'ergebnisse_t2_optimiert_diagnostische_guete') {
            ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
                tableHTML += renderRow(`Optimiert für ${bfZielMetric}`, kolId, allKollektivStats[kolId]?.gueteT2_bruteforce);
            });
        }

        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }
    
    function _renderVergleichAST2Tabelle(allKollektivStats, lang, commonData) {
        const config = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle;
        let tableHTML = `<h4 class="mt-4 mb-3" id="${config.id}-title">${lang === 'de' ? config.titleDe : config.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <thead><tr>
                <th>Vergleich</th>
                <th>Kollektiv</th>
                <th>Methode 1 (AUC)</th>
                <th>Methode 2 (AUC)</th>
                <th>DeLong p-Wert (AUC)</th>
                <th>McNemar p-Wert (Acc.)</th>
            </tr></thead><tbody>`;

        ['Gesamt', 'direkt OP', 'nRCT'].forEach(kolId => {
            const asStats = allKollektivStats[kolId]?.gueteAS;
            const bfStats = allKollektivStats[kolId]?.gueteT2_bruteforce;
            const vergleich = allKollektivStats[kolId]?.vergleichASvsT2_bruteforce;

            if (asStats && bfStats && vergleich) {
                 tableHTML += `<tr>
                    <td>AS vs. BF-Optimiert (${commonData.bruteForceMetricForPublication})</td>
                    <td>${utils.getKollektivDisplayName(kolId)}</td>
                    <td>AS (${utils.formatNumber(asStats.auc.value, 3, 'N/A', true)})</td>
                    <td>BF (${utils.formatNumber(bfStats.auc.value, 3, 'N/A', true)})</td>
                    <td>${utils.getPValueText(vergleich.delong?.pValue, lang, true)} ${utils.getStatisticalSignificanceSymbol(vergleich.delong?.pValue)}</td>
                    <td>${utils.getPValueText(vergleich.mcnemar?.pValue, lang, true)} ${utils.getStatisticalSignificanceSymbol(vergleich.mcnemar?.pValue)}</td>
                </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }


    return Object.freeze({
        renderLiteraturT2KriterienTabelle: _renderLiteraturT2KriterienTabelle,
        renderPatientenCharakteristikaTabelle: _renderPatientenCharakteristikaTabelle,
        renderDiagnostischeGueteTabelle: _renderDiagnostischeGueteTabelle,
        renderVergleichAST2Tabelle: _renderVergleichAST2Tabelle
    });

})();
