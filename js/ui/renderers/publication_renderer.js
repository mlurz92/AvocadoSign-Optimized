const publicationRenderer = (() => {

    let currentLangInternal = 'de';
    let currentAllStatsInternal = null;
    let currentCommonDataInternal = null;
    let currentOptionsInternal = null;

    function _initializeForTableGeneration(lang, allKollektivStats, commonData, options) {
        currentLangInternal = lang || 'de';
        currentAllStatsInternal = allKollektivStats;
        currentCommonDataInternal = commonData;
        currentOptionsInternal = options || {};
    }

    function _formatMetricForTable(metricData, isRate = true, digits = 1) {
        const langToUse = currentLangInternal;
        if (!metricData || metricData.value === undefined || metricData.value === null || isNaN(metricData.value)) return 'N/A';
        const placeholder = 'N/A';

        const formatSingleValue = (val, d, isP) => {
            if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return placeholder;
            return isP ? formatPercent(val, d, placeholder) : formatNumber(val, d, placeholder, langToUse === 'en');
        };

        const valStr = formatSingleValue(metricData.value, digits, isRate);
        if (valStr === placeholder) return valStr;

        if (metricData.ci && metricData.ci.lower !== null && metricData.ci.upper !== null && !isNaN(metricData.ci.lower) && !isNaN(metricData.ci.upper) && isFinite(metricData.ci.lower) && isFinite(metricData.ci.upper)) {
            const lowerStr = formatSingleValue(metricData.ci.lower, digits, isRate);
            const upperStr = formatSingleValue(metricData.ci.upper, digits, isRate);
            if (lowerStr === placeholder || upperStr === placeholder) return valStr;

            const ciText = langToUse === 'de' ? '95%-KI' : '95% CI';
            let mainValDisp = valStr, lowerDisp = lowerStr, upperDisp = upperStr;
            if (isRate) {
                mainValDisp = String(mainValDisp).replace('%', '');
                lowerDisp = String(lowerDisp).replace('%', '');
                upperDisp = String(upperDisp).replace('%', '');
                return `${mainValDisp} (${ciText}: ${lowerDisp}–${upperDisp})%`;
            } else {
                return `${mainValDisp} (${ciText}: ${lowerDisp}–${upperDisp})`;
            }
        }
        return valStr;
    }

    function _generatePatientCharacteristicsTableHTML() {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.TABLE_PATIENT_CHARS;
        if (!currentAllStatsInternal || !currentAllStatsInternal.Gesamt || !currentAllStatsInternal.Gesamt.deskriptiv) return `<p class="text-muted small">${currentLangInternal === 'de' ? 'Keine ausreichenden Patientendaten für Tabelle verfügbar.' : 'Insufficient patient data available for table.'}</p>`;

        let tableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${tableConfig.id}-title">${currentLangInternal === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead>
                <tr>
                    <th>${currentLangInternal === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                    <th>${getKollektivDisplayName('Gesamt')} (N=${currentAllStatsInternal.Gesamt?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('direkt OP')} (N=${currentAllStatsInternal['direkt OP']?.deskriptiv?.anzahlPatienten || 0})</th>
                    <th>${getKollektivDisplayName('nRCT')} (N=${currentAllStatsInternal.nRCT?.deskriptiv?.anzahlPatienten || 0})</th>
                </tr>
            </thead><tbody>`;

        const fVal = (val, dig = 1, placeholder = 'N/A', useStd = false) => formatNumber(val, dig, placeholder, useStd);
        const fPerc = (count, total, dig = 0) => (total > 0 && count !== undefined && count !== null && !isNaN(count)) ? formatPercent(count / total, dig) : 'N/A';

        const addRow = (labelDe, labelEn, getterGesamt, getterDirektOP, getterNRCT) => {
            const pGesamt = currentAllStatsInternal.Gesamt?.deskriptiv;
            const pDirektOP = currentAllStatsInternal['direkt OP']?.deskriptiv;
            const pNRCT = currentAllStatsInternal.nRCT?.deskriptiv;
            tableHTML += `<tr>
                            <td>${currentLangInternal === 'de' ? labelDe : labelEn}</td>
                            <td>${pGesamt ? getterGesamt(pGesamt) : 'N/A'}</td>
                            <td>${pDirektOP ? getterDirektOP(pDirektOP) : 'N/A'}</td>
                            <td>${pNRCT ? getterNRCT(pNRCT) : 'N/A'}</td>
                          </tr>`;
        };

        addRow('Alter, Median (Min–Max) [Jahre]', 'Age, Median (Min–Max) [Years]',
            p => `${fVal(p.alter?.median,1,undefined,currentLangInternal==='en')} (${fVal(p.alter?.min,0,undefined,currentLangInternal==='en')}–${fVal(p.alter?.max,0,undefined,currentLangInternal==='en')})`,
            p => `${fVal(p.alter?.median,1,undefined,currentLangInternal==='en')} (${fVal(p.alter?.min,0,undefined,currentLangInternal==='en')}–${fVal(p.alter?.max,0,undefined,currentLangInternal==='en')})`,
            p => `${fVal(p.alter?.median,1,undefined,currentLangInternal==='en')} (${fVal(p.alter?.min,0,undefined,currentLangInternal==='en')}–${fVal(p.alter?.max,0,undefined,currentLangInternal==='en')})`
        );
        addRow('Geschlecht, männlich [n (%)]', 'Sex, male [n (%)]',
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`,
            p => `${p.geschlecht?.m ?? 0} (${fPerc(p.geschlecht?.m, p.anzahlPatienten)})`
        );
        addRow('Pathologischer N-Status, positiv [n (%)]', 'Pathological N-Status, positive [n (%)]',
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten,1)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten,1)})`,
            p => `${p.nStatus?.plus ?? 0} (${fPerc(p.nStatus?.plus, p.anzahlPatienten,1)})`
        );
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _generateLiteratureT2CriteriaTableHTML() {
        const tableConfig = PUBLICATION_CONFIG.publicationElements.TABLE_LITERATURE_T2_CRITERIA;
        let tableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${tableConfig.id}-title">${currentLangInternal === 'de' ? tableConfig.titleDe : tableConfig.titleEn}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead>
                <tr>
                    <th>${currentLangInternal === 'de' ? 'Studie / Kriteriensatz' : 'Study / Criteria Set'}</th>
                    <th>${currentLangInternal === 'de' ? 'Primäres Zielkollektiv (Originalstudie / Anwendung in dieser Analyse)' : 'Primary Target Cohort (Original Study / Application in this Analysis)'}</th>
                    <th>${currentLangInternal === 'de' ? 'Kernkriterien (Zusammenfassung)' : 'Core Criteria (Summary)'}</th>
                    <th>${currentLangInternal === 'de' ? 'Logische Verknüpfung' : 'Logic'}</th>
                </tr>
            </thead><tbody>`;

        PUBLICATION_CONFIG.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet && studySet.studyInfo) {
                const kriterienText = studySet.studyInfo.keyCriteriaSummary || studySet.description || (currentLangInternal === 'de' ? 'Nicht spezifiziert' : 'Not specified');
                const targetCohortText = `${getKollektivDisplayName(studySet.studyInfo.patientCohort.split('N=')[0].trim() || studySet.applicableKollektiv)} (${studySet.context || 'N/A'}) / ${getKollektivDisplayName(studySet.applicableKollektiv)}`;
                tableHTML += `<tr>
                                <td>${studySet.name} ${referenceManager.cite(studySet.studyInfo.reference.split(' ')[0].toUpperCase().replace(/[^A-Z0-9_]/g, '') + '_' + studySet.studyInfo.reference.match(/\b\d{4}\b/)[0])}</td>
                                <td>${targetCohortText}</td>
                                <td style="white-space: normal;">${kriterienText}</td>
                                <td>${UI_TEXTS.t2LogicDisplayNames[studySet.logic] || studySet.logic}</td>
                              </tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }

    function _generateDiagnosticPerformanceTableHTML(tableConfigKey, statsGetter, methodNameBase = '') {
        const tableConfig = PUBLICATION_CONFIG.publicationElements[tableConfigKey];
        if (!currentAllStatsInternal) return `<p class="text-muted small">${currentLangInternal === 'de' ? 'Keine Gütedaten für Tabelle verfügbar.' : 'No performance data available for table.'}</p>`;

        let title = currentLangInternal === 'de' ? tableConfig.titleDe : tableConfig.titleEn;
        if (title.includes('{{PUBLICATION_BF_METRIC_NAME}}')) {
            title = title.replace('{{PUBLICATION_BF_METRIC_NAME}}', currentOptionsInternal.publicationBfMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication);
        }

        let tableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${tableConfig.id}-title">${title}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead><tr>
                <th>${currentLangInternal === 'de' ? 'Methode / Kriteriensatz' : 'Method / Criteria Set'}</th>
                <th>${currentLangInternal === 'de' ? 'Kollektiv (N)' : 'Cohort (n)'}</th>
                <th>Sens. (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>Spez. (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>PPV (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>NPV (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>LR+ (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>LR- (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>Acc. (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>AUC (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
            </tr></thead><tbody>`;

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kolId => {
            const stats = statsGetter(kolId);
            const nPat = currentAllStatsInternal?.[kolId]?.deskriptiv?.anzahlPatienten || 0;
            let methodName = methodNameBase;
            if (methodNameBase === 'Literatur-T2') { // Special handling for multiple literature sets
                PUBLICATION_CONFIG.literatureCriteriaSets.forEach(litSetConf => {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id);
                    if (studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'))) {
                        const specificStats = currentAllStatsInternal?.[kolId]?.gueteT2_literatur?.[litSetConf.id];
                        methodName = studySet.displayShortName || studySet.name;
                        tableHTML += _generateSinglePerfRowHTML(methodName, kolId, nPat, specificStats);
                    }
                });
                return; // Skip general row for "Literatur-T2" itself
            } else if (methodNameBase === 'Optimierte T2') {
                 const bfDef = currentAllStatsInternal?.[kolId]?.bruteforce_definition;
                 if (bfDef && bfDef.criteria) {
                    methodName = `${currentLangInternal === 'de' ? 'Optimiert für' : 'Optimized for'} ${bfDef.metricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication}`;
                 } else {
                    methodName = `${currentLangInternal === 'de' ? 'Optimierte T2 (nicht verfügbar für' : 'Optimized T2 (not available for'} ${currentOptionsInternal.publicationBfMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication})`;
                 }
            }


            tableHTML += _generateSinglePerfRowHTML(methodName, kolId, nPat, stats);
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }
    
    function _generateSinglePerfRowHTML(methodName, kolId, nPat, stats) {
        let rowHTML = `<tr><td>${methodName}</td><td>${getKollektivDisplayName(kolId)} (N=${nPat})</td>`;
        if (stats && stats.matrix && (stats.matrix.rp + stats.matrix.fp + stats.matrix.fn + stats.matrix.rn > 0)) {
            rowHTML += `<td>${_formatMetricForTable(stats.sens, true, 1)}</td>
                        <td>${_formatMetricForTable(stats.spez, true, 1)}</td>
                        <td>${_formatMetricForTable(stats.ppv, true, 1)}</td>
                        <td>${_formatMetricForTable(stats.npv, true, 1)}</td>
                        <td>${_formatMetricForTable(stats.lr_plus, false, 2)}</td>
                        <td>${_formatMetricForTable(stats.lr_minus, false, 2)}</td>
                        <td>${_formatMetricForTable(stats.acc, true, 1)}</td>
                        <td>${_formatMetricForTable(stats.auc, false, 3)}</td>`;
        } else {
            rowHTML += `<td colspan="8" class="text-center text-muted small"><em>${currentLangInternal === 'de' ? 'Keine validen Daten oder nicht anwendbar' : 'No valid data or not applicable'}</em></td>`;
        }
        rowHTML += `</tr>`;
        return rowHTML;
    }


    function _generateComparisonTableHTML(tableConfigKey, comparisonDataGetter, method2NamePrefix = 'T2') {
        const tableConfig = PUBLICATION_CONFIG.publicationElements[tableConfigKey];
         if (!currentAllStatsInternal) return `<p class="text-muted small">${currentLangInternal === 'de' ? 'Keine Vergleichsdaten für Tabelle verfügbar.' : 'No comparison data available for table.'}</p>`;

        let title = currentLangInternal === 'de' ? tableConfig.titleDe : tableConfig.titleEn;
         if (title.includes('{{PUBLICATION_BF_METRIC_NAME}}')) {
            title = title.replace('{{PUBLICATION_BF_METRIC_NAME}}', currentOptionsInternal.publicationBfMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication);
        }


        let tableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${tableConfig.id}-title">${title}</h4>`;
        tableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
            <thead><tr>
                <th>${currentLangInternal === 'de' ? 'Kollektiv' : 'Cohort'}</th>
                <th>${currentLangInternal === 'de' ? 'Vergleich' : 'Comparison'}</th>
                <th>AUC AS (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>AUC ${method2NamePrefix} (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                <th>Diff. AUC (AS - ${method2NamePrefix})</th>
                <th>DeLong p-Wert (AUC)</th>
                <th>McNemar p-Wert (Acc.)</th>
            </tr></thead><tbody>`;

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kolId => {
            const comparisonSet = comparisonDataGetter(kolId); // This function needs to return { asStats, method2Stats, comparisonStats, method2DisplayName }
            if (comparisonSet && comparisonSet.asStats && comparisonSet.method2Stats && comparisonSet.comparisonStats) {
                const { asStats, method2Stats, comparisonStats, method2DisplayNameActual } = comparisonSet;
                 const method2DisplayName = method2DisplayNameActual || method2NamePrefix;
                 tableHTML += `<tr>
                                <td>${getKollektivDisplayName(kolId)}</td>
                                <td>AS vs. ${method2DisplayName}</td>
                                <td>${_formatMetricForTable(asStats.auc, false, 3)}</td>
                                <td>${_formatMetricForTable(method2Stats.auc, false, 3)}</td>
                                <td>${formatNumber(comparisonStats.delong?.diffAUC, 3, 'N/A', true)}</td>
                                <td>${_formatPValueForText(comparisonStats.delong?.pValue)}</td>
                                <td>${_formatPValueForText(comparisonStats.mcnemar?.pValue)}</td>
                              </tr>`;
            } else {
                 tableHTML += `<tr><td>${getKollektivDisplayName(kolId)}</td><td>AS vs. ${method2NamePrefix}</td><td colspan="5" class="text-center text-muted small"><em>${currentLangInternal === 'de' ? 'Vergleichsdaten nicht verfügbar/anwendbar' : 'Comparison data not available/applicable'}</em></td></tr>`;
            }
        });
        tableHTML += `</tbody></table></div>`;
        return tableHTML;
    }


    function renderSectionContent(sectionId, lang, allKollektivStats, commonDataFromLogic, options = {}) {
        if (!sectionId || !lang || !allKollektivStats || !commonDataFromLogic) {
            return '<p class="text-danger">Fehler: Notwendige Daten für die Sektionsanzeige fehlen.</p>';
        }

        const commonData = {
            ...commonDataFromLogic,
            currentKollektivName: getKollektivDisplayName(options.currentKollektiv),
            bruteForceMetricForPublication: options.publicationBfMetric || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication,
            references: commonDataFromLogic.references || (APP_CONFIG.REFERENCES_FOR_PUBLICATION || {})
        };
        commonData.references.LURZ_SCHAEFER_2025_ADDITIONAL = { // Example how specific paper details could be passed
            studyPeriod: "Januar 2020 und November 2023",
            mriSystem: "einem 3.0-T System (MAGNETOM Prisma Fit; Siemens Healthineers, Erlangen, Deutschland)",
            contrastAgent: "Gadoteridol (ProHance; Bracco Imaging, Konstanz, Deutschland)",
            t2SliceThickness: "2–3 mm",
            radiologistExperience: ["29", "7", "19"],
        };
         commonData.references.ETHICS_VOTE_SAXONY = { shortCitation: "Ethikvotum Nr. 2023-101 (Sächsische Landesärztekammer)"};


        const mainSectionConfig = PUBLICATION_CONFIG.sections.find(s => s.id === sectionId);
        if (!mainSectionConfig || !mainSectionConfig.subSections || mainSectionConfig.subSections.length === 0) {
            return `<p class="text-warning">Keine Unterabschnitte für Hauptabschnitt '${sectionId}' definiert.</p>`;
        }

        let combinedHtml = `<div class="publication-main-section" id="pub-main-content-${sectionId}">`;
        combinedHtml += `<h1 class="mb-4 display-6">${UI_TEXTS.publikationTab.sectionLabels[mainSectionConfig.labelKey] || mainSectionConfig.labelKey}</h1>`;

        mainSectionConfig.subSections.forEach(subSection => {
            combinedHtml += `<div class="publication-sub-section border-bottom pb-4 mb-4" id="pub-content-${subSection.id}">`;
            combinedHtml += `<h2 class="mb-3 h4">${subSection.label}</h2>`;

            const textContentHtml = publicationTextGenerator.getSectionText(subSection.id, lang, allKollektivStats, commonData, options);
            combinedHtml += textContentHtml || `<p class="text-muted">Inhalt für '${subSection.label}' nicht verfügbar.</p>`;

            // Check if this subsection is configured to have specific tables or figures
            Object.entries(PUBLICATION_CONFIG.publicationElements).forEach(([elementKey, elementConfig]) => {
                if (elementConfig.associatedSubSection === subSection.id || elementConfig.id === subSection.id) { // Assuming a new property `associatedSubSection` or direct ID match
                    if (elementKey.startsWith('TABLE_')) {
                        combinedHtml += `<div id="${elementConfig.id}-content_wrapper"></div>`; // Placeholder for table
                    } else if (elementKey.startsWith('FIGURE_')) {
                        combinedHtml += `<div class="chart-container-publication" id="${elementConfig.id}-content_wrapper"><h5 class="text-center small mb-1 publication-figure-title">${lang === 'de' ? elementConfig.titleDe : elementConfig.titleEn}</h5><p class="text-muted small text-center p-1">${lang === 'de' ? elementConfig.referenceFormat.de : elementConfig.referenceFormat.en}</p><div id="${elementConfig.id}" class="chart-render-area" style="min-height: ${elementConfig.minHeight || '250px'};"></div></div>`; // Placeholder for figure
                    }
                }
            });
            combinedHtml += `</div>`;
        });

        combinedHtml += `</div>`;
        return combinedHtml;
    }

    function generateTableHTML(tableKey, lang, allKollektivStats, commonData, options) {
        _initializeForTableGeneration(lang, allKollektivStats, commonData, options);

        switch(tableKey) {
            case 'TABLE_PATIENT_CHARS':
                return _generatePatientCharacteristicsTableHTML();
            case 'TABLE_LITERATURE_T2_CRITERIA':
                return _generateLiteratureT2CriteriaTableHTML();
            case 'TABLE_PERFORMANCE_AS':
                return _generateDiagnosticPerformanceTableHTML(tableKey, (kolId) => currentAllStatsInternal?.[kolId]?.gueteAS, 'Avocado Sign');
            case 'TABLE_PERFORMANCE_LIT_T2':
                 return _generateDiagnosticPerformanceTableHTML(tableKey, (kolId) => null, 'Literatur-T2'); // Handled internally by iterating lit sets
            case 'TABLE_PERFORMANCE_BF_T2':
                return _generateDiagnosticPerformanceTableHTML(tableKey, (kolId) => currentAllStatsInternal?.[kolId]?.gueteT2_bruteforce, 'Optimierte T2');
            case 'TABLE_COMPARISON_AS_VS_LIT_T2':
                return _generateComparisonTableHTML(tableKey, (kolId) => {
                    // This needs a more complex structure from allKollektivStats or dynamic creation
                    // For now, this shows the pattern; actual data must be structured in allKollektivStats
                    // to have asStats, method2Stats (for each lit T2), comparisonStats, method2DisplayNameActual
                    // This part needs a specific data structure from allKollektivStats.
                    // We'll assume for each lit set, there's a comparison object.
                    // This will require `statistics_service.calculateAllStatsForPublication` to create these comparison substructures.
                    // For now, let's return a placeholder if structure isn't readily available like that.
                    // This part requires that `allKollektivStats[kolId]` contains entries like `vergleichASvsT2_literatur_koh_2008_morphology`
                    // and `gueteT2_literatur.koh_2008_morphology`
                    // The logic in _generateComparisonTableHTML iterates through lit sets internally if needed.
                    // For now, this function will just return an empty string or a specific example.
                    // To make it work properly, the caller (publikation_tab_logic) would iterate through literature sets
                    // and call this for *each* comparison, passing the specific lit set key.
                    // Or, this function builds multiple rows if `method2NamePrefix` is 'Literatur-T2'.

                    let html = '';
                    PUBLICATION_CONFIG.literatureCriteriaSets.forEach(litSetConf => {
                        const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id);
                         if (studySet && (studySet.applicableKollektiv === kolId || (studySet.applicableKollektiv === 'Gesamt' && kolId === 'Gesamt'))) {
                            const asStats = currentAllStatsInternal?.[kolId]?.gueteAS;
                            const litT2Stats = currentAllStatsInternal?.[kolId]?.gueteT2_literatur?.[litSetConf.id];
                            const comparisonStats = currentAllStatsInternal?.[kolId]?.[`vergleichASvsT2_literatur_${litSetConf.id}`];
                             if (asStats && litT2Stats && comparisonStats) {
                                html += `<tr>
                                            <td>${getKollektivDisplayName(kolId)}</td>
                                            <td>AS vs. ${studySet.displayShortName || studySet.name}</td>
                                            <td>${_formatMetricForTable(asStats.auc, false, 3)}</td>
                                            <td>${_formatMetricForTable(litT2Stats.auc, false, 3)}</td>
                                            <td>${formatNumber(comparisonStats.delong?.diffAUC, 3, 'N/A', true)}</td>
                                            <td>${_formatPValueForText(comparisonStats.delong?.pValue)}</td>
                                            <td>${_formatPValueForText(comparisonStats.mcnemar?.pValue)}</td>
                                          </tr>`;
                            }
                        }
                    });
                    if(html) { // Return the full table structure only if rows were generated
                        const tableConfig = PUBLICATION_CONFIG.publicationElements[tableKey];
                        let title = currentLangInternal === 'de' ? tableConfig.titleDe : tableConfig.titleEn;
                        let fullTableHTML = `<h4 class="mt-4 mb-3 publication-table-title" id="${tableConfig.id}-title">${title}</h4>`;
                        fullTableHTML += `<div class="table-responsive"><table class="table table-sm table-bordered table-striped small publication-table" id="${tableConfig.id}">
                            <thead><tr>
                                <th>${currentLangInternal === 'de' ? 'Kollektiv' : 'Cohort'}</th>
                                <th>${currentLangInternal === 'de' ? 'Vergleich' : 'Comparison'}</th>
                                <th>AUC AS (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                                <th>AUC Lit. T2 (${currentLangInternal === 'de' ? '95%-KI' : '95% CI'})</th>
                                <th>Diff. AUC (AS - Lit. T2)</th>
                                <th>DeLong p-Wert (AUC)</th>
                                <th>McNemar p-Wert (Acc.)</th>
                            </tr></thead><tbody>${html}</tbody></table></div>`;
                        return fullTableHTML;
                    }
                    return `<p class="text-muted small">${currentLangInternal === 'de' ? `Keine spezifischen Literaturvergleichsdaten für Kollektiv ${getKollektivDisplayName(kolId)} verfügbar.` : `No specific literature comparison data available for cohort ${getKollektivDisplayName(kolId)}.`}</p>`;
                });
                 return ''; // Wrapper will be generated by caller if any rows were made.
            case 'TABLE_COMPARISON_AS_VS_BF_T2':
                return _generateComparisonTableHTML(tableKey, (kolId) => ({
                    asStats: currentAllStatsInternal?.[kolId]?.gueteAS,
                    method2Stats: currentAllStatsInternal?.[kolId]?.gueteT2_bruteforce,
                    comparisonStats: currentAllStatsInternal?.[kolId]?.vergleichASvsT2_bruteforce,
                    method2DisplayNameActual: `${currentLangInternal === 'de' ? 'Optimiert für' : 'Optimized for'} ${currentAllStatsInternal?.[kolId]?.bruteforce_definition?.metricName || PUBLICATION_CONFIG.defaultBruteForceMetricForPublication}`
                }), 'Optimierte T2');

            default: return `<p class="text-warning">${currentLangInternal === 'de' ? 'Unbekannter Tabellenschlüssel:' : 'Unknown table key:'} ${tableKey}</p>`;
        }
    }


    return Object.freeze({
        renderSectionContent,
        generateTableHTML
    });

})();
