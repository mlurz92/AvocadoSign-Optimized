const publicationTables = (() => {

    const formatPubNumber = (num, digits = 0, lang = 'en', placeholder = '--') => {
        if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return placeholder;
        let formatted = formatNumber(num, digits, placeholder, true, lang);
        if (lang === 'de') {
            formatted = formatted.replace('.', ',');
        }
        return formatted;
    };

    const formatPubPercent = (num, digits = 1, lang = 'en', placeholder = '--') => {
        if (num === null || num === undefined || isNaN(num) || !isFinite(num)) return placeholder;
        return formatPercent(num, digits, placeholder, lang).replace('%',''); // Remove % here, add it in table cell
    };

    const formatPubCI = (value, ciLower, ciUpper, digits = 1, lang = 'en', placeholder = '--') => {
        if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return placeholder;
        const formattedValue = formatPubNumber(value, digits, lang);
        if (ciLower === null || ciLower === undefined || isNaN(ciLower) || !isFinite(ciLower) ||
            ciUpper === null || ciUpper === undefined || isNaN(ciUpper) || !isFinite(ciUpper)) {
            return formattedValue;
        }
        const formattedLower = formatPubNumber(ciLower, digits, lang);
        const formattedUpper = formatPubNumber(ciUpper, digits, lang);
        return `${formattedValue} (${formattedLower}, ${formattedUpper})`;
    };
    
    const formatPubMetricValue = (metricData, digits, lang = 'en') => {
        if (!metricData || isNaN(metricData.value)) {
            return '--';
        }
        const value = metricData.value;
        const ciLower = metricData.ci?.lower;
        const ciUpper = metricData.ci?.upper;

        return formatPubCI(value, ciLower, ciUpper, digits, lang);
    };

    const formatPubPValue = (pValue, lang = 'en') => {
        return getPValueText(pValue, lang, true);
    };

    function generateMethodsLiteratureCriteriaTable(context) {
        const lang = context.currentLanguage;
        const literatureSets = APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets;
        const tableId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.id;
        const title = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.titleDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.titleEn;
        const caption = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.methoden.literaturT2KriterienTabelle.captionEn;

        let tableHTML = `
            <table class="table table-bordered table-sm publication-table" id="${tableId}">
                <caption>${caption}</caption>
                <thead>
                    <tr>
                        <th rowspan="2">${lang === 'de' ? 'Kriteriensatz' : 'Criteria Set'}</th>
                        <th rowspan="2">${lang === 'de' ? 'Referenz' : 'Reference'}</th>
                        <th rowspan="2">${lang === 'de' ? 'Patientenkohorte' : 'Patient Cohort'}</th>
                        <th rowspan="2">${lang === 'de' ? 'Untersuchungstyp' : 'Investigation Type'}</th>
                        <th colspan="5" class="text-center">${lang === 'de' ? 'T2w Kriterien' : 'T2w Criteria'}</th>
                        <th rowspan="2">${lang === 'de' ? 'Logik' : 'Logic'}</th>
                    </tr>
                    <tr>
                        <th>${lang === 'de' ? 'Größe (mm)' : 'Size (mm)'}</th>
                        <th>${lang === 'de' ? 'Form' : 'Shape'}</th>
                        <th>${lang === 'de' ? 'Kontur' : 'Contour'}</th>
                        <th>${lang === 'de' ? 'Homogenität' : 'Homogeneity'}</th>
                        <th>${lang === 'de' ? 'Signal' : 'Signal'}</th>
                    </tr>
                </thead>
                <tbody>`;

        literatureSets.forEach(set => {
            const sizeDisplay = set.criteria.size?.active ? `${set.criteria.size.condition} ${formatPubNumber(set.criteria.size.threshold, 1, lang)}` : lang === 'de' ? 'N/A' : 'N/A';
            const formDisplay = set.criteria.form?.active ? set.criteria.form.value : (lang === 'de' ? 'N/A' : 'N/A');
            const konturDisplay = set.criteria.kontur?.active ? set.criteria.kontur.value : (lang === 'de' ? 'N/A' : 'N/A');
            const homogenitaetDisplay = set.criteria.homogenitaet?.active ? set.criteria.homogenitaet.value : (lang === 'de' ? 'N/A' : 'N/A');
            const signalDisplay = set.criteria.signal?.active ? set.criteria.signal.value : (lang === 'de' ? 'N/A' : 'N/A');
            
            const studyReference = (set.studyInfo.reference || '').split(';')[0].trim(); // Only first reference if multiple
            const refToCite = Object.keys(APP_CONFIG.REFERENCES_FOR_PUBLICATION).find(key => APP_CONFIG.REFERENCES_FOR_PUBLICATION[key].includes(studyReference));
            const citation = refToCite ? `<sup>[${Object.keys(APP_CONFIG.REFERENCES_FOR_PUBLICATION).indexOf(refToCite) + 1}]</sup>` : '';

            tableHTML += `
                <tr>
                    <td>${set.name || set.id}</td>
                    <td>${studyReference}${citation}</td>
                    <td>${set.studyInfo.patientCohort || (lang === 'de' ? 'N/A' : 'N/A')}</td>
                    <td>${set.studyInfo.investigationType || (lang === 'de' ? 'N/A' : 'N/A')}</td>
                    <td>${sizeDisplay}</td>
                    <td>${formDisplay}</td>
                    <td>${konturDisplay}</td>
                    <td>${homogenitaetDisplay}</td>
                    <td>${signalDisplay}</td>
                    <td>${set.logic || (lang === 'de' ? 'N/A' : 'N/A')}</td>
                </tr>`;
        });

        tableHTML += `
                </tbody>
            </table>`;

        return `<div class="table-container">${tableHTML}</div>`;
    }


    function generateResultsPatientCharacteristicsTable(context) {
        const lang = context.currentLanguage;
        const stats = context.allStats.Gesamt.deskriptiv;
        const statsDirektOP = context.allStats['direkt OP']?.deskriptiv;
        const statsNRCT = context.allStats.nRCT?.deskriptiv;

        const tableId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.id;
        const title = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.titleEn;
        const caption = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.patientenCharakteristikaTabelle.captionEn;

        let tableHTML = `
            <table class="table table-bordered table-sm publication-table" id="${tableId}">
                <caption>${caption}</caption>
                <thead>
                    <tr>
                        <th rowspan="2">${lang === 'de' ? 'Merkmal' : 'Characteristic'}</th>
                        <th colspan="2" class="text-center">${lang === 'de' ? 'Gesamtkollektiv' : 'Overall Cohort'}<br>(N=${stats.anzahlPatienten})</th>
                        <th colspan="2" class="text-center">${lang === 'de' ? 'Direkt OP' : 'Upfront Surgery'}<br>(N=${statsDirektOP?.anzahlPatienten || 0})</th>
                        <th colspan="2" class="text-center">${lang === 'de' ? 'nRCT' : 'nRCT'}<br>(N=${statsNRCT?.anzahlPatienten || 0})</th>
                    </tr>
                    <tr>
                        <th class="text-end">${lang === 'de' ? 'Median (Min–Max)' : 'Median (Min–Max)'}</th>
                        <th class="text-end">${lang === 'de' ? '[MW ± SD]' : '[Mean ± SD]'}</th>
                        <th class="text-end">${lang === 'de' ? 'Median (Min–Max)' : 'Median (Min–Max)'}</th>
                        <th class="text-end">${lang === 'de' ? '[MW ± SD]' : '[Mean ± SD]'}</th>
                        <th class="text-end">${lang === 'de' ? 'Median (Min–Max)' : 'Median (Min–Max)'}</th>
                        <th class="text-end">${lang === 'de' ? '[MW ± SD]' : '[Mean ± SD]'}</th>
                    </tr>
                </thead>
                <tbody>`;
        
        const renderNumericRow = (label, statObj, lang) => {
            const medianRange = statObj ? `${formatPubNumber(statObj.median, 0, lang)} (${formatPubNumber(statObj.min, 0, lang)}–${formatPubNumber(statObj.max, 0, lang)})` : '--';
            const meanSD = statObj ? `[${formatPubNumber(statObj.mean, 1, lang)} ± ${formatPubNumber(statObj.sd, 1, lang)}]` : '--';
            return `<td class="text-end">${medianRange}</td><td class="text-end">${meanSD}</td>`;
        };

        const renderCategoricalRow = (label, mainVal, mainTotal, subVal1, subTotal1, subVal2, subTotal2, lang) => {
            const formatCount = (count, total) => {
                if (total === 0) return `${formatPubNumber(count, 0, lang)} (${formatPubPercent(0, 1, lang)}%)`;
                return `${formatPubNumber(count, 0, lang)} (${formatPubPercent(count / total, 1, lang)}%)`;
            };
            return `
                <tr>
                    <td>${label}</td>
                    <td colspan="2" class="text-center">${formatCount(mainVal, mainTotal)}</td>
                    <td colspan="2" class="text-center">${formatCount(subVal1, subTotal1)}</td>
                    <td colspan="2" class="text-center">${formatCount(subVal2, subTotal2)}</td>
                </tr>`;
        };

        // Age Row
        tableHTML += `
            <tr>
                <td>${lang === 'de' ? 'Alter (Jahre)' : 'Age (years)'}</td>
                ${renderNumericRow(lang === 'de' ? 'Alter' : 'Age', stats.alter, lang)}
                ${renderNumericRow(lang === 'de' ? 'Alter' : 'Age', statsDirektOP?.alter, lang)}
                ${renderNumericRow(lang === 'de' ? 'Alter' : 'Age', statsNRCT?.alter, lang)}
            </tr>`;

        // Gender Rows
        tableHTML += renderCategoricalRow(
            lang === 'de' ? 'Geschlecht: männlich' : 'Sex: male',
            stats.geschlecht.m, stats.anzahlPatienten,
            statsDirektOP?.geschlecht?.m ?? 0, statsDirektOP?.anzahlPatienten ?? 0,
            statsNRCT?.geschlecht?.m ?? 0, statsNRCT?.anzahlPatienten ?? 0,
            lang
        );
        tableHTML += renderCategoricalRow(
            lang === 'de' ? 'Geschlecht: weiblich' : 'Sex: female',
            stats.geschlecht.f, stats.anzahlPatienten,
            statsDirektOP?.geschlecht?.f ?? 0, statsDirektOP?.anzahlPatienten ?? 0,
            statsNRCT?.geschlecht?.f ?? 0, statsNRCT?.anzahlPatienten ?? 0,
            lang
        );

        // Therapy Type (already in columns, not a separate row)
        // Nodal Status Rows
        tableHTML += renderCategoricalRow(
            lang === 'de' ? 'N-Status: N+' : 'Nodal status: N+',
            stats.nStatus.plus, stats.anzahlPatienten,
            statsDirektOP?.nStatus?.plus ?? 0, statsDirektOP?.anzahlPatienten ?? 0,
            statsNRCT?.nStatus?.plus ?? 0, statsNRCT?.anzahlPatienten ?? 0,
            lang
        );
        tableHTML += renderCategoricalRow(
            lang === 'de' ? 'N-Status: N-' : 'Nodal status: N-',
            stats.nStatus.minus, stats.anzahlPatienten,
            statsDirektOP?.nStatus?.minus ?? 0, statsDirektOP?.anzahlPatienten ?? 0,
            statsNRCT?.nStatus?.minus ?? 0, statsNRCT?.anzahlPatienten ?? 0,
            lang
        );

        // AS Status Rows
        tableHTML += renderCategoricalRow(
            lang === 'de' ? 'AS-Status: AS+' : 'AS status: AS+',
            stats.asStatus.plus, stats.anzahlPatienten,
            statsDirektOP?.asStatus?.plus ?? 0, statsDirektOP?.anzahlPatienten ?? 0,
            statsNRCT?.asStatus?.plus ?? 0, statsNRCT?.anzahlPatienten ?? 0,
            lang
        );
        tableHTML += renderCategoricalRow(
            lang === 'de' ? 'AS-Status: AS-' : 'AS status: AS-',
            stats.asStatus.minus, stats.anzahlPatienten,
            statsDirektOP?.asStatus?.minus ?? 0, statsDirektOP?.anzahlPatienten ?? 0,
            statsNRCT?.asStatus?.minus ?? 0, statsNRCT?.anzahlPatienten ?? 0,
            lang
        );
        
        // T2 Status Rows
        tableHTML += renderCategoricalRow(
            lang === 'de' ? 'T2-Status (angewandt): T2+' : 'T2 status (applied): T2+',
            stats.t2Status.plus, stats.anzahlPatienten,
            statsDirektOP?.t2Status?.plus ?? 0, statsDirektOP?.anzahlPatienten ?? 0,
            statsNRCT?.t2Status?.plus ?? 0, statsNRCT?.anzahlPatienten ?? 0,
            lang
        );
        tableHTML += renderCategoricalRow(
            lang === 'de' ? 'T2-Status (angewandt): T2-' : 'T2 status (applied): T2-',
            stats.t2Status.minus, stats.anzahlPatienten,
            statsDirektOP?.t2Status?.minus ?? 0, statsDirektOP?.anzahlPatienten ?? 0,
            statsNRCT?.t2Status?.minus ?? 0, statsNRCT?.anzahlPatienten ?? 0,
            lang
        );

        // Lymph Node Counts
        const renderLKRow = (label, statObj, lang) => {
            const medianRange = statObj?.total ? `${formatPubNumber(statObj.total.median, 0, lang)} (${formatPubNumber(statObj.total.min, 0, lang)}–${formatPubNumber(statObj.total.max, 0, lang)})` : '--';
            const meanSD = statObj?.total ? `[${formatPubNumber(statObj.total.mean, 1, lang)} ± ${formatPubNumber(statObj.total.sd, 1, lang)}]` : '--';
            return `<td class="text-end">${medianRange}</td><td class="text-end">${meanSD}</td>`;
        };

        tableHTML += `
            <tr>
                <td>${lang === 'de' ? 'Anzahl resezierte LK (Histopath.)' : 'Number of resected LNs (Histopath.)'}</td>
                ${renderLKRow(lang === 'de' ? 'Anzahl resezierte LK (Histopath.)' : 'Number of resected LNs (Histopath.)', stats.lkAnzahlen.n, lang)}
                ${renderLKRow(lang === 'de' ? 'Anzahl resezierte LK (Histopath.)' : 'Number of resected LNs (Histopath.)', statsDirektOP?.lkAnzahlen?.n, lang)}
                ${renderLKRow(lang === 'de' ? 'Anzahl resezierte LK (Histopath.)' : 'Number of resected LNs (Histopath.)', statsNRCT?.lkAnzahlen?.n, lang)}
            </tr>`;
        tableHTML += `
            <tr>
                <td>${lang === 'de' ? 'Anzahl sichtbare LK (AS/T2)' : 'Number of visible LNs (AS/T2)'}</td>
                ${renderLKRow(lang === 'de' ? 'Anzahl sichtbare LK (AS/T2)' : 'Number of visible LNs (AS/T2)', stats.lkAnzahlen.t2, lang)}
                ${renderLKRow(lang === 'de' ? 'Anzahl sichtbare LK (AS/T2)' : 'Number of visible LNs (AS/T2)', statsDirektOP?.lkAnzahlen?.t2, lang)}
                ${renderLKRow(lang === 'de' ? 'Anzahl sichtbare LK (AS/T2)' : 'Number of visible LNs (AS/T2)', statsNRCT?.lkAnzahlen?.t2, lang)}
            </tr>`;

        tableHTML += `
                </tbody>
            </table>`;

        return `<div class="table-container">${tableHTML}</div>`;
    }

    function generateResultsPerformanceTable(context, methodId, tableKey, titleKey, captionKey) {
        const lang = context.currentLanguage;
        const statsOverall = context.allStats.Gesamt;
        const statsDirektOP = context.allStats['direkt OP'];
        const statsNRCT = context.allStats.nRCT;

        const tableId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[tableKey].id;
        const title = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[tableKey].titleDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[tableKey].titleEn;
        const caption = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[tableKey].captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse[tableKey].captionEn;
        
        let bfMetricDisplayName = context.currentBruteForceMetric;
        if(lang === 'de') {
             bfMetricDisplayName = APP_CONFIG.PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === context.currentBruteForceMetric)?.label || bfMetricDisplayName;
        } else {
             bfMetricDisplayName = APP_CONFIG.PUBLICATION_CONFIG.bruteForceMetricsForPublication.find(m => m.value === context.currentBruteForceMetric)?.label.replace('Positiver Prädiktiver Wert (PPV)', 'Positive Predictive Value (PPV)').replace('Negativer Prädiktiver Wert (NPV)', 'Negative Predictive Value (NPV)').replace('Accuracy', 'Accuracy').replace('Balanced Accuracy', 'Balanced Accuracy').replace('F1-Score', 'F1-Score') || bfMetricDisplayName;
        }

        const formattedCaption = caption.replace('{BF_METRIC}', bfMetricDisplayName);


        let tableHTML = `
            <table class="table table-bordered table-sm publication-table" id="${tableId}">
                <caption>${formattedCaption}</caption>
                <thead>
                    <tr>
                        <th rowspan="2">${lang === 'de' ? 'Metrik' : 'Metric'}</th>
                        <th colspan="1" class="text-center">${lang === 'de' ? 'Gesamtkollektiv' : 'Overall Cohort'}<br>(N=${statsOverall?.anzahlPatienten})</th>
                        <th colspan="1" class="text-center">${lang === 'de' ? 'Direkt OP' : 'Upfront Surgery'}<br>(N=${statsDirektOP?.anzahlPatienten || 0})</th>
                        <th colspan="1" class="text-center">${lang === 'de' ? 'nRCT' : 'nRCT'}<br>(N=${statsNRCT?.anzahlPatienten || 0})</th>
                    </tr>
                    <tr>
                        <th class="text-end">${lang === 'de' ? 'Wert (95% KI)' : 'Value (95% CI)'}</th>
                        <th class="text-end">${lang === 'de' ? 'Wert (95% KI)' : 'Value (95% CI)'}</th>
                        <th class="text-end">${lang === 'de' ? 'Wert (95% KI)' : 'Value (95% CI)'}</th>
                    </tr>
                </thead>
                <tbody>`;

        const metrics = ['sens', 'spez', 'ppv', 'npv', 'acc', 'balAcc', 'f1', 'auc'];
        const metricDisplayNames = {
            sens: lang === 'de' ? 'Sensitivität (%)' : 'Sensitivity (%)',
            spez: lang === 'de' ? 'Spezifität (%)' : 'Specificity (%)',
            ppv: lang === 'de' ? 'PPV (%)' : 'PPV (%)',
            npv: lang === 'de' ? 'NPV (%)' : 'NPV (%)',
            acc: lang === 'de' ? 'Genauigkeit (%)' : 'Accuracy (%)',
            balAcc: lang === 'de' ? 'Bal. Genauigkeit (%)' : 'Bal. Accuracy (%)',
            f1: lang === 'de' ? 'F1-Score' : 'F1-Score',
            auc: lang === 'de' ? 'AUC' : 'AUC'
        };

        metrics.forEach(metricKey => {
            const isPercent = (metricKey !== 'f1' && metricKey !== 'auc');
            const digits = (metricKey === 'f1' || metricKey === 'auc') ? 3 : 1;
            
            let overallData = null;
            if (methodId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                overallData = statsOverall?.gueteAS?.[metricKey];
            } else if (methodId === 'optimized_t2') {
                overallData = statsOverall?.gueteT2_bruteforce?.[metricKey];
            } else if (methodId === 'literature_t2') {
                // This branch needs special handling as it has multiple literature sets, 
                // but this function is structured for single method comparison across cohorts.
                // It will only pick the first one for simplicity or be used for specific study ID
                // For this project, this function should primarily be called for AS or optimized T2
                 const specificStudyId = options.studyId; // Assuming studyId is passed in options for literature sets
                 if (specificStudyId) {
                     overallData = statsOverall?.gueteT2_literatur?.[specificStudyId]?.[metricKey];
                 }
            }


            let direktOPData = null;
             if (methodId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                direktOPData = statsDirektOP?.gueteAS?.[metricKey];
            } else if (methodId === 'optimized_t2') {
                direktOPData = statsDirektOP?.gueteT2_bruteforce?.[metricKey];
            } else if (methodId === 'literature_t2') {
                 const specificStudyId = options.studyId; // Assuming studyId is passed in options for literature sets
                 if (specificStudyId) {
                     direktOPData = statsDirektOP?.gueteT2_literatur?.[specificStudyId]?.[metricKey];
                 }
            }


            let nRCTData = null;
            if (methodId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                nRCTData = statsNRCT?.gueteAS?.[metricKey];
            } else if (methodId === 'optimized_t2') {
                nRCTData = statsNRCT?.gueteT2_bruteforce?.[metricKey];
            } else if (methodId === 'literature_t2') {
                 const specificStudyId = options.studyId; // Assuming studyId is passed in options for literature sets
                 if (specificStudyId) {
                     nRCTData = statsNRCT?.gueteT2_literatur?.[specificStudyId]?.[metricKey];
                 }
            }
            

            tableHTML += `
                <tr>
                    <td>${metricDisplayNames[metricKey]}</td>
                    <td class="text-end">${formatPubMetricValue(overallData, digits, lang)}${isPercent ? '%' : ''}</td>
                    <td class="text-end">${formatPubMetricValue(direktOPData, digits, lang)}${isPercent ? '%' : ''}</td>
                    <td class="text-end">${formatPubMetricValue(nRCTData, digits, lang)}${isPercent ? '%' : ''}</td>
                </tr>`;
        });

        tableHTML += `
                </tbody>
            </table>`;

        return `<div class="table-container">${tableHTML}</div>`;
    }

    function generateResultsLiteratureT2PerformanceTable(context) {
        const lang = context.currentLanguage;
        const literatureSets = APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets;
        const tableId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.id;
        const title = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.titleEn;
        const caption = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.diagnostischeGueteLiteraturT2Tabelle.captionEn;

        let tableHTML = `
            <table class="table table-bordered table-sm publication-table" id="${tableId}">
                <caption>${caption}</caption>
                <thead>
                    <tr>
                        <th rowspan="2">${lang === 'de' ? 'Kriteriensatz' : 'Criteria Set'}</th>
                        <th rowspan="2">${lang === 'de' ? 'Evaluiert auf Kollektiv (N)' : 'Evaluated on Cohort (N)'}</th>
                        <th colspan="6" class="text-center">${lang === 'de' ? 'Diagnostische Güte (Wert (95% KI))' : 'Diagnostic Performance (Value (95% CI))'}</th>
                    </tr>
                    <tr>
                        <th>${lang === 'de' ? 'Sens. (%)' : 'Sens. (%)'}</th>
                        <th>${lang === 'de' ? 'Spez. (%)' : 'Spec. (%)'}</th>
                        <th>${lang === 'de' ? 'PPV (%)' : 'PPV (%)'}</th>
                        <th>${lang === 'de' ? 'NPV (%)' : 'NPV (%)'}</th>
                        <th>${lang === 'de' ? 'Acc. (%)' : 'Acc. (%)'}</th>
                        <th>${lang === 'de' ? 'AUC' : 'AUC'}</th>
                    </tr>
                </thead>
                <tbody>`;
        
        literatureSets.forEach(set => {
            const applicableKollektivId = set.applicableKollektiv;
            const stats = context.allStats[applicableKollektivId];
            const performance = stats?.gueteT2_literatur?.[set.id];

            const nPatients = stats?.anzahlPatienten || 0;

            const sens = formatPubMetricValue(performance?.sens, 1, lang);
            const spez = formatPubMetricValue(performance?.spez, 1, lang);
            const ppv = formatPubMetricValue(performance?.ppv, 1, lang);
            const npv = formatPubMetricValue(performance?.npv, 1, lang);
            const acc = formatPubMetricValue(performance?.acc, 1, lang);
            const auc = formatPubMetricValue(performance?.auc, 3, lang);


            tableHTML += `
                <tr>
                    <td>${set.name || set.id}</td>
                    <td class="text-center">${context.kollektivNames[applicableKollektivId] || applicableKollektivId} (N=${nPatients})</td>
                    <td class="text-end">${sens}%</td>
                    <td class="text-end">${spez}%</td>
                    <td class="text-end">${ppv}%</td>
                    <td class="text-end">${npv}%</td>
                    <td class="text-end">${acc}%</td>
                    <td class="text-end">${auc}</td>
                </tr>`;
        });

        tableHTML += `
                </tbody>
            </table>`;

        return `<div class="table-container">${tableHTML}</div>`;
    }

    function generateResultsComparisonTable(context) {
        const lang = context.currentLanguage;
        const tableId = APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.id;
        const title = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.titleDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.titleEn;
        const caption = lang === 'de' ? APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.captionDe : APP_CONFIG.PUBLICATION_CONFIG.publicationElements.ergebnisse.statistischerVergleichAST2Tabelle.captionEn;
        
        let tableHTML = `
            <table class="table table-bordered table-sm publication-table" id="${tableId}">
                <caption>${caption}</caption>
                <thead>
                    <tr>
                        <th rowspan="2">${lang === 'de' ? 'Kollektiv (N)' : 'Cohort (N)'}</th>
                        <th colspan="2" class="text-center">${lang === 'de' ? 'Avocado Sign (AS)' : 'Avocado Sign (AS)'}</th>
                        <th colspan="2" class="text-center">${lang === 'de' ? 'Optimierte T2-Kriterien' : 'Optimized T2 Criteria'}</th>
                        <th colspan="2" class="text-center">${lang === 'de' ? 'P-Werte für Vergleich' : 'P-values for Comparison'}</th>
                    </tr>
                    <tr>
                        <th>${lang === 'de' ? 'Acc. (%)' : 'Acc. (%)'}</th>
                        <th>${lang === 'de' ? 'AUC' : 'AUC'}</th>
                        <th>${lang === 'de' ? 'Acc. (%)' : 'Acc. (%)'}</th>
                        <th>${lang === 'de' ? 'AUC' : 'AUC'}</th>
                        <th>${lang === 'de' ? 'McNemar (Acc.)' : 'McNemar (Acc.)'}</th>
                        <th>${lang === 'de' ? 'DeLong (AUC)' : 'DeLong (AUC)'}</th>
                    </tr>
                </thead>
                <tbody>`;

        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];
        kollektive.forEach(kollektivId => {
            const stats = context.allStats[kollektivId];
            if (!stats) return;

            const nPatients = stats.anzahlPatienten;

            const asAcc = stats.gueteAS?.acc?.value;
            const asAuc = stats.gueteAS?.auc?.value;
            const t2OptimizedAcc = stats.gueteT2_bruteforce?.acc?.value;
            const t2OptimizedAuc = stats.gueteT2_bruteforce?.auc?.value;

            const pMcNemar = stats.vergleichASvsT2_bruteforce?.mcnemar?.pValue;
            const pDeLong = stats.vergleichASvsT2_bruteforce?.delong?.pValue;

            tableHTML += `
                <tr>
                    <td>${context.kollektivNames[kollektivId] || kollektivId} (N=${nPatients})</td>
                    <td class="text-end">${formatPubNumber(asAcc * 100, 1, lang)}%</td>
                    <td class="text-end">${formatPubNumber(asAuc, 3, lang)}</td>
                    <td class="text-end">${formatPubNumber(t2OptimizedAcc * 100, 1, lang)}%</td>
                    <td class="text-end">${formatPubNumber(t2OptimizedAuc, 3, lang)}</td>
                    <td class="text-end">${formatPubPValue(pMcNemar, lang)}</td>
                    <td class="text-end">${formatPubPValue(pDeLong, lang)}</td>
                </tr>`;
        });

        // Add literature comparison rows (if any)
        APP_CONFIG.PUBLICATION_CONFIG.literatureCriteriaSets.forEach(studySet => {
            const kollektivId = studySet.applicableKollektiv;
            const stats = context.allStats[kollektivId];
            if (!stats || !stats.gueteT2_literatur?.[studySet.id]) return;

            const nPatients = stats.anzahlPatienten;
            const asAcc = stats.gueteAS?.acc?.value;
            const asAuc = stats.gueteAS?.auc?.value;
            const t2LitAcc = stats.gueteT2_literatur?.[studySet.id]?.acc?.value;
            const t2LitAuc = stats.gueteT2_literatur?.[studySet.id]?.auc?.value;

            const comparison = stats[`vergleichASvsT2_literatur_${studySet.id}`];
            const pMcNemar = comparison?.mcnemar?.pValue;
            const pDeLong = comparison?.delong?.pValue;

            tableHTML += `
                <tr>
                    <td>${studySet.displayShortName || studySet.name} (${context.kollektivNames[kollektivId] || kollektivId}) (N=${nPatients})</td>
                    <td class="text-end">${formatPubNumber(asAcc * 100, 1, lang)}%</td>
                    <td class="text-end">${formatPubNumber(asAuc, 3, lang)}</td>
                    <td class="text-end">${formatPubNumber(t2LitAcc * 100, 1, lang)}%</td>
                    <td class="text-end">${formatPubNumber(t2LitAuc, 3, lang)}</td>
                    <td class="text-end">${formatPubPValue(pMcNemar, lang)}</td>
                    <td class="text-end">${formatPubPValue(pDeLong, lang)}</td>
                </tr>`;
        });


        tableHTML += `
                </tbody>
            </table>`;
        return `<div class="table-container">${tableHTML}</div>`;
    }


    return Object.freeze({
        generateMethodsLiteratureCriteriaTable,
        generateResultsPatientCharacteristicsTable,
        generateResultsPerformanceTable,
        generateResultsLiteratureT2PerformanceTable,
        generateResultsComparisonTable
    });

})();
