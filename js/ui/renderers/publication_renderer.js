const publicationRenderer = (() => {

    function _fCIForTable(metric, digits = 1, isPercent = true, lang = 'de') {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';
        
        const formatSingleValue = (val, d, isP, useStandard = false) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                formattedNum = formatNumber(val, d, 'N/A', useStandard);
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metric.value, digits, isPercent, lang === 'en');
        if (valStr === 'N/A') return valStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, digits, isPercent, lang === 'en');
            const upperStr = formatSingleValue(metric.ci.upper, digits, isPercent, lang === 'en');
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            
            let mainValDisplay = valStr;
            let lowerValDisplay = lowerStr;
            let upperValDisplay = upperStr;

            if(isPercent){
                mainValDisplay = String(mainValDisplay).replace('%','');
                lowerValDisplay = String(lowerValDisplay).replace('%','');
                upperValDisplay = String(upperValDisplay).replace('%','');
                return `${mainValDisplay} (${lowerValDisplay}\u00A0–\u00A0${upperValDisplay})%`;
            } else {
                 return `${mainValDisplay} (${lowerValDisplay}\u00A0–\u00A0${upperValDisplay})`;
            }
        }
        return valStr;
    }

    function _renderLiteraturT2KriterienUebersichtTabelle(lang, commonData) {
        const config = PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienUebersichtTabelle;
        let tableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${config.id}-title">${lang === 'de' ? config.titleDe : config.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <caption class="visually-hidden">${lang === 'de' ? config.titleDe : config.titleEn}</caption>
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
                    <th>${lang === 'de' ? 'Original-Zielkollektiv & Kontext' : 'Original Target Cohort & Context'}</th>
                    <th>${lang === 'de' ? 'Kernkriterien / Definition' : 'Core Criteria / Definition'}</th>
                    <th>${lang === 'de' ? 'Logik' : 'Logic'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const kriterienText = studySet.studyInfo?.keyCriteriaSummary || studySet.description || (lang === 'de' ? 'Nicht spezifiziert' : 'Not specified');
                const kontext = studySet.context || (lang === 'de' ? 'Nicht spezifiziert' : 'Not specified');
                const esgarRef = studySet.id.startsWith('rutegard') ? (lang === 'de' ? ` (bas. auf ESGAR Konsensus${publicationTextGenerator._getSafeLink('beetsTan2018ESGAR', commonData, lang)})` : ` (based on ESGAR Consensus${publicationTextGenerator._getSafeLink('beetsTan2018ESGAR', commonData, lang)})`) : '';


                tableHTML += `<tr>
                                <td>${studySet.name}${esgarRef} ${publicationTextGenerator._getSafeLink(conf.id.startsWith('rutegard') ? 'rutegard2025' : conf.id.startsWith('koh') ? 'koh2008' : 'barbaro2024', commonData, lang)}</td>
                                <td>${getKollektivDisplayName(studySet.applicableKollektiv)} (${kontext})</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang) {
        const config = PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle;
        if (!allKollektivStats || !allKollektivStats.Gesamt || !allKollektivStats.Gesamt.deskriptiv) return `<p class="text-muted small">${lang === 'de' ? 'Keine ausreichenden Patientendaten für Tabelle 1 verfügbar.' : 'Insufficient patient data for Table 1.'}</p>`;
        
        let tableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${config.id}-title">${lang === 'de' ? config.titleDe : config.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${config.id}">
            <caption class="visually-hidden">${lang === 'de' ? config.titleDe : config.titleEn}</caption>
            <thead>
                <tr>
                    <th>${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (N=${allKollektivStats.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (N=${allKollektivStats['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('nRCT')} (N=${allKollektivStats.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A', useStd = false) => formatNumber(val, dig, placeholder, useStd);
        const fPerc = (count, total, dig = 1) => (total > 0 && count !== undefined && count !== null && !isNaN(count)) ? formatPercent(count / total, dig) : 'N/A';

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

        addRow(lang === 'de' ? 'Alter, Median (Min–Max) [Jahre]' : 'Age, Median (Min–Max) [Years]', lang === 'de' ? 'Alter, Median (Min–Max) [Jahre]' : 'Age, Median (Min–Max) [Years]',
            p => `${fVal(p.alter?.median,1,undefined,lang==='en')} (${fVal(p.alter?.min,0,undefined,lang==='en')}–${fVal(p.alter?.max,0,undefined,lang==='en')})`,
            p => `${fVal(p.alter?.median,1,undefined,lang==='en')} (${fVal(p.alter?.min,0,undefined,lang==='en')}–${fVal(p.alter?.max,0,undefined,lang==='en')})`,
            p => `${fVal(p.alter?.median,1,undefined,lang==='en')} (${fVal(p.alter?.min,0,undefined,lang==='en')}–${fVal(p.alter?.max,0,undefined,lang==='en')})`
        );
        addRow(lang === 'de' ? 'Geschlecht, männlich [n (%)]' : 'Sex, male [n (%)]', lang === 'de' ? 'Geschlecht, männlich [n (%)]' : 'Sex, male [n (%)]',
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`
        );
        addRow(lang === 'de' ? 'Pathologischer N-Status, positiv [n (%)]' : 'Pathological N-Status, positive [n (%)]', lang === 'de' ? 'Pathologischer N-Status, positiv [n (%)]' : 'Pathological N-Status, positive [n (%)]',
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten)})`
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderPerformanceMetrikenTabelle(kollektivId, methodeName, methodeKey, statsObj, lang, commonData) {
        const config = PUBLICATION_CONFIG.publicationElements.ergebnisse.performanceMetrikenTabelle;
        const tableId = `${config.idPrefix}-${methodeKey}-${kollektivId}`;
        const titleDe = config.titleDe.replace('{Methode}', methodeName).replace('{Kollektiv}', getKollektivDisplayName(kollektivId));
        const titleEn = config.titleEn.replace('{Methode}', methodeName).replace('{Kollektiv}', getKollektivDisplayName(kollektivId));

        if (!statsObj || !statsObj.matrix) return `<p class="text-muted small">${lang === 'de' ? `Keine Performancedaten für ${methodeName} im Kollektiv ${getKollektivDisplayName(kollektivId)}.` : `No performance data for ${methodeName} in ${getKollektivDisplayName(kollektivId)} cohort.`}</p>`;

        let tableHTML = `<h5 class="mt-3 mb-2 publication-table-title" id="${tableId}-title">${lang === 'de' ? titleDe : titleEn}</h5>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}">
            <caption class="visually-hidden">${lang === 'de' ? titleDe : titleEn}</caption>
            <thead><tr>
                <th>${lang==='de'?'Metrik':'Metric'}</th>
                <th>${lang==='de'?'Wert (95%-KI)':'Value (95% CI)'}</th>
                <th>${lang==='de'?'Konfusionsmatrix':'Confusion Matrix'} (RP/FP/FN/RN)</th>
                <th>${lang==='de'?'CI Methode':'CI Method'}</th>
            </tr></thead><tbody>`;

        const metricsOrder = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc', 'lrPlus', 'lrMinus'];
        const { rp, fp, fn, rn } = statsObj.matrix;
        const matrixStr = `${rp}/${fp}/${fn}/${rn}`;

        metricsOrder.forEach(key => {
            const metric = statsObj[key];
            if (metric) {
                const isRate = !(key === 'f1' || key === 'auc' || key === 'lrPlus' || key === 'lrMinus');
                const digits = (key === 'f1' || key === 'auc' || key === 'lrPlus' || key === 'lrMinus') ? 3 : 1;
                const metricNameDisplay = TOOLTIP_CONTENT.statMetrics[key]?.name || key.toUpperCase();
                tableHTML += `<tr>
                                <td>${metricNameDisplay}</td>
                                <td>${_fCIForTable(metric, digits, isRate, lang)}</td>
                                <td>${key === 'sens' ? matrixStr : ''}</td>
                                <td>${metric.method || 'N/A'}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderStatistischerVergleichTabelle(kollektivId, methode1Name, methode1Key, methode2Name, methode2Key, vergleichsStatsObj, lang, commonData) {
        const config = PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichTabelle;
        const tableId = `${config.idPrefix}-${methode1Key}-vs-${methode2Key}-${kollektivId}`;
        const titleDe = config.titleDe.replace('{Methode1}', methode1Name).replace('{Methode2}', methode2Name).replace('{Kollektiv}', getKollektivDisplayName(kollektivId));
        const titleEn = config.titleEn.replace('{Methode1}', methode1Name).replace('{Methode2}', methode2Name).replace('{Kollektiv}', getKollektivDisplayName(kollektivId));

        if (!vergleichsStatsObj) return `<p class="text-muted small">${lang === 'de' ? `Keine Vergleichsdaten für ${methode1Name} vs. ${methode2Name} im Kollektiv ${getKollektivDisplayName(kollektivId)}.` : `No comparison data for ${methode1Name} vs. ${methode2Name} in ${getKollektivDisplayName(kollektivId)} cohort.`}</p>`;

        let tableHTML = `<h5 class="mt-3 mb-2 publication-table-title" id="${tableId}-title">${lang === 'de' ? titleDe : titleEn}</h5>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableId}">
            <caption class="visually-hidden">${lang === 'de' ? titleDe : titleEn}</caption>
            <thead><tr>
                <th>${lang==='de'?'Vergleichsaspekt':'Comparison Aspect'}</th>
                <th>${lang==='de'?'Wert / Statistik':'Value / Statistic'}</th>
                <th>${lang==='de'?'p-Wert':'p-value'}</th>
                <th>${lang==='de'?'Testmethode':'Test Method'}</th>
            </tr></thead><tbody>`;

        const m = vergleichsStatsObj.mcnemar;
        const d = vergleichsStatsObj.delong;

        tableHTML += `<tr>
                        <td>Accuracy (Diskordanz)</td>
                        <td>${m?.statistic !== undefined ? formatNumber(m.statistic, 3, 'N/A', lang === 'en') + (m.df ? ` (df=${m.df})` : '') : 'N/A'}</td>
                        <td>${getPValueText(m?.pValue, lang)} ${getStatisticalSignificanceSymbol(m?.pValue)}</td>
                        <td>${m?.method || 'N/A'}</td>
                      </tr>`;
        tableHTML += `<tr>
                        <td>AUC Differenz (${methode1Name} - ${methode2Name})</td>
                        <td>${d?.diffAUC !== undefined ? _fCIForTable(d, 3, false, lang) : 'N/A'} (Z=${formatNumber(d?.Z, 2, 'N/A', lang === 'en')})</td>
                        <td>${getPValueText(d?.pValue, lang)} ${getStatisticalSignificanceSymbol(d?.pValue)}</td>
                        <td>${d?.method || 'N/A'}</td>
                      </tr>`;
        if (vergleichsStatsObj.diffSens) {
             tableHTML += `<tr>
                        <td>Sensitivitäts-Differenz (${methode1Name} - ${methode2Name})</td>
                        <td colspan="2">${_fCIForTable(vergleichsStatsObj.diffSens, 1, true, lang)}</td>
                        <td>${vergleichsStatsObj.diffSens.method || 'N/A'}</td>
                      </tr>`;
        }
         if (vergleichsStatsObj.diffSpez) {
             tableHTML += `<tr>
                        <td>Spezifitäts-Differenz (${methode1Name} - ${methode2Name})</td>
                        <td colspan="2">${_fCIForTable(vergleichsStatsObj.diffSpez, 1, true, lang)}</td>
                        <td>${vergleichsStatsObj.diffSpez.method || 'N/A'}</td>
                      </tr>`;
        }

        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _renderChartPlaceholder(chartConfig, kollektivId, lang, figSuffix = '') {
        const chartId = `${chartConfig.idPrefix || chartConfig.id}${kollektivId ? '-' + kollektivId.replace(/\s+/g, '_') : ''}${figSuffix}`;
        const title = (lang === 'de' ? chartConfig.titleDe : chartConfig.titleEn).replace('{Kollektiv}', getKollektivDisplayName(kollektivId));
        const figNum = chartConfig.figureNumber ? ( (lang === 'de' ? `Abb. ${chartConfig.figureNumber}` : `Fig. ${chartConfig.figureNumber}`) + (figSuffix || '')) : '';

        return `<div class="col-md-${chartConfig.colWidth || 6} mt-3">
                    <div class="chart-container border rounded p-2" id="${chartId}">
                        <h5 class="text-center small mb-1">${title}</h5>
                        ${figNum ? `<p class="text-muted small text-center p-1">${figNum}</p>` : ''}
                        <p class="text-muted small text-center p-3">${lang === 'de' ? 'Diagramm wird geladen...' : 'Chart loading...'}</p>
                    </div>
                </div>`;
    }


    function renderSectionContent(sectionId, lang, allKollektivStats, commonDataFromLogic, options = {}) {
        if (!sectionId || !lang || !allKollektivStats || !commonDataFromLogic) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const { currentKollektiv, bruteForceMetric } = options; // global currentKollektiv for context, bfMetric for publication
        const commonData = {
            ...commonDataFromLogic,
            currentKollektivName: getKollektivDisplayName(currentKollektiv),
            bruteForceMetricForPublication: bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            references: commonDataFromLogic.references || {}
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

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für diesen Unterabschnitt (ID: ${subSection.id}, Sprache: ${lang}) wird noch generiert.</p>`;

            if (subSection.id === 'methoden_t2_definition') {
                combinedHtml += _renderLiteraturT2KriterienUebersichtTabelle(lang, commonData);
            } else if (subSection.id === 'ergebnisse_patientencharakteristika') {
                combinedHtml += _renderPatientenCharakteristikaTabelle(allKollektivStats, lang);
                let chartRow = '<div class="row mt-4 g-3">';
                chartRow += _renderChartPlaceholder({...(PUBLICATION_CONFIG.publicationElements.ergebnisse.alterVerteilungChart), idPrefix: 'pub-chart-alter', figureNumber: '1', colWidth:6}, 'Gesamt', lang, 'a');
                chartRow += _renderChartPlaceholder({...(PUBLICATION_CONFIG.publicationElements.ergebnisse.geschlechtVerteilungChart), idPrefix: 'pub-chart-gender', figureNumber: '1', colWidth:6}, 'Gesamt', lang, 'b');
                chartRow += '</div>';
                combinedHtml += chartRow;
            } else if (subSection.id === 'ergebnisse_as_performance') {
                const kollektiveToRender = ['Gesamt', 'direkt OP', 'nRCT'];
                kollektiveToRender.forEach(kolId => {
                    combinedHtml += _renderPerformanceMetrikenTabelle(kolId, 'Avocado Sign', 'AS', allKollektivStats[kolId]?.gueteAS, lang, commonData);
                });
            } else if (subSection.id === 'ergebnisse_literatur_t2_performance') {
                PUBLICATION_CONFIG.literatureCriteriaSets.forEach(litConf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litConf.id);
                    if (studySet) {
                        const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                        combinedHtml += _renderPerformanceMetrikenTabelle(targetKollektiv, studySet.name, litConf.id, allKollektivStats[targetKollektiv]?.gueteT2_literatur?.[litConf.id], lang, commonData);
                    }
                });
            } else if (subSection.id === 'ergebnisse_optimierte_t2_performance') {
                const kollektiveToRender = ['Gesamt', 'direkt OP', 'nRCT'];
                 const bfMetricForTitle = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
                kollektiveToRender.forEach(kolId => {
                    const methName = `${lang === 'de' ? 'Optimiertes T2' : 'Optimized T2'} (${bfMetricForTitle})`;
                    combinedHtml += _renderPerformanceMetrikenTabelle(kolId, methName, `bf-${bfMetricForTitle.replace(/\s+/g, '_')}`, allKollektivStats[kolId]?.gueteT2_bruteforce, lang, commonData);
                });
            } else if (subSection.id === 'ergebnisse_vergleich_performance') {
                const kollektiveToRender = ['Gesamt', 'direkt OP', 'nRCT'];
                const bfMetricForOptimizedName = commonData.bruteForceMetricForPublication || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

                kollektiveToRender.forEach(kolId => {
                    combinedHtml += `<h3 class="mt-4">${getKollektivDisplayName(kolId)}</h3>`;
                    PUBLICATION_CONFIG.literatureCriteriaSets.forEach(litConf => {
                         const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litConf.id);
                         if (studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'))) {
                            const vergleichStats = allKollektivStats[kolId]?.[`vergleichASvsT2_literatur_${litConf.id}`];
                            combinedHtml += _renderStatistischerVergleichTabelle(kolId, 'Avocado Sign', 'AS', studySet.name, litConf.id, vergleichStats, lang, commonData);
                         }
                    });
                    const vergleichStatsBF = allKollektivStats[kolId]?.vergleichASvsT2_bruteforce;
                    const bfDef = allKollektivStats[kolId]?.bruteforce_definition;
                    if (vergleichStatsBF && bfDef) {
                        const bfSetName = `${lang === 'de' ? 'Optimiertes T2' : 'Optimized T2'} (${bfDef.metricName || bfMetricForOptimizedName})`;
                        combinedHtml += _renderStatistischerVergleichTabelle(kolId, 'Avocado Sign', 'AS', bfSetName, `bf_${(bfDef.metricName || bfMetricForOptimizedName).replace(/\s+/g, '_')}`, vergleichStatsBF, lang, commonData);
                    }
                });
                let chartRow = '<div class="row mt-4 g-3">';
                const chartSuffixes = ['a', 'b', 'c'];
                kollektiveToRender.forEach((kolId, index) => {
                    chartRow += _renderChartPlaceholder({...(PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichPerformanceBalkenChart), figureNumber: '2', colWidth:4}, kolId, lang, chartSuffixes[index]);
                });
                 kollektiveToRender.forEach((kolId, index) => {
                    chartRow += _renderChartPlaceholder({...(PUBLICATION_CONFIG.publicationElements.ergebnisse.vergleichROCChart), figureNumber: '3', colWidth:4}, kolId, lang, chartSuffixes[index]);
                });
                chartRow += '</div>';
                combinedHtml += chartRow;
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
