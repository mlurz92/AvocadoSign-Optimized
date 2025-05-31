const publicationRenderer = (() => {

    const fCI_pub = (metric, digits = 1, isPercent = true, lang = 'de', showMethod = false) => {
        if (!metric || metric.value === undefined || metric.value === null || isNaN(metric.value)) return 'N/A';
        const pValuePrecision = (digits === 3 && !isPercent) ? APP_CONFIG.STATISTICAL_CONSTANTS.P_VALUE_PRECISION_CSV : digits;

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 'N/A';
            let formattedNum;
            if (isP) {
                formattedNum = formatPercent(val, d, 'N/A');
            } else {
                formattedNum = formatNumber(val, d, 'N/A', true);
            }
            if (lang === 'de' && typeof formattedNum === 'string' && !isP) {
                formattedNum = formattedNum.replace('.', ',');
            }
            return formattedNum;
        };

        const valStr = formatSingleValue(metric.value, pValuePrecision, isPercent);
        if (valStr === 'N/A') return valStr;

        if (metric.ci && metric.ci.lower !== null && metric.ci.upper !== null && !isNaN(metric.ci.lower) && !isNaN(metric.ci.upper) && isFinite(metric.ci.lower) && isFinite(metric.ci.upper)) {
            const lowerStr = formatSingleValue(metric.ci.lower, pValuePrecision, isPercent);
            const upperStr = formatSingleValue(metric.ci.upper, pValuePrecision, isPercent);
            if (lowerStr === 'N/A' || upperStr === 'N/A') return valStr;
            
            let mainValForDisplay = valStr;
            let lowerValForDisplay = lowerStr;
            let upperValForDisplay = upperStr;
            let suffix = isPercent ? '%' : '';

            if(isPercent){
                mainValForDisplay = String(mainValForDisplay).replace('%','');
                lowerValForDisplay = String(lowerValForDisplay).replace('%','');
                upperValForDisplay = String(upperValForDisplay).replace('%','');
            }
            let ciString = `${mainValForDisplay} (${lowerValForDisplay}\u00A0–\u00A0${upperValForDisplay})${suffix}`;
            if(showMethod && metric.method) ciString += ` [${metric.method.replace('Woolf Logit (Haldane-Anscombe correction)', 'Woolf Logit').replace('Bootstrap Percentile','Bootstrap')}]`;
            return ciString;
        }
        return valStr;
    };

    function _createDownloadButtons(elementId, baseName, formats = ['png', 'csv', 'md']) {
        let buttonsHTML = '<div class="publication-element-downloads btn-group btn-group-sm mt-1" role="group" aria-label="Download options">';
        if (formats.includes('png')) {
            buttonsHTML += `<button class="btn btn-outline-secondary table-download-png-btn" data-table-id="${elementId}" data-table-name="${baseName}" data-tippy-content="Tabelle als PNG herunterladen"><i class="fas fa-image"></i> PNG</button>`;
        }
        if (formats.includes('csv')) {
            buttonsHTML += `<button class="btn btn-outline-secondary table-download-csv-btn" data-table-id="${elementId}" data-table-name="${baseName}" data-tippy-content="Tabelle als CSV herunterladen"><i class="fas fa-file-csv"></i> CSV</button>`;
        }
        if (formats.includes('md')) {
             buttonsHTML += `<button class="btn btn-outline-secondary table-download-md-btn" data-table-id="${elementId}" data-table-name="${baseName}" data-tippy-content="Tabelle als Markdown herunterladen"><i class="fab fa-markdown"></i> MD</button>`;
        }
        buttonsHTML += '</div>';
        return formats.length > 0 ? buttonsHTML : '';
    }

    function _renderPatientenCharakteristikaTabelle(allKollektivStats, lang, commonData, elementId, title) {
        const pGesamt = allKollektivStats?.Gesamt?.deskriptiv;
        const pDirektOP = allKollektivStats?.['direkt OP']?.deskriptiv;
        const pNRCT = allKollektivStats?.nRCT?.deskriptiv;
        const na = 'N/A';

        if (!pGesamt || !pDirektOP || !pNRCT) {
            return `<p class="text-warning">${lang === 'de' ? 'Daten für Patientencharakteristika nicht verfügbar.' : 'Data for patient characteristics not available.'}</p>`;
        }

        const headers = [
            lang === 'de' ? 'Merkmal' : 'Characteristic',
            `${getKollektivDisplayName('Gesamt')} (N=${pGesamt.anzahlPatienten})`,
            `${getKollektivDisplayName('direkt OP')} (N=${pDirektOP.anzahlPatienten})`,
            `${getKollektivDisplayName('nRCT')} (N=${pNRCT.anzahlPatienten})`
        ];

        const formatCellData = (data, key, subKey = null, isPercentOfTotal = false, digits = 1, isCountOnly = false) => {
            if (!data) return na;
            let value, totalForPercent;
            if (subKey) { value = data[key]?.[subKey]; totalForPercent = data.anzahlPatienten; }
            else { value = data[key]; totalForPercent = data.anzahlPatienten; }

            if (isCountOnly && (value !== null && value !== undefined && !isNaN(value))) return formatNumber(value, 0);

            if (isPercentOfTotal && totalForPercent > 0 && value !== null && value !== undefined && !isNaN(value)) {
                return `${formatNumber(value, 0)} (${formatPercent(value / totalForPercent, digits === 0 ? 0 : 1)})`;
            }
            if (value !== null && value !== undefined && !isNaN(value)) {
                 if (key === 'alter' && subKey === 'medianRange') return `${formatNumber(data.alter?.median, digits, na, lang==='en')} (${formatNumber(data.alter?.min, 0, na, lang==='en')}\u00A0–\u00A0${formatNumber(data.alter?.max, 0, na, lang==='en')})`;
                 if (key === 'alter' && subKey === 'meanSD') return `${formatNumber(data.alter?.mean, digits, na, lang==='en')} (±${formatNumber(data.alter?.sd, digits, na, lang==='en')})`;
                 return formatNumber(value, digits, na, lang==='en');
            }
            return na;
        };
        
        const rows = [
            { labelDe: 'Alter (Jahre), Median (Range)', labelEn: 'Age (years), Median (Range)', key: 'alter', subKey: 'medianRange', digits:1 },
            { labelDe: 'Alter (Jahre), Mittelwert (SD)', labelEn: 'Age (years), Mean (SD)', key: 'alter', subKey: 'meanSD', digits:1 },
            { labelDe: 'Geschlecht, männlich n (%)', labelEn: 'Sex, male n (%)', key: 'geschlecht', subKey: 'm', isPercent: true, digits:0 },
            { labelDe: 'Histopathologischer N-Status, positiv n (%)', labelEn: 'Histopathological N-Status, positive n (%)', key: 'nStatus', subKey: 'plus', isPercent: true, digits:0 }
        ];
        
        let tableHTML = `<div class="table-responsive">
                            <table class="table table-sm table-bordered table-hover publication-table" id="${elementId}-table">
                                <caption>${title}</caption>
                                <thead class="small"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody class="small">`;
        rows.forEach(row => {
            tableHTML += `<tr>
                            <td>${lang === 'de' ? row.labelDe : row.labelEn}</td>
                            <td>${formatCellData(pGesamt, row.key, row.subKey, row.isPercent, row.digits, row.isCountOnly)}</td>
                            <td>${formatCellData(pDirektOP, row.key, row.subKey, row.isPercent, row.digits, row.isCountOnly)}</td>
                            <td>${formatCellData(pNRCT, row.key, row.subKey, row.isPercent, row.digits, row.isCountOnly)}</td>
                          </tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        tableHTML += _createDownloadButtons(`${elementId}-table`, elementId);
        return tableHTML;
    }

    function _renderLiteraturT2KriterienTabelle(lang, commonData, elementId, title) {
        const sets = studyT2CriteriaManager.getAllStudyCriteriaSets();
        if (!sets || sets.length === 0) {
            return `<p class="text-warning">${lang === 'de' ? 'Keine Literatur-Kriteriensets definiert.' : 'No literature criteria sets defined.'}</p>`;
        }
        const headers = [
            lang === 'de' ? 'Kriterienset / Autor(en)' : 'Criteria Set / Author(s)',
            lang === 'de' ? 'Kurzbeschreibung der Kriterien' : 'Brief Criteria Description',
            lang === 'de' ? 'Urspr. Zielgruppe / Anwendung' : 'Original Target Group / Application',
            lang === 'de' ? 'Referenz' : 'Reference'
        ];

        let tableHTML = `<div class="table-responsive">
                            <table class="table table-sm table-bordered table-hover publication-table" id="${elementId}-table">
                                <caption>${title}</caption>
                                <thead class="small"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody class="small">`;
        sets.forEach(set => {
            if (!PUBLICATION_CONFIG.literatureCriteriaSets.find(confSet => confSet.id === set.id)) return; // Nur die im PublicationConfig definierten anzeigen
            const refKey = Object.keys(commonData.references).find(key => commonData.references[key].file === set.studyInfo?.referenceFile);
            const reference = refKey ? getReference(refKey, commonData, 'citation') : set.studyInfo?.reference || 'N/A';
            const name = set.name || 'N/A';
            const criteriaDesc = set.studyInfo?.keyCriteriaSummary || studyT2CriteriaManager.formatCriteriaForDisplay(set.criteria, set.logic, true) || 'N/A';
            const targetGroup = set.studyInfo?.investigationType ? `${getKollektivDisplayName(set.applicableKollektiv)} (${set.studyInfo.investigationType})` : getKollektivDisplayName(set.applicableKollektiv);

            tableHTML += `<tr>
                            <td>${name}</td>
                            <td>${criteriaDesc}</td>
                            <td>${targetGroup}</td>
                            <td>${reference}</td>
                          </tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        tableHTML += _createDownloadButtons(`${elementId}-table`, elementId);
        return tableHTML;
    }

    function _renderDiagnostischeGueteTabelle(statsData, methodenName, kollektivName, lang, elementId, title, showFullCIInfo = true) {
         if (!statsData || !statsData.matrix) {
            return `<p class="text-warning">${lang === 'de' ? `Keine Daten für diagnostische Güte von '${methodenName}' im Kollektiv '${kollektivName}' verfügbar.` : `No data available for diagnostic performance of '${methodenName}' in cohort '${kollektivName}'.`}</p>`;
        }
        const headers = [
            lang === 'de' ? 'Metrik' : 'Metric',
            lang === 'de' ? 'Wert (95%-KI)' : 'Value (95% CI)'
        ];
        if (showFullCIInfo) headers.push(lang === 'de' ? 'KI-Methode' : 'CI Method');

        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = { sens: lang==='de'?'Sensitivität':'Sensitivity', spez: lang==='de'?'Spezifität':'Specificity', ppv: 'PPV', npv: 'NPV', acc: lang==='de'?'Accuracy':'Accuracy', balAcc: lang==='de'?'Balanced Accuracy':'Balanced Accuracy', f1: 'F1-Score', auc: 'AUC' };

        let tableHTML = `<div class="table-responsive">
                            <table class="table table-sm table-bordered table-hover publication-table" id="${elementId}-table">
                                <caption>${title}</caption>
                                <thead class="small"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody class="small">`;
        metrics.forEach(key => {
            const metric = statsData[key];
            const isRate = !(key === 'auc' || key === 'f1');
            const digits = (key === 'auc' || key === 'f1') ? 3 : 1;
            tableHTML += `<tr>
                            <td>${metricDisplayNames[key]}</td>
                            <td>${fCI_pub(metric, digits, isRate, lang)}</td>`;
            if (showFullCIInfo) tableHTML += `<td>${metric?.method || 'N/A'}</td>`;
            tableHTML += `</tr>`;
        });
        tableHTML += `</tbody></table></div>`;
        tableHTML += _createDownloadButtons(`${elementId}-table`, elementId);
        return tableHTML;
    }

    function _renderStatistischerVergleichTabelle(allKollektivStats, commonData, lang, elementId, title, options) {
        const bfZielMetric = options.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;
        const headers = [
            lang === 'de' ? 'Vergleich' : 'Comparison',
            lang === 'de' ? 'Kollektiv' : 'Cohort',
            'AUC (AS)', 'AUC (T2)',
            lang === 'de' ? 'Δ AUC' : 'Δ AUC',
            'p-Wert (DeLong)',
            lang === 'de' ? 'p-Wert (McNemar)' : 'p-Value (McNemar)'
        ];
        let tableHTML = `<div class="table-responsive">
                            <table class="table table-sm table-bordered table-hover publication-table" id="${elementId}-table">
                                <caption>${title}</caption>
                                <thead class="small"><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                                <tbody class="small">`;
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        const t2SetsToCompare = [
             ...PUBLICATION_CONFIG.literatureCriteriaSets.map(s => ({...s, type: 'Literatur'})),
             {id: 'bruteforce', nameKey: lang ==='de' ? `Für ${bfZielMetric} optimierte T2-Kriterien` : `T2 Criteria Optimized for ${bfZielMetric}`, type: 'Brute-Force'}
        ];

        kollektive.forEach(kId => {
            const kollektivDisplayName = getKollektivDisplayName(kId);
            const nPat = allKollektivStats?.[kId]?.deskriptiv?.anzahlPatienten || 'N/A';
            const asStats = allKollektivStats?.[kId]?.gueteAS;

            t2SetsToCompare.forEach(t2Set => {
                let vergleichData, t2Stats;
                let t2SetName = t2Set.nameKey;
                let isApplicable = true;

                if(t2Set.type === 'Literatur') {
                    const studyDetails = studyT2CriteriaManager.getStudyCriteriaSetById(t2Set.id);
                    if(studyDetails?.applicableKollektiv && studyDetails.applicableKollektiv !== 'Gesamt' && studyDetails.applicableKollektiv !== kId){
                        isApplicable = false;
                    }
                    if(isApplicable) {
                        vergleichData = allKollektivStats?.[kId]?.[`vergleichASvsT2_literatur_${t2Set.id}`];
                        t2Stats = allKollektivStats?.[kId]?.gueteT2_literatur?.[t2Set.id];
                        const refKey = Object.keys(commonData.references).find(key => commonData.references[key].file === studyDetails?.studyInfo?.referenceFile);
                        t2SetName = refKey ? getReference(refKey, commonData, 'citation') : t2Set.nameKey;
                         if(studyDetails && studyDetails.studyInfo?.primaryReferenceKey && commonData.references[studyDetails.studyInfo.primaryReferenceKey]){
                             const primaryRef = getReference(studyDetails.studyInfo.primaryReferenceKey, commonData, 'citation');
                             t2SetName = `${primaryRef} (${lang === 'de' ? 'eval. durch' : 'eval. by'} ${t2SetName})`;
                         }
                    }
                } else { // Brute-Force
                    const bfDef = allKollektivStats?.[kId]?.bruteforce_definition;
                    if(bfDef && bfDef.metricName !== bfZielMetric){
                         t2SetName += ` (optimiert für ${bfDef.metricName})`;
                    }
                    vergleichData = allKollektivStats?.[kId]?.vergleichASvsT2_bruteforce;
                    t2Stats = allKollektivStats?.[kId]?.gueteT2_bruteforce;
                }

                if(isApplicable && vergleichData && asStats && t2Stats) {
                    tableHTML += `<tr>
                                    <td>AS vs. ${t2SetName}</td>
                                    <td>${kollektivDisplayName} (N=${nPat})</td>
                                    <td>${fCI_pub(asStats.auc, 3, false, lang)}</td>
                                    <td>${fCI_pub(t2Stats.auc, 3, false, lang)}</td>
                                    <td>${formatNumber(vergleichData.delong?.diffAUC, 3, 'N/A', lang === 'en')}</td>
                                    <td>${formatPValueForText(vergleichData.delong?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichData.delong?.pValue)}</td>
                                    <td>${formatPValueForText(vergleichData.mcnemar?.pValue, lang)} ${getStatisticalSignificanceSymbol(vergleichData.mcnemar?.pValue)}</td>
                                  </tr>`;
                }
            });
        });
        tableHTML += `</tbody></table></div>`;
        tableHTML += _createDownloadButtons(`${elementId}-table`, elementId);
        return tableHTML;
    }

    function renderPublicationSection(sectionId, lang, allKollektivStats, commonData, options = {}) {
        const contentArea = document.getElementById('publikation-content-area');
        if (!contentArea) { console.error("Publikation Content Area nicht gefunden."); return; }

        contentArea.innerHTML = `<div class="p-5 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div></div>`;

        try {
            const htmlContent = publicationTextGenerator.getSectionText(sectionId, lang, allKollektivStats, commonData, options);
            contentArea.innerHTML = htmlContent;

            // Jetzt die dynamischen Elemente (Tabellen, Diagramme) rendern
            const pubElementsConfig = PUBLICATION_CONFIG.publicationElements;
            const bfMetric = options.bruteForceMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication;

            if (sectionId === 'methoden_t2_definition') {
                const el = document.getElementById(pubElementsConfig.methoden.literaturT2KriterienTabelle.id);
                const title = lang === 'de' ? pubElementsConfig.methoden.literaturT2KriterienTabelle.titleDe : pubElementsConfig.methoden.literaturT2KriterienTabelle.titleEn;
                if (el) el.innerHTML = _renderLiteraturT2KriterienTabelle(lang, commonData, pubElementsConfig.methoden.literaturT2KriterienTabelle.id, title);
            } else if (sectionId === 'ergebnisse_patientencharakteristika') {
                const elTable = document.getElementById(pubElementsConfig.ergebnisse.patientenCharakteristikaTabelle.id);
                const titleTable = lang === 'de' ? pubElementsConfig.ergebnisse.patientenCharakteristikaTabelle.titleDe : pubElementsConfig.ergebnisse.patientenCharakteristikaTabelle.titleEn;
                if (elTable) elTable.innerHTML = _renderPatientenCharakteristikaTabelle(allKollektivStats, lang, commonData, pubElementsConfig.ergebnisse.patientenCharakteristikaTabelle.id, titleTable);

                const chartDataGesamt = allKollektivStats?.Gesamt?.deskriptiv;
                if (chartDataGesamt) {
                    const elChartAge = document.getElementById(pubElementsConfig.ergebnisse.alterVerteilungChart.id);
                    const titleAge = lang === 'de' ? pubElementsConfig.ergebnisse.alterVerteilungChart.titleDe : pubElementsConfig.ergebnisse.alterVerteilungChart.titleEn;
                    if (elChartAge) chart_renderer.renderAgeDistributionChart(elChartAge.id, chartDataGesamt.alterData, getKollektivDisplayName('Gesamt'), {title: titleAge});

                    const elChartGender = document.getElementById(pubElementsConfig.ergebnisse.geschlechtVerteilungChart.id);
                    const titleGender = lang === 'de' ? pubElementsConfig.ergebnisse.geschlechtVerteilungChart.titleDe : pubElementsConfig.ergebnisse.geschlechtVerteilungChart.titleEn;
                    const genderDataForChart = [
                        { label: UI_TEXTS.legendLabels.male, value: chartDataGesamt.geschlecht.m, color: APP_CONFIG.CHART_SETTINGS.NEW_PRIMARY_COLOR_BLUE},
                        { label: UI_TEXTS.legendLabels.female, value: chartDataGesamt.geschlecht.f, color: APP_CONFIG.CHART_SETTINGS.NEW_SECONDARY_COLOR_YELLOW_GREEN },
                        { label: UI_TEXTS.legendLabels.unknownGender, value: chartDataGesamt.geschlecht.unbekannt, color: '#cccccc' }
                    ].filter(d => d.value > 0);
                    if (elChartGender && genderDataForChart.length > 0) chart_renderer.renderPieChart(elChartGender.id, genderDataForChart, {title: titleGender, showLegend: true, legendPosition: 'bottom'});
                }
            } else if (sectionId === 'ergebnisse_as_performance') {
                const el = document.getElementById(pubElementsConfig.ergebnisse.diagnostischeGueteASTabelle.id);
                const title = lang === 'de' ? pubElementsConfig.ergebnisse.diagnostischeGueteASTabelle.titleDe : pubElementsConfig.ergebnisse.diagnostischeGueteASTabelle.titleEn;
                const asPerfData = {
                    Gesamt: allKollektivStats?.Gesamt?.gueteAS,
                    'Direkt OP': allKollektivStats?.['direkt OP']?.gueteAS,
                    'nRCT': allKollektivStats?.nRCT?.gueteAS
                };
                 if (el && asPerfData.Gesamt) { // Hier als Beispiel nur für Gesamtkollektiv, muss erweitert/strukturiert werden
                     let tableHTML = '';
                     for (const kollektivId in asPerfData) {
                         if (asPerfData[kollektivId]) {
                             const kollektivDisplayName = getKollektivDisplayName(kollektivId);
                             const nPat = allKollektivStats?.[kollektivId]?.deskriptiv?.anzahlPatienten || 'N/A';
                             const subTitle = `${title} - ${kollektivDisplayName} (N=${nPat})`;
                             tableHTML += _renderDiagnostischeGueteTabelle(asPerfData[kollektivId], 'Avocado Sign', kollektivDisplayName, lang, `${pubElementsConfig.ergebnisse.diagnostischeGueteASTabelle.id}-${kollektivId.replace(/\s+/g, '')}`, subTitle);
                             tableHTML += '<hr class="my-3"/>';
                         }
                     }
                    el.innerHTML = tableHTML;
                 }
            } else if (sectionId === 'ergebnisse_literatur_t2_performance') {
                const el = document.getElementById(pubElementsConfig.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id);
                const titleBase = lang === 'de' ? pubElementsConfig.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleDe : pubElementsConfig.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleEn;
                if(el) {
                    let tableHTML = '';
                    PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studyConf => {
                        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(studyConf.id);
                        if(studySet) {
                            const targetKollektiv = studySet.applicableKollektiv || 'Gesamt';
                            const stats = allKollektivStats?.[targetKollektiv]?.gueteT2_literatur?.[studyConf.id];
                            if (stats) {
                                 const kollektivDisplayName = getKollektivDisplayName(targetKollektiv);
                                 const nPat = allKollektivStats?.[targetKollektiv]?.deskriptiv?.anzahlPatienten || 'N/A';
                                 const subTitle = `${titleBase} - ${studySet.name} (${kollektivDisplayName}, N=${nPat})`;
                                 tableHTML += _renderDiagnostischeGueteTabelle(stats, studySet.name, kollektivDisplayName, lang, `${pubElementsConfig.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id}-${studyConf.id}`, subTitle);
                                 tableHTML += '<hr class="my-3"/>';
                            }
                        }
                    });
                    el.innerHTML = tableHTML || `<p class="text-muted">${lang==='de'?'Keine Daten für diese Tabelle.':'No data for this table.'}</p>`;
                }
            } else if (sectionId === 'ergebnisse_optimierte_t2_performance') {
                const el = document.getElementById(pubElementsConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id);
                const titleBase = (lang === 'de' ? pubElementsConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleDe : pubElementsConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.titleEn).replace('{BF_METRIC}', bfMetric);
                if(el) {
                    let tableHTML = '';
                    const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
                    kollektive.forEach(kId => {
                         const bfStats = allKollektivStats?.[kId]?.gueteT2_bruteforce;
                         const bfDef = allKollektivStats?.[kId]?.bruteforce_definition;
                         if(bfStats && bfDef && bfDef.metricName === bfMetric) { // Nur wenn Metrik übereinstimmt
                            const kollektivDisplayName = getKollektivDisplayName(kId);
                            const nPat = allKollektivStats?.[kId]?.deskriptiv?.anzahlPatienten || 'N/A';
                            const subTitle = `${titleBase} - ${kollektivDisplayName} (N=${nPat})`;
                            const methodenName = lang==='de' ? `Optimierte T2 (für ${bfMetric})` : `Optimized T2 (for ${bfMetric})`;
                            tableHTML += _renderDiagnostischeGueteTabelle(bfStats, methodenName, kollektivDisplayName, lang, `${pubElementsConfig.ergebnisse.diagnostischeGueteOptimierteT2Tabelle.id}-${kId.replace(/\s+/g, '')}`, subTitle);
                            tableHTML += '<hr class="my-3"/>';
                         }
                    });
                     el.innerHTML = tableHTML || `<p class="text-muted">${lang==='de'?'Keine Daten für diese Tabelle (ggf. andere BF-Metrik ausgewählt als für die Optimierung verwendet wurde).':'No data for this table (possibly different BF metric selected than used for optimization).'}</p>`;
                }
            } else if (sectionId === 'ergebnisse_vergleich_performance') {
                const elTable = document.getElementById(pubElementsConfig.ergebnisse.statistischerVergleichAST2Tabelle.id);
                const titleTable = (lang === 'de' ? pubElementsConfig.ergebnisse.statistischerVergleichAST2Tabelle.titleDe : pubElementsConfig.ergebnisse.statistischerVergleichAST2Tabelle.titleEn).replace('{BF_METRIC}', bfMetric);
                if (elTable) elTable.innerHTML = _renderStatistischerVergleichTabelle(allKollektivStats, commonData, lang, pubElementsConfig.ergebnisse.statistischerVergleichAST2Tabelle.id, titleTable, options);
                
                // Vergleichscharts
                const chartKollektive = [
                    { id: 'Gesamt', elId: pubElementsConfig.ergebnisse.vergleichPerformanceChartGesamt.id, titleConf: pubElementsConfig.ergebnisse.vergleichPerformanceChartGesamt },
                    { id: 'direkt OP', elId: pubElementsConfig.ergebnisse.vergleichPerformanceChartDirektOP.id, titleConf: pubElementsConfig.ergebnisse.vergleichPerformanceChartDirektOP },
                    { id: 'nRCT', elId: pubElementsConfig.ergebnisse.vergleichPerformanceChartNRCT.id, titleConf: pubElementsConfig.ergebnisse.vergleichPerformanceChartNRCT }
                ];
                chartKollektive.forEach(item => {
                    const elChart = document.getElementById(item.elId);
                    const statsAS = allKollektivStats?.[item.id]?.gueteAS;
                    const statsBF = allKollektivStats?.[item.id]?.gueteT2_bruteforce;
                    const bfDef = allKollektivStats?.[item.id]?.bruteforce_definition;
                    const nPat = allKollektivStats?.[item.id]?.deskriptiv?.anzahlPatienten || 'N/A';

                    if (elChart && statsAS && statsBF && bfDef && bfDef.metricName === bfMetric) {
                        const chartTitle = (lang==='de' ? item.titleConf.titleDe : item.titleConf.titleEn)
                                            .replace('{BF_METRIC}', bfMetric)
                                            .replace('{Kollektiv}', getKollektivDisplayName(item.id))
                                            .replace('[N_GESAMT]', nPat).replace('[N_DIREKT_OP]', nPat).replace('[N_NRCT]', nPat);
                        const chartData = [
                            { group: 'Sens.', AS: statsAS.sens, 'T2 Opt.': statsBF.sens },
                            { group: 'Spez.', AS: statsAS.spez, 'T2 Opt.': statsBF.spez },
                            { group: 'PPV', AS: statsAS.ppv, 'T2 Opt.': statsBF.ppv },
                            { group: 'NPV', AS: statsAS.npv, 'T2 Opt.': statsBF.npv },
                            { group: 'Acc.', AS: statsAS.acc, 'T2 Opt.': statsBF.acc },
                            { group: 'AUC', AS: statsAS.auc, 'T2 Opt.': statsBF.auc }
                        ];
                        const series = [
                            { name: 'AS', key: 'AS', color: APP_CONFIG.CHART_SETTINGS.AS_COLOR, showCI: true },
                            { name: `T2 Opt. (für ${bfMetric})`, key: 'T2 Opt.', color: APP_CONFIG.CHART_SETTINGS.T2_COLOR, showCI: true }
                        ];
                         chart_renderer.renderComparisonBarChart(item.elId, chartData, series, { title: chartTitle, yAxisLabel: 'Wert', barType: 'grouped', showLegend: true, includeCI: true });
                    } else if(elChart) {
                         elChart.innerHTML = `<p class="text-center text-muted small mt-3">${lang === 'de' ? 'Vergleichsdiagramm nicht verfügbar (fehlende Daten oder abweichende BF-Metrik).' : 'Comparison chart not available (missing data or differing BF metric).'}</p>`;
                    }
                });
            }
            ui_helpers.initializeTooltips(contentArea); // Tooltips für dynamisch hinzugefügte Elemente aktivieren
        } catch (error) {
            console.error(`Fehler beim Rendern der Sektion ${sectionId}:`, error);
            contentArea.innerHTML = `<p class="text-danger">Fehler beim Laden des Inhalts für Sektion '${sectionId}'. Details siehe Konsole.</p>`;
        }
    }


    return Object.freeze({
        renderPublicationSection
    });

})();
