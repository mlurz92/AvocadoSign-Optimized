const publicationRenderer = (() => {
    let _allStats;
    let _lang;
    let _bfMetric;
    let _uiTexts;
    let _tooltipContent;

    function _fVal(value, digits = 1, isPercent = false, na = '--') {
        const num = parseFloat(value);
        if (value === null || value === undefined || isNaN(num) || !isFinite(num)) return na;
        const opts = { minimumFractionDigits: digits, maximumFractionDigits: digits };
        const locale = _lang === 'en' ? 'en-US' : 'de-DE';
        let formatted = num.toLocaleString(locale, opts);
        if (isPercent) formatted += '%';
        return formatted;
    }

    function _fCI(metricObj, digits = 1, isPercent = false, na = '--') {
        if (!metricObj || metricObj.value === null || metricObj.value === undefined || isNaN(metricObj.value)) return na;
        const valStr = _fVal(metricObj.value, digits, isPercent, na);
        if (!metricObj.ci || metricObj.ci.lower === null || metricObj.ci.lower === undefined || isNaN(metricObj.ci.lower) || metricObj.ci.upper === null || metricObj.ci.upper === undefined || isNaN(metricObj.ci.upper)) {
            return valStr;
        }
        const lowerStr = _fVal(metricObj.ci.lower, digits, isPercent, na);
        const upperStr = _fVal(metricObj.ci.upper, digits, isPercent, na);
        const ciText = _lang === 'en' ? '95% CI' : '95%-KI';
        return `${valStr} (${ciText}: ${lowerStr} – ${upperStr})`;
    }
    
    function _fPVal(pValue, na = '--') {
        if (pValue === null || pValue === undefined || isNaN(pValue)) return na;
        if (pValue < 0.001) return _lang === 'en' ? '<.001' : '<0,001';
        return _fVal(pValue, 3, false, na);
    }

    function _createTableHTML(tableId, captionText, headers, rows, footerText = '') {
        let html = `<div class="table-responsive publication-table-container my-3">`;
        html += `<table class="table table-sm table-bordered table-hover small caption-top" id="${tableId}-table">`;
        html += `<caption class="publication-table-caption">${captionText}</caption>`;
        html += '<thead><tr>';
        headers.forEach(header => {
            const tooltip = header.tooltip || header.label;
            html += `<th scope="col" data-tippy-content="${tooltip}">${header.label}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach((cell, index) => {
                const cellData = (typeof cell === 'object' && cell !== null) ? cell : { value: cell, tooltip: null };
                const tooltipAttr = cellData.tooltip ? `data-tippy-content="${cellData.tooltip}"` : '';
                const cellValue = cellData.value !== null && cellData.value !== undefined ? cellData.value : '--';
                if (index === 0) { // First cell usually a header for the row
                    html += `<th scope="row" ${tooltipAttr}>${cellValue}</th>`;
                } else {
                    html += `<td ${tooltipAttr}>${cellValue}</td>`;
                }
            });
            html += '</tr>';
        });
        html += '</tbody>';
        if (footerText) {
            html += `<tfoot><tr><td colspan="${headers.length}" class="small text-muted">${footerText}</td></tr></tfoot>`;
        }
        html += '</table></div>';
        return html;
    }

    function _renderPatientenCharakteristikaTabelleHTML() {
        const headers = [
            { label: _lang === 'en' ? 'Characteristic' : 'Merkmal', tooltip: _lang === 'en' ? 'Patient characteristic' : 'Patientenmerkmal' },
            { label: _getKollektivDisplayName('Gesamt', false), tooltip: _lang === 'en' ? `Overall Cohort (N=${_fVal(_allStats.Gesamt?.deskriptiv?.anzahlPatienten,0)})` : `Gesamtkollektiv (N=${_fVal(_allStats.Gesamt?.deskriptiv?.anzahlPatienten,0)})` },
            { label: _getKollektivDisplayName('direkt OP', false), tooltip: _lang === 'en' ? `Upfront Surgery (N=${_fVal(_allStats['direkt OP']?.deskriptiv?.anzahlPatienten,0)})` : `Direkt-OP (N=${_fVal(_allStats['direkt OP']?.deskriptiv?.anzahlPatienten,0)})` },
            { label: _getKollektivDisplayName('nRCT', false), tooltip: _lang === 'en' ? `nCRT (N=${_fVal(_allStats.nRCT?.deskriptiv?.anzahlPatienten,0)})` : `nRCT (N=${_fVal(_allStats.nRCT?.deskriptiv?.anzahlPatienten,0)})` }
        ];
        const rows = [];
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];

        function getStat(kollektivId, path, formatter, ...args) {
            let stat = _allStats[kollektivId]?.deskriptiv;
            path.forEach(p => stat = stat?.[p]);
            return stat !== undefined && stat !== null ? formatter(stat, ...args) : '--';
        }
        function getNCount(val, total) { return `${_fVal(val,0)} (${_fVal(val / total * 100, 1, true)})`;}

        rows.push([
            { value: _lang==='en'?'Number of patients':'Anzahl Patienten', tooltip:_lang==='en'?'Total number of patients in each cohort':'Gesamtzahl der Patienten pro Kollektiv'},
            _fVal(_allStats.Gesamt?.deskriptiv?.anzahlPatienten,0),
            _fVal(_allStats['direkt OP']?.deskriptiv?.anzahlPatienten,0),
            _fVal(_allStats.nRCT?.deskriptiv?.anzahlPatienten,0)
        ]);
        rows.push([
            { value: _lang==='en'?'Age (years), median (range)':'Alter (Jahre), Median (Spannweite)', tooltip:_lang==='en'?'Median age and range (min-max)':'Medianes Alter und Spannweite (Min-Max)'},
            getStat('Gesamt', ['alter'], d => `${_fVal(d.median,1)} (${_fVal(d.min,0)}–${_fVal(d.max,0)})`),
            getStat('direkt OP', ['alter'], d => `${_fVal(d.median,1)} (${_fVal(d.min,0)}–${_fVal(d.max,0)})`),
            getStat('nRCT', ['alter'], d => `${_fVal(d.median,1)} (${_fVal(d.min,0)}–${_fVal(d.max,0)})`)
        ]);
        rows.push([
            { value: _lang==='en'?'Male sex, n (%)':'Männliches Geschlecht, n (%)', tooltip:_lang==='en'?'Number and percentage of male patients':'Anzahl und Prozentsatz männlicher Patienten'},
            getStat('Gesamt', ['geschlecht','m'], (v,k) => getNCount(v, _allStats[k].deskriptiv.anzahlPatienten), 'Gesamt'),
            getStat('direkt OP', ['geschlecht','m'], (v,k) => getNCount(v, _allStats[k].deskriptiv.anzahlPatienten), 'direkt OP'),
            getStat('nRCT', ['geschlecht','m'], (v,k) => getNCount(v, _allStats[k].deskriptiv.anzahlPatienten), 'nRCT')
        ]);
         rows.push([
            { value: _lang==='en'?'Pathological N-positive, n (%)':'Pathologisch N-positiv, n (%)', tooltip:_lang==='en'?'Number and percentage of patients with pathological N+ status':'Anzahl und Prozentsatz der Patienten mit pathologischem N+ Status'},
            getStat('Gesamt', ['nStatus','plus'], (v,k) => getNCount(v, _allStats[k].deskriptiv.anzahlPatienten), 'Gesamt'),
            getStat('direkt OP', ['nStatus','plus'], (v,k) => getNCount(v, _allStats[k].deskriptiv.anzahlPatienten), 'direkt OP'),
            getStat('nRCT', ['nStatus','plus'], (v,k) => getNCount(v, _allStats[k].deskriptiv.anzahlPatienten), 'nRCT')
        ]);
        return _createTableHTML('pub-table-patienten-charakteristika-content', '', headers, rows);
    }
    
    function _getKollektivDisplayName(kollektivId, includeN = true) {
        const displayName = _uiTexts.kollektivDisplayNames[kollektivId] || kollektivId;
        if (includeN && _allStats && _allStats[kollektivId]?.deskriptiv) {
            const n = _allStats[kollektivId].deskriptiv.anzahlPatienten;
            return `${displayName} (N=${_fVal(n, 0)})`;
        }
        return displayName;
    }

    function _renderLiteraturT2KriterienTabelleHTML() {
        const headers = [
            { label: _lang === 'en' ? 'Criteria Set / Author' : 'Kriterienset / Autor', tooltip: _lang === 'en' ? 'Name of the literature-based criteria set' : 'Name des Literaturbasierten Kriteriensets' },
            { label: _lang === 'en' ? 'Key Morphological Features & Logic' : 'Zentrale Morphologische Merkmale & Logik', tooltip: _lang === 'en' ? 'Summary of the key criteria and their logical combination' : 'Zusammenfassung der Hauptkriterien und deren logische Verknüpfung' },
            { label: _lang === 'en' ? 'Primary Target Cohort (Original Study)' : 'Primäres Zielkollektiv (Originalstudie)', tooltip: _lang === 'en' ? 'The patient cohort for which the criteria were primarily intended or validated in the original publication' : 'Die Patientenkohorte, für die die Kriterien primär vorgesehen oder validiert wurden in der Originalpublikation' }
        ];
        const rows = [];
        _config.literatureCriteriaSets.forEach(conf => {
            const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(conf.id);
            if (studySet) {
                const formattedCriteria = studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic, _lang);
                rows.push([
                    { value: conf.nameKey, tooltip: conf.referenceString },
                    { value: formattedCriteria, tooltip: `Logik: ${studySet.logic?.toUpperCase() || 'N/V'}` },
                    { value: studySet.targetPopulationText?.[_lang] || studySet.targetPopulationText?.['de'] || (_lang === 'en' ? 'General / Mixed' : 'Allgemein / Gemischt'), tooltip: _lang === 'en' ? `Original target: ${studySet.originalReference}` : `Originales Ziel: ${studySet.originalReference}` }
                ]);
            }
        });
        return _createTableHTML('pub-table-literatur-t2-kriterien-content', '', headers, rows);
    }

    function _renderDiagnostischeGueteTabelleHTML(methodType, tableIdSuffix, captionPlaceholder, kollektiveToShow = ['Gesamt', 'direkt OP', 'nRCT']) {
        const headers = [
            { label: _lang === 'en' ? 'Cohort' : 'Kollektiv', tooltip: _lang === 'en' ? 'Patient cohort' : 'Patientenkohorte' },
            { label: _getMetricName('sens'), tooltip: _tooltipContent.statMetrics.sens?.description?.[_lang] || _tooltipContent.statMetrics.sens?.description?.['de'] },
            { label: _getMetricName('spez'), tooltip: _tooltipContent.statMetrics.spez?.description?.[_lang] || _tooltipContent.statMetrics.spez?.description?.['de'] },
            { label: _getMetricName('ppv'), tooltip: _tooltipContent.statMetrics.ppv?.description?.[_lang] || _tooltipContent.statMetrics.ppv?.description?.['de'] },
            { label: _getMetricName('npv'), tooltip: _tooltipContent.statMetrics.npv?.description?.[_lang] || _tooltipContent.statMetrics.npv?.description?.['de'] },
            { label: _getMetricName('acc'), tooltip: _tooltipContent.statMetrics.acc?.description?.[_lang] || _tooltipContent.statMetrics.acc?.description?.['de'] },
            { label: `AUC (${_getMetricName('balAcc')})`, tooltip: _tooltipContent.statMetrics.auc?.description?.[_lang] || _tooltipContent.statMetrics.auc?.description?.['de'] },
            { label: _lang === 'en' ? 'CI Method' : 'KI-Methode', tooltip: _lang === 'en' ? 'Method used for confidence interval calculation' : 'Methode zur Berechnung des Konfidenzintervalls'}
        ];
        const rows = [];
        kollektiveToShow.forEach(kollektivId => {
            let stats;
            let methodForTooltip = '';
            if (methodType === 'AS') {
                stats = _allStats[kollektivId]?.gueteAS;
                methodForTooltip = 'Avocado Sign';
            } else if (typeof methodType === 'object' && methodType.isBF) { // BF
                stats = _allStats[kollektivId]?.gueteT2_bruteforce_publication;
                const bfDef = _allStats[kollektivId]?.bruteforce_definition_publication;
                methodForTooltip = _lang === 'en' ? `Optimized T2 (for ${_bfMetric})` : `Optimiertes T2 (für ${_bfMetric})`;
                if (bfDef) {
                     captionPlaceholder = captionPlaceholder.replace('{BF_CRITERIA_DEF}', _formatBFDefinition(bfDef, _lang));
                }
            } else { // Literatur-Set
                stats = _allStats[kollektivId]?.gueteT2_literatur?.[methodType.id];
                const litSetName = _config.literatureCriteriaSets.find(s => s.id === methodType.id)?.nameKey || methodType.id;
                methodForTooltip = litSetName;
            }

            if (stats && stats.matrix && stats.matrix.rp !== undefined) {
                const row = [
                    {value: _getKollektivDisplayName(kollektivId), tooltip: _lang === 'en' ? `Data for cohort: ${_getKollektivDisplayName(kollektivId)}` : `Daten für Kollektiv: ${_getKollektivDisplayName(kollektivId)}` },
                    {value: _fCI(stats.sens, 1, true), tooltip: ui_helpers.getMetricInterpretationHTML('sens',stats.sens, methodForTooltip, kollektivId)},
                    {value: _fCI(stats.spez, 1, true), tooltip: ui_helpers.getMetricInterpretationHTML('spez',stats.spez, methodForTooltip, kollektivId)},
                    {value: _fCI(stats.ppv, 1, true), tooltip: ui_helpers.getMetricInterpretationHTML('ppv',stats.ppv, methodForTooltip, kollektivId)},
                    {value: _fCI(stats.npv, 1, true), tooltip: ui_helpers.getMetricInterpretationHTML('npv',stats.npv, methodForTooltip, kollektivId)},
                    {value: _fCI(stats.acc, 1, true), tooltip: ui_helpers.getMetricInterpretationHTML('acc',stats.acc, methodForTooltip, kollektivId)},
                    {value: _fCI(stats.auc, 3, false), tooltip: ui_helpers.getMetricInterpretationHTML('auc',stats.auc, methodForTooltip, kollektivId)},
                    {value: stats.sens?.method || '--', tooltip: _lang==='en'?'CI method for Sensitivity':'KI-Methode für Sensitivität'} // Assuming all proportion CIs use same method, or pick one representative
                ];
                rows.push(row);
            }
        });
        if (rows.length === 0) {
            return `<p class="text-muted small">${_lang === 'en' ? 'No performance data available to display for ' : 'Keine Leistungsdaten zur Anzeige verfügbar für '}${captionPlaceholder.split(':')[0]}.</p>`;
        }
        return _createTableHTML(tableIdSuffix, captionPlaceholder, headers, rows);
    }
    
    function _renderStatistischerVergleichAST2TabelleHTML() {
        const headers = [
            { label: _lang === 'en' ? 'Cohort' : 'Kollektiv' },
            { label: _lang === 'en' ? 'Comparison' : 'Vergleich' },
            { label: _lang === 'en' ? 'Accuracy (McNemar p-value)' : 'Accuracy (McNemar p-Wert)' },
            { label: _lang === 'en' ? 'AUC (DeLong p-value)' : 'AUC (DeLong p-Wert)' },
            { label: _lang === 'en' ? 'AUC Difference (AS - T2)' : 'AUC Differenz (AS - T2)' }
        ];
        const rows = [];
        const kollektive = ['Gesamt', 'direkt OP', 'nRCT'];

        kollektive.forEach(kollektivId => {
            const stats = _allStats[kollektivId];
            if (!stats) return;

            // AS vs. Literatur (ESGAR als primäres Beispiel)
            const esgarId = 'rutegard_et_al_esgar';
            const litComp = stats[`vergleichASvsT2_literatur_${esgarId}`];
            const litSetName = _config.literatureCriteriaSets.find(s => s.id === esgarId)?.shortName || esgarId;
            const gueteLit = stats.gueteT2_literatur?.[esgarId];

            if (litComp && gueteLit && gueteLit.matrix.rp !== undefined) {
                rows.push([
                    {value: _getKollektivDisplayName(kollektivId)},
                    {value: `AS vs. ${litSetName}`},
                    {value: `${_fPVal(litComp.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(litComp.mcnemar?.pValue)}`, tooltip: ui_helpers.getTestInterpretationHTML('mcnemar', litComp.mcnemar, kollektivId, litSetName)},
                    {value: `${_fPVal(litComp.delong?.pValue)} ${getStatisticalSignificanceSymbol(litComp.delong?.pValue)}`, tooltip: ui_helpers.getTestInterpretationHTML('delong', litComp.delong, kollektivId, litSetName)},
                    {value: _fCI({value: litComp.delong?.diffAUC, ci:null}, 3, false), tooltip: _lang === 'en' ? `Difference in AUC (AS - ${litSetName})` : `Differenz der AUC (AS - ${litSetName})`}
                ]);
            }

            // AS vs. BF-optimiert
            const bfComp = stats.vergleichASvsT2_bruteforce_publication;
            const bfDef = stats.bruteforce_definition_publication;
            if (bfComp && bfDef) {
                const bfShortName = _lang === 'en' ? `BF-T2 (${bfDef.metricName})` : `BF-T2 (${bfDef.metricName})`;
                rows.push([
                    {value: _getKollektivDisplayName(kollektivId)},
                    {value: `AS vs. ${bfShortName}`},
                    {value: `${_fPVal(bfComp.mcnemar?.pValue)} ${getStatisticalSignificanceSymbol(bfComp.mcnemar?.pValue)}`, tooltip: ui_helpers.getTestInterpretationHTML('mcnemar', bfComp.mcnemar, kollektivId, bfShortName)},
                    {value: `${_fPVal(bfComp.delong?.pValue)} ${getStatisticalSignificanceSymbol(bfComp.delong?.pValue)}`, tooltip: ui_helpers.getTestInterpretationHTML('delong', bfComp.delong, kollektivId, bfShortName)},
                    {value: _fCI({value: bfComp.delong?.diffAUC, ci:null}, 3, false), tooltip: _lang === 'en' ? `Difference in AUC (AS - ${bfShortName})` : `Differenz der AUC (AS - ${bfShortName})`}
                ]);
            }
        });
         if (rows.length === 0) return `<p class="text-muted small">${_lang === 'en' ? 'No comparison data available.' : 'Keine Vergleichsdaten verfügbar.'}</p>`;
        return _createTableHTML('pub-table-stat-vergleich-content', '', headers, rows);
    }

    function _renderKonfusionsmatrizenVergleichTabelleHTML() {
        const headers = [
            {label: _lang==='en'?'Method':'Methode'}, {label:''},
            {label: _lang==='en'?'Pathology N+':'Pathologie N+'}, {label: _lang==='en'?'Pathology N-':'Pathologie N-'}
        ];
        const rows = [];
        const gesamtStats = _allStats.Gesamt;
        if (!gesamtStats) return `<p class="text-muted small">${_lang === 'en' ? 'Overall cohort data not available for confusion matrices.' : 'Gesamtkohorten-Daten für Konfusionsmatrizen nicht verfügbar.'}</p>`;

        const methods = [
            { name: 'Avocado Sign (AS)', data: gesamtStats.gueteAS?.matrix },
            { name: `Optimized T2 (BF for ${_bfMetric})`, data: gesamtStats.gueteT2_bruteforce_publication?.matrix },
            { name: `ESGAR 2016 (Lit.)`, data: gesamtStats.gueteT2_literatur?.['rutegard_et_al_esgar']?.matrix }
        ];

        methods.forEach(method => {
            if (method.data) {
                rows.push([
                    {value: method.name, rowspan: 2}, {value: _lang === 'en' ? `${method.name.split('(')[0].trim()}+` : `${method.name.split('(')[0].trim()}+`},
                    _fVal(method.data.rp, 0), _fVal(method.data.fp, 0)
                ]);
                rows.push([
                    {value: ''}, // Empty for rowspan
                    {value: _lang === 'en' ? `${method.name.split('(')[0].trim()}-` : `${method.name.split('(')[0].trim()}-`},
                    _fVal(method.data.fn, 0), _fVal(method.data.rn, 0)
                ]);
            }
        });
        if (rows.length === 0) return `<p class="text-muted small">${_lang === 'en' ? 'No confusion matrix data available.' : 'Keine Konfusionsmatrix-Daten verfügbar.'}</p>`;
        // Custom HTML for this specific table structure with rowspans
        let html = `<div class="table-responsive publication-table-container my-3">`;
        html += `<table class="table table-sm table-bordered text-center small caption-top" id="pub-table-konfusionsmatrizen-content-table">`;
        html += `<caption class="publication-table-caption">${_lang==='en'?'Exemplary 2x2 Confusion Matrices (Overall Cohort)':'Exemplarische 2x2 Konfusionsmatrizen (Gesamtkollektiv)'}</caption>`;
        html += '<thead><tr>';
        headers.forEach(header => html += `<th scope="col" data-tippy-content="${header.tooltip || header.label}">${header.label}</th>`);
        html += '</tr></thead><tbody>';
        let firstOfMethod = true;
        for (let i = 0; i < rows.length; i++) {
            html += '<tr>';
            const row = rows[i];
            if (row[0].rowspan) { // Method Name
                html += `<th scope="row" rowspan="${row[0].rowspan}" style="vertical-align: middle;" data-tippy-content="${row[0].tooltip || ''}">${row[0].value}</th>`;
                firstOfMethod = true;
            }
            // Start from index 1 if rowspan was handled, or 0 if it's a normal data row following a rowspan
            const startIndex = row[0].rowspan ? 1 : 0;
            for (let j = startIndex; j < row.length; j++) {
                 const cellData = (typeof row[j] === 'object' && row[j] !== null) ? row[j] : { value: row[j], tooltip: null };
                 const tooltipAttr = cellData.tooltip ? `data-tippy-content="${cellData.tooltip}"` : '';
                 const cellValue = cellData.value !== null && cellData.value !== undefined ? cellData.value : '--';
                 if (j === startIndex && firstOfMethod && !row[0].rowspan ) { /* skip if it's a placeholder for rowspan*/ }
                 else if (j === startIndex && !row[0].rowspan) { // Predicted status like AS+ or T2+
                     html += `<th scope="row" ${tooltipAttr}>${cellValue}</th>`;
                 } else {
                    html += `<td ${tooltipAttr}>${cellValue}</td>`;
                 }
            }
            if(row[0].rowspan) firstOfMethod = false;
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        return html;
    }


    function renderPublicationTable(tableElementId, tableTitle, allKollektivStats, currentLang, currentBfMetric, subSectionIdHint) {
        _allStats = allKollektivStats;
        _lang = currentLang;
        _bfMetric = currentBfMetric;
        _uiTexts = getUITexts();
        _tooltipContent = _uiTexts.TOOLTIP_CONTENT;
        _config = PUBLICATION_CONFIG;
        _appConfig = APP_CONFIG;
        
        let tableHTML = `<h5 class="publication-element-title">${tableTitle.replace('{BF_METRIC}', _bfMetric)}</h5>`;
        let footerText = '';

        switch (tableElementId) {
            case 'pub-table-patienten-charakteristika':
                tableHTML += _renderPatientenCharakteristikaTabelleHTML();
                footerText = _lang === 'en' ? 'Values are n (%) or median (range).' : 'Werte sind n (%) oder Median (Spannweite).';
                break;
            case 'pub-table-literatur-t2-kriterien':
                tableHTML += _renderLiteraturT2KriterienTabelleHTML();
                break;
            case 'pub-table-diagnostische-guete-as':
                tableHTML += _renderDiagnostischeGueteTabelleHTML('AS', 'pub-table-diagnostische-guete-as-content', tableTitle);
                footerText = _lang==='en'?'AS: Avocado Sign. CI: Confidence Interval. AUC: Area Under Curve (equivalent to Balanced Accuracy).':'AS: Avocado Sign. KI: Konfidenzintervall. AUC: Area Under Curve (äquivalent zur Balanced Accuracy).';
                break;
             case 'pub-table-diagnostische-guete-literatur-t2':
                 let contentLit = '';
                 _config.literatureCriteriaSets.forEach(litSetConf => {
                     const litSetName = litSetConf.nameKey;
                     const subTableId = `pub-table-diagnostische-guete-lit-${litSetConf.id}`;
                     const subCaption = _lang==='en'?`Performance of ${litSetName}`:`Leistung von ${litSetName}`;
                     // Determine applicable kollektiv for this lit set, might not be all three standard ones
                     const studySetInfo = studyT2CriteriaManager.getStudyCriteriaSetById(litSetConf.id);
                     let kollektiveForThisLit = ['Gesamt', 'direkt OP', 'nRCT']; // Default to all
                     if (studySetInfo && studySetInfo.applicableKollektiv && studySetInfo.applicableKollektiv !== 'Gesamt') {
                         kollektiveForThisLit = [studySetInfo.applicableKollektiv];
                     }
                     contentLit += _renderDiagnostischeGueteTabelleHTML({id: litSetConf.id}, subTableId, subCaption, kollektiveForThisLit);
                 });
                 tableHTML += contentLit;
                 footerText = _lang==='en'?'Performance of literature-based T2 criteria. Evaluation cohort may vary.':'Leistung Literatur-basierter T2-Kriterien. Evaluationskollektiv kann variieren.';
                 break;
            case 'pub-table-diagnostische-guete-optimierte-t2':
                const bfDef = _allStats.Gesamt?.bruteforce_definition_publication; // Get a sample definition for title
                let titleWithBF = tableTitle.replace('{BF_METRIC}', _bfMetric);
                if (bfDef) titleWithBF = titleWithBF.replace('{BF_CRITERIA_DEF}', _formatBFDefinition(bfDef, _lang));
                else titleWithBF = titleWithBF.replace('{BF_CRITERIA_DEF}', _lang === 'en' ? 'N/A' : 'N/V');

                tableHTML = `<h5 class="publication-element-title">${titleWithBF}</h5>`; // Re-set title with BF def
                tableHTML += _renderDiagnostischeGueteTabelleHTML({isBF: true}, 'pub-table-diagnostische-guete-optimierte-t2-content', titleWithBF);
                footerText = _lang==='en'?'BF: Brute-Force optimized. Performance for T2 criteria optimized for the specified target metric.':'BF: Brute-Force optimiert. Leistung für T2-Kriterien, die für die angegebene Zielmetrik optimiert wurden.';
                break;
            case 'pub-table-statistischer-vergleich-as-t2':
                tableHTML += _renderStatistischerVergleichAST2TabelleHTML();
                footerText = _lang === 'en' ? 'Comparison of AS vs. selected T2 criteria sets using McNemar (Accuracy) and DeLong (AUC) tests.' : 'Vergleich von AS vs. ausgewählten T2-Kriteriensets mittels McNemar (Accuracy) und DeLong (AUC) Tests.';
                break;
            case 'pub-table-konfusionsmatrizen-vergleich':
                tableHTML += _renderKonfusionsmatrizenVergleichTabelleHTML();
                footerText = _lang === 'en' ? 'RP: True Positive, FP: False Positive, FN: False Negative, RN: True Negative.' : 'RP: Richtig Positiv, FP: Falsch Positiv, FN: Falsch Negativ, RN: Richtig Negativ.';
                break;
            default:
                return `<p class="text-muted small">Tabelle mit ID "${tableElementId}" nicht implementiert.</p>`;
        }
        if (footerText) {
            const existingTable = document.createElement('div');
            existingTable.innerHTML = tableHTML;
            const tfoot = existingTable.querySelector('table tfoot');
            if(tfoot) tfoot.innerHTML = `<tr><td colspan="100%">${footerText}</td></tr>`; // Colspan large enough
            else {
                 const tableEl = existingTable.querySelector('table');
                 if(tableEl) {
                    const newTfoot = document.createElement('tfoot');
                    newTfoot.innerHTML = `<tr><td colspan="100%">${footerText}</td></tr>`;
                    tableEl.appendChild(newTfoot);
                 }
            }
            tableHTML = existingTable.innerHTML;
        }

        return tableHTML;
    }

    function renderPublicationChart(chartElementId, chartTitle, allKollektivStats, styleOptions, bfMetric, subSectionIdHint) {
        _allStats = allKollektivStats;
        _lang = styleOptions.lang;
        _bfMetric = bfMetric;
        _uiTexts = getUITexts();
        _tooltipContent = _uiTexts.TOOLTIP_CONTENT;
        _config = PUBLICATION_CONFIG;
        _appConfig = APP_CONFIG;

        const chartContainer = document.getElementById(chartElementId);
        if (!chartContainer) {
            console.warn(`Chart-Container #${chartElementId} nicht gefunden für Publikations-Chart.`);
            return;
        }
        chartContainer.innerHTML = ''; // Clear previous chart

        let titleText = chartTitle;
        const nGesamt = _allStats.Gesamt?.deskriptiv?.anzahlPatienten;
        const nDirektOP = _allStats['direkt OP']?.deskriptiv?.anzahlPatienten;
        const nNRCT = _allStats.nRCT?.deskriptiv?.anzahlPatienten;

        titleText = titleText.replace('{N_GESAMT}', nGesamt !== undefined ? _fVal(nGesamt, 0) : 'N/A')
                             .replace('{N_DIREKT_OP}', nDirektOP !== undefined ? _fVal(nDirektOP, 0) : 'N/A')
                             .replace('{N_NRCT}', nNRCT !== undefined ? _fVal(nNRCT, 0) : 'N/A')
                             .replace('{BF_METRIC}', bfMetric);
        
        const titleElement = document.createElement('h5');
        titleElement.className = 'publication-element-title text-center';
        titleElement.textContent = titleText;
        chartContainer.appendChild(titleElement);
        
        const chartDivId = `${chartElementId}-chartarea`;
        const chartDiv = document.createElement('div');
        chartDiv.id = chartDivId;
        chartDiv.style.minHeight = '300px'; // Default min height
        chartDiv.style.width = '100%';
        chartContainer.appendChild(chartDiv);


        const chartOptions = { width: null, height: null }; // Allow D3 to use container size

        switch (chartElementId) {
            case 'pub-chart-alter-Gesamt':
                if (_allStats.Gesamt?.deskriptiv?.alterData) {
                    chartRenderer.renderAgeDistributionChart(_allStats.Gesamt.deskriptiv.alterData, chartDivId, chartOptions, styleOptions);
                }
                break;
            case 'pub-chart-gender-Gesamt':
                if (_allStats.Gesamt?.deskriptiv?.geschlecht) {
                    const genderData = [
                        { label: _uiTexts.legendLabels.male[_lang] || 'Männlich', value: _allStats.Gesamt.deskriptiv.geschlecht.m || 0 },
                        { label: _uiTexts.legendLabels.female[_lang] || 'Weiblich', value: _allStats.Gesamt.deskriptiv.geschlecht.f || 0 }
                    ];
                    chartRenderer.renderPieChart(genderData, chartDivId, {...chartOptions, useCompactMargins: true, legendBelow: true, outerRadiusFactor: 0.7, innerRadiusFactor: 0.3}, styleOptions);
                }
                break;
            case 'pub-chart-vergleich-Gesamt':
            case 'pub-chart-vergleich-direkt-OP':
            case 'pub-chart-vergleich-nRCT':
                const kollektivId = chartElementId.includes('Gesamt') ? 'Gesamt' : chartElementId.includes('direkt-OP') ? 'direkt OP' : 'nRCT';
                const statsKoll = _allStats[kollektivId];
                if (statsKoll) {
                    const esgarData = statsKoll.gueteT2_literatur?.['rutegard_et_al_esgar'];
                    const bfData = statsKoll.gueteT2_bruteforce_publication;
                    const asData = statsKoll.gueteAS;
                    const t2LitLabel = _config.literatureCriteriaSets.find(s => s.id === 'rutegard_et_al_esgar')?.shortName || 'Lit.-T2';
                    const t2BfLabel = _lang === 'en' ? `BF-T2 (${bfMetric})` : `BF-T2 (${bfMetric})`;
                    
                    const comparisonData = ['Sens', 'Spez', 'AUC'].map(metricKey => {
                        const key = metricKey.toLowerCase();
                        return {
                            metric: metricKey, // Display name for axis
                            'AS': asData?.[key]?.value ?? NaN,
                            [t2LitLabel]: esgarData?.[key]?.value ?? NaN,
                            [t2BfLabel]: bfData?.[key]?.value ?? NaN
                        };
                    }).filter(d => d.metric && (isFinite(d['AS']) || isFinite(d[t2LitLabel]) || isFinite(d[t2BfLabel])));
                     if(comparisonData.length > 0) {
                        chartRenderer.renderComparisonBarChart(comparisonData, chartDivId, chartOptions, t2BfLabel, styleOptions);
                     } else {
                        chartDiv.innerHTML = `<p class="text-muted small text-center p-3">${_lang === 'en' ? 'Not enough data for comparison chart.' : 'Nicht genügend Daten für Vergleichsdiagramm.'}</p>`;
                     }
                }
                break;
             case 'pub-chart-performance-detail-gesamt':
                // Placeholder for a more detailed chart, e.g., Sens vs 1-Spez plot
                // For now, could be similar to comparison bar chart or a specific scatter plot logic
                const gesamtStatsForDetail = _allStats.Gesamt;
                if(gesamtStatsForDetail) {
                    const esgarPerf = gesamtStatsForDetail.gueteT2_literatur?.['rutegard_et_al_esgar'];
                    const bfPerf = gesamtStatsForDetail.gueteT2_bruteforce_publication;
                    const asPerf = gesamtStatsForDetail.gueteAS;
                    const scatterData = [];
                    if(asPerf) scatterData.push({name: 'AS', x: 1 - (asPerf.spez?.value || 0), y: asPerf.sens?.value || 0, auc: asPerf.auc?.value });
                    if(esgarPerf) scatterData.push({name: 'ESGAR 2016', x: 1 - (esgarPerf.spez?.value || 0), y: esgarPerf.sens?.value || 0, auc: esgarPerf.auc?.value });
                    if(bfPerf) scatterData.push({name: `BF-T2 (${bfMetric})`, x: 1 - (bfPerf.spez?.value || 0), y: bfPerf.sens?.value || 0, auc: bfPerf.auc?.value });
                    
                    // This would require a new chart type 'renderScatterPlot' or similar in chart_renderer.js
                    // For now, just indicate placeholder.
                    chartDiv.innerHTML = `<p class="text-muted small text-center p-3">${_lang === 'en' ? 'Detailed performance scatter plot (Sens. vs 1-Spec.) would be rendered here.' : 'Detailliertes Performance Scatter Plot (Sens. vs 1-Spez.) würde hier gerendert.'}</p><pre class="small">${JSON.stringify(scatterData, null, 2)}</pre>`;
                }
                break;
            default:
                chartDiv.innerHTML = `<p class="text-muted small text-center p-3">Diagramm mit ID "${chartElementId}" ist nicht implementiert für den Publikations-Renderer.</p>`;
        }
    }

    return Object.freeze({
        renderPublicationTable,
        renderPublicationChart
    });

})();
